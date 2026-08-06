import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchRooms, fetchUsers, fetchBookings, fetchAccessLogs, fetchEquipmentLogs, fetchActivityLogs,
  searchBookingsApi, patchBookingEntryTimeApi, patchBookingStatusApi,
  cancelBookingApi, checkInBookingApi, forceCancelBookingUnauthorizedApi,
  patchUserPartialApi, deleteAccessLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [equipmentLogs, setEquipmentLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-5001');
  const [filterRoom, setFilterRoom] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedInUseCount] = useState(14);
  const [cachedRecentBooking] = useState('메인 댄스홀 A (최아티스트 / 블랙라이트 댄스 크루)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadBookings(), loadRooms(), loadUsers(), loadAccessLogs(), loadEquipmentLogs(), loadActivityLogs(), loadStaffs()]);
  const loadBookings = async () => setBookings(await fetchBookings());
  const loadRooms = async () => setRooms(await fetchRooms());
  const loadUsers = async () => setUsers(await fetchUsers());
  const loadAccessLogs = async () => setAccessLogs(await fetchAccessLogs());
  const loadEquipmentLogs = async () => setEquipmentLogs(await fetchEquipmentLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 대관 직원을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadBookings();
    // INTENTIONAL_ERROR: cachedInUseCount and cachedRecentBooking remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (roomName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 댄스홀 A(3초 지연) 결과가 최신 합주실 B(0.2초) 결과를 덮어씀
    showToast(`연습실 예약 목록 조회 중 [공간: ${roomName} / 상태: ${status}]...`, 'info');
    searchBookingsApi(roomName, status, search).then(data => {
      setBookings(data);
      if (roomName === '메인 댄스홀 A (특대형)') {
        showToast('메인 댄스홀 A 예약 수신 완료 (3초 지연 완료 ➔ 최신 공간 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`예약 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedBookings[idx] 아닌 원본 bookings[idx] 예약이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedBookings[idx];
    if (clicked) {
      showToast(`[${clicked.userName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusEntryTimeRace = (bkgId, target, entryTime) => {
    showToast('사용중 변경(3초 지연)과 출입시각 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchBookingStatusApi(bkgId, target.status);
    setTimeout(() => {
      patchBookingEntryTimeApi(bkgId, entryTime);
    }, 100);
    setTimeout(async () => {
      showToast('출입 인정 시각 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('사용중 변경 완료 (3초 완료 - 출입시각 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadBookings();
    }, 4000);
  };

  const triggerCancelCheckinConflict = (bkgId) => {
    showToast('예약 취소(0.5초 완료)와 출입 확인(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelBookingApi(bkgId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadBookings();
    }, 600);
    checkInBookingApi(bkgId);
    setTimeout(async () => {
      showToast('출입 확인 처리 (4초 완료 → CANCELLED 예약을 IN_USE로 복원시킴 - Error 2)', 'danger');
      await loadBookings();
      await loadAccessLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, userName, phone, teamName) => {
    await patchUserPartialApi(id, userName, phone, teamName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/소속팀/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadUsers();
  };

  const deleteLog = async (id) => {
    const data = await deleteAccessLogApi(id);
    if (data.success) {
      showToast('출입 기록 삭제 완료. (대시보드 연습실별 이용률 및 이용자 사용시간 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadAccessLogs();
    }
  };

  const testUnauthorizedForceCancel = async (id) => {
    const res = await forceCancelBookingUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 강제취소 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('PracticeRoom 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedBookings = useMemo(() => {
    let list = [...bookings];
    if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.totalFeeWon - a.totalFeeWon);
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return list;
  }, [bookings, sortOrder]);

  // INTENTIONAL_ERROR: selectedBooking is based on original bookings[] not sortedBookings[] (Error 3)
  const selectedBooking = useMemo(() => bookings[selectedIdx] || bookings[0] || null, [bookings, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedInUseCount={cachedInUseCount} cachedRecentBooking={cachedRecentBooking} resetSandbox={resetSandbox} />
      <div className="practiceroom-grid">
        <Sidebar
          filterRoom={filterRoom} setFilterRoom={setFilterRoom}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          bookings={sortedBookings} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          rooms={rooms}
        />
        <CenterSection
          bookings={bookings} rooms={rooms} users={users}
          accessLogs={accessLogs} equipmentLogs={equipmentLogs} activityLogs={activityLogs}
          deleteAccessLog={deleteLog} testUnauthorizedForceCancel={testUnauthorizedForceCancel}
        />
        <RightPanel
          selectedBooking={selectedBooking}
          setSelectedBooking={(u) => setBookings(prev => prev.map(b => b.id === u.id ? u : b))}
          bookings={bookings} users={users}
          triggerStatusEntryTimeRace={triggerStatusEntryTimeRace}
          triggerCancelCheckinConflict={triggerCancelCheckinConflict}
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
