import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import IssueEditModal from '../components/IssueEditModal.jsx';
import {
  fetchAdmins,
  fetchProjects,
  fetchTeamMembers,
  fetchIssues,
  fetchComments,
  fetchWorkLogs,
  searchIssuesApi,
  patchIssueStatusApi,
  patchIssueAssigneeApi,
  deleteIssueApi,
  addCommentApi,
  deleteProjectApi,
  patchIssuePartialApi,
  deleteWorkLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-101');
  const [filterProject, setFilterProject] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);
  const [selectedIssueForModal, setSelectedIssueForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedMyIssueCount, setCachedMyIssueCount] = useState(12);
  const [cachedRecentIssue, setCachedRecentIssue] = useState('ISU-2001 (API 라우팅 레이턴시 30ms 단축 / 김동남)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadProjects();
    await loadTeamMembers();
    await loadIssues();
    await loadComments();
    await loadWorkLogs();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadProjects = async () => {
    const data = await fetchProjects();
    setProjects(data);
  };

  const loadTeamMembers = async () => {
    const data = await fetchTeamMembers();
    setTeamMembers(data);
  };

  const loadIssues = async () => {
    const data = await fetchIssues();
    setIssues(data);
  };

  const loadComments = async () => {
    const data = await fetchComments();
    setComments(data);
  };

  const loadWorkLogs = async () => {
    const data = await fetchWorkLogs();
    setWorkLogs(data);
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

  // User Session Switch (Error 6 Target)
  const handleAdminSwitch = (adminId) => {
    setActiveAdmin(adminId);
    showToast(`로그인 작업자를 [${adminId}] 권한으로 변경합니다.`, 'info');
    loadIssues();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 사용자 A가 담당 이슈 목록을 본 뒤 사용자 B로 로그인하면 이슈 목록은 B 담당 기준으로 바뀌지만, 
    // 상단 내 이슈 개수(cachedMyIssueCount) 및 최근 이슈 상세 요약 캐시(cachedRecentIssue)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Assignee update race condition (Error 1 Trigger)
  const triggerStatusAssigneeRace = (isu) => {
    showToast('이슈 상태 변경(3초 지연)과 담당자 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Assignee update (0.1s done)
    patchIssueAssigneeApi(isu.id, isu.assigneeId, isu.assigneeName);

    // 2. Status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchIssueStatusApi(isu.id, isu.status);
    }, 100);

    setTimeout(async () => {
      showToast('이슈 상태 변경 완료 (상태는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 담당자와 새 상태 조합이 롤백 저장됨)', 'warning');
      await loadIssues();
    }, 4500);
  };

  // Project search race condition (Error 5 Trigger)
  const triggerSearchRace = (projectId, search) => {
    showToast(`프로젝트 이슈 목록을 조회합니다: [${projectId} / ${search}]`, 'info');

    if (projectId === 'PRJ-101') {
      searchIssuesApi('PRJ-101', 'ALL', search).then(data => {
        setIssues(data);
        showToast('PRJ-101 이슈 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (projectId === 'PRJ-102') {
      searchIssuesApi('PRJ-102', 'ALL', search).then(data => {
        setIssues(data);
        showToast('PRJ-102 이슈 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchIssuesApi(projectId, 'ALL', search).then(data => {
        setIssues(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 이슈 목록을 우선순위순/마감일순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 이슈가 아니라 정렬 전 원본 배열의 같은 index 이슈 상세가 열리는 결함입니다.
    setSelectedIssueIndex(index);
    const clickedIsu = sortedIssues[index];
    if (clickedIsu) {
      showToast(`[${clickedIsu.title}] 상세보기 알림 (우측 관제 패널에는 인덱스 불일치 이슈의 담당자/댓글이 표시됨)`, 'warning');
    }
  };

  // Delete Issue & Add Comment Conflict (Error 2 Trigger)
  const triggerDeleteCommentConflict = (isu) => {
    showToast('이슈 삭제 처리와 댓글 작성을 연쇄 진행합니다.', 'info');

    // 1. Delete Issue (0.5s done)
    deleteIssueApi(isu.id);

    // 2. Add Comment (4.0s delay with restore)
    setTimeout(async () => {
      await addCommentApi(isu.id, '김프로젝트 PM', '삭제 처리 건에 관한 긴급 보충 리뷰 댓글입니다.');
      showToast('이슈 삭제 응답 완료 (0.5초 완료)', 'warning');
      await loadIssues();
    }, 100);

    setTimeout(async () => {
      showToast('댓글 작성 응답 완료 (4초 지연 완료: 삭제된 이슈를 IN_PROGRESS 상태로 복원시킴)', 'danger');
      await loadIssues();
      await loadComments();
    }, 4500);
  };

  // Partial Issue Save (Error 8 Trigger)
  const triggerPartialIssueSave = async (id, title, dueDate, priority) => {
    await patchIssuePartialApi(id, title, dueDate, priority);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 이슈 수정 모달에서 제목, 마감일, 우선순위를 동시에 수정하면 백엔드는 제목과 우선순위만 저장하고 
    // 마감일은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('이슈 제목, 마감일, 우선순위가 성공적으로 저장되었습니다.', 'success');
    await loadIssues();
  };

  // Delete Work Log (Error 4 Target)
  const deleteWorkLog = async (id) => {
    const data = await deleteWorkLogApi(id);
    if (data.success) {
      showToast('작업 감사 로그를 삭제했습니다. (프로젝트 완료율 및 번다운 차트 수치에는 계속 유지됨)', 'warning');
      await loadWorkLogs();
    }
  };

  // Test Unauthorized Project Delete (Error 7 Trigger)
  const testUnauthorizedProjectDelete = async (id) => {
    try {
      const res = await deleteProjectApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 프로젝트 삭제 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (issueId, title, dueDate, priority) => {
    await patchIssuePartialApi(issueId, title, dueDate, priority);
    showToast(`[${issueId}] 이슈 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedIssueForModal(null);
    await loadIssues();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('TaskFlow 이슈 관리 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIssueIndex(0);
    await loadAll();
  };

  const sortedIssues = useMemo(() => {
    let list = [...issues];
    if (filterProject !== 'ALL') {
      list = list.filter(i => i.projectId === filterProject);
    }
    if (searchTerm) {
      list = list.filter(i => i.title.includes(searchTerm) || i.id.includes(searchTerm));
    }
    if (sortOrder === 'PRIORITY_DESC') {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sortOrder === 'DUEDATE_ASC') {
      list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    return list;
  }, [issues, filterProject, searchTerm, sortOrder]);

  // Selected Issue for RightPanel (Error 3 Effect)
  const selectedIssueForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedIssues[selectedIssueIndex] || issues[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted issues array
      return issues[selectedIssueIndex] || issues[0];
    }
  }, [sortedIssues, issues, selectedIssueIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedMyIssueCount={cachedMyIssueCount}
        cachedRecentIssue={cachedRecentIssue}
        resetSandbox={resetSandbox}
      />

      <div className="taskflow-grid">
        <Sidebar
          filterProject={filterProject}
          setFilterProject={setFilterProject}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          issues={sortedIssues}
          selectedIssueIndex={selectedIssueIndex}
          setSelectedIssueIndex={setSelectedIssueIndex}
          openDetailMismatch={openDetailMismatch}
          projects={projects}
        />

        <CenterSection
          projects={projects}
          issues={issues}
          teamMembers={teamMembers}
          comments={comments}
          workLogs={workLogs}
          deleteWorkLog={deleteWorkLog}
          openIssueModal={(isu) => setSelectedIssueForModal(isu)}
          testUnauthorizedProjectDelete={testUnauthorizedProjectDelete}
        />

        <RightPanel
          selectedIssue={selectedIssueForPanel}
          setSelectedIssue={(updated) => {
            setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
          }}
          teamMembers={teamMembers}
          triggerStatusAssigneeRace={triggerStatusAssigneeRace}
          triggerDeleteCommentConflict={triggerDeleteCommentConflict}
          triggerPartialIssueSave={triggerPartialIssueSave}
        />
      </div>

      <IssueEditModal
        issue={selectedIssueForModal}
        onClose={() => setSelectedIssueForModal(null)}
        onConfirm={handleModalConfirm}
      />

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
