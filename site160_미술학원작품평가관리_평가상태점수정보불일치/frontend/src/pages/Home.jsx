import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchClasses, fetchStudents, fetchArtworks, fetchEvaluations, fetchFeedbacks, fetchActivityLogs,
  searchArtworksApi, patchArtworkScoreApi, patchArtworkStatusApi,
  cancelSubmissionApi, addFeedbackApi, confirmScoreUnauthorizedApi,
  patchStudentPartialApi, deleteFeedbackApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-8801');
  const [filterClassName, setFilterClassName] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingEvalCount] = useState(9);
  const [cachedRecentArt] = useState('빛과 음영의 정밀 정물 소묘 (최그림 학생 / 96점 S급)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadArtworks(), loadClasses(), loadStudents(), loadEvaluations(), loadFeedbacks(), loadActivityLogs(), loadStaffs()]);
  const loadArtworks = async () => setArtworks(await fetchArtworks());
  const loadClasses = async () => setClasses(await fetchClasses());
  const loadStudents = async () => setStudents(await fetchStudents());
  const loadEvaluations = async () => setEvaluations(await fetchEvaluations());
  const loadFeedbacks = async () => setFeedbacks(await fetchFeedbacks());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 강사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadArtworks();
    // INTENTIONAL_ERROR: cachedPendingEvalCount and cachedRecentArt remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (className, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 입시미술 A반(3초 지연) 결과가 최신 예고소묘 B반(0.2초) 결과를 덮어씀
    showToast(`작품 목록 조회 중 [반: ${className} / 상태: ${status}]...`, 'info');
    searchArtworksApi(className, status, search).then(data => {
      setArtworks(data);
      if (className === '입시미술 수시집중 A반') {
        showToast('입시미술 A반 목록 수신 완료 (3초 지연 완료 ➔ 최신 반 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`작품 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedArtworks[idx] 아닌 원본 artworks[idx] 작품이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedArtworks[idx];
    if (clicked) {
      showToast(`[${clicked.artTitle}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 작품 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusScoreRace = (artId, target, score) => {
    showToast('평가완료 변경(3초 지연)과 점수 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchArtworkStatusApi(artId, target.status);
    setTimeout(() => {
      patchArtworkScoreApi(artId, score);
    }, 100);
    setTimeout(async () => {
      showToast('실기 평가 점수 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('평가완료 변경 완료 (3초 완료 - 점수 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadArtworks();
    }, 4000);
  };

  const triggerCancelFeedbackConflict = (artId) => {
    showToast('작품 제출 취소(0.5초 완료)와 피드백 작성(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelSubmissionApi(artId);
    setTimeout(async () => {
      showToast('작품 제출 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadArtworks();
    }, 600);
    addFeedbackApi(artId);
    setTimeout(async () => {
      showToast('피드백 작성 처리 완료 (4초 완료 → CANCELLED 작품을 EVALUATING으로 복원시킴 - Error 2)', 'danger');
      await loadArtworks();
      await loadFeedbacks();
    }, 4500);
  };

  const triggerPartialSave = async (id, studentName, className, parentContact) => {
    await patchStudentPartialApi(id, studentName, className, parentContact);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save className (Error 8)
    showToast(`[${id}] 학생명/보호자연락처/실기반이 성공적으로 저장되었습니다.`, 'success');
    await loadStudents();
  };

  const deleteLog = async (id) => {
    const data = await deleteFeedbackApi(id);
    if (data.success) {
      showToast('피드백 댓글 삭제 완료. (대시보드 학생별 평균점수 및 강사별 평가량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadFeedbacks();
    }
  };

  const testUnauthorizedConfirmScore = async (id) => {
    const res = await confirmScoreUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 점수 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ArtReview 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedArtworks = useMemo(() => {
    let list = [...artworks];
    if (sortOrder === 'SCORE_DESC') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.submitDate.localeCompare(b.submitDate));
    }
    return list;
  }, [artworks, sortOrder]);

  // INTENTIONAL_ERROR: selectedArtwork is based on original artworks[] not sortedArtworks[] (Error 3)
  const selectedArtwork = useMemo(() => artworks[selectedIdx] || artworks[0] || null, [artworks, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingEvalCount={cachedPendingEvalCount} cachedRecentArt={cachedRecentArt} resetSandbox={resetSandbox} />
      <div className="artreview-grid">
        <Sidebar
          filterClassName={filterClassName} setFilterClassName={setFilterClassName}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          artworks={sortedArtworks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          classes={classes}
        />
        <CenterSection
          artworks={artworks} classes={classes} students={students}
          evaluations={evaluations} feedbacks={feedbacks} activityLogs={activityLogs}
          deleteFeedback={deleteLog} testUnauthorizedConfirmScore={testUnauthorizedConfirmScore}
        />
        <RightPanel
          selectedArtwork={selectedArtwork}
          setSelectedArtwork={(u) => setArtworks(prev => prev.map(a => a.id === u.id ? u : a))}
          artworks={artworks} students={students}
          triggerStatusScoreRace={triggerStatusScoreRace}
          triggerCancelFeedbackConflict={triggerCancelFeedbackConflict}
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
