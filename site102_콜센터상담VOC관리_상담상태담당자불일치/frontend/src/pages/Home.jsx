import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import CustomerEditModal from '../components/CustomerEditModal.jsx';
import {
  fetchVocCategories,
  fetchAgents,
  fetchCustomers,
  fetchConsultations,
  fetchMemos,
  fetchActivityLogs,
  searchConsultationsApi,
  patchCallStatusApi,
  patchCallAgentApi,
  completeCallApi,
  reopenCallApi,
  patchStatusUnauthorizedApi,
  patchCustomerPartialApi,
  deleteMemoApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [vocCategories, setVocCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [memos, setMemos] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeAgent, setActiveAgent] = useState('AGT-3001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedCallIndex, setSelectedCallIndex] = useState(0);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedUnprocessedCalls, setCachedUnprocessedCalls] = useState(18);
  const [cachedRecentCustomer, setCachedRecentCustomer] = useState('김동남 고객 (배송지연 / 미배송 3일차)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadVocCategories();
    await loadAgents();
    await loadCustomers();
    await loadConsultations();
    await loadMemos();
    await loadActivityLogs();
  };

  const loadVocCategories = async () => {
    const data = await fetchVocCategories();
    setVocCategories(data);
  };

  const loadAgents = async () => {
    const data = await fetchAgents();
    setAgents(data);
  };

  const loadCustomers = async () => {
    const data = await fetchCustomers();
    setCustomers(data);
  };

  const loadConsultations = async () => {
    const data = await fetchConsultations();
    setConsultations(data);
  };

  const loadMemos = async () => {
    const data = await fetchMemos();
    setMemos(data);
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

  // Agent Session Switch (Error 6 Target)
  const handleAgentSwitch = (agentId) => {
    setActiveAgent(agentId);
    showToast(`로그인 상담원을 [${agentId}] 권한으로 변경합니다.`, 'info');
    loadConsultations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 상담원 A가 고객 상세를 본 뒤 상담원 B로 로그인하면 상담 목록은 B 담당 기준으로 바뀌지만, 
    // 상단 미처리 상담 수(cachedUnprocessedCalls) 및 최근 고객 상세 캐시(cachedRecentCustomer)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Agent update race condition (Error 1 Trigger)
  const triggerStatusAgentRace = (call) => {
    showToast('상담 상태 변경(3초 지연)과 담당 상담원 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Agent update (0.1s done)
    patchCallAgentApi(call.id, call.agentName);

    // 2. Status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchCallStatusApi(call.id, call.status);
    }, 100);

    setTimeout(async () => {
      showToast('상담 상태 변경 완료 (상태는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 담당자와 처리중 상태 조합이 롤백 저장됨)', 'warning');
      await loadConsultations();
    }, 4500);
  };

  // Category search race condition (Error 5 Trigger)
  const triggerSearchRace = (category, search) => {
    showToast(`VOC 카테고리 상담 목록을 조회합니다: [${category} / ${search}]`, 'info');

    if (category === '배송지연') {
      searchConsultationsApi('배송지연', 'ALL', search).then(data => {
        setConsultations(data);
        showToast('배송지연 상담 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (category === '결제오류') {
      searchConsultationsApi('결제오류', 'ALL', search).then(data => {
        setConsultations(data);
        showToast('결제오류 상담 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchConsultationsApi(category, 'ALL', search).then(data => {
        setConsultations(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 상담 목록을 대기시간순/우선순위순으로 정렬한 뒤 상세 보기 버튼을 누르면 
    // 사용자가 클릭한 상담이 아니라 정렬 전 원본 배열의 같은 index 상담 상세가 열리는 결함입니다.
    setSelectedCallIndex(index);
    const clickedCall = sortedConsultations[index];
    if (clickedCall) {
      showToast(`[${clickedCall.id}] 상담 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 상담의 고객명/문의내용이 표시됨)`, 'warning');
    }
  };

  // Complete Call & Reopen Conflict (Error 2 Trigger)
  const triggerCompleteReopenConflict = (call) => {
    showToast('상담 완료 처리와 고객 재문의를 연쇄 진행합니다.', 'info');

    // 1. Complete Call (0.5s done, status = COMPLETED)
    completeCallApi(call.id);

    // 2. Reopen Call (4.0s delay with restore to IN_PROGRESS)
    setTimeout(async () => {
      await reopenCallApi(call.id, '동일 사유로 재문의 접수됨');
      showToast('상담 완료 응답 완료 (0.5초 완료)', 'warning');
      await loadConsultations();
    }, 100);

    setTimeout(async () => {
      showToast('고객 재문의 등록 응답 완료 (4초 지연 완료: 완료된 상담을 IN_PROGRESS 처리중 상태로 복원시킴)', 'danger');
      await loadConsultations();
    }, 4500);
  };

  // Partial Customer Save (Error 8 Trigger)
  const triggerPartialCustomerSave = async (id, phone, tier, recentInquiry) => {
    await patchCustomerPartialApi(id, phone, tier, recentInquiry);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 고객 정보 수정 모달에서 연락처, 등급, 최근 문의 요약을 동시에 수정하면 백엔드는 연락처와 최근 문의 요약만 저장하고 
    // 등급은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 고객 등급, 최근 문의 요약이 성공적으로 저장되었습니다.', 'success');
    await loadCustomers();
  };

  // Delete Memo (Error 4 Target)
  const deleteMemo = async (id) => {
    const data = await deleteMemoApi(id);
    if (data.success) {
      showToast('상담 메모를 삭제했습니다. (상담원별 처리량 및 대시보드 완료율 수치에는 계속 유지됨)', 'warning');
      await loadMemos();
    }
  };

  // Test Unauthorized Status Change (Error 7 Trigger)
  const testUnauthorizedStatusChange = async (id, status) => {
    try {
      const res = await patchStatusUnauthorizedApi(id, status, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 상담 상태 변경 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (customerId, phone, tier, recentInquiry) => {
    await patchCustomerPartialApi(customerId, phone, tier, recentInquiry);
    showToast(`[${customerId}] 고객 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedCustomerForModal(null);
    await loadCustomers();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CallDesk 콜센터 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedCallIndex(0);
    await loadAll();
  };

  const sortedConsultations = useMemo(() => {
    let list = [...consultations];
    if (filterCategory !== 'ALL') {
      list = list.filter(c => c.category === filterCategory);
    }
    if (searchTerm) {
      list = list.filter(c => c.customerName.includes(searchTerm) || c.id.includes(searchTerm) || c.inquiryText.includes(searchTerm));
    }
    if (sortOrder === 'WAIT_DESC') {
      list.sort((a, b) => b.waitTimeMin - a.waitTimeMin);
    } else if (sortOrder === 'PRIORITY_DESC') {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    }
    return list;
  }, [consultations, filterCategory, searchTerm, sortOrder]);

  // Selected Call for RightPanel (Error 3 Effect)
  const selectedCallForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedConsultations[selectedCallIndex] || consultations[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted consultations array
      return consultations[selectedCallIndex] || consultations[0];
    }
  }, [sortedConsultations, consultations, selectedCallIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAgent={activeAgent}
        handleAgentSwitch={handleAgentSwitch}
        cachedUnprocessedCalls={cachedUnprocessedCalls}
        cachedRecentCustomer={cachedRecentCustomer}
        resetSandbox={resetSandbox}
      />

      <div className="calldesk-grid">
        <Sidebar
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          consultations={sortedConsultations}
          selectedCallIndex={selectedCallIndex}
          setSelectedCallIndex={setSelectedCallIndex}
          openDetailMismatch={openDetailMismatch}
          vocCategories={vocCategories}
        />

        <CenterSection
          consultations={consultations}
          customers={customers}
          agents={agents}
          memos={memos}
          activityLogs={activityLogs}
          deleteMemo={deleteMemo}
          openCustomerModal={(cust) => setSelectedCustomerForModal(cust)}
          testUnauthorizedStatusChange={testUnauthorizedStatusChange}
        />

        <RightPanel
          selectedCall={selectedCallForPanel}
          setSelectedCall={(updated) => {
            setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
          agents={agents}
          customers={customers}
          triggerStatusAgentRace={triggerStatusAgentRace}
          triggerCompleteReopenConflict={triggerCompleteReopenConflict}
          triggerPartialCustomerSave={triggerPartialCustomerSave}
        />
      </div>

      <CustomerEditModal
        customer={selectedCustomerForModal}
        onClose={() => setSelectedCustomerForModal(null)}
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
