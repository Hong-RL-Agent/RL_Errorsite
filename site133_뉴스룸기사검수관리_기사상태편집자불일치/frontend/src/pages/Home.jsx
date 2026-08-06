import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchEditors, fetchReporters, fetchArticles, fetchReviewComments, fetchPublishLogs, fetchActivityLogs,
  searchArticlesApi, patchArticleEditorApi, patchArticleStatusApi,
  deleteArticleApi, addReviewCommentApi, publishArticleUnauthorizedApi,
  patchArticlePartialApi, deletePublishLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [editors, setEditors] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [reviewComments, setReviewComments] = useState([]);
  const [publishLogs, setPublishLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-3001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching editor (Error 6)
  const [cachedReviewingCount] = useState(15);
  const [cachedRecentArticle] = useState('[단독] 차세대 AI 반도체 수주 계약 체결 (IT/과학 / 이데스크)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadArticles(), loadEditors(), loadReporters(), loadReviewComments(), loadPublishLogs(), loadActivityLogs(), loadStaffs()]);
  const loadArticles = async () => setArticles(await fetchArticles());
  const loadEditors = async () => setEditors(await fetchEditors());
  const loadReporters = async () => setReporters(await fetchReporters());
  const loadReviewComments = async () => setReviewComments(await fetchReviewComments());
  const loadPublishLogs = async () => setPublishLogs(await fetchPublishLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 에디터를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadArticles();
    // INTENTIONAL_ERROR: cachedReviewingCount and cachedRecentArticle remain from previous editor session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 정치/사회(3초 지연) 결과가 최신 IT/과학(0.2초) 결과를 덮어씀
    showToast(`기사 목록 조회 중 [카테고리: ${category} / 상태: ${status}]...`, 'info');
    searchArticlesApi(category, status, search).then(data => {
      setArticles(data);
      if (category === '정치/사회') {
        showToast('정치/사회 기사 수신 완료 (3초 지연 완료 ➔ 최신 카테고리 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`기사 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedArticles[idx] 아닌 원본 articles[idx] 기사가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedArticles[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 기사 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusEditorRace = (artId, target, editorName) => {
    showToast('발행예약 변경(3초 지연)과 담당 편집자 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchArticleStatusApi(artId, target.status);
    setTimeout(() => {
      patchArticleEditorApi(artId, editorName);
    }, 100);
    setTimeout(async () => {
      showToast('담당 편집자 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('발행예약 변경 완료 (3초 완료 - 담당 편집자 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadArticles();
    }, 4000);
  };

  const triggerDeleteCommentConflict = (artId, editorName, commentText) => {
    showToast('기사 삭제(0.5초 완료)와 데스크 검수 의견 작성(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    deleteArticleApi(artId);
    setTimeout(async () => {
      showToast('기사 삭제 완료 (0.5초 완료 → 데이터베이스에서 소거됨)', 'warning');
      await loadArticles();
    }, 600);
    addReviewCommentApi(artId, editorName, commentText);
    setTimeout(async () => {
      showToast('데스크 검수 의견 작성 처리 (4초 완료 → 삭제된 기사를 REVIEWING으로 복원시킴 - Error 2)', 'danger');
      await loadArticles();
      await loadReviewComments();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, category, scheduledTime) => {
    await patchArticlePartialApi(id, title, category, scheduledTime);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save category (Error 8)
    showToast(`[${id}] 제목/카테고리/발행예정시각이 성공적으로 저장되었습니다.`, 'success');
    await loadArticles();
  };

  const deleteLog = async (id) => {
    const data = await deletePublishLogApi(id);
    if (data.success) {
      showToast('발행 로그 삭제 완료. (대시보드 카테고리별 발행 수 및 기자별 기사 수 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadPublishLogs();
    }
  };

  const testUnauthorizedPublish = async (id) => {
    const res = await publishArticleUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 최종 발행 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('NewsDesk 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedArticles = useMemo(() => {
    let list = [...articles];
    if (sortOrder === 'VIEWS_DESC') {
      list.sort((a, b) => b.views - a.views);
    } else if (sortOrder === 'CODE_DESC') {
      list.sort((a, b) => b.articleCode.localeCompare(a.articleCode));
    }
    return list;
  }, [articles, sortOrder]);

  // INTENTIONAL_ERROR: selectedArticle is based on original articles[] not sortedArticles[] (Error 3)
  const selectedArticle = useMemo(() => articles[selectedIdx] || articles[0] || null, [articles, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedReviewingCount={cachedReviewingCount} cachedRecentArticle={cachedRecentArticle} resetSandbox={resetSandbox} />
      <div className="newsdesk-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          articles={sortedArticles} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          articles={articles} reporters={reporters} editors={editors}
          reviewComments={reviewComments} publishLogs={publishLogs} activityLogs={activityLogs}
          deletePublishLog={deleteLog} testUnauthorizedPublish={testUnauthorizedPublish}
        />
        <RightPanel
          selectedArticle={selectedArticle}
          setSelectedArticle={(u) => setArticles(prev => prev.map(a => a.id === u.id ? u : a))}
          articles={articles} editors={editors}
          triggerStatusEditorRace={triggerStatusEditorRace}
          triggerDeleteCommentConflict={triggerDeleteCommentConflict}
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
