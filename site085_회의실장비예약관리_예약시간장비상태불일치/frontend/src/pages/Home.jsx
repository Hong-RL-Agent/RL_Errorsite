import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchRooms,
  fetchEquipments,
  fetchReservations,
  fetchEmployees,
  searchRoomsApi,
  patchReservationEquipmentApi,
  patchReservationTimeApi,
  cancelReservationApi,
  returnEquipmentStatusApi,
  reserveEquipmentApi,
  deleteReservationApi,
  updateEquipmentStatusUnauthorizedApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [activeEmp, setActiveEmp] = useState('EMP-01');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [availSortOrder, setAvailSortOrder] = useState('NONE');

  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale equipments cache for Error 1
  const [previousEquipmentsCache, setPreviousEquipmentsCache] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedReservationCount, setCachedReservationCount] = useState(5);
  const [cachedNextRoomSummary, setCachedNextRoomSummary] = useState('1층 에메랄드 대회의실 (08.10 10:00)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadRooms();
    await loadEquipments();
    await loadReservations();
    await loadEmployees();
  };

  const loadRooms = async () => {
    const data = await fetchRooms();
    setRooms(data);
  };

  const loadEquipments = async () => {
    const data = await fetchEquipments();
    setEquipments(data);
    if (data.length > 0 && !selectedEquipment) {
      setSelectedEquipment(data[0]);
    }
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
    if (data.length > 0 && !selectedReservation) {
      setSelectedReservation(data[0]);
      setPreviousEquipmentsCache(data[0].equipments || []);
    }
  };

  const loadEmployees = async () => {
    const data = await fetchEmployees();
    setEmployees(data);
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

  // Employee Session Switch (Error 6 Target)
  const handleEmpSwitch = (empId) => {
    setActiveEmp(empId);
    showToast(`로그인 사원 계정을 [${empId}] 회원으로 변경합니다.`, 'info');
    loadReservations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A의 예약 내역을 본 뒤 직원 B로 로그인하면 예약 목록은 B 기준으로 바뀌지만, 
    // 상단 예약 건수 및 다음 회의실 요약 캐시(cachedReservationCount, cachedNextRoomSummary)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Time & Equipment update race (Error 1 Trigger)
  const triggerTimeEquipmentRace = (resv) => {
    showToast('회의실 예약 시간 조정과 신청 장비 변경을 순차 요청합니다.', 'info');

    patchReservationEquipmentApi(resv.id, resv.equipments);

    setTimeout(() => {
      patchReservationTimeApi(resv.id, resv.date, resv.timeSlot, previousEquipmentsCache);
    }, 100);

    setPreviousEquipmentsCache(resv.equipments || []);

    setTimeout(async () => {
      showToast('시간 변경 완료 (시간은 갱신되었으나 3초 지연 완료로 장비 목록이 이전 상태로 롤백 저장됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Floor & Type search race condition (Error 5 Trigger)
  const triggerSearchRace = (floor, type) => {
    showToast(`회의실 목록 필터를 조회합니다: [${floor}층 / ${type}]`, 'info');

    if (floor === '3') {
      searchRoomsApi('3', type).then(data => {
        setRooms(data);
        showToast('3층 회의실 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (floor === '2') {
      searchRoomsApi('2', type).then(data => {
        setRooms(data);
        showToast('2층 회의실 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchRoomsApi(floor, type).then(data => {
        setRooms(data);
      });
    }
  };

  // Available Sort Equipment Reserve Index Mismatch (Error 3 Target)
  const confirmEquipmentReserve = async (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 장비 목록을 사용가능순으로 정렬한 뒤 예약 버튼을 누르면 
    // 사용자가 클릭한 장비가 아니라 정렬 전 배열의 같은 index 장비가 예약되어 저장되는 결함입니다.
    const targetEqp = equipments[index];
    if (!targetEqp) {
      showToast('장비 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    showToast(`[${targetEqp.name}] 장비 예약 알림 표시 완료 (실제 backend DB에는 인덱스 불일치 장비 id로 저장됨)`, 'warning');
    await reserveEquipmentApi(targetEqp.id, 'EMP-01', '김철수 팀장');
    await loadEquipments();
  };

  // Cancel Reservation & Return Equipment Conflict (Error 2 Trigger)
  const triggerCancelReturnConflict = (resv) => {
    showToast('예약 취소 처리와 장비 반납을 진행합니다.', 'info');

    // 1. Cancel Reservation (0.5s done)
    cancelReservationApi(resv.id);

    // 2. Return Equipment & Re-activate (4.0s delay)
    setTimeout(async () => {
      await returnEquipmentStatusApi(resv.id);
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadReservations();
    }, 100);

    setTimeout(async () => {
      showToast('장비 반납 완료 (4초 지연 완료: 취소된 예약을 다시 COMPLETED 사용완료 상태로 재활성화시킴)', 'danger');
      await loadReservations();
    }, 4500);
  };

  // Delete Reservation (Error 4 Target)
  const deleteReservation = async (id) => {
    const data = await deleteReservationApi(id);
    if (data.success) {
      showToast('장비 예약을 삭제했습니다. (장비별 사용 횟수 및 월별 사용 통계 수치에는 계속 유지됨)', 'warning');
      await loadReservations();
    }
  };

  // Test Unauthorized Equipment Status Update (Error 7 Trigger)
  const testUnauthorizedEquipmentStatusUpdate = async (id) => {
    try {
      const res = await updateEquipmentStatusUnauthorizedApi(id, 'AVAILABLE', 'GUEST_EMP');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('RoomEquip 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedReservation(null);
    await loadAll();
  };

  const sortedEquipments = useMemo(() => {
    let list = [...equipments];
    if (filterType !== 'ALL') {
      list = list.filter(e => e.type === filterType);
    }
    if (availSortOrder === 'AVAILABLE_FIRST') {
      list.sort((a, b) => (b.status === 'AVAILABLE' ? 1 : 0) - (a.status === 'AVAILABLE' ? 1 : 0));
    }
    return list;
  }, [equipments, filterType, availSortOrder]);

  const empReservations = useMemo(() => {
    return reservations.filter(r => r.empId === activeEmp);
  }, [reservations, activeEmp]);

  return (
    <div id="app">
      <Header
        activeEmp={activeEmp}
        handleEmpSwitch={handleEmpSwitch}
        cachedReservationCount={cachedReservationCount}
        cachedNextRoomSummary={cachedNextRoomSummary}
        resetSandbox={resetSandbox}
      />

      <div className="roomequip-grid">
        <Sidebar
          filterFloor={filterFloor}
          setFilterFloor={setFilterFloor}
          filterType={filterType}
          setFilterType={setFilterType}
          availSortOrder={availSortOrder}
          setAvailSortOrder={setAvailSortOrder}
          triggerSearchRace={triggerSearchRace}
          equipments={sortedEquipments}
          selectedEquipment={selectedEquipment}
          setSelectedEquipment={setSelectedEquipment}
          confirmEquipmentReserve={confirmEquipmentReserve}
        />

        <CenterSection
          rooms={rooms}
          reservations={empReservations}
          deleteReservation={deleteReservation}
          testUnauthorizedEquipmentStatusUpdate={testUnauthorizedEquipmentStatusUpdate}
        />

        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={setSelectedReservation}
          triggerTimeEquipmentRace={triggerTimeEquipmentRace}
          equipments={equipments}
          triggerCancelReturnConflict={triggerCancelReturnConflict}
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
