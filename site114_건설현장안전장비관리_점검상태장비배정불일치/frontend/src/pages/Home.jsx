import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchWorkers, fetchZones, fetchEquipments, fetchSafetyInspections, fetchSafetyTrainings, fetchActivityLogs,
  searchInspectionsApi, patchInspectionEquipmentApi, patchInspectionStatusApi,
  cancelHazardApi, completeEquipmentInspectionApi, completeInspectionUnauthorizedApi,
  patchEquipmentPartialApi, deleteTrainingLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [workers, setWorkers] = useState([]);
  const [zones, setZones] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [safetyTrainings, setSafetyTrainings] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeWorker, setActiveWorker] = useState('WRK-A001');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching workers (Error 6)
  const [cachedPendingHazards] = useState(18);
  const [cachedRecentInspection] = useState('A동 옥상 난간대 미설치 위험 (스카이 차량 SKY-1 배정)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadInspections(), loadZones(), loadEquipments(), loadTrainings(), loadActivityLogs(), loadWorkers()]);
  const loadInspections = async () => setInspections(await fetchSafetyInspections());
  const loadZones = async () => setZones(await fetchZones());
  const loadEquipments = async () => setEquipments(await fetchEquipments());
  const loadTrainings = async () => setSafetyTrainings(await fetchSafetyTrainings());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadWorkers = async () => setWorkers(await fetchWorkers());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleWorkerSwitch = (workerId) => {
    setActiveWorker(workerId);
    showToast(`로그인 관리자를 [${workerId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadInspections();
    // INTENTIONAL_ERROR: cachedPendingHazards and cachedRecentInspection remain from previous worker session (Error 6)
  };

  const triggerSearchRace = (zoneId, riskGrade, search) => {
    // INTENTIONAL_ERROR: Error 5 - ZONE-A1(3초 지연) 결과가 최신 ZONE-B1(0.2초) 결과를 덮어씀
    showToast(`점검 목록 조회 중 [구역: ${zoneId} / 위험도: ${riskGrade}]...`, 'info');
    searchInspectionsApi(zoneId, riskGrade, search).then(data => {
      setInspections(data);
      if (zoneId === 'ZONE-A1') {
        showToast('A동 점검 목록 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`점검 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedInspections[idx] 아닌 원본 inspections[idx] 점검이 열림
    setSelectedIdx(idx);
    const clicked = sortedInspections[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 클릭 (우측 패널에는 원본 배열 인덱스 ${idx}번 점검 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusEquipmentRace = (insp) => {
    showToast('조치완료 처리(3초 지연)와 장비 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchInspectionStatusApi(insp.id, insp.status);
    setTimeout(() => {
      patchInspectionEquipmentApi(insp.id, insp.equipmentId, insp.equipmentName);
    }, 100);
    setTimeout(async () => {
      showToast('장비 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('조치완료 처리 완료 (3초 완료 - 장비 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadInspections();
    }, 4000);
  };

  const triggerCancelEquipmentConflict = (inspId) => {
    showToast('신고 취소(0.5초 완료)와 장비점검 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelHazardApi(inspId);
    setTimeout(async () => {
      showToast('신고 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadInspections();
    }, 600);
    completeEquipmentInspectionApi(inspId);
    setTimeout(async () => {
      showToast('장비점검 완료 처리 (4초 완료 → CANCELLED 위험요소를 IN_PROGRESS로 복원시킴 - Error 2)', 'danger');
      await loadInspections();
      await loadEquipments();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, inspectCycleDays, zoneId) => {
    await patchEquipmentPartialApi(id, name, inspectCycleDays, zoneId);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save inspectCycleDays (Error 8)
    showToast(`[${id}] 장비명/점검주기/배정구역이 성공적으로 저장되었습니다.`, 'success');
    await loadEquipments();
  };

  const deleteLog = async (id) => {
    const data = await deleteTrainingLogApi(id);
    if (data.success) {
      showToast('안전교육 기록 삭제 완료. (작업자 교육 이수율 및 월별 통계 수치에는 계속 반영됨 - Error 4)', 'warning');
      await loadTrainings();
    }
  };

  const testUnauthorizedComplete = async (id) => {
    const res = await completeInspectionUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 조치완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('BuildSafe 건설현장 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedInspections = useMemo(() => {
    let list = [...inspections];
    if (sortOrder === 'RISK_DESC') {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      list.sort((a, b) => (order[a.riskGrade] || 9) - (order[b.riskGrade] || 9));
    } else if (sortOrder === 'DUE_ASC') {
      list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return list;
  }, [inspections, sortOrder]);

  // INTENTIONAL_ERROR: selectedInspection is based on original inspections[] not sortedInspections[] (Error 3)
  const selectedInspection = useMemo(() => inspections[selectedIdx] || inspections[0] || null, [inspections, selectedIdx]);

  return (
    <div id="app">
      <Header activeWorker={activeWorker} handleWorkerSwitch={handleWorkerSwitch} cachedPendingHazards={cachedPendingHazards} cachedRecentInspection={cachedRecentInspection} resetSandbox={resetSandbox} />
      <div className="buildsafe-grid">
        <Sidebar
          filterZone={filterZone} setFilterZone={setFilterZone}
          filterRisk={filterRisk} setFilterRisk={setFilterRisk}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          inspections={sortedInspections} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          zones={zones}
        />
        <CenterSection
          inspections={inspections} zones={zones} equipments={equipments}
          safetyTrainings={safetyTrainings} activityLogs={activityLogs}
          deleteTrainingLog={deleteLog} testUnauthorizedComplete={testUnauthorizedComplete}
        />
        <RightPanel
          selectedInspection={selectedInspection}
          setSelectedInspection={(u) => setInspections(prev => prev.map(i => i.id === u.id ? u : i))}
          inspections={inspections} equipments={equipments} zones={zones}
          triggerStatusEquipmentRace={triggerStatusEquipmentRace}
          triggerCancelEquipmentConflict={triggerCancelEquipmentConflict}
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
