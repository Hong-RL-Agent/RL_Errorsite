import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchVessels, fetchYards, fetchContainers, fetchActivityLogs,
  searchContainersApi, patchContainerYardApi, assignVesselApi,
  cancelExportApi, completeLoadingApi, assignVesselUnauthorizedApi,
  patchContainerPartialApi, deleteLoadingLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [yards, setYards] = useState([]);
  const [containers, setContainers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STAFF-7001');
  const [filterZone, setFilterZone] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache — these remain stale when switching staff accounts (Error 6)
  const [cachedPending] = useState(18);
  const [cachedRecentContainer] = useState('COSCO2260001 (COSCO Shanghai 배정 / A-01 야드 배치)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    await Promise.all([loadContainers(), loadVessels(), loadYards(), loadActivityLogs()]);
  };
  const loadContainers = async () => setContainers(await fetchContainers());
  const loadVessels = async () => setVessels(await fetchVessels());
  const loadYards = async () => setYards(await fetchYards());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 직원을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadContainers();
    // INTENTIONAL_ERROR: cachedPending and cachedRecentContainer remain from previous staff session
  };

  const triggerSearchRace = (zone, search) => {
    // INTENTIONAL_ERROR
    // Error 5: A구역(3초 지연) 후 B구역(0.2초 완료) 조회 시 늦은 A구역 결과가 B구역 결과를 덮어씀
    showToast(`컨테이너 목록 조회 중 [야드: ${zone} / 검색: ${search}]...`, 'info');
    searchContainersApi(zone, 'ALL', search).then(data => {
      setContainers(data);
      if (zone === 'A구역') {
        showToast('A구역 컨테이너 목록 수신 완료 (3초 지연 완료 ➔ B구역 목록을 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`${zone || '전체'} 컨테이너 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR
    // Error 3: 정렬 후 클릭 시 sortedContainers[idx] 아닌 원본 containers[idx]가 선택됨
    setSelectedIdx(idx);
    const clickedCtn = sortedContainers[idx];
    if (clickedCtn) {
      showToast(`[${clickedCtn.containerNo}] 상세 클릭 (우측 관제 패널에는 원본 배열 인덱스 ${idx}번 컨테이너 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerYardVesselRace = (ctn) => {
    showToast('야드 위치 변경(3초 지연)과 선박 배정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchContainerYardApi(ctn.id, ctn.zone, ctn.yardBlock);
    setTimeout(() => {
      assignVesselApi(ctn.id, ctn.vesselId, ctn.vesselName);
    }, 100);
    setTimeout(async () => {
      showToast('선박 배정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('야드 위치 변경 완료 (3초 완료 - 이전 선박 배정 롤백 가능성 있음 → 새로고침으로 확인)', 'danger');
      await loadContainers();
    }, 4000);
  };

  const triggerCancelLoadingConflict = (ctn) => {
    showToast('반출 취소(0.5초 완료)와 선적 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelExportApi(ctn.id);
    setTimeout(async () => {
      showToast('반출 취소 완료 (0.5초 완료 → 상태: IN_YARD)', 'warning');
      await loadContainers();
    }, 600);
    completeLoadingApi(ctn.id);
    setTimeout(async () => {
      showToast('선적 완료 완료 (4초 완료 → IN_YARD 상태를 LOADED로 복원시킴 - Error 2)', 'danger');
      await loadContainers();
    }, 4500);
  };

  const triggerPartialContainerSave = async (id, weightTon, isDangerous, destination) => {
    await patchContainerPartialApi(id, weightTon, isDangerous, destination);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save isDangerous (Error 8)
    showToast(`[${id}] 컨테이너 무게/위험물여부/목적지가 성공적으로 저장되었습니다.`, 'success');
    await loadContainers();
  };

  const deleteLog = async (id) => {
    const data = await deleteLoadingLogApi(id);
    if (data.success) {
      showToast('선적 작업 로그 삭제 완료. (선박별 적재율 및 야드 점유율 수치에는 계속 반영됨 - Error 4)', 'warning');
      await loadActivityLogs();
    }
  };

  const testUnauthorizedAssign = async (id) => {
    const res = await assignVesselUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 선박 배정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('PortStack 항만 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedContainers = useMemo(() => {
    let list = [...containers];
    if (sortOrder === 'ARRIVAL_ASC') list.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    else if (sortOrder === 'DANGEROUS_FIRST') list.sort((a, b) => (b.isDangerous ? 1 : 0) - (a.isDangerous ? 1 : 0));
    return list;
  }, [containers, sortOrder]);

  // INTENTIONAL_ERROR: selectedContainer is based on original containers[] not sortedContainers[] (Error 3)
  const selectedContainer = useMemo(() => containers[selectedIdx] || containers[0] || null, [containers, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPending={cachedPending} cachedRecentContainer={cachedRecentContainer} resetSandbox={resetSandbox} />
      <div className="portstack-grid">
        <Sidebar filterZone={filterZone} setFilterZone={setFilterZone} searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortOrder={sortOrder} setSortOrder={setSortOrder} triggerSearchRace={triggerSearchRace} containers={sortedContainers} selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch} />
        <CenterSection containers={containers} vessels={vessels} yards={yards} activityLogs={activityLogs} deleteLoadingLog={deleteLog} testUnauthorizedAssign={testUnauthorizedAssign} />
        <RightPanel selectedContainer={selectedContainer} setSelectedContainer={(u) => setContainers(prev => prev.map(c => c.id === u.id ? u : c))} containers={containers} vessels={vessels} triggerYardVesselRace={triggerYardVesselRace} triggerCancelLoadingConflict={triggerCancelLoadingConflict} triggerPartialContainerSave={triggerPartialContainerSave} />
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
