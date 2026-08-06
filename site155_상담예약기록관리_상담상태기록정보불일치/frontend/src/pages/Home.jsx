import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchCounselors, fetchClients, fetchCounsels, fetchFollowups, fetchCounselLogs, fetchActivityLogs,
  searchCounselsApi, patchCounselNoteTextApi, patchCounselStatusApi,
  cancelCounselApi, registerFollowupApi, viewCounselLogUnauthorizedApi,
  patchClientPartialApi, deleteCounselLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [clients, setClients] = useState([]);
  const [counsels, setCounsels] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [counselLogs, setCounselLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-7001');
  const [filterCounselor, setFilterCounselor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedTodayCounselCount] = useState(11);
  const [cachedRecentClient] = useState('최내담 님 (직장 스트레스 및 자아 존중감 향상 / 95점)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadCounsels(), loadCounselors(), loadClients(), loadFollowups(), loadCounselLogs(), loadActivityLogs(), loadStaffs()]);
  const loadCounsels = async () => setCounsels(await fetchCounsels());
  const loadCounselors = async () => setCounselors(await fetchCounselors());
  const loadClients = async () => setClients(await fetchClients());
  const loadFollowups = async () => setFollowups(await fetchFollowups());
  const loadCounselLogs = async () => setCounselLogs(await fetchCounselLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 상담사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadCounsels();
    // INTENTIONAL_ERROR: cachedTodayCounselCount and cachedRecentClient remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (counselorName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 김심리(3초 지연) 결과가 최신 이마음(0.2초) 결과를 덮어씀
    showToast(`상담 예약 목록 조회 중 [상담사: ${counselorName} / 상태: ${status}]...`, 'info');
    searchCounselsApi(counselorName, status, search).then(data => {
      setCounsels(data);
      if (counselorName === '김심리 수석상담사') {
        showToast('김심리 상담사 목록 수신 완료 (3초 지연 완료 ➔ 최신 상담사 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`상담 예약 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedCounsels[idx] 아닌 원본 counsels[idx] 예약이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedCounsels[idx];
    if (clicked) {
      showToast(`[${clicked.clientName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusNoteRace = (cnslId, target, noteText) => {
    showToast('상담완료 변경(3초 지연)과 상담 기록 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchCounselStatusApi(cnslId, target.status);
    setTimeout(() => {
      patchCounselNoteTextApi(cnslId, noteText);
    }, 100);
    setTimeout(async () => {
      showToast('비공개 상담 기록 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('상담완료 변경 완료 (3초 완료 - 상담 기록 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadCounsels();
    }, 4000);
  };

  const triggerCancelFollowupConflict = (cnslId) => {
    showToast('상담 취소(0.5초 완료)와 후속 일정 등록(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelCounselApi(cnslId);
    setTimeout(async () => {
      showToast('상담 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadCounsels();
    }, 600);
    registerFollowupApi(cnslId);
    setTimeout(async () => {
      showToast('후속 일정 등록 완료 (4초 완료 → CANCELLED 상담을 FOLLOWUP으로 복원시킴 - Error 2)', 'danger');
      await loadCounsels();
      await loadFollowups();
    }, 4500);
  };

  const triggerPartialSave = async (id, clientName, phone, topic) => {
    await patchClientPartialApi(id, clientName, phone, topic);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/상담주제/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadClients();
  };

  const deleteLog = async (id) => {
    const data = await deleteCounselLogApi(id);
    if (data.success) {
      showToast('상담 기록 삭제 완료. (대시보드 상담사별 처리량 및 후속 일정 비율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadCounselLogs();
    }
  };

  const testUnauthorizedViewLog = async (id) => {
    const res = await viewCounselLogUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 상담 기록 열람 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CounselNote 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedCounsels = useMemo(() => {
    let list = [...counsels];
    if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.counselDate.localeCompare(b.counselDate));
    } else if (sortOrder === 'PRIORITY_DESC') {
      list.sort((a, b) => b.priority.localeCompare(a.priority));
    }
    return list;
  }, [counsels, sortOrder]);

  // INTENTIONAL_ERROR: selectedCounsel is based on original counsels[] not sortedCounsels[] (Error 3)
  const selectedCounsel = useMemo(() => counsels[selectedIdx] || counsels[0] || null, [counsels, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedTodayCounselCount={cachedTodayCounselCount} cachedRecentClient={cachedRecentClient} resetSandbox={resetSandbox} />
      <div className="counselnote-grid">
        <Sidebar
          filterCounselor={filterCounselor} setFilterCounselor={setFilterCounselor}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          counsels={sortedCounsels} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          counselors={counselors}
        />
        <CenterSection
          counsels={counsels} counselors={counselors} clients={clients} followups={followups}
          counselLogs={counselLogs} activityLogs={activityLogs}
          deleteCounselLog={deleteLog} testUnauthorizedViewLog={testUnauthorizedViewLog}
        />
        <RightPanel
          selectedCounsel={selectedCounsel}
          setSelectedCounsel={(u) => setCounsels(prev => prev.map(c => c.id === u.id ? u : c))}
          counsels={counsels} clients={clients}
          triggerStatusNoteRace={triggerStatusNoteRace}
          triggerCancelFollowupConflict={triggerCancelFollowupConflict}
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
