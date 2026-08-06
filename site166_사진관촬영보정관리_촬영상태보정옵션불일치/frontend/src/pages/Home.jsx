import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchCustomers, fetchProducts, fetchReservations, fetchRetouchTasks, fetchDispatchLogs, fetchActivityLogs,
  searchReservationsApi, patchRetouchOptionApi, patchReservationStatusApi,
  cancelReservationApi, completeDispatchApi, completeDispatchUnauthorizedApi,
  patchCustomerPartialApi, deleteDispatchLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [retouchTasks, setRetouchTasks] = useState([]);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-2201');
  const [filterProductCategory, setFilterProductCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingRetouchCount] = useState(9);
  const [cachedRecentCustomer] = useState('최스냅 (퍼스널 컬러 프리미엄 프로필 / 150,000원)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadReservations(), loadProducts(), loadCustomers(), loadRetouchTasks(), loadDispatchLogs(), loadActivityLogs(), loadStaffs()]);
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadProducts = async () => setProducts(await fetchProducts());
  const loadCustomers = async () => setCustomers(await fetchCustomers());
  const loadRetouchTasks = async () => setRetouchTasks(await fetchRetouchTasks());
  const loadDispatchLogs = async () => setDispatchLogs(await fetchDispatchLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 스튜디오 실장을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadReservations();
    // INTENTIONAL_ERROR: cachedPendingRetouchCount and cachedRecentCustomer remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (productCategory, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 프로필(3초 지연) 결과가 최신 웨딩(0.2초) 결과를 덮어씀
    showToast(`촬영 예약 목록 조회 중 [상품: ${productCategory} / 상태: ${status}]...`, 'info');
    searchReservationsApi(productCategory, status, search).then(data => {
      setReservations(data);
      if (productCategory === '프로필/증명사진 패키지') {
        showToast('프로필 상품 목록 수신 완료 (3초 지연 완료 ➔ 최신 상품 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`예약 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedReservations[idx] 아닌 원본 reservations[idx] 예약이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedReservations[idx];
    if (clicked) {
      showToast(`[${clicked.customerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusOptionRace = (rsvId, target, retouchOption) => {
    showToast('촬영완료 변경(3초 지연)과 보정 옵션 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReservationStatusApi(rsvId, target.status);
    setTimeout(() => {
      patchRetouchOptionApi(rsvId, retouchOption);
    }, 100);
    setTimeout(async () => {
      showToast('1:1 리터칭 보정 옵션 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('촬영완료 변경 완료 (3초 완료 - 보정 옵션 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReservations();
    }, 4000);
  };

  const triggerCancelDispatchConflict = (rsvId) => {
    showToast('예약 취소(0.5초 완료)와 앨범 출고(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(rsvId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReservations();
    }, 600);
    completeDispatchApi(rsvId);
    setTimeout(async () => {
      showToast('앨범 출고 완료 처리 완료 (4초 완료 → CANCELLED 예약을 DELIVERED로 복원시킴 - Error 2)', 'danger');
      await loadReservations();
      await loadDispatchLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, customerName, phone, shootConcept) => {
    await patchCustomerPartialApi(id, customerName, phone, shootConcept);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 고객명/선호촬영컨셉/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadCustomers();
  };

  const deleteLog = async (id) => {
    const data = await deleteDispatchLogApi(id);
    if (data.success) {
      showToast('출고 로그 삭제 완료. (대시보드 작업자별 처리량 및 상품별 선택률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadDispatchLogs();
    }
  };

  const testUnauthorizedCompleteDispatch = async (id) => {
    const res = await completeDispatchUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 앨범 출고 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('PhotoStudioOps 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedReservations = useMemo(() => {
    let list = [...reservations];
    if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.shootDate.localeCompare(b.shootDate));
    } else if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.priceWon - a.priceWon);
    }
    return list;
  }, [reservations, sortOrder]);

  // INTENTIONAL_ERROR: selectedReservation is based on original reservations[] not sortedReservations[] (Error 3)
  const selectedReservation = useMemo(() => reservations[selectedIdx] || reservations[0] || null, [reservations, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingRetouchCount={cachedPendingRetouchCount} cachedRecentCustomer={cachedRecentCustomer} resetSandbox={resetSandbox} />
      <div className="photostudioops-grid">
        <Sidebar
          filterProductCategory={filterProductCategory} setFilterProductCategory={setFilterProductCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          reservations={sortedReservations} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          products={products}
        />
        <CenterSection
          reservations={reservations} products={products} customers={customers}
          retouchTasks={retouchTasks} dispatchLogs={dispatchLogs} activityLogs={activityLogs}
          deleteDispatchLog={deleteLog} testUnauthorizedCompleteDispatch={testUnauthorizedCompleteDispatch}
        />
        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={(u) => setReservations(prev => prev.map(r => r.id === u.id ? u : r))}
          reservations={reservations} customers={customers}
          triggerStatusOptionRace={triggerStatusOptionRace}
          triggerCancelDispatchConflict={triggerCancelDispatchConflict}
          triggerPartialSave={triggerPartialSave}
        />
      </div>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}</span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
