import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import OrgEditModal from '../components/OrgEditModal.jsx';
import {
  fetchAdmins,
  fetchPlans,
  fetchOrganizations,
  fetchTeamMembers,
  fetchUsageLogs,
  fetchBillingHistories,
  searchOrganizationsApi,
  patchPlanApi,
  patchLicenseSeatsApi,
  cancelSubscriptionApi,
  refreshUsageApi,
  patchPlanUnauthorizedApi,
  patchOrgPartialApi,
  deleteUsageLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [plans, setPlans] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [billingHistories, setBillingHistories] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-101');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const [selectedOrgForModal, setSelectedOrgForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedExpectedBilling, setCachedExpectedBilling] = useState(1545000);
  const [cachedUsageAlert, setCachedUsageAlert] = useState('테크노바 소프트웨어 (API 호출 limit 85% 임계 초과)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadPlans();
    await loadOrganizations();
    await loadTeamMembers();
    await loadUsageLogs();
    await loadBillingHistories();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadPlans = async () => {
    const data = await fetchPlans();
    setPlans(data);
  };

  const loadOrganizations = async () => {
    const data = await fetchOrganizations();
    setOrganizations(data);
  };

  const loadTeamMembers = async () => {
    const data = await fetchTeamMembers();
    setTeamMembers(data);
  };

  const loadUsageLogs = async () => {
    const data = await fetchUsageLogs();
    setUsageLogs(data);
  };

  const loadBillingHistories = async () => {
    const data = await fetchBillingHistories();
    setBillingHistories(data);
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
    showToast(`로그인 관리자를 [${adminId}] 권한으로 변경합니다.`, 'info');
    loadOrganizations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 조직 설정을 본 뒤 관리자 B로 로그인하면 조직 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 청구 예정 금액(cachedExpectedBilling) 및 최근 사용량 알림 캐시(cachedUsageAlert)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Plan & License Seats update race condition (Error 1 Trigger)
  const triggerPlanSeatsRace = (org) => {
    showToast('요금제 변경(3초 지연)과 팀원 라이선스 수 수정(0.1초)을 순차 처리합니다.', 'info');

    // 1. License seats update (0.1s done)
    patchLicenseSeatsApi(org.id, 50);

    // 2. Plan update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchPlanApi(org.id, org.planId, org.planName);
    }, 100);

    setTimeout(async () => {
      showToast('요금제 변경 완료 (플랜은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 라이선스 수와 새 플랜 조합이 롤백 저장됨)', 'warning');
      await loadOrganizations();
    }, 4500);
  };

  // Plan search race condition (Error 5 Trigger)
  const triggerSearchRace = (planId, search) => {
    showToast(`구독 요금제 조직 목록을 조회합니다: [${planId} / ${search}]`, 'info');

    if (planId === 'PLN-ENTERPRISE') {
      searchOrganizationsApi('PLN-ENTERPRISE', 'ALL', search).then(data => {
        setOrganizations(data);
        showToast('Enterprise 요금제 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (planId === 'PLN-BASIC') {
      searchOrganizationsApi('PLN-BASIC', 'ALL', search).then(data => {
        setOrganizations(data);
        showToast('Basic 요금제 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchOrganizationsApi(planId, 'ALL', search).then(data => {
        setOrganizations(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 팀원 목록을 권한순/사용량순으로 정렬한 뒤 라이선스 변경 버튼을 누르면 
    // 사용자가 클릭한 팀원이 아니라 정렬 전 원본 배열의 같은 index 팀원 라이선스가 변경되는 결함입니다.
    setSelectedOrgIndex(index);
    const clickedOrg = sortedOrganizations[index];
    if (clickedOrg) {
      showToast(`[${clickedOrg.name}] 조직 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 조직의 이메일/사업자번호가 표시됨)`, 'warning');
    }
  };

  // Cancel Subscription & Refresh Usage Conflict (Error 2 Trigger)
  const triggerCancelRefreshConflict = (org) => {
    showToast('구독 취소 처리와 사용량 갱신을 연쇄 진행합니다.', 'info');

    // 1. Cancel Subscription (0.5s done, status = CANCELLED)
    cancelSubscriptionApi(org.id);

    // 2. Refresh Usage (4.0s delay with restore to ACTIVE)
    setTimeout(async () => {
      await refreshUsageApi(org.id);
      showToast('구독 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadOrganizations();
    }, 100);

    setTimeout(async () => {
      showToast('사용량 갱신 응답 완료 (4초 지연 완료: 취소된 구독을 ACTIVE 활성 상태로 복원시킴)', 'danger');
      await loadOrganizations();
    }, 4500);
  };

  // Partial Org Save (Error 8 Trigger)
  const triggerPartialOrgSave = async (id, name, billingEmail, bizRegNo) => {
    await patchOrgPartialApi(id, name, billingEmail, bizRegNo);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 조직 정보 수정 모달에서 조직명, 청구 이메일, 사업자번호를 동시에 수정하면 백엔드는 조직명과 사업자번호만 저장하고 
    // 청구 이메일은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('조직명, 청구 이메일, 사업자등록번호가 성공적으로 저장되었습니다.', 'success');
    await loadOrganizations();
  };

  // Delete Usage Log (Error 4 Target)
  const deleteUsageLog = async (id) => {
    const data = await deleteUsageLogApi(id);
    if (data.success) {
      showToast('사용량 측정 로그를 삭제했습니다. (월별 API 사용량 합계 및 청구 예정 금액 수치에는 계속 유지됨)', 'warning');
      await loadUsageLogs();
    }
  };

  // Test Unauthorized Plan Change (Error 7 Trigger)
  const testUnauthorizedPlanChange = async (id, planId) => {
    try {
      const res = await patchPlanUnauthorizedApi(id, planId, 'Enterprise Custom', 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 요금제 변경 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (orgId, name, billingEmail, bizRegNo) => {
    await patchOrgPartialApi(orgId, name, billingEmail, bizRegNo);
    showToast(`[${orgId}] 조직 기본 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedOrgForModal(null);
    await loadOrganizations();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CloudPlan 구독 및 사용량 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedOrgIndex(0);
    await loadAll();
  };

  const sortedOrganizations = useMemo(() => {
    let list = [...organizations];
    if (filterPlan !== 'ALL') {
      list = list.filter(o => o.planId === filterPlan);
    }
    if (searchTerm) {
      list = list.filter(o => o.name.includes(searchTerm) || o.id.includes(searchTerm));
    }
    if (sortOrder === 'ROLE_DESC') {
      list.sort((a, b) => b.seatsUsed - a.seatsUsed);
    } else if (sortOrder === 'CALLS_DESC') {
      list.sort((a, b) => b.seatsAllowed - a.seatsAllowed);
    }
    return list;
  }, [organizations, filterPlan, searchTerm, sortOrder]);

  // Selected Org for RightPanel (Error 3 Effect)
  const selectedOrgForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedOrganizations[selectedOrgIndex] || organizations[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted organizations array
      return organizations[selectedOrgIndex] || organizations[0];
    }
  }, [sortedOrganizations, organizations, selectedOrgIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedExpectedBilling={cachedExpectedBilling}
        cachedUsageAlert={cachedUsageAlert}
        resetSandbox={resetSandbox}
      />

      <div className="cloudplan-grid">
        <Sidebar
          filterPlan={filterPlan}
          setFilterPlan={setFilterPlan}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          organizations={sortedOrganizations}
          selectedOrgIndex={selectedOrgIndex}
          setSelectedOrgIndex={setSelectedOrgIndex}
          openDetailMismatch={openDetailMismatch}
          plans={plans}
        />

        <CenterSection
          plans={plans}
          organizations={organizations}
          teamMembers={teamMembers}
          usageLogs={usageLogs}
          billingHistories={billingHistories}
          deleteUsageLog={deleteUsageLog}
          openOrgModal={(org) => setSelectedOrgForModal(org)}
          testUnauthorizedPlanChange={testUnauthorizedPlanChange}
        />

        <RightPanel
          selectedOrg={selectedOrgForPanel}
          setSelectedOrg={(updated) => {
            setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));
          }}
          plans={plans}
          triggerPlanSeatsRace={triggerPlanSeatsRace}
          triggerCancelRefreshConflict={triggerCancelRefreshConflict}
          triggerPartialOrgSave={triggerPartialOrgSave}
        />
      </div>

      <OrgEditModal
        org={selectedOrgForModal}
        onClose={() => setSelectedOrgForModal(null)}
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
