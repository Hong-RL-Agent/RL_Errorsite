import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchResearchers, fetchEquipments, fetchReservations, fetchExpLogs, fetchMaintenanceRequests, fetchActivityLogs,
  searchEquipmentsApi, patchReservationTimeApi, addExpLogApi,
  cancelReservationApi, completeEquipmentUseApi, disableEquipmentUnauthorizedApi,
  patchEquipmentPartialApi, deleteExpLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [researchers, setResearchers] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [expLogs, setExpLogs] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeResearcher, setActiveResearcher] = useState('RES-2001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching researchers (Error 6)
  const [cachedMyReservations] = useState(3);
  const [cachedRecentExpLog] = useState('FE-TEM 결정구조 HR-TEM 분석 완료 (김연구)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadEquipments(), loadReservations(), loadExpLogs(), loadMaintenance(), loadActivityLogs(), loadResearchers()]);
  const loadEquipments = async () => setEquipments(await fetchEquipments());
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadExpLogs = async () => setExpLogs(await fetchExpLogs());
  const loadMaintenance = async () => setMaintenanceRequests(await fetchMaintenanceRequests());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadResearchers = async () => setResearchers(await fetchResearchers());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleResearcherSwitch = (researcherId) => {
    setActiveResearcher(researcherId);
    showToast(`로그인 연구원을 [${researcherId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadReservations();
    // INTENTIONAL_ERROR: cachedMyReservations and cachedRecentExpLog remain from previous researcher session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 분석장비(3초 지연) 결과가 최신 측정장비(0.2초) 결과를 덮어씀
    showToast(`장비 목록 조회 중 [유형: ${category} / 상태: ${status}]...`, 'info');
    searchEquipmentsApi(category, status, search).then(data => {
      setEquipments(data);
      if (category === '분석장비') {
        showToast('분석장비 목록 수신 완료 (3초 지연 완료 ➔ 최신 장비 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`장비 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedEquipments[idx] 아닌 원본 equipments[idx] 장비가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedEquipments[idx];
    if (clicked) {
      showToast(`[${clicked.name}] 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 장비 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerTimeExpLogRace = (rsvId, eq, startTime, endTime, expTitle) => {
    showToast('예약 시간 변경(3초 지연)과 실험로그 작성(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReservationTimeApi(rsvId, startTime, endTime);
    setTimeout(() => {
      addExpLogApi({
        equipmentId: eq.id,
        equipmentName: eq.name,
        researcherId: activeResearcher,
        researcherName: "김연구 (책임연구원)",
        expTitle: expTitle || "신규 정밀 측정 실험",
        note: "실험 로그 연동 완료"
      });
    }, 100);
    setTimeout(async () => {
      showToast('실험 로그 작성 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('예약 시간 변경 완료 (3초 완료 - 실험로그 생성이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReservations();
      await loadExpLogs();
    }, 4000);
  };

  const triggerCancelUseConflict = (rsvId) => {
    showToast('예약 취소(0.5초 완료)와 장비 사용완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(rsvId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReservations();
    }, 600);
    completeEquipmentUseApi(rsvId);
    setTimeout(async () => {
      showToast('장비 사용완료 처리 (4초 완료 → CANCELLED 예약을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadReservations();
      await loadEquipments();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, location, inspectCycleDays) => {
    await patchEquipmentPartialApi(id, name, location, inspectCycleDays);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save location (Error 8)
    showToast(`[${id}] 장비명/위치/점검주기가 성공적으로 저장되었습니다.`, 'success');
    await loadEquipments();
  };

  const deleteLog = async (id) => {
    const data = await deleteExpLogApi(id);
    if (data.success) {
      showToast('실험 로그 삭제 완료. (대시보드 장비별 사용률 및 연구원별 사용시간 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadExpLogs();
    }
  };

  const testUnauthorizedDisable = async (id) => {
    const res = await disableEquipmentUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 장비 사용중지 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('LabReserve 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedEquipments = useMemo(() => {
    let list = [...equipments];
    if (sortOrder === 'USAGE_DESC') {
      list.sort((a, b) => b.usageRate - a.usageRate);
    } else if (sortOrder === 'INSPECT_ASC') {
      list.sort((a, b) => a.inspectCycleDays - b.inspectCycleDays);
    }
    return list;
  }, [equipments, sortOrder]);

  // INTENTIONAL_ERROR: selectedEquipment is based on original equipments[] not sortedEquipments[] (Error 3)
  const selectedEquipment = useMemo(() => equipments[selectedIdx] || equipments[0] || null, [equipments, selectedIdx]);

  return (
    <div id="app">
      <Header activeResearcher={activeResearcher} handleResearcherSwitch={handleResearcherSwitch} cachedMyReservations={cachedMyReservations} cachedRecentExpLog={cachedRecentExpLog} resetSandbox={resetSandbox} />
      <div className="labreserve-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          equipments={sortedEquipments} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          equipments={equipments} reservations={reservations} expLogs={expLogs}
          maintenanceRequests={maintenanceRequests} activityLogs={activityLogs}
          deleteExpLog={deleteLog} testUnauthorizedDisable={testUnauthorizedDisable}
        />
        <RightPanel
          selectedEquipment={selectedEquipment}
          setSelectedEquipment={(u) => setEquipments(prev => prev.map(e => e.id === u.id ? u : e))}
          equipments={equipments} reservations={reservations}
          triggerTimeExpLogRace={triggerTimeExpLogRace}
          triggerCancelUseConflict={triggerCancelUseConflict}
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
