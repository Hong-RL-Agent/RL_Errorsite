import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchTrailSections, fetchPatrolTeams, fetchReports, fetchActionLogs, fetchActivityLogs,
  searchReportsApi, patchReportLocationApi, patchReportStatusApi,
  cancelReportApi, completeActionApi, clearDangerZoneUnauthorizedApi,
  patchReportPartialApi, deleteActionLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [trailSections, setTrailSections] = useState([]);
  const [patrolTeams, setPatrolTeams] = useState([]);
  const [reports, setReports] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-2001');
  const [filterMountain, setFilterMountain] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingCount] = useState(14);
  const [cachedRecentReport] = useState('북한산 백운대 (낙석 위험 / 제1 산악구조대)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadReports(), loadTrailSections(), loadPatrolTeams(), loadActionLogs(), loadActivityLogs(), loadStaffs()]);
  const loadReports = async () => setReports(await fetchReports());
  const loadTrailSections = async () => setTrailSections(await fetchTrailSections());
  const loadPatrolTeams = async () => setPatrolTeams(await fetchPatrolTeams());
  const loadActionLogs = async () => setActionLogs(await fetchActionLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 산림 통제관을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadReports();
    // INTENTIONAL_ERROR: cachedPendingCount and cachedRecentReport remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (mountain, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 북한산(3초 지연) 결과가 최신 설악산(0.2초) 결과를 덮어씀
    showToast(`안전 신고 목록 조회 중 [구역: ${mountain} / 상태: ${status}]...`, 'info');
    searchReportsApi(mountain, status, search).then(data => {
      setReports(data);
      if (mountain === '북한산 국립공원') {
        showToast('북한산 국립공원 신고 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`신고 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedReports[idx] 아닌 원본 reports[idx] 신고가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedReports[idx];
    if (clicked) {
      showToast(`[${clicked.reportType}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 신고 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusLocationRace = (rptId, target, locationDesc) => {
    showToast('조치중 변경(3초 지연)과 위치 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReportStatusApi(rptId, target.status);
    setTimeout(() => {
      patchReportLocationApi(rptId, locationDesc);
    }, 100);
    setTimeout(async () => {
      showToast('위험 위치 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('조치중 변경 완료 (3초 완료 - 위치 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReports();
    }, 4000);
  };

  const triggerCancelActionConflict = (rptId) => {
    showToast('신고 취소(0.5초 완료)와 조치 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelReportApi(rptId);
    setTimeout(async () => {
      showToast('신고 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReports();
    }, 600);
    completeActionApi(rptId);
    setTimeout(async () => {
      showToast('조치 완료 처리 (4초 완료 → CANCELLED 신고를 RESOLVED로 복원시킴 - Error 2)', 'danger');
      await loadReports();
      await loadActionLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, reportType, locationDesc, dangerGrade) => {
    await patchReportPartialApi(id, reportType, locationDesc, dangerGrade);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save locationDesc (Error 8)
    showToast(`[${id}] 신고유형/위치설명/위험등급이 성공적으로 저장되었습니다.`, 'success');
    await loadReports();
  };

  const deleteLog = async (id) => {
    const data = await deleteActionLogApi(id);
    if (data.success) {
      showToast('조치 로그 삭제 완료. (대시보드 구역별 신고 수 및 위험도 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadActionLogs();
    }
  };

  const testUnauthorizedClear = async (id) => {
    const res = await clearDangerZoneUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 위험구역 해제 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('TrailSafe 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedReports = useMemo(() => {
    let list = [...reports];
    if (sortOrder === 'GRADE_DESC') {
      list.sort((a, b) => a.dangerGrade.localeCompare(b.dangerGrade));
    } else if (sortOrder === 'TIME_DESC') {
      list.sort((a, b) => b.reportTime.localeCompare(a.reportTime));
    }
    return list;
  }, [reports, sortOrder]);

  // INTENTIONAL_ERROR: selectedReport is based on original reports[] not sortedReports[] (Error 3)
  const selectedReport = useMemo(() => reports[selectedIdx] || reports[0] || null, [reports, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingCount={cachedPendingCount} cachedRecentReport={cachedRecentReport} resetSandbox={resetSandbox} />
      <div className="trailsafe-grid">
        <Sidebar
          filterMountain={filterMountain} setFilterMountain={setFilterMountain}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          reports={sortedReports} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          trailSections={trailSections}
        />
        <CenterSection
          trailSections={trailSections} reports={reports} patrolTeams={patrolTeams}
          actionLogs={actionLogs} activityLogs={activityLogs}
          deleteActionLog={deleteLog} testUnauthorizedClear={testUnauthorizedClear}
        />
        <RightPanel
          selectedReport={selectedReport}
          setSelectedReport={(u) => setReports(prev => prev.map(r => r.id === u.id ? u : r))}
          reports={reports}
          triggerStatusLocationRace={triggerStatusLocationRace}
          triggerCancelActionConflict={triggerCancelActionConflict}
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
