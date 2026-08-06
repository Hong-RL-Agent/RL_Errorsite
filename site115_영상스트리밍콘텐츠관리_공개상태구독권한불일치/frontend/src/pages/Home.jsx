import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchPlans, fetchSeries, fetchContents, fetchUsers, fetchWatchLogs, fetchActivityLogs,
  searchContentsApi, patchContentPlanApi, patchContentStatusApi,
  makeContentPrivateApi, addWatchLogApi, publishContentUnauthorizedApi,
  patchContentPartialApi, deleteWatchLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [series, setSeries] = useState([]);
  const [contents, setContents] = useState([]);
  const [users, setUsers] = useState([]);
  const [watchLogs, setWatchLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('ADM-1001');
  const [filterGenre, setFilterGenre] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingReviews] = useState(5);
  const [cachedRecentContent] = useState('사이버펑크 서울 2099 EP.01 (PREMIUM 구독 권한 / 공개중)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadContents(), loadSeries(), loadPlans(), loadUsers(), loadWatchLogs(), loadActivityLogs(), loadStaffs()]);
  const loadContents = async () => setContents(await fetchContents());
  const loadSeries = async () => setSeries(await fetchSeries());
  const loadPlans = async () => setPlans(await fetchPlans());
  const loadUsers = async () => setUsers(await fetchUsers());
  const loadWatchLogs = async () => setWatchLogs(await fetchWatchLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadContents();
    // INTENTIONAL_ERROR: cachedPendingReviews and cachedRecentContent remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (genre, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - SF/액션(3초 지연) 결과가 최신 드라마/법정(0.2초) 결과를 덮어씀
    showToast(`콘텐츠 목록 조회 중 [장르: ${genre} / 상태: ${status}]...`, 'info');
    searchContentsApi(genre, status, search).then(data => {
      setContents(data);
      if (genre === 'SF/액션') {
        showToast('SF/액션 콘텐츠 목록 수신 완료 (3초 지연 완료 ➔ 최신 장르 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`콘텐츠 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedContents[idx] 아닌 원본 contents[idx] 영상이 열림
    setSelectedIdx(idx);
    const clicked = sortedContents[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 클릭 (우측 패널에는 원본 배열 인덱스 ${idx}번 영상 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusPlanRace = (cnt) => {
    showToast('공개 상태 변경(3초 지연)과 구독권한 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchContentStatusApi(cnt.id, cnt.status);
    setTimeout(() => {
      patchContentPlanApi(cnt.id, cnt.requiredPlan);
    }, 100);
    setTimeout(async () => {
      showToast('구독권한 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('공개 상태 변경 완료 (3초 완료 - 구독권한 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadContents();
    }, 4000);
  };

  const triggerPrivateWatchConflict = (cntId) => {
    showToast('비공개 처리(0.5초 완료)와 시청 로그 생성(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    makeContentPrivateApi(cntId);
    setTimeout(async () => {
      showToast('비공개 처리 완료 (0.5초 완료 → 상태: PRIVATE)', 'warning');
      await loadContents();
    }, 600);
    addWatchLogApi(cntId);
    setTimeout(async () => {
      showToast('시청 로그 생성 완료 (4초 완료 → PRIVATE 콘텐츠를 PUBLISHED로 복원시킴 - Error 2)', 'danger');
      await loadContents();
      await loadWatchLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, genre, rating) => {
    await patchContentPartialApi(id, title, genre, rating);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save genre (Error 8)
    showToast(`[${id}] 영상 제목/장르/관람등급이 성공적으로 저장되었습니다.`, 'success');
    await loadContents();
  };

  const deleteLog = async (id) => {
    const data = await deleteWatchLogApi(id);
    if (data.success) {
      showToast('시청 로그 삭제 완료. (대시보드 인기 순위 및 장르별 시청시간 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadWatchLogs();
    }
  };

  const testUnauthorizedPublish = async (id) => {
    const res = await publishContentUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 콘텐츠 공개 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('StreamAdmin 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedContents = useMemo(() => {
    let list = [...contents];
    if (sortOrder === 'VIEWS_DESC') {
      list.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortOrder === 'RELEASE_DESC') {
      list.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    }
    return list;
  }, [contents, sortOrder]);

  // INTENTIONAL_ERROR: selectedContent is based on original contents[] not sortedContents[] (Error 3)
  const selectedContent = useMemo(() => contents[selectedIdx] || contents[0] || null, [contents, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingReviews={cachedPendingReviews} cachedRecentContent={cachedRecentContent} resetSandbox={resetSandbox} />
      <div className="streamadmin-grid">
        <Sidebar
          filterGenre={filterGenre} setFilterGenre={setFilterGenre}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          contents={sortedContents} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          contents={contents} series={series} plans={plans}
          watchLogs={watchLogs} activityLogs={activityLogs}
          deleteWatchLog={deleteLog} testUnauthorizedPublish={testUnauthorizedPublish}
        />
        <RightPanel
          selectedContent={selectedContent}
          setSelectedContent={(u) => setContents(prev => prev.map(c => c.id === u.id ? u : c))}
          contents={contents} plans={plans}
          triggerStatusPlanRace={triggerStatusPlanRace}
          triggerPrivateWatchConflict={triggerPrivateWatchConflict}
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
