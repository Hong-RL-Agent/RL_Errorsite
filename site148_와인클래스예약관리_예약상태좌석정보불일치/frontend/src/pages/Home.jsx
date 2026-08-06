import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchClassesList, fetchSeats, fetchCustomers, fetchBookings, fetchKitLogs, fetchActivityLogs,
  searchBookingsApi, patchBookingSeatApi, patchBookingStatusApi,
  cancelBookingApi, markKitReadyApi, confirmBookingUnauthorizedApi,
  patchCustomerPartialApi, deleteKitLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [seats, setSeats] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [kitLogs, setKitLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9001');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingKitCount] = useState(11);
  const [cachedRecentBooking] = useState('프랑스 보르도 그랑크뤼 마스터반 (VIP A-1 / 최와인 고객)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadBookings(), loadClassesList(), loadSeats(), loadCustomers(), loadKitLogs(), loadActivityLogs(), loadStaffs()]);
  const loadBookings = async () => setBookings(await fetchBookings());
  const loadClassesList = async () => setClassesList(await fetchClassesList());
  const loadSeats = async () => setSeats(await fetchSeats());
  const loadCustomers = async () => setCustomers(await fetchCustomers());
  const loadKitLogs = async () => setKitLogs(await fetchKitLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 소믈리에를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadBookings();
    // INTENTIONAL_ERROR: cachedPendingKitCount and cachedRecentBooking remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (className, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 보르도반(3초 지연) 결과가 최신 바롤로반(0.2초) 결과를 덮어씀
    showToast(`와인 수강 예약 목록 조회 중 [클래스: ${className} / 상태: ${status}]...`, 'info');
    searchBookingsApi(className, status, search).then(data => {
      setBookings(data);
      if (className === '프랑스 보르도 그랑크뤼 마스터 클래스') {
        showToast('보르도 마스터반 수신 완료 (3초 지연 완료 ➔ 최신 클래스 결과를 덮어썼을 수 있음)', 'warning');
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
      showToast(`[${clicked.customerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusSeatRace = (bkgId, target, seatNo) => {
    showToast('예약확정 변경(3초 지연)과 좌석 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchBookingStatusApi(bkgId, target.status);
    setTimeout(() => {
      patchBookingSeatApi(bkgId, seatNo);
    }, 100);
    setTimeout(async () => {
      showToast('와인 테이스팅 좌석 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('예약확정 변경 완료 (3초 완료 - 좌석 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadBookings();
    }, 4000);
  };

  const triggerCancelKitReadyConflict = (bkgId) => {
    showToast('예약 취소(0.5초 완료)와 키트 준비완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelBookingApi(bkgId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadBookings();
    }, 600);
    markKitReadyApi(bkgId);
    setTimeout(async () => {
      showToast('키트 준비완료 처리 (4초 완료 → CANCELLED 예약을 KIT_READY로 복원시킴 - Error 2)', 'danger');
      await loadBookings();
      await loadKitLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, customerName, phone, preferredWine) => {
    await patchCustomerPartialApi(id, customerName, phone, preferredWine);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/선호와인/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadCustomers();
  };

  const deleteLog = async (id) => {
    const data = await deleteKitLogApi(id);
    if (data.success) {
      showToast('시음 키트 로그 삭제 완료. (대시보드 클래스별 준비율 및 월별 예약 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadKitLogs();
    }
  };

  const testUnauthorizedConfirmBooking = async (id) => {
    const res = await confirmBookingUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 예약 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('WineClass 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedBookings = useMemo(() => {
    let list = [...bookings];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.priceWon - a.priceWon);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.classDate.localeCompare(b.classDate));
    }
    return list;
  }, [bookings, sortOrder]);

  // INTENTIONAL_ERROR: selectedBooking is based on original bookings[] not sortedBookings[] (Error 3)
  const selectedBooking = useMemo(() => bookings[selectedIdx] || bookings[0] || null, [bookings, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingKitCount={cachedPendingKitCount} cachedRecentBooking={cachedRecentBooking} resetSandbox={resetSandbox} />
      <div className="wineclass-grid">
        <Sidebar
          filterClass={filterClass} setFilterClass={setFilterClass}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          bookings={sortedBookings} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          classesList={classesList}
        />
        <CenterSection
          bookings={bookings} classesList={classesList} seats={seats} customers={customers}
          kitLogs={kitLogs} activityLogs={activityLogs}
          deleteKitLog={deleteLog} testUnauthorizedConfirmBooking={testUnauthorizedConfirmBooking}
        />
        <RightPanel
          selectedBooking={selectedBooking}
          setSelectedBooking={(u) => setBookings(prev => prev.map(b => b.id === u.id ? u : b))}
          bookings={bookings} seats={seats} customers={customers}
          triggerStatusSeatRace={triggerStatusSeatRace}
          triggerCancelKitReadyConflict={triggerCancelKitReadyConflict}
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
