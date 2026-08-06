import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchActors, fetchLocations, fetchScenes, fetchSchedules, fetchFilmingLogs, fetchActivityLogs,
  searchScenesApi, patchSceneActorScheduleApi, patchSceneStatusApi,
  cancelSceneApi, completeFilmingLogApi, completeSceneUnauthorizedApi,
  patchScenePartialApi, deleteFilmingLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [actors, setActors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [filmingLogs, setFilmingLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-8001');
  const [filterActor, setFilterActor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedUnshotCount] = useState(36);
  const [cachedRecentScene] = useState('Scene #45 부두 야간 빗속 격투 액션 씬 (최민수 배우 / 인천항 3번 부두)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadScenes(), loadActors(), loadLocations(), loadSchedules(), loadFilmingLogs(), loadActivityLogs(), loadStaffs()]);
  const loadScenes = async () => setScenes(await fetchScenes());
  const loadActors = async () => setActors(await fetchActors());
  const loadLocations = async () => setLocations(await fetchLocations());
  const loadSchedules = async () => setSchedules(await fetchSchedules());
  const loadFilmingLogs = async () => setFilmingLogs(await fetchFilmingLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 제작진을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadScenes();
    // INTENTIONAL_ERROR: cachedUnshotCount and cachedRecentScene remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (actorName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 최민수(3초 지연) 결과가 최신 이병헌(0.2초) 결과를 덮어씀
    showToast(`장면 목록 조회 중 [배우: ${actorName} / 상태: ${status}]...`, 'info');
    searchScenesApi(actorName, status, search).then(data => {
      setScenes(data);
      if (actorName.includes('최민수')) {
        showToast('최민수 배우 출연 장면 수신 완료 (3초 지연 완료 ➔ 최신 배우 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`장면 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedScenes[idx] 아닌 원본 scenes[idx] 장면이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedScenes[idx];
    if (clicked) {
      showToast(`[${clicked.sceneName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 장면 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusScheduleRace = (scnId, target, actorName, actorSchedule) => {
    showToast('촬영완료 변경(3초 지연)과 배우 스케줄 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchSceneStatusApi(scnId, target.status);
    setTimeout(() => {
      patchSceneActorScheduleApi(scnId, actorName, actorSchedule);
    }, 100);
    setTimeout(async () => {
      showToast('배우 스케줄 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('촬영완료 변경 완료 (3초 완료 - 배우 스케줄 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadScenes();
    }, 4000);
  };

  const triggerCancelLogConflict = (scnId) => {
    showToast('촬영 취소(0.5초 완료)와 촬영 로그 작성(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelSceneApi(scnId);
    setTimeout(async () => {
      showToast('촬영 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadScenes();
    }, 600);
    completeFilmingLogApi(scnId);
    setTimeout(async () => {
      showToast('촬영 로그 작성 처리 (4초 완료 → CANCELLED 장면을 FILMING으로 복원시킴 - Error 2)', 'danger');
      await loadScenes();
      await loadFilmingLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, sceneName, location, shootDate) => {
    await patchScenePartialApi(id, sceneName, location, shootDate);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save location (Error 8)
    showToast(`[${id}] 장면명/로케이션/촬영예정일이 성공적으로 저장되었습니다.`, 'success');
    await loadScenes();
  };

  const deleteLog = async (id) => {
    const data = await deleteFilmingLogApi(id);
    if (data.success) {
      showToast('촬영 로그 삭제 완료. (대시보드 배우별 촬영 시간 및 진행률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadFilmingLogs();
    }
  };

  const testUnauthorizedComplete = async (id) => {
    const res = await completeSceneUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 촬영 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FilmBoard 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedScenes = useMemo(() => {
    let list = [...scenes];
    const impMap = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
    if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.shootDate.localeCompare(b.shootDate));
    } else if (sortOrder === 'IMPORTANCE_DESC') {
      list.sort((a, b) => (impMap[b.importance] || 0) - (impMap[a.importance] || 0));
    }
    return list;
  }, [scenes, sortOrder]);

  // INTENTIONAL_ERROR: selectedScene is based on original scenes[] not sortedScenes[] (Error 3)
  const selectedScene = useMemo(() => scenes[selectedIdx] || scenes[0] || null, [scenes, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedUnshotCount={cachedUnshotCount} cachedRecentScene={cachedRecentScene} resetSandbox={resetSandbox} />
      <div className="filmboard-grid">
        <Sidebar
          filterActor={filterActor} setFilterActor={setFilterActor}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          scenes={sortedScenes} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          actors={actors}
        />
        <CenterSection
          scenes={scenes} actors={actors} locations={locations}
          filmingLogs={filmingLogs} activityLogs={activityLogs}
          deleteFilmingLog={deleteLog} testUnauthorizedComplete={testUnauthorizedComplete}
        />
        <RightPanel
          selectedScene={selectedScene}
          setSelectedScene={(u) => setScenes(prev => prev.map(s => s.id === u.id ? u : s))}
          scenes={scenes} actors={actors} locations={locations}
          triggerStatusScheduleRace={triggerStatusScheduleRace}
          triggerCancelLogConflict={triggerCancelLogConflict}
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
