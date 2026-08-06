import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchRoutesList, fetchBuses, fetchDrivers, fetchSchedules, fetchBoardingLogs, fetchActivityLogs,
  searchSchedulesApi, patchSchedulePassengerCountApi, patchScheduleStatusApi,
  cancelScheduleApi, recordBoardingLogApi, completeScheduleUnauthorizedApi,
  patchBusPartialApi, deleteBoardingLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [boardingLogs, setBoardingLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-8001');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedDelayedCount] = useState(5);
  const [cachedRecentSchedule] = useState('정문-공학관 순환선 (A노선 / 만차 혼잡 경고)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadSchedules(), loadRoutesList(), loadBuses(), loadDrivers(), loadBoardingLogs(), loadActivityLogs(), loadStaffs()]);
  const loadSchedules = async () => setSchedules(await fetchSchedules());
  const loadRoutesList = async () => setRoutesList(await fetchRoutesList());
  const loadBuses = async () => setBuses(await fetchBuses());
  const loadDrivers = async () => setDrivers(await fetchDrivers());
  const loadBoardingLogs = async () => setBoardingLogs(await fetchBoardingLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 셔틀 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadSchedules();
    // INTENTIONAL_ERROR: cachedDelayedCount and cachedRecentSchedule remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (routeName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - A노선(3초 지연) 결과가 최신 B노선(0.2초) 결과를 덮어씀
    showToast(`셔틀 운행 일정 조회 중 [노선: ${routeName} / 상태: ${status}]...`, 'info');
    searchSchedulesApi(routeName, status, search).then(data => {
      setSchedules(data);
      if (routeName === '정문-공학관 순환선 (A노선)') {
        showToast('A노선 셔틀 수신 완료 (3초 지연 완료 ➔ 최신 노선 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`배차 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedSchedules[idx] 아닌 원본 schedules[idx] 운행이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedSchedules[idx];
    if (clicked) {
      showToast(`[${clicked.busNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 배차 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusPassengerRace = (schId, target, passengerCount) => {
    showToast('운행중 변경(3초 지연)과 승차인원 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchScheduleStatusApi(schId, target.status);
    setTimeout(() => {
      patchSchedulePassengerCountApi(schId, passengerCount);
    }, 100);
    setTimeout(async () => {
      showToast('승차 인원 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('운행중 변경 완료 (3초 완료 - 승차인원 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadSchedules();
    }, 4000);
  };

  const triggerCancelBoardingConflict = (schId) => {
    showToast('운행 취소(0.5초 완료)와 승차 기록 등록(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelScheduleApi(schId);
    setTimeout(async () => {
      showToast('운행 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadSchedules();
    }, 600);
    recordBoardingLogApi(schId);
    setTimeout(async () => {
      showToast('승차 기록 처리 (4초 완료 → CANCELLED 운행을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadSchedules();
      await loadBoardingLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, busNo, seatCapacity, driverName) => {
    await patchBusPartialApi(id, busNo, seatCapacity, driverName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save seatCapacity (Error 8)
    showToast(`[${id}] 차량번호/담당기사/좌석수가 성공적으로 저장되었습니다.`, 'success');
    await loadBuses();
  };

  const deleteLog = async (id) => {
    const data = await deleteBoardingLogApi(id);
    if (data.success) {
      showToast('승차 기록 삭제 완료. (대시보드 노선별 혼잡도 및 시간대별 승차 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadBoardingLogs();
    }
  };

  const testUnauthorizedCompleteSchedule = async (id) => {
    const res = await completeScheduleUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 운행 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ShuttleCampus 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedSchedules = useMemo(() => {
    let list = [...schedules];
    if (sortOrder === 'PASSENGER_DESC') {
      list.sort((a, b) => b.passengerCount - a.passengerCount);
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
    return list;
  }, [schedules, sortOrder]);

  // INTENTIONAL_ERROR: selectedSchedule is based on original schedules[] not sortedSchedules[] (Error 3)
  const selectedSchedule = useMemo(() => schedules[selectedIdx] || schedules[0] || null, [schedules, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedDelayedCount={cachedDelayedCount} cachedRecentSchedule={cachedRecentSchedule} resetSandbox={resetSandbox} />
      <div className="shuttlecampus-grid">
        <Sidebar
          filterRoute={filterRoute} setFilterRoute={setFilterRoute}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          schedules={sortedSchedules} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          routesList={routesList}
        />
        <CenterSection
          schedules={schedules} routesList={routesList} buses={buses} drivers={drivers}
          boardingLogs={boardingLogs} activityLogs={activityLogs}
          deleteBoardingLog={deleteLog} testUnauthorizedCompleteSchedule={testUnauthorizedCompleteSchedule}
        />
        <RightPanel
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={(u) => setSchedules(prev => prev.map(s => s.id === u.id ? u : s))}
          schedules={schedules} buses={buses}
          triggerStatusPassengerRace={triggerStatusPassengerRace}
          triggerCancelBoardingConflict={triggerCancelBoardingConflict}
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
