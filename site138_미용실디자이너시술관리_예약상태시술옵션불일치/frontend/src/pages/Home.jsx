import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchDesigners, fetchTreatments, fetchClients, fetchReservations, fetchVisitLogs, fetchActivityLogs,
  searchReservationsApi, patchReservationTreatmentApi, patchReservationStatusApi,
  cancelReservationApi, completeReservationApi, refundReservationUnauthorizedApi,
  patchClientPartialApi, deleteVisitLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [visitLogs, setVisitLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-8001');
  const [filterDesigner, setFilterDesigner] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedTodayCount] = useState(14);
  const [cachedRecentClient] = useState('김지민 님 (엘리 원장 / 시그니처 S컬 펌)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadReservations(), loadDesigners(), loadTreatments(), loadClients(), loadVisitLogs(), loadActivityLogs(), loadStaffs()]);
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadDesigners = async () => setDesigners(await fetchDesigners());
  const loadTreatments = async () => setTreatments(await fetchTreatments());
  const loadClients = async () => setClients(await fetchClients());
  const loadVisitLogs = async () => setVisitLogs(await fetchVisitLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 디자이너를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadReservations();
    // INTENTIONAL_ERROR: cachedTodayCount and cachedRecentClient remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (designerName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 엘리 원장(3초 지연) 결과가 최신 지아 디자이너(0.2초) 결과를 덮어씀
    showToast(`시술 예약 목록 조회 중 [디자이너: ${designerName} / 상태: ${status}]...`, 'info');
    searchReservationsApi(designerName, status, search).then(data => {
      setReservations(data);
      if (designerName === '엘리 원장') {
        showToast('엘리 원장 예약 수신 완료 (3초 지연 완료 ➔ 최신 디자이너 결과를 덮어썼을 수 있음)', 'warning');
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
      showToast(`[${clicked.clientName}] 예약 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusTreatmentRace = (resId, target, treatmentName) => {
    showToast('시술중 변경(3초 지연)과 옵션 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReservationStatusApi(resId, target.status);
    setTimeout(() => {
      patchReservationTreatmentApi(resId, treatmentName);
    }, 100);
    setTimeout(async () => {
      showToast('시술 옵션 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('시술중 변경 완료 (3초 완료 - 시술 옵션 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReservations();
    }, 4000);
  };

  const triggerCancelCompleteConflict = (resId) => {
    showToast('예약 취소(0.5초 완료)와 시술 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(resId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReservations();
    }, 600);
    completeReservationApi(resId);
    setTimeout(async () => {
      showToast('시술 완료 처리 (4초 완료 → CANCELLED 예약을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadReservations();
      await loadVisitLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, clientName, phone, preferredDesigner) => {
    await patchClientPartialApi(id, clientName, phone, preferredDesigner);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/연락처/선호 디자이너가 성공적으로 저장되었습니다.`, 'success');
    await loadClients();
  };

  const deleteLog = async (id) => {
    const data = await deleteVisitLogApi(id);
    if (data.success) {
      showToast('방문 로그 삭제 완료. (대시보드 디자이너별 매출 및 재방문율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadVisitLogs();
    }
  };

  const testUnauthorizedRefund = async (id) => {
    const res = await refundReservationUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 환불 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('HairStudioPro 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedReservations = useMemo(() => {
    let list = [...reservations];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.priceWon - a.priceWon);
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.resTime.localeCompare(b.resTime));
    }
    return list;
  }, [reservations, sortOrder]);

  // INTENTIONAL_ERROR: selectedReservation is based on original reservations[] not sortedReservations[] (Error 3)
  const selectedReservation = useMemo(() => reservations[selectedIdx] || reservations[0] || null, [reservations, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedTodayCount={cachedTodayCount} cachedRecentClient={cachedRecentClient} resetSandbox={resetSandbox} />
      <div className="hairstudiopro-grid">
        <Sidebar
          filterDesigner={filterDesigner} setFilterDesigner={setFilterDesigner}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          reservations={sortedReservations} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          designers={designers}
        />
        <CenterSection
          reservations={reservations} designers={designers} clients={clients}
          visitLogs={visitLogs} activityLogs={activityLogs}
          deleteVisitLog={deleteLog} testUnauthorizedRefund={testUnauthorizedRefund}
        />
        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={(u) => setReservations(prev => prev.map(r => r.id === u.id ? u : r))}
          reservations={reservations} treatments={treatments} designers={designers}
          triggerStatusTreatmentRace={triggerStatusTreatmentRace}
          triggerCancelCompleteConflict={triggerCancelCompleteConflict}
          triggerPartialSave={triggerPartialSave}
          clients={clients}
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
