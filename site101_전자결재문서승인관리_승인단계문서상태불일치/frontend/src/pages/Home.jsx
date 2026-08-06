import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import DocEditModal from '../components/DocEditModal.jsx';
import {
  fetchDepartments,
  fetchEmployees,
  fetchDocuments,
  fetchApprovalLines,
  fetchComments,
  fetchActivityLogs,
  searchDocumentsApi,
  patchApprovalLineApi,
  patchDocumentStatusApi,
  rejectDocumentApi,
  submitApprovalCommentApi,
  approveDocumentUnauthorizedApi,
  patchDocPartialApi,
  deleteActivityLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [approvalLines, setApprovalLines] = useState([]);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeEmployee, setActiveEmployee] = useState('EMP-2001');
  const [filterDept, setFilterDept] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [selectedDocForModal, setSelectedDocForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedPendingCount, setCachedPendingCount] = useState(21);
  const [cachedRecentDoc, setCachedRecentDoc] = useState('서버 인프라 증설품의서 (박바캉스 부장 결재대기)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadDepartments();
    await loadEmployees();
    await loadDocuments();
    await loadApprovalLines();
    await loadComments();
    await loadActivityLogs();
  };

  const loadDepartments = async () => {
    const data = await fetchDepartments();
    setDepartments(data);
  };

  const loadEmployees = async () => {
    const data = await fetchEmployees();
    setEmployees(data);
  };

  const loadDocuments = async () => {
    const data = await fetchDocuments();
    setDocuments(data);
  };

  const loadApprovalLines = async () => {
    const data = await fetchApprovalLines();
    setApprovalLines(data);
  };

  const loadComments = async () => {
    const data = await fetchComments();
    setComments(data);
  };

  const loadActivityLogs = async () => {
    const data = await fetchActivityLogs();
    setActivityLogs(data);
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

  // Employee Session Switch (Error 6 Target)
  const handleEmployeeSwitch = (employeeId) => {
    setActiveEmployee(employeeId);
    showToast(`로그인 직원을 [${employeeId}] 결재권으로 변경합니다.`, 'info');
    loadDocuments();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 결재 대기 문서 상세를 본 뒤 직원 B로 로그인하면 문서 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 결재 대기 개수(cachedPendingCount) 및 최근 문서 결재선 요약 캐시(cachedRecentDoc)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Approval Line & Document Status update race condition (Error 1 Trigger)
  const triggerLineStatusRace = (doc) => {
    showToast('결재선 변경(3초 지연)과 문서 결재요청(0.1초)을 순차 처리합니다.', 'info');

    // 1. Document status update to PENDING (0.1s done)
    patchDocumentStatusApi(doc.id, 'PENDING');

    // 2. Approval line update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchApprovalLineApi(doc.id, doc.approverName);
    }, 100);

    setTimeout(async () => {
      showToast('결재선 변경 완료 (결재선은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 결재선과 결재요청 상태 조합이 롤백 저장됨)', 'warning');
      await loadDocuments();
      await loadApprovalLines();
    }, 4500);
  };

  // Dept search race condition (Error 5 Trigger)
  const triggerSearchRace = (deptName, search) => {
    showToast(`부서 전자결재 문서 목록을 조회합니다: [${deptName} / ${search}]`, 'info');

    if (deptName === '경영지원부') {
      searchDocumentsApi('경영지원부', 'ALL', search).then(data => {
        setDocuments(data);
        showToast('경영지원부 문서 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (deptName === 'IT개발부') {
      searchDocumentsApi('IT개발부', 'ALL', search).then(data => {
        setDocuments(data);
        showToast('IT개발부 문서 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchDocumentsApi(deptName, 'ALL', search).then(data => {
        setDocuments(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 결재 대기 문서 목록을 마감일순/중요도순으로 정렬한 뒤 승인/상세 버튼을 누르면 
    // 사용자가 클릭한 문서가 아니라 정렬 전 원본 배열의 같은 index 문서 승인이 진행되는 결함입니다.
    setSelectedDocIndex(index);
    const clickedDoc = sortedDocuments[index];
    if (clickedDoc) {
      showToast(`[${clickedDoc.title}] 결재 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 문서의 기안자/첨부파일이 표시됨)`, 'warning');
    }
  };

  // Reject Document & Submit Approval Comment Conflict (Error 2 Trigger)
  const triggerRejectCommentConflict = (doc) => {
    showToast('문서 반려 처리와 승인 의견 작성을 연쇄 진행합니다.', 'info');

    // 1. Reject Document (0.5s done, status = REJECTED)
    rejectDocumentApi(doc.id);

    // 2. Submit Approval Comment (4.0s delay with restore to PENDING)
    setTimeout(async () => {
      await submitApprovalCommentApi(doc.id, '박바캉스 부장', '보완 사항 확인하여 승인 조치로 재전환함.');
      showToast('문서 반려 응답 완료 (0.5초 완료)', 'warning');
      await loadDocuments();
    }, 100);

    setTimeout(async () => {
      showToast('승인 의견 제출 응답 완료 (4초 지연 완료: 반려된 문서를 PENDING 승인대기 상태로 복원시킴)', 'danger');
      await loadDocuments();
      await loadComments();
    }, 4500);
  };

  // Partial Doc Save (Error 8 Trigger)
  const triggerPartialDocSave = async (id, title, urgency, attachment) => {
    await patchDocPartialApi(id, title, urgency, attachment);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 문서 수정 모달에서 제목, 긴급 여부, 첨부파일명을 동시에 수정하면 백엔드는 제목과 긴급 여부만 저장하고 
    // 첨부파일명은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('문서 제목, 긴급 여부, 첨부파일명이 성공적으로 저장되었습니다.', 'success');
    await loadDocuments();
  };

  // Delete Activity Log (Error 4 Target)
  const deleteActivityLog = async (id) => {
    const data = await deleteActivityLogApi(id);
    if (data.success) {
      showToast('감사 활동 로그를 삭제했습니다. (부서별 결재 완료율 및 평균 처리시간 수치에는 계속 유지됨)', 'warning');
      await loadActivityLogs();
    }
  };

  // Test Unauthorized Approval (Error 7 Trigger)
  const testUnauthorizedApprove = async (id) => {
    try {
      const res = await approveDocumentUnauthorizedApi(id, 'DRAFTER');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 최종 승인 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (docId, title, urgency, attachment) => {
    await patchDocPartialApi(docId, title, urgency, attachment);
    showToast(`[${docId}] 문서 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedDocForModal(null);
    await loadDocuments();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('SignFlow 전자결재 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedDocIndex(0);
    await loadAll();
  };

  const sortedDocuments = useMemo(() => {
    let list = [...documents];
    if (filterDept !== 'ALL') {
      list = list.filter(d => d.deptName === filterDept);
    }
    if (searchTerm) {
      list = list.filter(d => d.title.includes(searchTerm) || d.id.includes(searchTerm) || d.drafterName.includes(searchTerm));
    }
    if (sortOrder === 'DUE_ASC') {
      list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortOrder === 'URGENCY_DESC') {
      const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0));
    }
    return list;
  }, [documents, filterDept, searchTerm, sortOrder]);

  // Selected Doc for RightPanel (Error 3 Effect)
  const selectedDocForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedDocuments[selectedDocIndex] || documents[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted documents array
      return documents[selectedDocIndex] || documents[0];
    }
  }, [sortedDocuments, documents, selectedDocIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeEmployee={activeEmployee}
        handleEmployeeSwitch={handleEmployeeSwitch}
        cachedPendingCount={cachedPendingCount}
        cachedRecentDoc={cachedRecentDoc}
        resetSandbox={resetSandbox}
      />

      <div className="signflow-grid">
        <Sidebar
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          documents={sortedDocuments}
          selectedDocIndex={selectedDocIndex}
          setSelectedDocIndex={setSelectedDocIndex}
          openDetailMismatch={openDetailMismatch}
          departments={departments}
        />

        <CenterSection
          documents={documents}
          employees={employees}
          departments={departments}
          comments={comments}
          activityLogs={activityLogs}
          deleteActivityLog={deleteActivityLog}
          openDocModal={(doc) => setSelectedDocForModal(doc)}
          testUnauthorizedApprove={testUnauthorizedApprove}
        />

        <RightPanel
          selectedDoc={selectedDocForPanel}
          setSelectedDoc={(updated) => {
            setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
          }}
          employees={employees}
          triggerLineStatusRace={triggerLineStatusRace}
          triggerRejectCommentConflict={triggerRejectCommentConflict}
          triggerPartialDocSave={triggerPartialDocSave}
        />
      </div>

      <DocEditModal
        doc={selectedDocForModal}
        onClose={() => setSelectedDocForModal(null)}
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
