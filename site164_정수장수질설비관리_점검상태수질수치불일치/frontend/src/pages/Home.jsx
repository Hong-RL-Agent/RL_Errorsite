import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchOperators, fetchEquipments, fetchInspections, fetchAlerts, fetchWaterLogs, fetchActivityLogs,
  searchEquipmentsApi, patchWaterMetricsApi, patchInspectionStatusApi,
  cancelInspectionApi, processAlertActionApi, updateWaterMetricsUnauthorizedApi,
  patchEquipmentPartialApi, deleteWaterLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [operators, setOperators] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('OPR-4401');
  const [filterSection, setFilterSection] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedWarningAlertCount] = useState(6);
  const [cachedRecentEquip] = useState('제1정수장 급속혼화기 (탁도 0.45 NTU > 0.3 NTU 기준 초과)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadInspections(), loadEquipments(), loadAlerts(), loadWaterLogs(), loadActivityLogs(), loadOperators()]);
  const loadInspections = async () => setInspections(await fetchInspections());
  const loadEquipments = async () => setEquipments(await fetchEquipments());
  const loadAlerts = async () => setAlerts(await fetchAlerts());
  const loadWaterLogs = async () => setWaterLogs(await fetchWaterLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadOperators = async () => setOperators(await fetchOperators());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 정수장 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadInspections();
    // INTENTIONAL_ERROR: cachedWarningAlertCount and cachedRecentEquip remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (section, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 제1정수장(3초 지연) 결과가 최신 제2정수장(0.2초) 결과를 덮어씀
    showToast(`정수 설비 목록 조회 중 [섹션: ${section} / 상태: ${status}]...`, 'info');
    searchEquipmentsApi(section, status, search).then(data => {
      setInspections(data);
      if (section === '제1정수장 혼화지/응집지') {
        showToast('제1정수장 목록 수신 완료 (3초 지연 완료 ➔ 최신 섹션 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`설비 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedInspections[idx] 아닌 원본 inspections[idx] 설비가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedInspections[idx];
    if (clicked) {
      showToast(`[${clicked.equipName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 설비 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusMetricsRace = (inspId, target, turbidityNtu, phLevel) => {
    showToast('조치완료 변경(3초 지연)과 탁도 수치 보정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchInspectionStatusApi(inspId, target.status);
    setTimeout(() => {
      patchWaterMetricsApi(inspId, turbidityNtu, phLevel);
    }, 100);
    setTimeout(async () => {
      showToast('수질 탁도 수치 보정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('조치완료 변경 완료 (3초 완료 - 탁도 보정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadInspections();
    }, 4000);
  };

  const triggerCancelAlertConflict = (inspId) => {
    showToast('점검 취소(0.5초 완료)와 이상 알림 처리(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelInspectionApi(inspId);
    setTimeout(async () => {
      showToast('점검 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadInspections();
    }, 600);
    processAlertActionApi(inspId);
    setTimeout(async () => {
      showToast('이상 알림 처리 완료 (4초 완료 → CANCELLED 점검을 IN_PROGRESS로 복원시킴 - Error 2)', 'danger');
      await loadInspections();
      await loadAlerts();
    }, 4500);
  };

  const triggerPartialSave = async (id, equipName, location, checkCycleDays) => {
    await patchEquipmentPartialApi(id, equipName, location, checkCycleDays);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save location (Error 8)
    showToast(`[${id}] 설비명/점검주기/위치가 성공적으로 저장되었습니다.`, 'success');
    await loadEquipments();
  };

  const deleteLog = async (id) => {
    const data = await deleteWaterLogApi(id);
    if (data.success) {
      showToast('수질 로그 삭제 완료. (대시보드 일별 평균 수질 및 설비별 이상률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadWaterLogs();
    }
  };

  const testUnauthorizedCalibrateWaterMetrics = async (id) => {
    const res = await updateWaterMetricsUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 수질 보정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('WaterPlant 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedInspections = useMemo(() => {
    let list = [...inspections];
    if (sortOrder === 'TURBIDITY_DESC') {
      list.sort((a, b) => b.turbidityNtu - a.turbidityNtu);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.checkDate.localeCompare(b.checkDate));
    }
    return list;
  }, [inspections, sortOrder]);

  // INTENTIONAL_ERROR: selectedInspection is based on original inspections[] not sortedInspections[] (Error 3)
  const selectedInspection = useMemo(() => inspections[selectedIdx] || inspections[0] || null, [inspections, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedWarningAlertCount={cachedWarningAlertCount} cachedRecentEquip={cachedRecentEquip} resetSandbox={resetSandbox} />
      <div className="waterplant-grid">
        <Sidebar
          filterSection={filterSection} setFilterSection={setFilterSection}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          inspections={sortedInspections} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          equipments={equipments}
        />
        <CenterSection
          inspections={inspections} equipments={equipments} alerts={alerts}
          waterLogs={waterLogs} activityLogs={activityLogs}
          deleteWaterLog={deleteLog} testUnauthorizedCalibrateWaterMetrics={testUnauthorizedCalibrateWaterMetrics}
        />
        <RightPanel
          selectedInspection={selectedInspection}
          setSelectedInspection={(u) => setInspections(prev => prev.map(i => i.id === u.id ? u : i))}
          inspections={inspections} equipments={equipments}
          triggerStatusMetricsRace={triggerStatusMetricsRace}
          triggerCancelAlertConflict={triggerCancelAlertConflict}
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
