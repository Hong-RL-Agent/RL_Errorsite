import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchStations, fetchChargers, fetchReservations, fetchChargeLogs, fetchBreakdownReports, fetchActivityLogs,
  searchChargersApi, patchReservationChargerApi, patchReservationTimeApi,
  cancelReservationApi, startChargingApi, disableChargerUnauthorizedApi,
  patchChargerPartialApi, deleteChargeLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [chargeLogs, setChargeLogs] = useState([]);
  const [breakdownReports, setBreakdownReports] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-5001');
  const [filterStation, setFilterStation] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedBrokenCount] = useState(6);
  const [cachedRecentCharger] = useState('STN-03 CHG-1004 화면 전원 불량 고장 (박관제 접수)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadChargers(), loadStations(), loadReservations(), loadChargeLogs(), loadBreakdownReports(), loadActivityLogs(), loadStaffs()]);
  const loadChargers = async () => setChargers(await fetchChargers());
  const loadStations = async () => setStations(await fetchStations());
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadChargeLogs = async () => setChargeLogs(await fetchChargeLogs());
  const loadBreakdownReports = async () => setBreakdownReports(await fetchBreakdownReports());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadChargers();
    // INTENTIONAL_ERROR: cachedBrokenCount and cachedRecentCharger remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (stationId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - STN-01(3초 지연) 결과가 최신 STN-02(0.2초) 결과를 덮어씀
    showToast(`충전기 목록 조회 중 [충전소: ${stationId} / 상태: ${status}]...`, 'info');
    searchChargersApi(stationId, status, search).then(data => {
      setChargers(data);
      if (stationId === 'STN-01') {
        showToast('강남 테헤란로 충전소 목록 수신 완료 (3초 지연 완료 ➔ 최신 충전소 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`충전기 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedChargers[idx] 아닌 원본 chargers[idx] 충전기가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedChargers[idx];
    if (clicked) {
      showToast(`[${clicked.id}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 충전기 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerTimeChargerRace = (rsvId, target, startTime, endTime) => {
    showToast('예약 시간 변경(3초 지연)과 충전기 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReservationTimeApi(rsvId, startTime, endTime);
    setTimeout(() => {
      patchReservationChargerApi(rsvId, target.id);
    }, 100);
    setTimeout(async () => {
      showToast('충전기 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('예약 시간 변경 완료 (3초 완료 - 충전기 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReservations();
    }, 4000);
  };

  const triggerCancelChargeConflict = (rsvId) => {
    showToast('예약 취소(0.5초 완료)와 충전 시작(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(rsvId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReservations();
    }, 600);
    startChargingApi(rsvId);
    setTimeout(async () => {
      showToast('충전 시작 처리 (4초 완료 → CANCELLED 예약을 CHARGING으로 복원시킴 - Error 2)', 'danger');
      await loadReservations();
      await loadChargers();
    }, 4500);
  };

  const triggerPartialSave = async (id, locationFloor, maxKw, inspectMemo) => {
    await patchChargerPartialApi(id, locationFloor, maxKw, inspectMemo);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save maxKw (Error 8)
    showToast(`[${id}] 충전기 위치/충전속도/점검메모가 성공적으로 저장되었습니다.`, 'success');
    await loadChargers();
  };

  const deleteLog = async (id) => {
    const data = await deleteChargeLogApi(id);
    if (data.success) {
      showToast('충전 로그 삭제 완료. (대시보드 충전소별 사용량 및 충전기별 고장률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadChargeLogs();
    }
  };

  const testUnauthorizedDisable = async (id) => {
    const res = await disableChargerUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 사용중지 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ChargeGrid 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedChargers = useMemo(() => {
    let list = [...chargers];
    if (sortOrder === 'USAGE_DESC') {
      list.sort((a, b) => b.totalKwCharged - a.totalKwCharged);
    } else if (sortOrder === 'KW_DESC') {
      list.sort((a, b) => b.maxKw - a.maxKw);
    }
    return list;
  }, [chargers, sortOrder]);

  // INTENTIONAL_ERROR: selectedCharger is based on original chargers[] not sortedChargers[] (Error 3)
  const selectedCharger = useMemo(() => chargers[selectedIdx] || chargers[0] || null, [chargers, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedBrokenCount={cachedBrokenCount} cachedRecentCharger={cachedRecentCharger} resetSandbox={resetSandbox} />
      <div className="chargegrid-grid">
        <Sidebar
          filterStation={filterStation} setFilterStation={setFilterStation}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          chargers={sortedChargers} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          stations={stations}
        />
        <CenterSection
          chargers={chargers} stations={stations} reservations={reservations}
          chargeLogs={chargeLogs} breakdownReports={breakdownReports} activityLogs={activityLogs}
          deleteChargeLog={deleteLog} testUnauthorizedDisable={testUnauthorizedDisable}
        />
        <RightPanel
          selectedCharger={selectedCharger}
          setSelectedCharger={(u) => setChargers(prev => prev.map(c => c.id === u.id ? u : c))}
          chargers={chargers} reservations={reservations}
          triggerTimeChargerRace={triggerTimeChargerRace}
          triggerCancelChargeConflict={triggerCancelChargeConflict}
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
