import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchSubjects, fetchExamCenters, fetchExaminees, fetchScores, fetchActivityLogs,
  searchExamineesApi, patchExamineeScoreApi, patchExamineeStatusApi,
  cancelRegistrationApi, completeScoringApi, passExamineeUnauthorizedApi,
  patchExamineePartialApi, deleteScoreApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examCenters, setExamCenters] = useState([]);
  const [examinees, setExaminees] = useState([]);
  const [scores, setScores] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9001');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedUnscoredCount] = useState(16);
  const [cachedRecentExaminee] = useState('홍길동 (정보처리기사 실기 / 85점)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadExaminees(), loadSubjects(), loadExamCenters(), loadScores(), loadActivityLogs(), loadStaffs()]);
  const loadExaminees = async () => setExaminees(await fetchExaminees());
  const loadSubjects = async () => setSubjects(await fetchSubjects());
  const loadExamCenters = async () => setExamCenters(await fetchExamCenters());
  const loadScores = async () => setScores(await fetchScores());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 감독관을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadExaminees();
    // INTENTIONAL_ERROR: cachedUnscoredCount and cachedRecentExaminee remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (subjectName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 정보처리기사(3초 지연) 결과가 최신 빅데이터분석기사(0.2초) 결과를 덮어씀
    showToast(`자격검정 응시자 목록 조회 중 [과목: ${subjectName} / 상태: ${status}]...`, 'info');
    searchExamineesApi(subjectName, status, search).then(data => {
      setExaminees(data);
      if (subjectName === '정보처리기사 (실기)') {
        showToast('정보처리기사 응시자 수신 완료 (3초 지연 완료 ➔ 최신 과목 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`응시자 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedExaminees[idx] 아닌 원본 examinees[idx] 응시자가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedExaminees[idx];
    if (clicked) {
      showToast(`[${clicked.name}] 응시자 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 응시자 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusScoreRace = (exmId, target, score) => {
    showToast('응시완료 변경(3초 지연)과 점수 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchExamineeStatusApi(exmId, target.status);
    setTimeout(() => {
      patchExamineeScoreApi(exmId, score);
    }, 100);
    setTimeout(async () => {
      showToast('CBT 점수 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('응시완료 변경 완료 (3초 완료 - 점수 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadExaminees();
    }, 4000);
  };

  const triggerCancelScoringConflict = (exmId) => {
    showToast('접수 취소(0.5초 완료)와 채점 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelRegistrationApi(exmId);
    setTimeout(async () => {
      showToast('접수 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadExaminees();
    }, 600);
    completeScoringApi(exmId);
    setTimeout(async () => {
      showToast('채점 완료 처리 (4초 완료 → CANCELLED 응시자를 SCORED로 복원시킴 - Error 2)', 'danger');
      await loadExaminees();
      await loadScores();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, phone, examCenter) => {
    await patchExamineePartialApi(id, name, phone, examCenter);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/연락처/시험장이 성공적으로 저장되었습니다.`, 'success');
    await loadExaminees();
  };

  const deleteLog = async (id) => {
    const data = await deleteScoreApi(id);
    if (data.success) {
      showToast('채점 로그 삭제 완료. (대시보드 과목별 평균 및 합격률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadScores();
    }
  };

  const testUnauthorizedPass = async (id) => {
    const res = await passExamineeUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 합격 처리 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CertiExam 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedExaminees = useMemo(() => {
    let list = [...examinees];
    if (sortOrder === 'SCORE_DESC') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.regDate.localeCompare(b.regDate));
    }
    return list;
  }, [examinees, sortOrder]);

  // INTENTIONAL_ERROR: selectedExaminee is based on original examinees[] not sortedExaminees[] (Error 3)
  const selectedExaminee = useMemo(() => examinees[selectedIdx] || examinees[0] || null, [examinees, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedUnscoredCount={cachedUnscoredCount} cachedRecentExaminee={cachedRecentExaminee} resetSandbox={resetSandbox} />
      <div className="certiexam-grid">
        <Sidebar
          filterSubject={filterSubject} setFilterSubject={setFilterSubject}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          examinees={sortedExaminees} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          subjects={subjects}
        />
        <CenterSection
          examinees={examinees} subjects={subjects} examCenters={examCenters}
          scores={scores} activityLogs={activityLogs}
          deleteScore={deleteLog} testUnauthorizedPass={testUnauthorizedPass}
        />
        <RightPanel
          selectedExaminee={selectedExaminee}
          setSelectedExaminee={(u) => setExaminees(prev => prev.map(e => e.id === u.id ? u : e))}
          examinees={examinees} examCenters={examCenters}
          triggerStatusScoreRace={triggerStatusScoreRace}
          triggerCancelScoringConflict={triggerCancelScoringConflict}
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
