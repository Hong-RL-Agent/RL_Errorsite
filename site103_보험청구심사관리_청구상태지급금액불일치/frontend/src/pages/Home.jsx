import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PolicyholderEditModal from '../components/PolicyholderEditModal.jsx';
import {
  fetchAdjusters,
  fetchProducts,
  fetchPolicyholders,
  fetchClaims,
  fetchMemos,
  fetchPayouts,
  fetchActivityLogs,
  searchClaimsApi,
  patchClaimStatusApi,
  patchPayoutAmountApi,
  rejectClaimApi,
  completeSupplementApi,
  approvePayoutUnauthorizedApi,
  patchPolicyholderPartialApi,
  deletePayoutApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [adjusters, setAdjusters] = useState([]);
  const [products, setProducts] = useState([]);
  const [policyholders, setPolicyholders] = useState([]);
  const [claims, setClaims] = useState([]);
  const [memos, setMemos] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeAdjuster, setActiveAdjuster] = useState('AUD-101');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedClaimIndex, setSelectedClaimIndex] = useState(0);
  const [selectedPolicyholderForModal, setSelectedPolicyholderForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedPendingAudits, setCachedPendingAudits] = useState(19);
  const [cachedRecentClaim, setCachedRecentClaim] = useState('이휴가 가입자 (프리미엄 암진단비 / 20,000,000원 지급완료)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdjusters();
    await loadProducts();
    await loadPolicyholders();
    await loadClaims();
    await loadMemos();
    await loadPayouts();
    await loadActivityLogs();
  };

  const loadAdjusters = async () => {
    const data = await fetchAdjusters();
    setAdjusters(data);
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const loadPolicyholders = async () => {
    const data = await fetchPolicyholders();
    setPolicyholders(data);
  };

  const loadClaims = async () => {
    const data = await fetchClaims();
    setClaims(data);
  };

  const loadMemos = async () => {
    const data = await fetchMemos();
    setMemos(data);
  };

  const loadPayouts = async () => {
    const data = await fetchPayouts();
    setPayouts(data);
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

  // Adjuster Session Switch (Error 6 Target)
  const handleAdjusterSwitch = (adjusterId) => {
    setActiveAdjuster(adjusterId);
    showToast(`로그인 심사자를 [${adjusterId}] 권한으로 변경합니다.`, 'info');
    loadClaims();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 심사자 A가 청구 상세를 본 뒤 심사자 B로 로그인하면 청구 목록은 B 담당 기준으로 바뀌지만, 
    // 상단 심사 대기 건수(cachedPendingAudits) 및 최근 청구 결제 요약 캐시(cachedRecentClaim)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Payout amount update race condition (Error 1 Trigger)
  const triggerStatusPayoutRace = (claim) => {
    showToast('청구 상태 변경(3초 지연)과 지급 예정 금액 수정(0.1초)을 순차 처리합니다.', 'info');

    // 1. Payout amount update (0.1s done)
    patchPayoutAmountApi(claim.id, claim.payoutAmount);

    // 2. Status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchClaimStatusApi(claim.id, claim.status);
    }, 100);

    setTimeout(async () => {
      showToast('청구 상태 변경 완료 (지급액은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 상태와 지급액 조합이 롤백 저장됨)', 'warning');
      await loadClaims();
    }, 4500);
  };

  // Product search race condition (Error 5 Trigger)
  const triggerSearchRace = (productName, search) => {
    showToast(`보험 상품 청구 목록을 조회합니다: [${productName} / ${search}]`, 'info');

    if (productName === '무배당 실손의료비보장보험') {
      searchClaimsApi('무배당 실손의료비보장보험', 'ALL', search).then(data => {
        setClaims(data);
        showToast('실손의료비보장보험 청구 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (productName === '프리미엄 암진단비 종합보험') {
      searchClaimsApi('프리미엄 암진단비 종합보험', 'ALL', search).then(data => {
        setClaims(data);
        showToast('암진단비 종합보험 청구 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchClaimsApi(productName, 'ALL', search).then(data => {
        setClaims(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 청구 목록을 청구금액순/접수일순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 청구가 아니라 정렬 전 원본 배열의 같은 index 청구 상세가 열리는 결함입니다.
    setSelectedClaimIndex(index);
    const clickedClaim = sortedClaims[index];
    if (clickedClaim) {
      showToast(`[${clickedClaim.id}] 청구 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 청구의 가입자명/지급액이 표시됨)`, 'warning');
    }
  };

  // Reject Claim & Supplement Conflict (Error 2 Trigger)
  const triggerRejectSupplementConflict = (claim) => {
    showToast('청구 반려 처리와 서류 보완 등록을 연쇄 진행합니다.', 'info');

    // 1. Reject Claim (0.5s done, status = REJECTED)
    rejectClaimApi(claim.id);

    // 2. Complete Supplement (4.0s delay with restore to UNDER_REVIEW)
    setTimeout(async () => {
      await completeSupplementApi(claim.id);
      showToast('청구 반려 응답 완료 (0.5초 완료)', 'warning');
      await loadClaims();
    }, 100);

    setTimeout(async () => {
      showToast('서류 보완 완료 응답 완료 (4초 지연 완료: 반려된 청구를 UNDER_REVIEW 심사중 상태로 복원시킴)', 'danger');
      await loadClaims();
    }, 4500);
  };

  // Partial Policyholder Save (Error 8 Trigger)
  const triggerPartialPolicyholderSave = async (id, address, phone, bankAccount) => {
    await patchPolicyholderPartialApi(id, address, phone, bankAccount);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 가입자 정보 수정 모달에서 주소, 연락처, 계좌번호를 동시에 수정하면 백엔드는 주소와 계좌번호만 저장하고 
    // 연락처는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('등록 주소, 연락처, 지급 계좌번호가 성공적으로 저장되었습니다.', 'success');
    await loadPolicyholders();
  };

  // Delete Payout (Error 4 Target)
  const deletePayout = async (id) => {
    const data = await deletePayoutApi(id);
    if (data.success) {
      showToast('지급 내역을 삭제했습니다. (월별 지급 총액 및 대시보드 승인율 수치에는 계속 유지됨)', 'warning');
      await loadPayouts();
    }
  };

  // Test Unauthorized Payout Approve (Error 7 Trigger)
  const testUnauthorizedApprove = async (id) => {
    try {
      const res = await approvePayoutUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 지급 승인 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (policyholderId, address, phone, bankAccount) => {
    await patchPolicyholderPartialApi(policyholderId, address, phone, bankAccount);
    showToast(`[${policyholderId}] 가입자 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedPolicyholderForModal(null);
    await loadPolicyholders();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ClaimGuard 손해사정 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedClaimIndex(0);
    await loadAll();
  };

  const sortedClaims = useMemo(() => {
    let list = [...claims];
    if (filterProduct !== 'ALL') {
      list = list.filter(c => c.productName === filterProduct);
    }
    if (searchTerm) {
      list = list.filter(c => c.policyholderName.includes(searchTerm) || c.id.includes(searchTerm) || c.diseaseName.includes(searchTerm));
    }
    if (sortOrder === 'AMOUNT_DESC') {
      list.sort((a, b) => b.claimAmount - a.claimAmount);
    } else if (sortOrder === 'DATE_DESC') {
      list.sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));
    }
    return list;
  }, [claims, filterProduct, searchTerm, sortOrder]);

  // Selected Claim for RightPanel (Error 3 Effect)
  const selectedClaimForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedClaims[selectedClaimIndex] || claims[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted claims array
      return claims[selectedClaimIndex] || claims[0];
    }
  }, [sortedClaims, claims, selectedClaimIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdjuster={activeAdjuster}
        handleAdjusterSwitch={handleAdjusterSwitch}
        cachedPendingAudits={cachedPendingAudits}
        cachedRecentClaim={cachedRecentClaim}
        resetSandbox={resetSandbox}
      />

      <div className="claimguard-grid">
        <Sidebar
          filterProduct={filterProduct}
          setFilterProduct={setFilterProduct}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          claims={sortedClaims}
          selectedClaimIndex={selectedClaimIndex}
          setSelectedClaimIndex={setSelectedClaimIndex}
          openDetailMismatch={openDetailMismatch}
          products={products}
        />

        <CenterSection
          claims={claims}
          policyholders={policyholders}
          products={products}
          memos={memos}
          payouts={payouts}
          activityLogs={activityLogs}
          deletePayout={deletePayout}
          openPolicyholderModal={(p) => setSelectedPolicyholderForModal(p)}
          testUnauthorizedApprove={testUnauthorizedApprove}
        />

        <RightPanel
          selectedClaim={selectedClaimForPanel}
          setSelectedClaim={(updated) => {
            setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
          policyholders={policyholders}
          triggerStatusPayoutRace={triggerStatusPayoutRace}
          triggerRejectSupplementConflict={triggerRejectSupplementConflict}
          triggerPartialPolicyholderSave={triggerPartialPolicyholderSave}
        />
      </div>

      <PolicyholderEditModal
        policyholder={selectedPolicyholderForModal}
        onClose={() => setSelectedPolicyholderForModal(null)}
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
