import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchZones, fetchDrones, fetchPilots, fetchRequests, fetchFlightLogs, fetchActivityLogs,
  searchRequestsApi, patchRequestZoneApi, patchRequestStatusApi,
  cancelRequestApi, completeShootingApi, approveFlightUnauthorizedApi,
  patchDronePartialApi, deleteFlightLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [zones, setZones] = useState([]);
  const [drones, setDrones] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [flightLogs, setFlightLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-7001');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingCount] = useState(12);
  const [cachedRecentRequest] = useState('인천 송도 국제도시 해안도로 미세먼지 8K 조망 촬영 (PENDING)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadRequests(), loadZones(), loadDrones(), loadPilots(), loadFlightLogs(), loadActivityLogs(), loadStaffs()]);
  const loadRequests = async () => setRequests(await fetchRequests());
  const loadZones = async () => setZones(await fetchZones());
  const loadDrones = async () => setDrones(await fetchDrones());
  const loadPilots = async () => setPilots(await fetchPilots());
  const loadFlightLogs = async () => setFlightLogs(await fetchFlightLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 관제 승인관을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadRequests();
    // INTENTIONAL_ERROR: cachedPendingCount and cachedRecentRequest remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (region, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 강남 관제권(3초 지연) 결과가 최신 송도 구역(0.2초) 결과를 덮어씀
    showToast(`촬영 비행 신청 목록 조회 중 [지역: ${region} / 상태: ${status}]...`, 'info');
    searchRequestsApi(region, status, search).then(data => {
      setRequests(data);
      if (region === '서울 강남 관제권') {
        showToast('강남 관제권 의뢰 수신 완료 (3초 지연 완료 ➔ 최신 지역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`의뢰 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedRequests[idx] 아닌 원본 requests[idx] 의뢰가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedRequests[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 의뢰 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusZoneRace = (reqId, target, zoneName) => {
    showToast('승인완료 변경(3초 지연)과 촬영구역 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchRequestStatusApi(reqId, target.status);
    setTimeout(() => {
      patchRequestZoneApi(reqId, zoneName);
    }, 100);
    setTimeout(async () => {
      showToast('촬영 구역 설정 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('승인완료 변경 완료 (3초 완료 - 촬영구역 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadRequests();
    }, 4000);
  };

  const triggerCancelShootingConflict = (reqId) => {
    showToast('승인 취소(0.5초 완료)와 촬영 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelRequestApi(reqId);
    setTimeout(async () => {
      showToast('승인 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadRequests();
    }, 600);
    completeShootingApi(reqId);
    setTimeout(async () => {
      showToast('촬영 완료 처리 (4초 완료 → CANCELLED 의뢰를 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadRequests();
      await loadFlightLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, droneName, batteryStatus, pilotName) => {
    await patchDronePartialApi(id, droneName, batteryStatus, pilotName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save batteryStatus (Error 8)
    showToast(`[${id}] 드론명/담당조종자/배터리상태가 성공적으로 저장되었습니다.`, 'success');
    await loadDrones();
  };

  const deleteLog = async (id) => {
    const data = await deleteFlightLogApi(id);
    if (data.success) {
      showToast('비행 로그 삭제 완료. (대시보드 조종자별 비행시간 및 드론 사용률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadFlightLogs();
    }
  };

  const testUnauthorizedApproveFlight = async (id) => {
    const res = await approveFlightUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 비행 승인 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('DronePermit 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedRequests = useMemo(() => {
    let list = [...requests];
    if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.flightDate.localeCompare(b.flightDate));
    } else if (sortOrder === 'ALT_DESC') {
      list.sort((a, b) => b.maxAltM - a.maxAltM);
    }
    return list;
  }, [requests, sortOrder]);

  // INTENTIONAL_ERROR: selectedRequest is based on original requests[] not sortedRequests[] (Error 3)
  const selectedRequest = useMemo(() => requests[selectedIdx] || requests[0] || null, [requests, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingCount={cachedPendingCount} cachedRecentRequest={cachedRecentRequest} resetSandbox={resetSandbox} />
      <div className="dronepermit-grid">
        <Sidebar
          filterRegion={filterRegion} setFilterRegion={setFilterRegion}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          requests={sortedRequests} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          zones={zones}
        />
        <CenterSection
          requests={requests} zones={zones} drones={drones} pilots={pilots}
          flightLogs={flightLogs} activityLogs={activityLogs}
          deleteFlightLog={deleteLog} testUnauthorizedApproveFlight={testUnauthorizedApproveFlight}
        />
        <RightPanel
          selectedRequest={selectedRequest}
          setSelectedRequest={(u) => setRequests(prev => prev.map(r => r.id === u.id ? u : r))}
          requests={requests} zones={zones} drones={drones}
          triggerStatusZoneRace={triggerStatusZoneRace}
          triggerCancelShootingConflict={triggerCancelShootingConflict}
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
