import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchCenters,
  searchCentersApi,
  fetchVehicles,
  fetchReservations,
  patchDateApi,
  patchServiceTypeApi,
  cancelReservationApi,
  patchStatusApi,
  deleteReservationApi,
  unauthorizedStatusChangeApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [centers, setCenters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [activeUser, setActiveUser] = useState('USER_A');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterServiceType, setFilterServiceType] = useState('ALL');
  const [ratingSortOrder, setRatingSortOrder] = useState('NONE');

  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale date cache for Error 1
  const [previousDateCache, setPreviousDateCache] = useState('2026-08-10');

  // User session stats cache (Error 6 Target)
  const [cachedCarNumber, setCachedCarNumber] = useState('12가 3456');
  const [cachedLastServiceItem, setCachedLastServiceItem] = useState('엔진오일 및 필터 교환');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadCenters();
    await loadVehicles();
    await loadReservations();
  };

  const loadCenters = async () => {
    const data = await fetchCenters();
    setCenters(data);
    if (data.length > 0 && !selectedCenter) {
      setSelectedCenter(data[0]);
    }
  };

  const loadVehicles = async () => {
    const data = await fetchVehicles();
    setVehicles(data);
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);

    const userList = data.filter(r => r.userId === activeUser);
    if (userList.length > 0 && !selectedReservation) {
      setSelectedReservation(userList[0]);
      setPreviousDateCache(userList[0].date);
    }
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

  const formatPrice = (val) => {
    if (!val) return '0원';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  };

  const getServiceTypeLabel = (type) => {
    const map = {
      ENGINE_OIL: "엔진오일 교환",
      BRAKE_PAD: "브레이크 패드",
      TIRE: "타이어 교체",
      BATTERY: "배터리 점검",
      INSPECTION: "정밀 점검"
    };
    return map[type] || type;
  };

  // User Session Switch (Error 6 Target)
  const handleUserSwitch = (userId) => {
    setActiveUser(userId);
    showToast(`로그인 차주 계정을 [${userId}] 회원으로 변경합니다.`, 'info');
    loadReservations();
    // Note: We intentionally do NOT update cachedCarNumber or cachedLastServiceItem here!
  };

  // Service Type & Date update race (Error 1 Trigger)
  const triggerServiceDateRace = (resv) => {
    showToast('정비 항목 변경과 예약 날짜 조정을 순차 요청합니다.', 'info');

    patchDateApi(resv.id, resv.date);

    setTimeout(() => {
      patchServiceTypeApi(resv.id, resv.serviceType, previousDateCache);
    }, 100);

    setPreviousDateCache(resv.date);

    setTimeout(async () => {
      showToast('정비 항목 수정 완료 (항목은 갱신되었으나 3초 지연 완료로 예약 날짜가 이전 값으로 롤백됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Region & Service Type search race condition (Error 5 Trigger)
  const triggerSearchRace = (reg, type) => {
    showToast(`정비소 검색 필터를 조회합니다: [${reg} / ${type}]`, 'info');

    if (reg === '강남구') {
      searchCentersApi('강남구', type).then(data => {
        setCenters(data);
        showToast('강남구 정비소 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (reg === '마포구') {
      searchCentersApi('마포구', type).then(data => {
        setCenters(data);
        showToast('마포구 정비소 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchCentersApi(reg, type).then(data => {
        setCenters(data);
      });
    }
  };

  // Rating Sort Booking Index Mismatch (Error 3 Target)
  const confirmBooking = (index) => {
    const targetCtr = centers[index];
    if (!targetCtr) {
      showToast('예약할 정비소 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }
    showToast(`[${targetCtr.name}] 정비소 즉시 예약이 완료되었습니다. (인덱스 불일치 오예약 가능)`, 'warning');
  };

  // Cancel & Status Change Conflict (Error 2 Trigger)
  const triggerCancelStatusConflict = (resv) => {
    showToast('예약 취소 요청과 정비사 작업 상태 변경을 동시 진행합니다.', 'info');

    patchStatusApi(resv.id, 'QUEUED');

    setTimeout(async () => {
      const data = await cancelReservationApi(resv.id);
      if (data.success) {
        showToast('예약 취소 성공 (0.5초 완료)', 'success');
        await loadReservations();
      }
    }, 100);

    setTimeout(async () => {
      showToast('상태 변경 응답 완료 (취소 완료 처리되었던 예약이 QUEUED 작업대기로 강제 부활됨)', 'danger');
      await loadReservations();
    }, 4500);
  };

  // Delete Reservation history (Error 4 Target)
  const deleteReservation = async (id) => {
    const data = await deleteReservationApi(id);
    if (data.success) {
      showToast('정비 이력을 삭제했습니다. (차량별 총 정비 금액 및 관리자 통계에는 계속 포함됨)', 'warning');
      await loadReservations();
    }
  };

  // Unauthorized Mechanic Status Change (Error 7 Trigger)
  const triggerUnauthorizedStatusChange = async (resv) => {
    const res = await unauthorizedStatusChangeApi(resv.id, 'IN_PROGRESS', '무단 정비사');
    if (res.status === 403) {
      showToast('HTTP 403 Forbidden: 권한 없는 일반 정비사는 상태를 변경할 수 없습니다. (활동 서버 로그에는 성공으로 기록됨)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('AutoCare 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedCenter(null);
    setSelectedReservation(null);
    await loadAll();
  };

  const sortedCenters = useMemo(() => {
    let list = [...centers];
    if (filterRegion !== 'ALL') {
      list = list.filter(c => c.region === filterRegion);
    }
    if (filterServiceType !== 'ALL') {
      list = list.filter(c => c.serviceType === filterServiceType);
    }
    if (ratingSortOrder === 'RATING_DESC') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [centers, filterRegion, filterServiceType, ratingSortOrder]);

  const userReservations = useMemo(() => {
    return reservations.filter(r => r.userId === activeUser);
  }, [reservations, activeUser]);

  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.userId === activeUser);
  }, [vehicles, activeUser]);

  return (
    <div id="app">
      <Header
        activeUser={activeUser}
        handleUserSwitch={handleUserSwitch}
        cachedCarNumber={cachedCarNumber}
        cachedLastServiceItem={cachedLastServiceItem}
        resetSandbox={resetSandbox}
      />

      <div className="autocare-grid">
        <Sidebar
          filterRegion={filterRegion}
          setFilterRegion={setFilterRegion}
          filterServiceType={filterServiceType}
          setFilterServiceType={setFilterServiceType}
          ratingSortOrder={ratingSortOrder}
          setRatingSortOrder={setRatingSortOrder}
          triggerSearchRace={triggerSearchRace}
          sortedCenters={sortedCenters}
          selectedCenter={selectedCenter}
          setSelectedCenter={setSelectedCenter}
          confirmBooking={confirmBooking}
          formatPrice={formatPrice}
          getServiceTypeLabel={getServiceTypeLabel}
        />

        <CenterSection
          selectedCenter={selectedCenter}
          selectedVehicle={selectedVehicle}
          userReservations={userReservations}
          deleteReservation={deleteReservation}
          formatPrice={formatPrice}
          getServiceTypeLabel={getServiceTypeLabel}
        />

        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={setSelectedReservation}
          triggerServiceDateRace={triggerServiceDateRace}
          triggerCancelStatusConflict={triggerCancelStatusConflict}
          triggerUnauthorizedStatusChange={triggerUnauthorizedStatusChange}
        />
      </div>

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
