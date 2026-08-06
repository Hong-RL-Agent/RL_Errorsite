import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchDistricts, fetchVolunteers, fetchSchedules, fetchReports, fetchAssignmentLogs, fetchActivityLogs,
  searchSchedulesApi, patchScheduleVolunteerApi, patchScheduleStatusApi,
  cancelScheduleApi, addFieldReportApi, confirmScheduleUnauthorizedApi,
  patchVolunteerPartialApi, deleteAssignmentLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [reports, setReports] = useState([]);
  const [assignmentLogs, setAssignmentLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-4001');
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedUnassignedCount] = useState(8);
  const [cachedRecentSchedule] = useState('종로 출근길 인사 (강열정 봉사자 배정)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadSchedules(), loadDistricts(), loadVolunteers(), loadReports(), loadAssignmentLogs(), loadActivityLogs(), loadStaffs()]);
  const loadSchedules = async () => setSchedules(await fetchSchedules());
  const loadDistricts = async () => setDistricts(await fetchDistricts());
  const loadVolunteers = async () => setVolunteers(await fetchVolunteers());
  const loadReports = async () => setReports(await fetchReports());
  const loadAssignmentLogs = async () => setAssignmentLogs(await fetchAssignmentLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 운영자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadSchedules();
    // INTENTIONAL_ERROR: cachedUnassignedCount and cachedRecentSchedule remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (districtId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - DIS-01(3초 지연) 결과가 최신 DIS-02(0.2초) 결과를 덮어씀
    showToast(`선거구 일정 조회 중 [지역: ${districtId} / 상태: ${status}]...`, 'info');
    searchSchedulesApi(districtId, status, search).then(data => {
      setSchedules(data);
      if (districtId === 'DIS-01') {
        showToast('종로구 일정 수신 완료 (3초 지연 완료 ➔ 최신 지역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`지역 일정 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedSchedules[idx] 아닌 원본 schedules[idx] 일정이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedSchedules[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 일정 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusVolunteerRace = (schId, target) => {
    showToast('일정 진행확정 변경(3초 지연)과 봉사자 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchScheduleStatusApi(schId, target.status);
    setTimeout(() => {
      patchScheduleVolunteerApi(schId, target.assignedVolunteerId, target.assignedVolunteerName);
    }, 100);
    setTimeout(async () => {
      showToast('봉사자 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('일정 진행확정 완료 (3초 완료 - 봉사자 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadSchedules();
    }, 4000);
  };

  const triggerCancelReportConflict = (schId) => {
    showToast('일정 취소(0.5초 완료)와 현장 보고 등록(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelScheduleApi(schId);
    setTimeout(async () => {
      showToast('일정 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadSchedules();
    }, 600);
    addFieldReportApi(schId);
    setTimeout(async () => {
      showToast('현장 보고 등록 처리 (4초 완료 → CANCELLED 일정을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadSchedules();
      await loadReports();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, phone, assignedDistrictId) => {
    await patchVolunteerPartialApi(id, name, phone, assignedDistrictId);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 봉사자 성명/연락처/담당지역이 성공적으로 저장되었습니다.`, 'success');
    await loadVolunteers();
  };

  const deleteLog = async (id) => {
    const data = await deleteAssignmentLogApi(id);
    if (data.success) {
      showToast('배정 로그 삭제 완료. (대시보드 지역별 참여율 및 봉사자 활동 횟수 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadAssignmentLogs();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmScheduleUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 일정확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CampaignCrew 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedSchedules = useMemo(() => {
    let list = [...schedules];
    if (sortOrder === 'REQ_DESC') {
      list.sort((a, b) => b.requiredCount - a.requiredCount);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    }
    return list;
  }, [schedules, sortOrder]);

  // INTENTIONAL_ERROR: selectedSchedule is based on original schedules[] not sortedSchedules[] (Error 3)
  const selectedSchedule = useMemo(() => schedules[selectedIdx] || schedules[0] || null, [schedules, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedUnassignedCount={cachedUnassignedCount} cachedRecentSchedule={cachedRecentSchedule} resetSandbox={resetSandbox} />
      <div className="campaigncrew-grid">
        <Sidebar
          filterDistrict={filterDistrict} setFilterDistrict={setFilterDistrict}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          schedules={sortedSchedules} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          districts={districts}
        />
        <CenterSection
          schedules={schedules} volunteers={volunteers} reports={reports}
          assignmentLogs={assignmentLogs} activityLogs={activityLogs}
          deleteAssignmentLog={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={(u) => setSchedules(prev => prev.map(s => s.id === u.id ? u : s))}
          schedules={schedules} volunteers={volunteers} districts={districts}
          triggerStatusVolunteerRace={triggerStatusVolunteerRace}
          triggerCancelReportConflict={triggerCancelReportConflict}
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
