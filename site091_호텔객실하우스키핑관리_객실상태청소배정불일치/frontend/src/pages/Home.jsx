import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import RoomEditModal from '../components/RoomEditModal.jsx';
import {
  fetchAdmins,
  fetchRooms,
  fetchReservations,
  fetchStaff,
  fetchCleaningLogs,
  fetchRequests,
  searchRoomsApi,
  patchRoomStaffApi,
  patchRoomStatusApi,
  checkoutRoomApi,
  completeCleaningApi,
  inspectRoomApi,
  patchRoomPartialApi,
  deleteCleaningLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [cleaningLogs, setCleaningLogs] = useState([]);
  const [guestRequests, setGuestRequests] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-001');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [selectedRoomForModal, setSelectedRoomForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedRequestCount, setCachedRequestCount] = useState(11);
  const [cachedRecentRoomSummary, setCachedRecentRoomSummary] = useState('301호 (로열 스위트 - VIP 투숙 중)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadRooms();
    await loadReservations();
    await loadStaff();
    await loadCleaningLogs();
    await loadRequests();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadRooms = async () => {
    const data = await fetchRooms();
    setRooms(data);
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
  };

  const loadStaff = async () => {
    const data = await fetchStaff();
    setStaffList(data);
  };

  const loadCleaningLogs = async () => {
    const data = await fetchCleaningLogs();
    setCleaningLogs(data);
  };

  const loadRequests = async () => {
    const data = await fetchRequests();
    setGuestRequests(data);
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

  // Admin Session Switch (Error 6 Target)
  const handleAdminSwitch = (adminId) => {
    setActiveAdmin(adminId);
    showToast(`로그인 계정을 [${adminId}] 권한으로 전환합니다.`, 'info');
    loadRooms();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 고객 요청 상세를 본 뒤 관리자 B로 로그인하면 객실 목록은 B 권한 기준으로 바뀌지만, 
    // 미처리 고객 요청 개수 및 최근 객실 상세 요약 캐시(cachedRequestCount, cachedRecentRoomSummary)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Staff update race condition (Error 1 Trigger)
  const triggerStatusStaffRace = (rm) => {
    showToast('객실 상태 변경(3초 지연)과 하우스키핑 직원 변경(0.1초)을 순차 실행합니다.', 'info');

    // 1. Staff update (0.1s done)
    patchRoomStaffApi(rm.id, rm.cleanerId, rm.cleanerName);

    // 2. Status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchRoomStatusApi(rm.id, rm.status);
    }, 100);

    setTimeout(async () => {
      showToast('객실 상태 변경 완료 (상태는 갱신되었으나 3초 전 스냅샷 덮어쓰기로 담당 직원이 이전 직원으로 롤백 저장됨)', 'warning');
      await loadRooms();
    }, 4500);
  };

  // Floor & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (floor, status) => {
    showToast(`층별 객실 배치도를 조회합니다: [${floor}층 / ${status}]`, 'info');

    if (floor === '1') {
      searchRoomsApi('1', status).then(data => {
        setRooms(data);
        showToast('1층 객실 배치도 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (floor === '2') {
      searchRoomsApi('2', status).then(data => {
        setRooms(data);
        showToast('2층 객실 배치도 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchRoomsApi(floor, status).then(data => {
        setRooms(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 객실 목록을 층별 또는 가격순으로 정렬한 뒤 상세보기 버튼을 누르면 
    // 사용자가 클릭한 객실이 아니라 정렬 전 원본 배열의 같은 index 객실 상세가 열리는 결함입니다.
    setSelectedRoomIndex(index);
    const clickedRoom = sortedRooms[index];
    if (clickedRoom) {
      showToast(`[${clickedRoom.id}호] 상세보기 표시 알림 (우측 관제 패널에는 인덱스 불일치 객실 데이터가 노출됨)`, 'warning');
    }
  };

  // Checkout & Cleaning Complete Conflict (Error 2 Trigger)
  const triggerCheckoutCleaningConflict = (rm) => {
    showToast('체크아웃 처리와 청소 완료 승인을 진행합니다.', 'info');

    // 1. Checkout (0.5s done)
    checkoutRoomApi(rm.id);

    // 2. Complete Cleaning & Re-activate to CHECKED_IN (4.0s delay)
    setTimeout(async () => {
      await completeCleaningApi(rm.id);
      showToast('체크아웃 처리 응답 완료 (0.5초 완료)', 'warning');
      await loadRooms();
    }, 100);

    setTimeout(async () => {
      showToast('청소 완료 처리 응답 완료 (4초 지연 완료: 체크아웃된 객실을 다시 CHECKED_IN 체크인 상태로 변경시킴)', 'danger');
      await loadRooms();
    }, 4500);
  };

  // Partial Room Save (Error 8 Trigger)
  const triggerPartialRoomSave = async (id, roomType, price, cleaningNote) => {
    await patchRoomPartialApi(id, roomType, price, cleaningNote);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 객실 정보 수정 모달에서 객실 타입, 숙박 가격, 청소 메모를 동시에 수정하면 백엔드는 객실 타입과 청소 메모만 저장하고 
    // 숙박 가격은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('객실 타입, 숙박 가격, 청소 메모가 성공적으로 저장되었습니다.', 'success');
    await loadRooms();
  };

  // Delete Cleaning Log (Error 4 Target)
  const deleteCleaningLog = async (id) => {
    const data = await deleteCleaningLogApi(id);
    if (data.success) {
      showToast('청소 완료 로그를 삭제했습니다. (직원별 완료 건수 및 대시보드 청소율 그래프 수치에는 계속 유지됨)', 'warning');
      await loadCleaningLogs();
    }
  };

  // Test Unauthorized Inspection (Error 7 Trigger)
  const testUnauthorizedInspect = async (id) => {
    try {
      const res = await inspectRoomApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 점검 완료 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (roomId, roomType, price, cleaningNote) => {
    await patchRoomPartialApi(roomId, roomType, price, cleaningNote);
    showToast(`[${roomId}호] 객실 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedRoomForModal(null);
    await loadRooms();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('HotelOps 객실관리 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedRoomIndex(0);
    await loadAll();
  };

  const sortedRooms = useMemo(() => {
    let list = [...rooms];
    if (filterFloor !== 'ALL') {
      list = list.filter(r => r.floor === parseInt(filterFloor));
    }
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'FLOOR_DESC') {
      list.sort((a, b) => b.floor - a.floor);
    }
    return list;
  }, [rooms, filterFloor, sortOrder]);

  // Selected Room for RightPanel (Error 3 Effect)
  const selectedRoomForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedRooms[selectedRoomIndex] || rooms[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted rooms array
      return rooms[selectedRoomIndex] || rooms[0];
    }
  }, [sortedRooms, rooms, selectedRoomIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedRequestCount={cachedRequestCount}
        cachedRecentRoomSummary={cachedRecentRoomSummary}
        resetSandbox={resetSandbox}
      />

      <div className="hotelops-grid">
        <Sidebar
          filterFloor={filterFloor}
          setFilterFloor={setFilterFloor}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          rooms={sortedRooms}
          selectedRoomIndex={selectedRoomIndex}
          setSelectedRoomIndex={setSelectedRoomIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          rooms={rooms}
          cleaningLogs={cleaningLogs}
          guestRequests={guestRequests}
          deleteCleaningLog={deleteCleaningLog}
          openRoomModal={(rm) => setSelectedRoomForModal(rm)}
          testUnauthorizedInspect={testUnauthorizedInspect}
        />

        <RightPanel
          selectedRoom={selectedRoomForPanel}
          setSelectedRoom={(updated) => {
            setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
          staffList={staffList}
          triggerStatusStaffRace={triggerStatusStaffRace}
          triggerCheckoutCleaningConflict={triggerCheckoutCleaningConflict}
          triggerPartialRoomSave={triggerPartialRoomSave}
        />
      </div>

      <RoomEditModal
        room={selectedRoomForModal}
        onClose={() => setSelectedRoomForModal(null)}
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
