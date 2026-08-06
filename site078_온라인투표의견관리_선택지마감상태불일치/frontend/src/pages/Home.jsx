import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchVotes,
  searchVotesApi,
  fetchVoteDetailApi,
  closeVoteApi,
  patchOptionsApi,
  castVoteApi,
  deleteParticipantApi,
  patchCommentApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [votes, setVotes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [comments, setComments] = useState([]);

  const [activeUser, setActiveUser] = useState('USER_A');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [voterSortOrder, setVoterSortOrder] = useState('NONE');

  const [selectedVote, setSelectedVote] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale options cache for Error 1
  const [previousOptionsCache, setPreviousOptionsCache] = useState([]);

  // User session stats cache (Error 6 Target)
  const [cachedVotedCount, setCachedVotedCount] = useState(4);
  const [cachedRecentResultTitle, setCachedRecentResultTitle] = useState('2026 하반기 사내 복지 정책 최우선 과제 투표');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadVotes();
  };

  const loadVotes = async () => {
    const data = await fetchVotes();
    setVotes(data);

    if (data.length > 0 && !selectedVote) {
      setSelectedVote(data[0]);
      setPreviousOptionsCache(data[0].options);
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getCategoryLabel = (cat) => {
    const map = {
      WELFARE: "복지/근태",
      TECH: "IT/기술",
      CULTURE: "조직문화"
    };
    return map[cat] || cat;
  };

  // User Session Switch (Error 6 Target)
  const handleUserSwitch = (userId) => {
    setActiveUser(userId);
    showToast(`로그인 투표자 계정을 [${userId}] 회원으로 변경합니다.`, 'info');
    loadVotes();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 사용자 A가 참여한 투표 목록을 본 뒤 사용자 B로 로그인하면 목록은 B 기준으로 갱신되나, 
    // 상단 참여 완료 개수와 최근 결과 캐시(cachedVotedCount, cachedRecentResultTitle)를 갱신하지 않고 사용자 A 데이터로 남겨두는 결함입니다.
  };

  // Options edit & Close race condition (Error 1 Trigger)
  const triggerOptionsCloseRace = (vote) => {
    showToast('선택지 문구 수정과 투표 마감 요청을 순차 실행합니다.', 'info');

    // 1. POST Close (0.1s delay)
    closeVoteApi(vote.id);

    // 2. PATCH Options (3.0s delay) - sends old previousOptionsCache
    setTimeout(() => {
      patchOptionsApi(vote.id, previousOptionsCache);
    }, 100);

    setPreviousOptionsCache(vote.options);

    setTimeout(async () => {
      showToast('선택지 수정 완료 (마감되었으나 3초 지연 완료로 이전 구형 선택지 문구로 롤백됨)', 'warning');
      await loadVotes();
    }, 4500);
  };

  // Category & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (cat, status) => {
    showToast(`투표 필터를 조회합니다: [${cat} / ${status}]`, 'info');

    if (cat === 'WELFARE') {
      searchVotesApi('WELFARE', status).then(data => {
        setVotes(data);
        showToast('복지/근태 투표 안건 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (cat === 'TECH') {
      searchVotesApi('TECH', status).then(data => {
        setVotes(data);
        showToast('IT/기술 투표 안건 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchVotesApi(cat, status).then(data => {
        setVotes(data);
      });
    }
  };

  // Voter Sort Index Mismatch (Error 3 Target)
  const confirmCastVote = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 후 잘못된 대상 선택
    // DESCRIPTION: 투표 목록을 참여자순으로 정렬한 뒤 투표하기 버튼을 누르면 
    // 화면의 정렬 인덱스(index)를 원본 투표 배열(votes)에 대입해 
    // 클릭한 투표가 아니라 정렬 전 원본 배열의 같은 index 투표 id로 참여가 저장되는 결함입니다.
    const targetVote = votes[index];
    if (!targetVote) {
      showToast('투표 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    castVoteApi(targetVote.id, activeUser === 'USER_A' ? '김철수' : '이영희', targetVote.options[0]?.id || 'OPT-01-A', activeUser);
    showToast(`[${targetVote.title}] 안건에 투표 참여를 완료했습니다. (인덱스 불일치 오참여 가능)`, 'warning');
  };

  // Comment edit & Status Reversal (Error 4 Trigger)
  const triggerCommentStatusReversal = (cmt) => {
    showToast('댓글 수정 요청을 전송합니다. (투표 마감 상태 역전 가능)', 'info');

    patchCommentApi(cmt.id, cmt.content);

    setTimeout(async () => {
      showToast('댓글 수정 완료 (4초 지연 완료: 마감 상태였던 투표가 OPEN으로 강제 상태 역전됨)', 'danger');
      await loadVotes();
    }, 4500);
  };

  // Delete Participant (Error 2 Target)
  const deleteParticipant = async (id) => {
    const data = await deleteParticipantApi(id);
    if (data.success) {
      showToast('투표 참여를 취소했습니다. (결과 그래프 및 총 참여자 수와 statistics 객체에는 계속 포함됨)', 'warning');
      await loadVotes();
    }
  };

  // Duplicate Cast Attempt (Error 7 Trigger)
  const triggerDuplicateCast = async (vote) => {
    const res = await castVoteApi(vote.id, activeUser === 'USER_A' ? '김철수' : '이영희', vote.options[0]?.id || 'OPT-01-A', activeUser);
    if (res.status === 409) {
      showToast('HTTP 409 Conflict: 이미 해당 투표에 참여하셨습니다. (투표 감사 로그 voteLogs에는 중복 참여가 기록됨)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('VoteSquare 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedVote(null);
    await loadAll();
  };

  const sortedVotes = useMemo(() => {
    let list = [...votes];
    if (filterCategory !== 'ALL') {
      list = list.filter(v => v.category === filterCategory);
    }
    if (filterStatus !== 'ALL') {
      list = list.filter(v => v.status === filterStatus);
    }
    if (voterSortOrder === 'VOTERS_DESC') {
      list.sort((a, b) => b.totalVoters - a.totalVoters);
    }
    return list;
  }, [votes, filterCategory, filterStatus, voterSortOrder]);

  return (
    <div id="app">
      <Header
        activeUser={activeUser}
        handleUserSwitch={handleUserSwitch}
        cachedVotedCount={cachedVotedCount}
        cachedRecentResultTitle={cachedRecentResultTitle}
        resetSandbox={resetSandbox}
      />

      <div className="votesquare-grid">
        <Sidebar
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          voterSortOrder={voterSortOrder}
          setVoterSortOrder={setVoterSortOrder}
          triggerSearchRace={triggerSearchRace}
          sortedVotes={sortedVotes}
          selectedVote={selectedVote}
          setSelectedVote={setSelectedVote}
          confirmCastVote={confirmCastVote}
          getCategoryLabel={getCategoryLabel}
        />

        <CenterSection
          selectedVote={selectedVote}
          participants={participants}
          deleteParticipant={deleteParticipant}
          getCategoryLabel={getCategoryLabel}
        />

        <RightPanel
          selectedVote={selectedVote}
          setSelectedVote={setSelectedVote}
          triggerOptionsCloseRace={triggerOptionsCloseRace}
          triggerCommentStatusReversal={triggerCommentStatusReversal}
          triggerDuplicateCast={triggerDuplicateCast}
          comments={comments}
        />
      </div>

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
