import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import CustomerEditModal from '../components/CustomerEditModal.jsx';
import {
  fetchAdmins,
  fetchTiers,
  fetchCustomers,
  fetchCoupons,
  fetchPoints,
  fetchPurchases,
  fetchActivityLogs,
  searchCustomersApi,
  patchCustomerTierApi,
  issueCouponApi,
  cancelCouponUsageApi,
  earnPointsApi,
  downgradeTierApi,
  patchCustomerPartialApi,
  deleteCouponUsageApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [points, setPoints] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-101');
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(0);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedCouponCount, setCachedCouponCount] = useState(40);
  const [cachedRecentCustomer, setCachedRecentCustomer] = useState('김동남 고객 (VVIP / 강남 플래그십점)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadTiers();
    await loadCustomers();
    await loadCoupons();
    await loadPoints();
    await loadPurchases();
    await loadActivityLogs();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadTiers = async () => {
    const data = await fetchTiers();
    setTiers(data);
  };

  const loadCustomers = async () => {
    const data = await fetchCustomers();
    setCustomers(data);
  };

  const loadCoupons = async () => {
    const data = await fetchCoupons();
    setCoupons(data);
  };

  const loadPoints = async () => {
    const data = await fetchPoints();
    setPoints(data);
  };

  const loadPurchases = async () => {
    const data = await fetchPurchases();
    setPurchases(data);
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

  // Admin Session Switch (Error 6 Target)
  const handleAdminSwitch = (adminId) => {
    setActiveAdmin(adminId);
    showToast(`로그인 CRM 운영자를 [${adminId}] 권한으로 변경합니다.`, 'info');
    loadCustomers();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 고객 상세를 본 뒤 관리자 B로 로그인하면 고객 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 오늘 발급 쿠폰 수(cachedCouponCount) 및 최근 관리 고객 상세 요약 캐시(cachedRecentCustomer)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Tier & Coupon issuance race condition (Error 1 Trigger)
  const triggerTierCouponRace = (cst) => {
    showToast('고객 등급 변경(3초 지연)과 신규 쿠폰 발급(0.1초)을 순차 처리합니다.', 'info');

    // 1. Issue Coupon (0.1s done)
    issueCouponApi(cst.id, `${cst.tier} 특별 우대 쿠폰`, 15, cst.tier);

    // 2. Tier update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchCustomerTierApi(cst.id, cst.tier);
    }, 100);

    setTimeout(async () => {
      showToast('고객 등급 변경 완료 (등급은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 등급 기준 할인율과 새 등급 카드가 롤백 저장됨)', 'warning');
      await loadCustomers();
      await loadCoupons();
    }, 4500);
  };

  // Tier search race condition (Error 5 Trigger)
  const triggerSearchRace = (tier, search) => {
    showToast(`멤버십 등급 고객 목록을 조회합니다: [${tier} / ${search}]`, 'info');

    if (tier === 'VVIP') {
      searchCustomersApi('VVIP', search).then(data => {
        setCustomers(data);
        showToast('VVIP 등급 고객 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (tier === 'GOLD') {
      searchCustomersApi('GOLD', search).then(data => {
        setCustomers(data);
        showToast('GOLD 등급 고객 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchCustomersApi(tier, search).then(data => {
        setCustomers(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 고객 목록을 누적 구매금액순/포인트순으로 정렬한 뒤 쿠폰 발급 버튼을 누르면 
    // 사용자가 클릭한 고객이 아니라 정렬 전 원본 배열의 같은 index 고객에게 쿠폰이 발급되는 결함입니다.
    setSelectedCustomerIndex(index);
    const clickedCst = sortedCustomers[index];
    if (clickedCst) {
      showToast(`[${clickedCst.name} 고객] 쿠폰 발급 알림 (우측 관제 패널에는 인덱스 불일치 다른 고객에게 쿠폰이 발급 저장됨)`, 'warning');
    }
  };

  // Cancel Coupon Usage & Earn Points Conflict (Error 2 Trigger)
  const triggerCancelCouponConflict = (cst) => {
    showToast('쿠폰 사용 취소와 포인트 적립을 연쇄 진행합니다.', 'info');

    const targetCoupon = coupons.find(c => c.customerId === cst.id) || coupons[0];

    // 1. Cancel Coupon Usage (0.5s done, sets UNUSED)
    cancelCouponUsageApi(targetCoupon.id);

    // 2. Earn Points & Re-activate Coupon to USED (4.0s delay)
    setTimeout(async () => {
      await earnPointsApi(cst.id, 5000, targetCoupon.id);
      showToast('쿠폰 사용 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadCoupons();
    }, 100);

    setTimeout(async () => {
      showToast('포인트 적립 응답 완료 (4초 지연 완료: 취소된 쿠폰을 USED 사용완료 상태로 다시 변경시킴)', 'danger');
      await loadCoupons();
      await loadPoints();
    }, 4500);
  };

  // Partial Customer Save (Error 8 Trigger)
  const triggerPartialCustomerSave = async (id, phone, preferredStore, marketingConsent) => {
    await patchCustomerPartialApi(id, phone, preferredStore, marketingConsent);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 고객 정보 수정 모달에서 연락처, 선호 매장, 마케팅 수신 여부를 동시에 수정하면 백엔드는 연락처와 마케팅 수신 여부만 저장하고 
    // 선호 매장은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 선호 매장, 마케팅 동의 여부가 성공적으로 저장되었습니다.', 'success');
    await loadCustomers();
  };

  // Delete Coupon Usage (Error 4 Target)
  const deleteCouponUsage = async (id) => {
    const data = await deleteCouponUsageApi(id);
    if (data.success) {
      showToast('쿠폰 내역을 삭제했습니다. (대시보드 쿠폰 사용률 및 혜택 총액 수치에는 계속 유지됨)', 'warning');
      await loadCoupons();
    }
  };

  // Test Unauthorized Downgrade (Error 7 Trigger)
  const testUnauthorizedDowngrade = async (id) => {
    try {
      const res = await downgradeTierApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 등급 강등 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (customerId, phone, preferredStore, marketingConsent) => {
    await patchCustomerPartialApi(customerId, phone, preferredStore, marketingConsent);
    showToast(`[${customerId}] 고객 인적사항이 성공적으로 저장되었습니다.`, 'success');
    setSelectedCustomerForModal(null);
    await loadCustomers();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MemberPlus CRM 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedCustomerIndex(0);
    await loadAll();
  };

  const sortedCustomers = useMemo(() => {
    let list = [...customers];
    if (filterTier !== 'ALL') {
      list = list.filter(c => c.tier === filterTier);
    }
    if (searchTerm) {
      list = list.filter(c => c.name.includes(searchTerm) || c.id.includes(searchTerm));
    }
    if (sortOrder === 'SPEND_DESC') {
      list.sort((a, b) => b.totalSpend - a.totalSpend);
    } else if (sortOrder === 'POINTS_DESC') {
      list.sort((a, b) => b.points - a.points);
    }
    return list;
  }, [customers, filterTier, searchTerm, sortOrder]);

  // Selected Customer for RightPanel (Error 3 Effect)
  const selectedCustomerForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedCustomers[selectedCustomerIndex] || customers[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted customers array
      return customers[selectedCustomerIndex] || customers[0];
    }
  }, [sortedCustomers, customers, selectedCustomerIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedCouponCount={cachedCouponCount}
        cachedRecentCustomer={cachedRecentCustomer}
        resetSandbox={resetSandbox}
      />

      <div className="memberplus-grid">
        <Sidebar
          filterTier={filterTier}
          setFilterTier={setFilterTier}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          customers={sortedCustomers}
          selectedCustomerIndex={selectedCustomerIndex}
          setSelectedCustomerIndex={setSelectedCustomerIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          tiers={tiers}
          customers={customers}
          coupons={coupons}
          points={points}
          purchases={purchases}
          activityLogs={activityLogs}
          deleteCouponUsage={deleteCouponUsage}
          openCustomerModal={(cst) => setSelectedCustomerForModal(cst)}
          testUnauthorizedDowngrade={testUnauthorizedDowngrade}
        />

        <RightPanel
          selectedCustomer={selectedCustomerForPanel}
          setSelectedCustomer={(updated) => {
            setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
          tiers={tiers}
          coupons={coupons}
          triggerTierCouponRace={triggerTierCouponRace}
          triggerCancelCouponConflict={triggerCancelCouponConflict}
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
