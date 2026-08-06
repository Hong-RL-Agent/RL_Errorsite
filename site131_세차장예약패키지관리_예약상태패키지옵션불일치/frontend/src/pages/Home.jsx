import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchBranches, fetchPackages, fetchVehicles, fetchBookings, fetchWorkLogs, fetchActivityLogs,
  searchBookingsApi, patchBookingOptionsApi, patchBookingStatusApi,
  cancelBookingApi, completeWorkLogApi, refundBookingUnauthorizedApi,
  patchVehiclePartialApi, deleteWorkLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [packages, setPackages] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9001');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedTodayCount] = useState(18);
  const [cachedRecentBooking] = useState('123가 4567 (프리미엄 세라믹 코팅 210,000원 / 강남 본점)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadBookings(), loadBranches(), loadPackages(), loadVehicles(), loadWorkLogs(), loadActivityLogs(), loadStaffs()]);
  const loadBookings = async () => setBookings(await fetchBookings());
  const loadBranches = async () => setBranches(await fetchBranches());
  const loadPackages = async () => setPackages(await fetchPackages());
  const loadVehicles = async () => setVehicles(await fetchVehicles());
  const loadWorkLogs = async () => setWorkLogs(await fetchWorkLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 직원을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadBookings();
    // INTENTIONAL_ERROR: cachedTodayCount and cachedRecentBooking remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (branchId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - BRN-01 강남(3초 지연) 결과가 최신 BRN-02 서초(0.2초) 결과를 덮어씀
    showToast(`예약 목록 조회 중 [지점: ${branchId} / 상태: ${status}]...`, 'info');
    searchBookingsApi(branchId, status, search).then(data => {
      setBookings(data);
      if (branchId === 'BRN-01') {
        showToast('강남 본점 세차 예약 수신 완료 (3초 지연 완료 ➔ 최신 지점 결과를 덮어썼을 수 있음)', 'warning');
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
      showToast(`[${clicked.carNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusOptionsRace = (bkgId, target, packageName, options, totalFeeWon) => {
    showToast('작업중 변경(3초 지연)과 패키지 옵션 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchBookingStatusApi(bkgId, target.status);
    setTimeout(() => {
      patchBookingOptionsApi(bkgId, packageName, options, totalFeeWon);
    }, 100);
    setTimeout(async () => {
      showToast('패키지 옵션 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('작업중 변경 완료 (3초 완료 - 패키지 옵션 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadBookings();
    }, 4000);
  };

  const triggerCancelWorkConflict = (bkgId) => {
    showToast('예약 취소(0.5초 완료)와 작업 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelBookingApi(bkgId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadBookings();
    }, 600);
    completeWorkLogApi(bkgId);
    setTimeout(async () => {
      showToast('작업 완료 처리 (4초 완료 → CANCELLED 예약을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadBookings();
      await loadWorkLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, carNo, carType, phone) => {
    await patchVehiclePartialApi(id, carNo, carType, phone);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save carType (Error 8)
    showToast(`[${id}] 차량번호/차종/고객 연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadVehicles();
  };

  const deleteLog = async (id) => {
    const data = await deleteWorkLogApi(id);
    if (data.success) {
      showToast('작업 로그 삭제 완료. (대시보드 지점별 매출 및 패키지 선택률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadWorkLogs();
    }
  };

  const testUnauthorizedRefund = async (id) => {
    const res = await refundBookingUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 예약 환불 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('WashBay 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedBookings = useMemo(() => {
    let list = [...bookings];
    if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.totalFeeWon - a.totalFeeWon);
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));
    }
    return list;
  }, [bookings, sortOrder]);

  // INTENTIONAL_ERROR: selectedBooking is based on original bookings[] not sortedBookings[] (Error 3)
  const selectedBooking = useMemo(() => bookings[selectedIdx] || bookings[0] || null, [bookings, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedTodayCount={cachedTodayCount} cachedRecentBooking={cachedRecentBooking} resetSandbox={resetSandbox} />
      <div className="washbay-grid">
        <Sidebar
          filterBranch={filterBranch} setFilterBranch={setFilterBranch}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          bookings={sortedBookings} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          branches={branches}
        />
        <CenterSection
          bookings={bookings} branches={branches} packages={packages}
          workLogs={workLogs} activityLogs={activityLogs}
          deleteWorkLog={deleteLog} testUnauthorizedRefund={testUnauthorizedRefund}
        />
        <RightPanel
          selectedBooking={selectedBooking}
          setSelectedBooking={(u) => setBookings(prev => prev.map(b => b.id === u.id ? u : b))}
          bookings={bookings} packages={packages} vehicles={vehicles}
          triggerStatusOptionsRace={triggerStatusOptionsRace}
          triggerCancelWorkConflict={triggerCancelWorkConflict}
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
