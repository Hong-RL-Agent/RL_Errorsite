import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PassengerEditModal from '../components/PassengerEditModal.jsx';
import {
  fetchStaffs,
  fetchFlights,
  fetchPassengers,
  fetchBaggage,
  fetchLostClaims,
  fetchActivityLogs,
  searchBaggageApi,
  patchBaggageStatusApi,
  patchBaggageHandlerApi,
  cancelLostClaimApi,
  updateBaggageLocationApi,
  closeClaimUnauthorizedApi,
  patchPassengerPartialApi,
  deleteProcessingLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [baggage, setBaggage] = useState([]);
  const [lostClaims, setLostClaims] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STAFF-3001');
  const [filterFlight, setFilterFlight] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedBaggageIndex, setSelectedBaggageIndex] = useState(0);
  const [selectedPassengerForModal, setSelectedPassengerForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedDelayedBaggage, setCachedDelayedBaggage] = useState(12);
  const [cachedRecentPassenger] = useState('김동남 승객 (BAG-88001 / KE081 JFK-ICN / 지연 보관소 B-3)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadStaffs();
    await loadFlights();
    await loadPassengers();
    await loadBaggage();
    await loadLostClaims();
    await loadActivityLogs();
  };

  const loadStaffs = async () => {
    const data = await fetchStaffs();
    setStaffs(data);
  };

  const loadFlights = async () => {
    const data = await fetchFlights();
    setFlights(data);
  };

  const loadPassengers = async () => {
    const data = await fetchPassengers();
    setPassengers(data);
  };

  const loadBaggage = async () => {
    const data = await fetchBaggage();
    setBaggage(data);
  };

  const loadLostClaims = async () => {
    const data = await fetchLostClaims();
    setLostClaims(data);
  };

  const loadActivityLogs = async () => {
    const data = await fetchActivityLogs();
    setActivityLogs(data);
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

  // Staff Session Switch (Error 6 Target)
  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 담당자를 [${staffId}] 권한으로 변경합니다.`, 'info');
    loadBaggage();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 수하물 상세를 본 뒤 직원 B로 로그인하면 수하물 목록은 B 담당 기준으로 바뀌지만, 
    // 상단 지연 수하물 수(cachedDelayedBaggage) 및 최근 승객 상세 캐시(cachedRecentPassenger)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Handler update race condition (Error 1 Trigger)
  const triggerStatusHandlerRace = (bag) => {
    showToast('수하물 상태 변경(3초 지연)과 담당 핸들러 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Handler update (0.1s done)
    patchBaggageHandlerApi(bag.id, bag.handlerName);

    // 2. Status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchBaggageStatusApi(bag.id, bag.status);
    }, 100);

    setTimeout(async () => {
      showToast('수하물 상태 지연 변경 완료 (상태는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 담당자와 지연상태 조합이 롤백 저장됨)', 'warning');
      await loadBaggage();
    }, 4500);
  };

  // Flight search race condition (Error 5 Trigger)
  const triggerSearchRace = (flightNo, search) => {
    showToast(`항공편 수하물 목록을 조회합니다: [${flightNo} / ${search}]`, 'info');

    if (flightNo === 'KE081') {
      searchBaggageApi('KE081', 'ALL', search).then(data => {
        setBaggage(data);
        showToast('KE081 항공편 수하물 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (flightNo === 'OZ202') {
      searchBaggageApi('OZ202', 'ALL', search).then(data => {
        setBaggage(data);
        showToast('OZ202 항공편 수하물 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchBaggageApi(flightNo, 'ALL', search).then(data => {
        setBaggage(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 수하물 목록을 지연시간순/항공편순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 수하물이 아니라 정렬 전 원본 배열의 같은 index 수하물 상세가 열리는 결함입니다.
    setSelectedBaggageIndex(index);
    const clickedBag = sortedBaggage[index];
    if (clickedBag) {
      showToast(`[${clickedBag.tagNo}] 수하물 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 수하물의 승객명/항공편이 표시됨)`, 'warning');
    }
  };

  // Cancel Claim & Location Update Conflict (Error 2 Trigger)
  const triggerCancelLocationConflict = (bag) => {
    showToast('분실 신고 취소 처리와 위치 갱신을 연쇄 진행합니다.', 'info');

    // 1. Cancel Lost Claim (0.5s done, status = CLAIMED / CANCELLED)
    cancelLostClaimApi(bag.id);

    // 2. Update Location (4.0s delay with restore to LOST_REPORTED)
    setTimeout(async () => {
      await updateBaggageLocationApi(bag.id, 'T1 지하 2층 수하물 재검색실');
      showToast('분실 신고 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadBaggage();
    }, 100);

    setTimeout(async () => {
      showToast('위치 갱신 실행 응답 완료 (4초 지연 완료: 취소된 신고를 LOST_REPORTED 분실신고 상태로 복원시킴)', 'danger');
      await loadBaggage();
      await loadLostClaims();
    }, 4500);
  };

  // Partial Passenger Save (Error 8 Trigger)
  const triggerPartialPassengerSave = async (id, phone, deliveryAddress, requests) => {
    await patchPassengerPartialApi(id, phone, deliveryAddress, requests);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 승객 정보 수정 모달에서 연락처, 수령 주소, 요청사항을 동시에 수정하면 백엔드는 연락처와 요청사항만 저장하고 
    // 수령 주소는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 수령 주소, 특별 요청사항이 성공적으로 저장되었습니다.', 'success');
    await loadPassengers();
  };

  // Delete Processing Log (Error 4 Target)
  const deleteProcessingLog = async (id) => {
    const data = await deleteProcessingLogApi(id);
    if (data.success) {
      showToast('수하물 처리 로그를 삭제했습니다. (항공편별 지연 수하물 수 및 분실 신고율 수치에는 계속 유지됨)', 'warning');
      await loadActivityLogs();
    }
  };

  // Test Unauthorized Claim Close (Error 7 Trigger)
  const testUnauthorizedClose = async (id) => {
    try {
      const res = await closeClaimUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 분실신고 종결 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (passengerId, phone, deliveryAddress, requests) => {
    await patchPassengerPartialApi(passengerId, phone, deliveryAddress, requests);
    showToast(`[${passengerId}] 승객 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedPassengerForModal(null);
    await loadPassengers();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('BagTrace 공항 수하물 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedBaggageIndex(0);
    await loadAll();
  };

  const sortedBaggage = useMemo(() => {
    let list = [...baggage];
    if (filterFlight !== 'ALL') {
      list = list.filter(b => b.flightNo === filterFlight);
    }
    if (searchTerm) {
      list = list.filter(b => b.passengerName.includes(searchTerm) || b.tagNo.includes(searchTerm) || b.id.includes(searchTerm));
    }
    if (sortOrder === 'WEIGHT_DESC') {
      list.sort((a, b) => b.weightKg - a.weightKg);
    } else if (sortOrder === 'FLIGHT_ASC') {
      list.sort((a, b) => a.flightNo.localeCompare(b.flightNo));
    }
    return list;
  }, [baggage, filterFlight, searchTerm, sortOrder]);

  // Selected Baggage for RightPanel (Error 3 Effect)
  const selectedBaggageForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedBaggage[selectedBaggageIndex] || baggage[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted baggage array
      return baggage[selectedBaggageIndex] || baggage[0];
    }
  }, [sortedBaggage, baggage, selectedBaggageIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeStaff={activeStaff}
        handleStaffSwitch={handleStaffSwitch}
        cachedDelayedBaggage={cachedDelayedBaggage}
        cachedRecentPassenger={cachedRecentPassenger}
        resetSandbox={resetSandbox}
      />

      <div className="bagtrace-grid">
        <Sidebar
          filterFlight={filterFlight}
          setFilterFlight={setFilterFlight}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          baggage={sortedBaggage}
          selectedBaggageIndex={selectedBaggageIndex}
          setSelectedBaggageIndex={setSelectedBaggageIndex}
          openDetailMismatch={openDetailMismatch}
          flights={flights}
        />

        <CenterSection
          baggage={baggage}
          passengers={passengers}
          flights={flights}
          lostClaims={lostClaims}
          activityLogs={activityLogs}
          deleteProcessingLog={deleteProcessingLog}
          openPassengerModal={(p) => setSelectedPassengerForModal(p)}
          testUnauthorizedClose={testUnauthorizedClose}
        />

        <RightPanel
          selectedBaggage={selectedBaggageForPanel}
          setSelectedBaggage={(updated) => {
            setBaggage(prev => prev.map(b => b.id === updated.id ? updated : b));
          }}
          staffs={staffs}
          passengers={passengers}
          triggerStatusHandlerRace={triggerStatusHandlerRace}
          triggerCancelLocationConflict={triggerCancelLocationConflict}
          triggerPartialPassengerSave={triggerPartialPassengerSave}
        />
      </div>

      <PassengerEditModal
        passenger={selectedPassengerForModal}
        onClose={() => setSelectedPassengerForModal(null)}
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
