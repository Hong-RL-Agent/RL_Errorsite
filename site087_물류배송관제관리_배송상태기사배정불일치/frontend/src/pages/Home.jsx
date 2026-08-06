import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import AssignModal from '../components/AssignModal.jsx';
import {
  fetchUsers,
  fetchCenters,
  fetchDrivers,
  fetchOrders,
  fetchLogs,
  fetchInquiries,
  searchOrdersApi,
  patchDriverApi,
  patchOrderStatusApi,
  cancelOrderApi,
  reassignDriverApi,
  patchAddressPartialApi,
  deleteLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const [activeUser, setActiveUser] = useState('ADM-01');
  const [filterCenter, setFilterCenter] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale driver cache for Error 1
  const [previousDriverIdCache, setPreviousDriverIdCache] = useState('DRV-001');
  const [previousDriverNameCache, setPreviousDriverNameCache] = useState('김기사');

  // Session stats cache (Error 6 Target)
  const [cachedDelayedCount, setCachedDelayedCount] = useState(4);
  const [cachedRecentDriver, setCachedRecentDriver] = useState('김기사 (서울80바 1234)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadUsers();
    await loadCenters();
    await loadDrivers();
    await loadOrders();
    await loadLogs();
    await loadInquiries();
  };

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const loadCenters = async () => {
    const data = await fetchCenters();
    setCenters(data);
  };

  const loadDrivers = async () => {
    const data = await fetchDrivers();
    setDrivers(data);
  };

  const loadOrders = async () => {
    const data = await fetchOrders();
    setOrders(data);
    if (data.length > 0) {
      setPreviousDriverIdCache(data[0].driverId);
      setPreviousDriverNameCache(data[0].driverName);
    }
  };

  const loadLogs = async () => {
    const data = await fetchLogs();
    setLogs(data);
  };

  const loadInquiries = async () => {
    const data = await fetchInquiries();
    setInquiries(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // User Session Switch (Error 6 Target)
  const handleUserSwitch = (userId) => {
    setActiveUser(userId);
    showToast(`로그인 계정을 [${userId}] 회원으로 변경합니다.`, 'info');
    loadOrders();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 기사 배정 화면을 본 뒤 관리자 B로 로그인하면 배송 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 지연 배송 개수 및 최근 배정 기사 캐시(cachedDelayedCount, cachedRecentDriver)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Driver update race (Error 1 Trigger)
  const triggerStatusDriverRace = (ord) => {
    showToast('배송 기사 변경과 배송 상태 조정을 순차 요청합니다.', 'info');

    patchDriverApi(ord.id, ord.driverId, ord.driverName);

    setTimeout(() => {
      patchOrderStatusApi(ord.id, ord.status, previousDriverIdCache, previousDriverNameCache, 'ADMIN');
    }, 100);

    setPreviousDriverIdCache(ord.driverId);
    setPreviousDriverNameCache(ord.driverName);

    setTimeout(async () => {
      showToast('상태 변경 완료 (상태는 갱신되었으나 3초 지연 완료로 담당 기사가 이전 기사로 롤백 저장됨)', 'warning');
      await loadOrders();
    }, 4500);
  };

  // Center & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (centerId, status) => {
    showToast(`물류 관제 필터를 조회합니다: [${centerId} / ${status}]`, 'info');

    if (centerId === 'CTR-01') {
      searchOrdersApi('CTR-01', status).then(data => {
        setOrders(data);
        showToast('서울 중앙 센터 배송 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (centerId === 'CTR-02') {
      searchOrdersApi('CTR-02', status).then(data => {
        setOrders(data);
        showToast('경기 허브 터미널 배송 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchOrdersApi(centerId, status).then(data => {
        setOrders(data);
      });
    }
  };

  // Sort Order Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 배송 목록을 지연시간순 또는 배송비순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 배송 id가 아니라 정렬 전 원본 배열의 같은 index 배송 상세가 선택되어 열리는 결함입니다.
    setSelectedOrderIndex(index);
    const clickedOrder = sortedOrders[index];
    if (clickedOrder) {
      showToast(`[${clickedOrder.waybillNo}] 상세보기 표시 알림 완료 (우측 상세 패널에는 인덱스 불일치 데이터가 노출됨)`, 'warning');
    }
  };

  // Cancel Order & Reassign Driver Conflict (Error 2 Trigger)
  const triggerCancelReassignConflict = (ord) => {
    showToast('배송 취소 처리와 기사 재배정을 진행합니다.', 'info');

    // 1. Cancel Order (0.5s done)
    cancelOrderApi(ord.id);

    // 2. Reassign Driver & Re-activate (4.0s delay)
    setTimeout(async () => {
      await reassignDriverApi(ord.id, 'DRV-001', '김기사');
      showToast('배송 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadOrders();
    }, 100);

    setTimeout(async () => {
      showToast('기사 재배정 완료 (4초 지연 완료: 취소된 배송을 다시 IN_DELIVERY 배송중 상태로 재활성화시킴)', 'danger');
      await loadOrders();
    }, 4500);
  };

  // Partial Address Save (Error 8 Trigger)
  const triggerPartialAddressSave = async (id, zipcode, detailAddress, deliveryMemo) => {
    await patchAddressPartialApi(id, zipcode, detailAddress, deliveryMemo);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 배송 주소를 수정하는 모달에서 우편번호, 상세주소, 배송메모를 한 번에 수정하면 백엔드는 우편번호와 배송메모만 저장하고 
    // 상세주소는 이전 값을 유지하지만, 프론트엔드는 세 값이 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('우편번호, 상세주소, 배송메모가 성공적으로 수정되었습니다.', 'success');
    await loadOrders();
  };

  // Delete Log (Error 4 Target)
  const deleteLog = async (id) => {
    const data = await deleteLogApi(id);
    if (data.success) {
      showToast('배송 완료 로그를 삭제했습니다. (완료 배송 수 및 센터 처리량 그래프 수치에는 계속 유지됨)', 'warning');
      await loadLogs();
    }
  };

  // Test Unauthorized Status Update (Error 7 Trigger)
  const testUnauthorizedStatusUpdate = async (id) => {
    try {
      const res = await patchOrderStatusApi(id, 'COMPLETED', 'DRV-001', '김기사', 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (orderId, driverId, driverName) => {
    await patchDriverApi(orderId, driverId, driverName);
    showToast(`[${driverName}] 기사님으로 재배정 완료되었습니다.`, 'success');
    setSelectedOrderForModal(null);
    await loadOrders();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('LogiControl 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedOrderIndex(0);
    await loadAll();
  };

  const sortedOrders = useMemo(() => {
    let list = [...orders];
    if (filterCenter !== 'ALL') {
      list = list.filter(o => o.centerId === filterCenter);
    }
    if (filterStatus !== 'ALL') {
      list = list.filter(o => o.status === filterStatus);
    }
    if (sortOrder === 'DELAY_DESC') {
      list.sort((a, b) => b.delayMinutes - a.delayMinutes);
    } else if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.deliveryFee - a.deliveryFee);
    }
    return list;
  }, [orders, filterCenter, filterStatus, sortOrder]);

  // Selected Order for RightPanel (Error 3 Effect)
  const selectedOrderForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedOrders[selectedOrderIndex] || orders[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted orders array
      return orders[selectedOrderIndex] || orders[0];
    }
  }, [sortedOrders, orders, selectedOrderIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeUser={activeUser}
        handleUserSwitch={handleUserSwitch}
        cachedDelayedCount={cachedDelayedCount}
        cachedRecentDriver={cachedRecentDriver}
        resetSandbox={resetSandbox}
      />

      <div className="logicontrol-grid">
        <Sidebar
          filterCenter={filterCenter}
          setFilterCenter={setFilterCenter}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          orders={sortedOrders}
          selectedOrderIndex={selectedOrderIndex}
          setSelectedOrderIndex={setSelectedOrderIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          orders={sortedOrders}
          drivers={drivers}
          logs={logs}
          inquiries={inquiries}
          deleteLog={deleteLog}
          openAssignModal={(ord) => setSelectedOrderForModal(ord)}
          testUnauthorizedStatusUpdate={testUnauthorizedStatusUpdate}
        />

        <RightPanel
          selectedOrder={selectedOrderForPanel}
          setSelectedOrder={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          }}
          triggerStatusDriverRace={triggerStatusDriverRace}
          drivers={drivers}
          triggerCancelReassignConflict={triggerCancelReassignConflict}
          triggerPartialAddressSave={triggerPartialAddressSave}
        />
      </div>

      <AssignModal
        order={selectedOrderForModal}
        drivers={drivers}
        onClose={() => setSelectedOrderForModal(null)}
        onConfirm={handleModalConfirm}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
