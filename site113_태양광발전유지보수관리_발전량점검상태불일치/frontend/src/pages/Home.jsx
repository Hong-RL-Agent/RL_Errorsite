import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchWorkers, fetchZones, fetchInverters, fetchPanels, fetchMaintenanceJobs, fetchPowerLogs, fetchActivityLogs,
  searchPanelsApi, patchPanelWorkerApi, patchPanelStatusApi,
  cancelJobApi, calibratePowerApi, calibratePowerUnauthorizedApi,
  patchPanelPartialApi, deletePowerLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [workers, setWorkers] = useState([]);
  const [zones, setZones] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [panels, setPanels] = useState([]);
  const [maintenanceJobs, setMaintenanceJobs] = useState([]);
  const [powerLogs, setPowerLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeWorker, setActiveWorker] = useState('WRK-9001');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching workers (Error 6)
  const [cachedHotspotCount] = useState(7);
  const [cachedRecentJob] = useState('MOD-B01-01 (Hotspot 과열 현상 / 임열화 점검관 배정)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadPanels(), loadZones(), loadInverters(), loadJobs(), loadPowerLogs(), loadActivityLogs(), loadWorkers()]);
  const loadPanels = async () => setPanels(await fetchPanels());
  const loadZones = async () => setZones(await fetchZones());
  const loadInverters = async () => setInverters(await fetchInverters());
  const loadJobs = async () => setMaintenanceJobs(await fetchMaintenanceJobs());
  const loadPowerLogs = async () => setPowerLogs(await fetchPowerLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadWorkers = async () => setWorkers(await fetchWorkers());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleWorkerSwitch = (workerId) => {
    setActiveWorker(workerId);
    showToast(`로그인 작업자를 [${workerId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadPanels();
    // INTENTIONAL_ERROR: cachedHotspotCount and cachedRecentJob remain from previous worker session (Error 6)
  };

  const triggerSearchRace = (zoneId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - ZONE-A01(3초 지연) 결과가 최신 ZONE-B01(0.2초) 결과를 덮어씀
    showToast(`패널 목록 조회 중 [구역: ${zoneId} / 상태: ${status}]...`, 'info');
    searchPanelsApi(zoneId, status, search).then(data => {
      setPanels(data);
      if (zoneId === 'ZONE-A01') {
        showToast('A구역 패널 목록 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`패널 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedPanels[idx] 아닌 원본 panels[idx] 패널이 열림
    setSelectedIdx(idx);
    const clicked = sortedPanels[idx];
    if (clicked) {
      showToast(`[${clicked.panelNo}] 상세 클릭 (우측 패널에는 원본 배열 인덱스 ${idx}번 패널 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusWorkerRace = (pnl) => {
    showToast('점검 상태 변경(3초 지연)과 작업자 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchPanelStatusApi(pnl.id, pnl.status);
    setTimeout(() => {
      patchPanelWorkerApi(pnl.id, pnl.workerId, pnl.workerName);
    }, 100);
    setTimeout(async () => {
      showToast('작업자 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('점검 상태 변경 완료 (3초 완료 - 작업자 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadPanels();
    }, 4000);
  };

  const triggerCancelCalibrateConflict = (jobId) => {
    showToast('점검 취소(0.5초 완료)와 발전량 보정(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelJobApi(jobId);
    setTimeout(async () => {
      showToast('점검 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadJobs();
    }, 600);
    calibratePowerApi(jobId);
    setTimeout(async () => {
      showToast('발전량 보정 처리 (4초 완료 → CANCELLED 작업을 INSPECTING으로 복원시킴 - Error 2)', 'danger');
      await loadJobs();
      await loadPanels();
    }, 4500);
  };

  const triggerPartialSave = async (id, installDate, grade, zoneId) => {
    await patchPanelPartialApi(id, installDate, grade, zoneId);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save grade (Error 8)
    showToast(`[${id}] 패널 설치일자/패널등급/관리구역이 성공적으로 저장되었습니다.`, 'success');
    await loadPanels();
  };

  const deleteLog = async (id) => {
    const data = await deletePowerLogApi(id);
    if (data.success) {
      showToast('발전량 로그 삭제 완료. (대시보드 구역별 효율 및 인버터 손실률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadPowerLogs();
    }
  };

  const testUnauthorizedCalibrate = async (id) => {
    const res = await calibratePowerUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 발전량 보정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('SolarOps 발전소 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedPanels = useMemo(() => {
    let list = [...panels];
    if (sortOrder === 'OUTPUT_ASC') list.sort((a, b) => a.currentKw - b.currentKw);
    else if (sortOrder === 'TEMP_DESC') list.sort((a, b) => b.tempC - a.tempC);
    return list;
  }, [panels, sortOrder]);

  // INTENTIONAL_ERROR: selectedPanel is based on original panels[] not sortedPanels[] (Error 3)
  const selectedPanel = useMemo(() => panels[selectedIdx] || panels[0] || null, [panels, selectedIdx]);

  return (
    <div id="app">
      <Header activeWorker={activeWorker} handleWorkerSwitch={handleWorkerSwitch} cachedHotspotCount={cachedHotspotCount} cachedRecentJob={cachedRecentJob} resetSandbox={resetSandbox} />
      <div className="solarops-grid">
        <Sidebar
          filterZone={filterZone} setFilterZone={setFilterZone}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          panels={sortedPanels} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          zones={zones}
        />
        <CenterSection
          panels={panels} zones={zones} inverters={inverters}
          maintenanceJobs={maintenanceJobs} powerLogs={powerLogs}
          activityLogs={activityLogs} deletePowerLog={deleteLog}
          testUnauthorizedCalibrate={testUnauthorizedCalibrate}
        />
        <RightPanel
          selectedPanel={selectedPanel}
          setSelectedPanel={(u) => setPanels(prev => prev.map(p => p.id === u.id ? u : p))}
          panels={panels} workers={workers} zones={zones} maintenanceJobs={maintenanceJobs}
          triggerStatusWorkerRace={triggerStatusWorkerRace}
          triggerCancelCalibrateConflict={triggerCancelCalibrateConflict}
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
