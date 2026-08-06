import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchDrivers, fetchVehicles, fetchCalls, fetchRideLogs, fetchSettlements, fetchActivityLogs,
  searchCallsApi, patchCallFeeApi, patchCallStatusApi,
  cancelCallApi, completeRideApi, confirmSettlementUnauthorizedApi,
  patchDriverPartialApi, deleteRideLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [calls, setCalls] = useState([]);
  const [rideLogs, setRideLogs] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-1001');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingCount] = useState(12);
  const [cachedRecentCall] = useState('강남역 ➔ 판교 테크노밸리 (강동수 기사 / 18,500원)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadCalls(), loadDrivers(), loadVehicles(), loadRideLogs(), loadSettlements(), loadActivityLogs(), loadStaffs()]);
  const loadCalls = async () => setCalls(await fetchCalls());
  const loadDrivers = async () => setDrivers(await fetchDrivers());
  const loadVehicles = async () => setVehicles(await fetchVehicles());
  const loadRideLogs = async () => setRideLogs(await fetchRideLogs());
  const loadSettlements = async () => setSettlements(await fetchSettlements());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 관제사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadCalls();
    // INTENTIONAL_ERROR: cachedPendingCount and cachedRecentCall remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (region, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 서울 강남권(3초 지연) 결과가 최신 서울 서초권(0.2초) 결과를 덮어씀
    showToast(`택시 배차 목록 조회 중 [권역: ${region} / 상태: ${status}]...`, 'info');
    searchCallsApi(region, status, search).then(data => {
      setCalls(data);
      if (region === '서울 강남권') {
        showToast('서울 강남권 호출 수신 완료 (3초 지연 완료 ➔ 최신 권역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`호출 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedCalls[idx] 아닌 원본 calls[idx] 호출이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedCalls[idx];
    if (clicked) {
      showToast(`[${clicked.origin} ➔ ${clicked.destination}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 호출 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusFeeRace = (callId, target, actualFeeWon) => {
    showToast('운행중 변경(3초 지연)과 요금 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchCallStatusApi(callId, target.status);
    setTimeout(() => {
      patchCallFeeApi(callId, actualFeeWon);
    }, 100);
    setTimeout(async () => {
      showToast('운행 요금 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('운행중 변경 완료 (3초 완료 - 요금 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadCalls();
    }, 4000);
  };

  const triggerCancelCompleteConflict = (callId) => {
    showToast('호출 취소(0.5초 완료)와 운행 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelCallApi(callId);
    setTimeout(async () => {
      showToast('호출 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadCalls();
    }, 600);
    completeRideApi(callId);
    setTimeout(async () => {
      showToast('운행 완료 처리 (4초 완료 → CANCELLED 호출을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadCalls();
      await loadRideLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, driverName, carNo, phone) => {
    await patchDriverPartialApi(id, driverName, carNo, phone);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/차량번호/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadDrivers();
  };

  const deleteLog = async (id) => {
    const data = await deleteRideLogApi(id);
    if (data.success) {
      showToast('운행 로그 삭제 완료. (대시보드 기사별 매출 및 월별 정산 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadRideLogs();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmSettlementUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 정산 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('TaxiDispatch 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedCalls = useMemo(() => {
    let list = [...calls];
    if (sortOrder === 'DIST_DESC') {
      list.sort((a, b) => b.distanceKm - a.distanceKm);
    } else if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.actualFeeWon - a.actualFeeWon);
    }
    return list;
  }, [calls, sortOrder]);

  // INTENTIONAL_ERROR: selectedCall is based on original calls[] not sortedCalls[] (Error 3)
  const selectedCall = useMemo(() => calls[selectedIdx] || calls[0] || null, [calls, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingCount={cachedPendingCount} cachedRecentCall={cachedRecentCall} resetSandbox={resetSandbox} />
      <div className="taxidispatch-grid">
        <Sidebar
          filterRegion={filterRegion} setFilterRegion={setFilterRegion}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          calls={sortedCalls} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          drivers={drivers}
        />
        <CenterSection
          calls={calls} drivers={drivers} vehicles={vehicles}
          rideLogs={rideLogs} settlements={settlements} activityLogs={activityLogs}
          deleteRideLog={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedCall={selectedCall}
          setSelectedCall={(u) => setCalls(prev => prev.map(c => c.id === u.id ? u : c))}
          calls={calls} drivers={drivers}
          triggerStatusFeeRace={triggerStatusFeeRace}
          triggerCancelCompleteConflict={triggerCancelCompleteConflict}
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
