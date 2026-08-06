import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchZones, fetchVehicles, fetchSchedules, fetchComplaints, fetchPickupLogs, fetchActivityLogs,
  searchSchedulesApi, patchScheduleVehicleApi, patchScheduleStatusApi,
  cancelScheduleApi, resolveComplaintApi, completeScheduleUnauthorizedApi,
  patchVehiclePartialApi, deletePickupLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [pickupLogs, setPickupLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-7001');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingComplaintCount] = useState(12);
  const [cachedRecentSchedule] = useState('종로1가 상업구역 (서울 82바 1234 차배정)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadSchedules(), loadZones(), loadVehicles(), loadComplaints(), loadPickupLogs(), loadActivityLogs(), loadStaffs()]);
  const loadSchedules = async () => setSchedules(await fetchSchedules());
  const loadZones = async () => setZones(await fetchZones());
  const loadVehicles = async () => setVehicles(await fetchVehicles());
  const loadComplaints = async () => setComplaints(await fetchComplaints());
  const loadPickupLogs = async () => setPickupLogs(await fetchPickupLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadSchedules();
    // INTENTIONAL_ERROR: cachedPendingComplaintCount and cachedRecentSchedule remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (zoneId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - ZONE-01(3초 지연) 결과가 최신 ZONE-02(0.2초) 결과를 덮어씀
    showToast(`수거 일정 조회 중 [구역: ${zoneId} / 상태: ${status}]...`, 'info');
    searchSchedulesApi(zoneId, status, search).then(data => {
      setSchedules(data);
      if (zoneId === 'ZONE-01') {
        showToast('종로1가 상업구역 일정 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`수거 일정 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedSchedules[idx] 아닌 원본 schedules[idx] 일정이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedSchedules[idx];
    if (clicked) {
      showToast(`[${clicked.zoneName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 일정 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusVehicleRace = (schId, target) => {
    showToast('수거 진행중 변경(3초 지연)과 차량 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchScheduleStatusApi(schId, target.status);
    setTimeout(() => {
      patchScheduleVehicleApi(schId, target.vehicleId, target.vehiclePlate);
    }, 100);
    setTimeout(async () => {
      showToast('차량 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('수거 진행중 변경 완료 (3초 완료 - 차량 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadSchedules();
    }, 4000);
  };

  const triggerCancelComplaintConflict = (schId) => {
    showToast('수거 취소(0.5초 완료)와 민원 처리완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelScheduleApi(schId);
    setTimeout(async () => {
      showToast('수거 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadSchedules();
    }, 600);
    resolveComplaintApi(schId);
    setTimeout(async () => {
      showToast('민원 처리완료 (4초 완료 → CANCELLED 수거를 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadSchedules();
      await loadComplaints();
    }, 4500);
  };

  const triggerPartialSave = async (id, plateNumber, zoneId, maintenanceStatus) => {
    await patchVehiclePartialApi(id, plateNumber, zoneId, maintenanceStatus);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save zoneId (Error 8)
    showToast(`[${id}] 차량번호/담당구역/정비상태가 성공적으로 저장되었습니다.`, 'success');
    await loadVehicles();
  };

  const deleteLog = async (id) => {
    const data = await deletePickupLogApi(id);
    if (data.success) {
      showToast('수거 로그 삭제 완료. (대시보드 구역별 수거량 및 차량별 작업량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadPickupLogs();
    }
  };

  const testUnauthorizedComplete = async (id) => {
    const res = await completeScheduleUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 수거 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CleanRoute 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedSchedules = useMemo(() => {
    let list = [...schedules];
    if (sortOrder === 'COMPLAINT_DESC') {
      list.sort((a, b) => b.complaintCount - a.complaintCount);
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return list;
  }, [schedules, sortOrder]);

  // INTENTIONAL_ERROR: selectedSchedule is based on original schedules[] not sortedSchedules[] (Error 3)
  const selectedSchedule = useMemo(() => schedules[selectedIdx] || schedules[0] || null, [schedules, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingComplaintCount={cachedPendingComplaintCount} cachedRecentSchedule={cachedRecentSchedule} resetSandbox={resetSandbox} />
      <div className="cleanroute-grid">
        <Sidebar
          filterZone={filterZone} setFilterZone={setFilterZone}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          schedules={sortedSchedules} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          zones={zones}
        />
        <CenterSection
          schedules={schedules} zones={zones} vehicles={vehicles}
          complaints={complaints} pickupLogs={pickupLogs} activityLogs={activityLogs}
          deletePickupLog={deleteLog} testUnauthorizedComplete={testUnauthorizedComplete}
        />
        <RightPanel
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={(u) => setSchedules(prev => prev.map(s => s.id === u.id ? u : s))}
          schedules={schedules} vehicles={vehicles} zones={zones}
          triggerStatusVehicleRace={triggerStatusVehicleRace}
          triggerCancelComplaintConflict={triggerCancelComplaintConflict}
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
