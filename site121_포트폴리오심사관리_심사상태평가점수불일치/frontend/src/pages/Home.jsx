import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchReviewers, fetchApplicants, fetchPortfolios, fetchEvaluations, fetchComments, fetchActivityLogs,
  searchApplicantsApi, patchApplicantScoreApi, patchApplicantStatusApi,
  cancelApplicantApi, addEvaluationCommentApi, confirmPassUnauthorizedApi,
  patchApplicantPartialApi, deleteEvaluationApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [reviewers, setReviewers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeReviewer, setActiveReviewer] = useState('REV-6001');
  const [filterJob, setFilterJob] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching reviewer (Error 6)
  const [cachedPendingCount] = useState(15);
  const [cachedRecentApplicant] = useState('박기획 지원자 (서비스 기획 - 95.0점 합격)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadApplicants(), loadReviewers(), loadPortfolios(), loadEvaluations(), loadComments(), loadActivityLogs()]);
  const loadApplicants = async () => setApplicants(await fetchApplicants());
  const loadReviewers = async () => setReviewers(await fetchReviewers());
  const loadPortfolios = async () => setPortfolios(await fetchPortfolios());
  const loadEvaluations = async () => setEvaluations(await fetchEvaluations());
  const loadComments = async () => setComments(await fetchComments());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleReviewerSwitch = (reviewerId) => {
    setActiveReviewer(reviewerId);
    showToast(`로그인 심사위원을 [${reviewerId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadApplicants();
    // INTENTIONAL_ERROR: cachedPendingCount and cachedRecentApplicant remain from previous reviewer session (Error 6)
  };

  const triggerSearchRace = (targetJob, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - UX/UI(3초 지연) 결과가 최신 프론트엔드(0.2초) 결과를 덮어씀
    showToast(`지원자 목록 조회 중 [직무: ${targetJob} / 상태: ${status}]...`, 'info');
    searchApplicantsApi(targetJob, status, search).then(data => {
      setApplicants(data);
      if (targetJob === 'UX/UI 디자인') {
        showToast('UX/UI 디자인 지원자 수신 완료 (3초 지연 완료 ➔ 최신 직무 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`지원자 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedApplicants[idx] 아닌 원본 applicants[idx] 지원자가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedApplicants[idx];
    if (clicked) {
      showToast(`[${clicked.name}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 지원자 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusScoreRace = (appId, target, evalScore) => {
    showToast('심사 상태 변경(3초 지연)과 평가 점수 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchApplicantStatusApi(appId, target.status);
    setTimeout(() => {
      patchApplicantScoreApi(appId, evalScore);
    }, 100);
    setTimeout(async () => {
      showToast('평가 점수 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('심사 상태 변경 완료 (3초 완료 - 평가 점수 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadApplicants();
    }, 4000);
  };

  const triggerCancelCommentConflict = (appId) => {
    showToast('지원 취소(0.5초 완료)와 심사 코멘트 작성(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelApplicantApi(appId);
    setTimeout(async () => {
      showToast('지원 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadApplicants();
    }, 600);
    addEvaluationCommentApi(appId);
    setTimeout(async () => {
      showToast('심사 코멘트 작성 처리 (4초 완료 → CANCELLED 지원을 UNDER_REVIEW로 복원시킴 - Error 2)', 'danger');
      await loadApplicants();
      await loadComments();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, targetJob, phone) => {
    await patchApplicantPartialApi(id, name, targetJob, phone);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save targetJob (Error 8)
    showToast(`[${id}] 지원자 성명/희망직무/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadApplicants();
  };

  const deleteEval = async (id) => {
    const data = await deleteEvaluationApi(id);
    if (data.success) {
      showToast('평가 데이터 삭제 완료. (대시보드 직무별 평균 점수 및 합격률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadEvaluations();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmPassUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 최종 합격 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CareerReview 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedApplicants = useMemo(() => {
    let list = [...applicants];
    if (sortOrder === 'SCORE_DESC') {
      list.sort((a, b) => b.evalScore - a.evalScore);
    } else if (sortOrder === 'EXP_DESC') {
      list.sort((a, b) => b.experienceYears - a.experienceYears);
    }
    return list;
  }, [applicants, sortOrder]);

  // INTENTIONAL_ERROR: selectedApplicant is based on original applicants[] not sortedApplicants[] (Error 3)
  const selectedApplicant = useMemo(() => applicants[selectedIdx] || applicants[0] || null, [applicants, selectedIdx]);

  return (
    <div id="app">
      <Header activeReviewer={activeReviewer} handleReviewerSwitch={handleReviewerSwitch} cachedPendingCount={cachedPendingCount} cachedRecentApplicant={cachedRecentApplicant} resetSandbox={resetSandbox} />
      <div className="careerreview-grid">
        <Sidebar
          filterJob={filterJob} setFilterJob={setFilterJob}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          applicants={sortedApplicants} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          applicants={applicants} evaluations={evaluations} comments={comments}
          activityLogs={activityLogs} deleteEvaluation={deleteEval}
          testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedApplicant={selectedApplicant}
          setSelectedApplicant={(u) => setApplicants(prev => prev.map(a => a.id === u.id ? u : a))}
          applicants={applicants}
          triggerStatusScoreRace={triggerStatusScoreRace}
          triggerCancelCommentConflict={triggerCancelCommentConflict}
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
