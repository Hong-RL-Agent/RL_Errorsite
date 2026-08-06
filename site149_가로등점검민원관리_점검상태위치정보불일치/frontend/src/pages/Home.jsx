import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchLights, fetchWorkers, fetchReports, fetchTasks, fetchLocationLogs, fetchActivityLogs,
  searchReportsApi, patchReportLocationApi, patchReportStatusApi,
  cancelReportApi, completeReportApi, completeReportUnauthorizedApi,
  patchLightPartialApi, deleteLocationLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [lights, setLights] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [locationLogs, setLocationLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-1001');
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedUnprocessedCount] = useState(16);
  const [cachedRecentReport] = useState('서울 강남구 테헤란로 123 앞 (HIGH 위험 / 점검중)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadReports(), loadLights(), loadWorkers(), loadTasks(), loadLocationLogs(), loadActivityLogs(), loadStaffs()]);
  const loadReports = async () => setReports(await fetchReports());
  const loadLights = async () => setLights(await fetchLights());
  const loadWorkers = async () => setWorkers(await fetchWorkers());
  const loadTasks = async () => setTasks(await fetchTasks());
  const loadLocationLogs = async () => setLocationLogs(await fetchLocationLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 시설물 담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadReports();
    // INTENTIONAL_ERROR: cachedUnprocessedCount and cachedRecentReport remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (district, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 테헤란로(3초 지연) 결과가 최신 반포대로(0.2초) 결과를 덮어씀
    showToast(`가로등 고장 신고 목록 조회 중 [구역: ${district} / 상태: ${status}]...`, 'info');
    searchReportsApi(district, status, search).then(data => {
      setReports(data);
      if (district === '강남구 테헤란로 권역') {
        showToast('테헤란로 권역 신고 수신 완료 (3초 지연 완료 ➔ 최신 구역 결과를 덮어썼을 수 있음)', 'warning');
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
      showToast(`[${clicked.issueType}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 신고 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusLocationRace = (rptId, target, location) => {
    showToast('조치완료 변경(3초 지연)과 위치 정보 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReportStatusApi(rptId, target.status);
    setTimeout(() => {
      patchReportLocationApi(rptId, location);
    }, 100);
    setTimeout(async () => {
      showToast('가로등 설치 위치 정보 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('조치완료 변경 완료 (3초 완료 - 위치 정보 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReports();
    }, 4000);
  };

  const triggerCancelCompleteConflict = (rptId) => {
    showToast('신고 취소(0.5초 완료)와 점검 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelReportApi(rptId);
    setTimeout(async () => {
      showToast('신고 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReports();
    }, 600);
    completeReportApi(rptId);
    setTimeout(async () => {
      showToast('점검 완료 처리 (4초 완료 → CANCELLED 신고를 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadReports();
      await loadLocationLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, lightCode, location, bulbType) => {
    await patchLightPartialApi(id, lightCode, location, bulbType);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save location (Error 8)
    showToast(`[${id}] 관리번호/전구타입/설치위치가 성공적으로 저장되었습니다.`, 'success');
    await loadLights();
  };

  const deleteLog = async (id) => {
    const data = await deleteLocationLogApi(id);
    if (data.success) {
      showToast('위치 로그 삭제 완료. (대시보드 구역별 고장률 및 작업자 처리량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadLocationLogs();
    }
  };

  const testUnauthorizedCompleteReport = async (id) => {
    const res = await completeReportUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 점검 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('StreetLightOps 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedReports = useMemo(() => {
    let list = [...reports];
    if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.rptDate.localeCompare(b.rptDate));
    } else if (sortOrder === 'RISK_DESC') {
      list.sort((a, b) => b.riskLevel.localeCompare(a.riskLevel));
    }
    return list;
  }, [reports, sortOrder]);

  // INTENTIONAL_ERROR: selectedReport is based on original reports[] not sortedReports[] (Error 3)
  const selectedReport = useMemo(() => reports[selectedIdx] || reports[0] || null, [reports, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedUnprocessedCount={cachedUnprocessedCount} cachedRecentReport={cachedRecentReport} resetSandbox={resetSandbox} />
      <div className="streetlightops-grid">
        <Sidebar
          filterDistrict={filterDistrict} setFilterDistrict={setFilterDistrict}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          reports={sortedReports} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          lights={lights}
        />
        <CenterSection
          reports={reports} lights={lights} workers={workers}
          locationLogs={locationLogs} activityLogs={activityLogs}
          deleteLocationLog={deleteLog} testUnauthorizedCompleteReport={testUnauthorizedCompleteReport}
        />
        <RightPanel
          selectedReport={selectedReport}
          setSelectedReport={(u) => setReports(prev => prev.map(r => r.id === u.id ? u : r))}
          reports={reports} lights={lights}
          triggerStatusLocationRace={triggerStatusLocationRace}
          triggerCancelCompleteConflict={triggerCancelCompleteConflict}
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
