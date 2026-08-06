import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchClients, fetchTranslators, fetchRequests, fetchReviewComments, fetchActivityLogs,
  searchRequestsApi, patchRequestFeeApi, patchRequestStatusApi,
  cancelRequestApi, completeDeliveryApi, confirmQuoteUnauthorizedApi,
  patchClientPartialApi, deleteReviewCommentApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [clients, setClients] = useState([]);
  const [translators, setTranslators] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviewComments, setReviewComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-3001');
  const [filterLangPair, setFilterLangPair] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedReviewingCount] = useState(16);
  const [cachedRecentRequest] = useState('보안 서비스 약관 번역 (Sarah Jenkins / 1,850,000원)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadRequests(), loadClients(), loadTranslators(), loadReviewComments(), loadActivityLogs(), loadStaffs()]);
  const loadRequests = async () => setRequests(await fetchRequests());
  const loadClients = async () => setClients(await fetchClients());
  const loadTranslators = async () => setTranslators(await fetchTranslators());
  const loadReviewComments = async () => setReviewComments(await fetchReviewComments());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 번역 매니저를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadRequests();
    // INTENTIONAL_ERROR: cachedReviewingCount and cachedRecentRequest remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (langPair, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 한국어➔영어(3초 지연) 결과가 최신 일본어(0.2초) 결과를 덮어씀
    showToast(`번역 의뢰 목록 조회 중 [언어쌍: ${langPair} / 상태: ${status}]...`, 'info');
    searchRequestsApi(langPair, status, search).then(data => {
      setRequests(data);
      if (langPair === '한국어 ➔ 영어') {
        showToast('한국어 ➔ 영어 의뢰 수신 완료 (3초 지연 완료 ➔ 최신 언어쌍 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`의뢰 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedRequests[idx] 아닌 원본 requests[idx] 의뢰가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedRequests[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 의뢰 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusFeeRace = (reqId, target, actualFeeWon) => {
    showToast('검수완료 변경(3초 지연)과 견적 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchRequestStatusApi(reqId, target.status);
    setTimeout(() => {
      patchRequestFeeApi(reqId, actualFeeWon);
    }, 100);
    setTimeout(async () => {
      showToast('견적 금액 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('검수완료 변경 완료 (3초 완료 - 금액 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadRequests();
    }, 4000);
  };

  const triggerCancelDeliveryConflict = (reqId) => {
    showToast('의뢰 취소(0.5초 완료)와 납품 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelRequestApi(reqId);
    setTimeout(async () => {
      showToast('의뢰 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadRequests();
    }, 600);
    completeDeliveryApi(reqId);
    setTimeout(async () => {
      showToast('납품 완료 처리 (4초 완료 → CANCELLED 의뢰를 DELIVERED로 복원시킴 - Error 2)', 'danger');
      await loadRequests();
      await loadReviewComments();
    }, 4500);
  };

  const triggerPartialSave = async (id, clientName, phone, company) => {
    await patchClientPartialApi(id, clientName, phone, company);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/소속회사/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadClients();
  };

  const deleteLog = async (id) => {
    const data = await deleteReviewCommentApi(id);
    if (data.success) {
      showToast('검수 의견 삭제 완료. (대시보드 번역가별 품질점수 및 납품 완료율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadReviewComments();
    }
  };

  const testUnauthorizedConfirmQuote = async (id) => {
    const res = await confirmQuoteUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 견적 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('TransDesk 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedRequests = useMemo(() => {
    let list = [...requests];
    if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.actualFeeWon - a.actualFeeWon);
    } else if (sortOrder === 'DUE_ASC') {
      list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return list;
  }, [requests, sortOrder]);

  // INTENTIONAL_ERROR: selectedRequest is based on original requests[] not sortedRequests[] (Error 3)
  const selectedRequest = useMemo(() => requests[selectedIdx] || requests[0] || null, [requests, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedReviewingCount={cachedReviewingCount} cachedRecentRequest={cachedRecentRequest} resetSandbox={resetSandbox} />
      <div className="transdesk-grid">
        <Sidebar
          filterLangPair={filterLangPair} setFilterLangPair={setFilterLangPair}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          requests={sortedRequests} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          translators={translators}
        />
        <CenterSection
          requests={requests} clients={clients} translators={translators}
          reviewComments={reviewComments} activityLogs={activityLogs}
          deleteReviewComment={deleteLog} testUnauthorizedConfirmQuote={testUnauthorizedConfirmQuote}
        />
        <RightPanel
          selectedRequest={selectedRequest}
          setSelectedRequest={(u) => setRequests(prev => prev.map(r => r.id === u.id ? u : r))}
          requests={requests} clients={clients}
          triggerStatusFeeRace={triggerStatusFeeRace}
          triggerCancelDeliveryConflict={triggerCancelDeliveryConflict}
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
