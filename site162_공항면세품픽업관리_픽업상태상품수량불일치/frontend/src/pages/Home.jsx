import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchCounters, fetchPassengers, fetchOrders, fetchProducts, fetchPickupLogs, fetchActivityLogs,
  searchOrdersApi, patchItemQuantityApi, patchOrderStatusApi,
  cancelOrderApi, completePickupApi, completePickupUnauthorizedApi,
  patchPassengerPartialApi, deletePickupLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [counters, setCounters] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [pickupLogs, setPickupLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-6601');
  const [filterCounterName, setFilterCounterName] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedDelayedPreparationCount] = useState(5);
  const [cachedRecentOrder] = useState('최공항 KE081 (설화수 자음 2종 세트 외 3건 / 4개)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadOrders(), loadCounters(), loadPassengers(), loadProducts(), loadPickupLogs(), loadActivityLogs(), loadStaffs()]);
  const loadOrders = async () => setOrders(await fetchOrders());
  const loadCounters = async () => setCounters(await fetchCounters());
  const loadPassengers = async () => setPassengers(await fetchPassengers());
  const loadProducts = async () => setProducts(await fetchProducts());
  const loadPickupLogs = async () => setPickupLogs(await fetchPickupLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 인도장 담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadOrders();
    // INTENTIONAL_ERROR: cachedDelayedPreparationCount and cachedRecentOrder remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (counterName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - T1 동편(3초 지연) 결과가 최신 T2 중앙(0.2초) 결과를 덮어씀
    showToast(`면세품 주문 목록 조회 중 [인도장: ${counterName} / 상태: ${status}]...`, 'info');
    searchOrdersApi(counterName, status, search).then(data => {
      setOrders(data);
      if (counterName === 'T1 동편 인도장 (11번 게이트 앞)') {
        showToast('T1 동편 인도장 수신 완료 (3초 지연 완료 ➔ 최신 인도장 결과를 덮어썼을 수 있음)', 'warning');
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
      showToast(`[${clicked.passengerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 주문 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusQuantityRace = (ordId, target, itemQuantity) => {
    showToast('준비완료 변경(3초 지연)과 수량 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchOrderStatusApi(ordId, target.status);
    setTimeout(() => {
      patchItemQuantityApi(ordId, itemQuantity);
    }, 100);
    setTimeout(async () => {
      showToast('면세품 인도 수량 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('준비완료 변경 완료 (3초 완료 - 수량 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadOrders();
    }, 4000);
  };

  const triggerCancelPickupConflict = (ordId) => {
    showToast('주문 취소(0.5초 완료)와 픽업 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelOrderApi(ordId);
    setTimeout(async () => {
      showToast('주문 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadOrders();
    }, 600);
    completePickupApi(ordId);
    setTimeout(async () => {
      showToast('픽업 완료 처리 완료 (4초 완료 → CANCELLED 주문을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadOrders();
      await loadPickupLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, passengerName, flightNo, passportEnglishName) => {
    await patchPassengerPartialApi(id, passengerName, flightNo, passportEnglishName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save flightNo (Error 8)
    showToast(`[${id}] 승객명/여권영문명/항공편이 성공적으로 저장되었습니다.`, 'success');
    await loadPassengers();
  };

  const deleteLog = async (id) => {
    const data = await deletePickupLogApi(id);
    if (data.success) {
      showToast('픽업 로그 삭제 완료. (대시보드 카운터별 처리량 및 시간대별 픽업률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadPickupLogs();
    }
  };

  const testUnauthorizedCompletePickup = async (id) => {
    const res = await completePickupUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 픽업 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('DutyPickup 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedOrders = useMemo(() => {
    let list = [...orders];
    if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sortOrder === 'QTY_DESC') {
      list.sort((a, b) => b.itemQuantity - a.itemQuantity);
    }
    return list;
  }, [orders, sortOrder]);

  // INTENTIONAL_ERROR: selectedOrder is based on original orders[] not sortedOrders[] (Error 3)
  const selectedOrder = useMemo(() => orders[selectedIdx] || orders[0] || null, [orders, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedDelayedPreparationCount={cachedDelayedPreparationCount} cachedRecentOrder={cachedRecentOrder} resetSandbox={resetSandbox} />
      <div className="dutypickup-grid">
        <Sidebar
          filterCounterName={filterCounterName} setFilterCounterName={setFilterCounterName}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          orders={sortedOrders} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          counters={counters}
        />
        <CenterSection
          orders={orders} counters={counters} passengers={passengers}
          products={products} pickupLogs={pickupLogs} activityLogs={activityLogs}
          deletePickupLog={deleteLog} testUnauthorizedCompletePickup={testUnauthorizedCompletePickup}
        />
        <RightPanel
          selectedOrder={selectedOrder}
          setSelectedOrder={(u) => setOrders(prev => prev.map(o => o.id === u.id ? u : o))}
          orders={orders} passengers={passengers}
          triggerStatusQuantityRace={triggerStatusQuantityRace}
          triggerCancelPickupConflict={triggerCancelPickupConflict}
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
