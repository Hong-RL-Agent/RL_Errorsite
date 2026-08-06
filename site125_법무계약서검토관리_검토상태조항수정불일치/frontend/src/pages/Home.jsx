import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchClients, fetchContracts, fetchClauses, fetchComments, fetchActivityLogs,
  searchContractsApi, patchContractClauseApi, patchContractStatusApi,
  rejectContractApi, addReviewCommentApi, approveContractUnauthorizedApi,
  patchContractPartialApi, deleteCommentApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-3001');
  const [filterClient, setFilterClient] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingReviewCount] = useState(18);
  const [cachedRecentContract] = useState('삼성전자 AI 라이선스 계약서 (리스크 85점 / 승인대기)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadContracts(), loadClients(), loadClauses(), loadComments(), loadActivityLogs(), loadStaffs()]);
  const loadContracts = async () => setContracts(await fetchContracts());
  const loadClients = async () => setClients(await fetchClients());
  const loadClauses = async () => setClauses(await fetchClauses());
  const loadComments = async () => setComments(await fetchComments());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 법무담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadContracts();
    // INTENTIONAL_ERROR: cachedPendingReviewCount and cachedRecentContract remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (clientName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 삼성전자(3초 지연) 결과가 최신 현대자동차(0.2초) 결과를 덮어씀
    showToast(`계약서 목록 조회 중 [거래처: ${clientName} / 상태: ${status}]...`, 'info');
    searchContractsApi(clientName, status, search).then(data => {
      setContracts(data);
      if (clientName.includes('삼성전자')) {
        showToast('삼성전자 계약서 수신 완료 (3초 지연 완료 ➔ 최신 거래처 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`계약서 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedContracts[idx] 아닌 원본 contracts[idx] 계약이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedContracts[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 계약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusClauseRace = (ctrId, target, clauseContent) => {
    showToast('검토 상태 승인대기 변경(3초 지연)과 조항 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchContractStatusApi(ctrId, target.status);
    setTimeout(() => {
      patchContractClauseApi(ctrId, clauseContent);
    }, 100);
    setTimeout(async () => {
      showToast('조항 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('검토 상태 승인대기 변경 완료 (3초 완료 - 조항 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadContracts();
    }, 4000);
  };

  const triggerRejectCommentConflict = (ctrId) => {
    showToast('계약 반려(0.5초 완료)와 검토 의견 작성(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    rejectContractApi(ctrId);
    setTimeout(async () => {
      showToast('계약 반려 완료 (0.5초 완료 → 상태: REJECTED)', 'warning');
      await loadContracts();
    }, 600);
    addReviewCommentApi(ctrId);
    setTimeout(async () => {
      showToast('검토 의견 작성 처리 (4초 완료 → REJECTED 계약을 UNDER_REVIEW로 복원시킴 - Error 2)', 'danger');
      await loadContracts();
      await loadComments();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, expireDate, clientName) => {
    await patchContractPartialApi(id, title, expireDate, clientName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save expireDate (Error 8)
    showToast(`[${id}] 계약명/만료일/거래처명이 성공적으로 저장되었습니다.`, 'success');
    await loadContracts();
  };

  const deleteCom = async (id) => {
    const data = await deleteCommentApi(id);
    if (data.success) {
      showToast('검토 의견 삭제 완료. (대시보드 리스크 점수 및 승인율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadComments();
    }
  };

  const testUnauthorizedApprove = async (id) => {
    const res = await approveContractUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 최종승인 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('LegalFlow 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedContracts = useMemo(() => {
    let list = [...contracts];
    if (sortOrder === 'RISK_DESC') {
      list.sort((a, b) => b.riskScore - a.riskScore);
    } else if (sortOrder === 'EXPIRE_ASC') {
      list.sort((a, b) => a.expireDate.localeCompare(b.expireDate));
    }
    return list;
  }, [contracts, sortOrder]);

  // INTENTIONAL_ERROR: selectedContract is based on original contracts[] not sortedContracts[] (Error 3)
  const selectedContract = useMemo(() => contracts[selectedIdx] || contracts[0] || null, [contracts, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingReviewCount={cachedPendingReviewCount} cachedRecentContract={cachedRecentContract} resetSandbox={resetSandbox} />
      <div className="legalflow-grid">
        <Sidebar
          filterClient={filterClient} setFilterClient={setFilterClient}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          contracts={sortedContracts} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          clients={clients}
        />
        <CenterSection
          contracts={contracts} clients={clients} comments={comments}
          activityLogs={activityLogs} deleteComment={deleteCom}
          testUnauthorizedApprove={testUnauthorizedApprove}
        />
        <RightPanel
          selectedContract={selectedContract}
          setSelectedContract={(u) => setContracts(prev => prev.map(c => c.id === u.id ? u : c))}
          contracts={contracts} clients={clients}
          triggerStatusClauseRace={triggerStatusClauseRace}
          triggerRejectCommentConflict={triggerRejectCommentConflict}
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
