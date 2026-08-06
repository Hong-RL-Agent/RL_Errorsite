import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchArtisans, fetchCustomers, fetchOptions, fetchOrders, fetchCraftLogs, fetchActivityLogs,
  searchOrdersApi, patchOrderOptionColorApi, patchOrderStatusApi,
  cancelOrderApi, shipOrderApi, shipOrderUnauthorizedApi,
  patchCustomerPartialApi, deleteCraftLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [options, setOptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [craftLogs, setCraftLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-6001');
  const [filterOptionType, setFilterOptionType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedDelayedCount] = useState(9);
  const [cachedRecentOrder] = useState('이탈리아 풀그레인 천연 가죽 지갑 (딥 탄 브라운 / 제작중)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadOrders(), loadOptions(), loadArtisans(), loadCustomers(), loadCraftLogs(), loadActivityLogs(), loadStaffs()]);
  const loadOrders = async () => setOrders(await fetchOrders());
  const loadOptions = async () => setOptions(await fetchOptions());
  const loadArtisans = async () => setArtisans(await fetchArtisans());
  const loadCustomers = async () => setCustomers(await fetchCustomers());
  const loadCraftLogs = async () => setCraftLogs(await fetchCraftLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 아티잔을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadOrders();
    // INTENTIONAL_ERROR: cachedDelayedCount and cachedRecentOrder remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (optionType, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 가죽 지갑(3초 지연) 결과가 최신 원목 테이블(0.2초) 결과를 덮어씀
    showToast(`공방 주문 목록 조회 중 [옵션유형: ${optionType} / 상태: ${status}]...`, 'info');
    searchOrdersApi(optionType, status, search).then(data => {
      setOrders(data);
      if (optionType === '천연 가극 각인 커스텀 지갑') {
        showToast('가죽 각인 지갑 수신 완료 (3초 지연 완료 ➔ 최신 옵션 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`주문 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedOrders[idx] 아닌 원본 orders[idx] 주문이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedOrders[idx];
    if (clicked) {
      showToast(`[${clicked.customerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 주문 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusOptionRace = (ordId, target, optionColor) => {
    showToast('제작중 변경(3초 지연)과 옵션 색상 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchOrderStatusApi(ordId, target.status);
    setTimeout(() => {
      patchOrderOptionColorApi(ordId, optionColor);
    }, 100);
    setTimeout(async () => {
      showToast('주문 옵션 색상 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('제작중 변경 완료 (3초 완료 - 옵션 색상 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadOrders();
    }, 4000);
  };

  const triggerCancelShipConflict = (ordId) => {
    showToast('주문 취소(0.5초 완료)와 발송 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelOrderApi(ordId);
    setTimeout(async () => {
      showToast('주문 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadOrders();
    }, 600);
    shipOrderApi(ordId);
    setTimeout(async () => {
      showToast('발송 완료 처리 (4초 완료 → CANCELLED 주문을 SHIPPED로 복원시킴 - Error 2)', 'danger');
      await loadOrders();
      await loadCraftLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, customerName, deliveryNote, optionColor) => {
    await patchCustomerPartialApi(id, customerName, '', deliveryNote, optionColor);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save optionColor (Error 8)
    showToast(`[${id}] 고객명/배송메모/옵션색상이 성공적으로 저장되었습니다.`, 'success');
    await loadCustomers();
  };

  const deleteLog = async (id) => {
    const data = await deleteCraftLogApi(id);
    if (data.success) {
      showToast('제작 로그 삭제 완료. (대시보드 제작자별 처리량 및 월별 발송 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadCraftLogs();
    }
  };

  const testUnauthorizedShipOrder = async (id) => {
    const res = await shipOrderUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 발송 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CraftOrder 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedOrders = useMemo(() => {
    let list = [...orders];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.orderPriceWon - a.orderPriceWon);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return list;
  }, [orders, sortOrder]);

  // INTENTIONAL_ERROR: selectedOrder is based on original orders[] not sortedOrders[] (Error 3)
  const selectedOrder = useMemo(() => orders[selectedIdx] || orders[0] || null, [orders, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedDelayedCount={cachedDelayedCount} cachedRecentOrder={cachedRecentOrder} resetSandbox={resetSandbox} />
      <div className="craftorder-grid">
        <Sidebar
          filterOptionType={filterOptionType} setFilterOptionType={setFilterOptionType}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          orders={sortedOrders} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          options={options}
        />
        <CenterSection
          orders={orders} options={options} artisans={artisans} customers={customers}
          craftLogs={craftLogs} activityLogs={activityLogs}
          deleteCraftLog={deleteLog} testUnauthorizedShipOrder={testUnauthorizedShipOrder}
        />
        <RightPanel
          selectedOrder={selectedOrder}
          setSelectedOrder={(u) => setOrders(prev => prev.map(o => o.id === u.id ? u : o))}
          orders={orders} customers={customers}
          triggerStatusOptionRace={triggerStatusOptionRace}
          triggerCancelShipConflict={triggerCancelShipConflict}
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
