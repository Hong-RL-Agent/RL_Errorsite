import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchZones, fetchVehicles, fetchWorkers, fetchTasks, fetchSnowLogs, fetchActivityLogs,
  searchTasksApi, patchTaskLocationApi, patchTaskStatusApi,
  cancelTaskApi, registerSaltUsageApi, completeTaskUnauthorizedApi,
  patchVehiclePartialApi, deleteSnowLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [snowLogs, setSnowLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9001');
  const [filterZoneName, setFilterZoneName] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedDelayedTaskCount] = useState(7);
  const [cachedRecentTask] = useState('강남권역 제설1구역 (15톤 살포차 서울01 / 1.2톤 염포)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadTasks(), loadZones(), loadVehicles(), loadWorkers(), loadSnowLogs(), loadActivityLogs(), loadStaffs()]);
  const loadTasks = async () => setTasks(await fetchTasks());
  const loadZones = async () => setZones(await fetchZones());
  const loadVehicles = async () => setVehicles(await fetchVehicles());
  const loadWorkers = async () => setWorkers(await fetchWorkers());
  const loadSnowLogs = async () => setSnowLogs(await fetchSnowLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 제설 관제관을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadTasks();
    // INTENTIONAL_ERROR: cachedDelayedTaskCount and cachedRecentTask remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (zoneName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 강남1구역(3초 지연) 결과가 최신 강북2구역(0.2초) 결과를 덮어씀
    showToast(`제설 작업 목록 조회 중 [구역: ${zoneName} / 상태: ${status}]...`, 'info');
    searchTasksApi(zoneName, status, search).then(data => {
      setTasks(data);
      if (zoneName === '강남권역 제설1구역 (테헤란로/강남대로)') {
        showToast('강남1구역 목록 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`작업 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedTasks[idx] 아닌 원본 tasks[idx] 작업이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedTasks[idx];
    if (clicked) {
      showToast(`[${clicked.vehicleNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 작업 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusLocationRace = (tskId, target, currentLocation) => {
    showToast('진행중 변경(3초 지연)과 차량 위치 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchTaskStatusApi(tskId, target.status);
    setTimeout(() => {
      patchTaskLocationApi(tskId, currentLocation);
    }, 100);
    setTimeout(async () => {
      showToast('차량 실시간 GPS 위치 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('진행중 변경 완료 (3초 완료 - 차량 위치 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadTasks();
    }, 4000);
  };

  const triggerCancelSaltConflict = (tskId) => {
    showToast('작업 취소(0.5초 완료)와 염화칼슘 사용량 등록(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelTaskApi(tskId);
    setTimeout(async () => {
      showToast('작업 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadTasks();
    }, 600);
    registerSaltUsageApi(tskId);
    setTimeout(async () => {
      showToast('사용량 등록 처리 완료 (4초 완료 → CANCELLED 작업을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadTasks();
      await loadSnowLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, vehicleNo, assignedZone, equipmentStatus) => {
    await patchVehiclePartialApi(id, vehicleNo, assignedZone, equipmentStatus);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save assignedZone (Error 8)
    showToast(`[${id}] 차량번호/장비상태/담당구역이 성공적으로 저장되었습니다.`, 'success');
    await loadVehicles();
  };

  const deleteLog = async (id) => {
    const data = await deleteSnowLogApi(id);
    if (data.success) {
      showToast('제설 로그 삭제 완료. (대시보드 구역별 작업률 및 염화칼슘 사용량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadSnowLogs();
    }
  };

  const testUnauthorizedCompleteTask = async (id) => {
    const res = await completeTaskUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 작업 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('SnowFleet 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedTasks = useMemo(() => {
    let list = [...tasks];
    if (sortOrder === 'PRIORITY_DESC') {
      list.sort((a, b) => a.priority.localeCompare(b.priority));
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return list;
  }, [tasks, sortOrder]);

  // INTENTIONAL_ERROR: selectedTask is based on original tasks[] not sortedTasks[] (Error 3)
  const selectedTask = useMemo(() => tasks[selectedIdx] || tasks[0] || null, [tasks, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedDelayedTaskCount={cachedDelayedTaskCount} cachedRecentTask={cachedRecentTask} resetSandbox={resetSandbox} />
      <div className="snowfleet-grid">
        <Sidebar
          filterZoneName={filterZoneName} setFilterZoneName={setFilterZoneName}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          tasks={sortedTasks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          zones={zones}
        />
        <CenterSection
          tasks={tasks} zones={zones} vehicles={vehicles} workers={workers}
          snowLogs={snowLogs} activityLogs={activityLogs}
          deleteSnowLog={deleteLog} testUnauthorizedCompleteTask={testUnauthorizedCompleteTask}
        />
        <RightPanel
          selectedTask={selectedTask}
          setSelectedTask={(u) => setTasks(prev => prev.map(t => t.id === u.id ? u : t))}
          tasks={tasks} vehicles={vehicles}
          triggerStatusLocationRace={triggerStatusLocationRace}
          triggerCancelSaltConflict={triggerCancelSaltConflict}
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
