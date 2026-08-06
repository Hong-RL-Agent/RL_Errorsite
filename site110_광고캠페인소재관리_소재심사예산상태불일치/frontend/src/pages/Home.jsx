import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import CampaignEditModal from '../components/CampaignEditModal.jsx';
import {
  fetchStaffs,
  fetchAdvertisers,
  fetchCampaigns,
  fetchCreatives,
  fetchActivityLogs,
  searchCampaignsApi,
  approveCreativeApi,
  patchCampaignBudgetApi,
  pauseCampaignApi,
  completeCreativeAuditApi,
  approveCreativeUnauthorizedApi,
  patchCampaignPartialApi,
  deleteBudgetLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STAFF-6001');
  const [filterAdvertiser, setFilterAdvertiser] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedCmpIndex, setSelectedCmpIndex] = useState(0);
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedPendingAudits] = useState(14);
  const [cachedRecentCampaign] = useState('삼성 갤럭시 S26 얼리버드 (소진율 76% / CTR 3.42%)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([
      loadStaffs(),
      loadAdvertisers(),
      loadCampaigns(),
      loadCreatives(),
      loadActivityLogs()
    ]);
  };

  const loadStaffs = async () => {
    const data = await fetchStaffs();
    setStaffs(data);
  };

  const loadAdvertisers = async () => {
    const data = await fetchAdvertisers();
    setAdvertisers(data);
  };

  const loadCampaigns = async () => {
    const data = await fetchCampaigns();
    setCampaigns(data);
  };

  const loadCreatives = async () => {
    const data = await fetchCreatives();
    setCreatives(data);
  };

  const loadActivityLogs = async () => {
    const data = await fetchActivityLogs();
    setActivityLogs(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Staff Session Switch (Error 6 Target)
  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 마케터를 [${staffId}] 권한으로 변경합니다.`, 'info');
    loadCampaigns();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 캠페인 상세를 본 뒤 관리자 B로 로그인하면 캠페인 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 심사 대기 소재 수(cachedPendingAudits) 및 최근 캠페인 상세 캐시(cachedRecentCampaign)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Creative Approve & Budget update race condition (Error 1 Trigger)
  const triggerCreativeBudgetRace = (cmp, cr) => {
    if (!cr) {
      showToast('연결된 광고 소재가 없습니다.', 'danger');
      return;
    }
    showToast('소재 심사 승인(3초 지연)과 캠페인 예산 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Budget update (0.1s done)
    patchCampaignBudgetApi(cmp.id, cmp.dailyBudget);

    // 2. Creative approve (3.0s delay with DB snapshot)
    setTimeout(() => {
      approveCreativeApi(cr.id);
    }, 100);

    setTimeout(async () => {
      showToast('소재 심사 승인 완료 (승인 처리되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 예산 조합이 롤백 저장됨)', 'warning');
      await loadCampaigns();
      await loadCreatives();
    }, 4500);
  };

  // Advertiser search race condition (Error 5 Trigger)
  const triggerSearchRace = (advertiserName, search) => {
    showToast(`광고주 캠페인 목록을 조회합니다: [${advertiserName} / ${search}]`, 'info');

    if (advertiserName === '삼성전자') {
      searchCampaignsApi('삼성전자', 'ALL', search).then(data => {
        setCampaigns(data);
        showToast('삼성전자 캠페인 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (advertiserName === '현대자동차') {
      searchCampaignsApi('현대자동차', 'ALL', search).then(data => {
        setCampaigns(data);
        showToast('현대자동차 캠페인 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchCampaignsApi(advertiserName, 'ALL', search).then(data => {
        setCampaigns(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 캠페인 목록을 소진율순/CTR순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 캠페인이 아니라 정렬 전 원본 배열의 같은 index 캠페인 상세가 열리는 결함입니다.
    setSelectedCmpIndex(index);
    const clickedCmp = sortedCampaigns[index];
    if (clickedCmp) {
      showToast(`[${clickedCmp.title}] 캠페인 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 캠페인의 소재/예산 정보가 표시됨)`, 'warning');
    }
  };

  // Pause Campaign & Complete Audit Conflict (Error 2 Trigger)
  const triggerPauseAuditConflict = (cmp, cr) => {
    if (!cr) {
      showToast('연결된 광고 소재가 없습니다.', 'danger');
      return;
    }
    showToast('캠페인 일시중지 처리와 소재 심사완료를 연쇄 진행합니다.', 'info');

    // 1. Pause Campaign (0.5s done, status = PAUSED)
    pauseCampaignApi(cmp.id);

    // 2. Complete Audit (4.0s delay with restore to RUNNING)
    setTimeout(async () => {
      await completeCreativeAuditApi(cr.id);
      showToast('캠페인 일시중지 응답 완료 (0.5초 완료)', 'warning');
      await loadCampaigns();
    }, 100);

    setTimeout(async () => {
      showToast('소재 심사완료 응답 완료 (4초 지연 완료: 일시중지된 캠페인을 RUNNING 집행중 상태로 복원시킴)', 'danger');
      await loadCampaigns();
      await loadCreatives();
    }, 4500);
  };

  // Partial Campaign Save (Error 8 Trigger)
  const triggerPartialCampaignSave = async (id, title, dailyBudget, targetRegion) => {
    await patchCampaignPartialApi(id, title, dailyBudget, targetRegion);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 캠페인 정보 수정 모달에서 캠페인명, 일일예산, 타겟 지역을 동시에 수정하면 백엔드는 캠페인명과 타겟 지역만 저장하고 
    // 일일예산은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('캠페인명, 일일 예산, 타겟 지역이 성공적으로 저장되었습니다.', 'success');
    await loadCampaigns();
  };

  // Delete Budget Log (Error 4 Target)
  const deleteBudgetLog = async (id) => {
    const data = await deleteBudgetLogApi(id);
    if (data.success) {
      showToast('예산 변경 로그를 삭제했습니다. (캠페인별 소진 금액 및 광고주별 집행액 수치에는 계속 유지됨)', 'warning');
      await loadActivityLogs();
    }
  };

  // Test Unauthorized Creative Approve (Error 7 Trigger)
  const testUnauthorizedApprove = async (id) => {
    try {
      const res = await approveCreativeUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 소재 승인 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (cmpId, title, dailyBudget, targetRegion) => {
    await patchCampaignPartialApi(cmpId, title, dailyBudget, targetRegion);
    showToast(`[${cmpId}] 캠페인 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedCampaignForModal(null);
    await loadCampaigns();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('AdPilot 애드 서버 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedCmpIndex(0);
    await loadAll();
  };

  const sortedCampaigns = useMemo(() => {
    let list = [...campaigns];
    if (filterAdvertiser !== 'ALL') {
      list = list.filter(c => c.advertiserName === filterAdvertiser);
    }
    if (searchTerm) {
      list = list.filter(c => c.title.includes(searchTerm) || c.id.includes(searchTerm));
    }
    if (sortOrder === 'EXHAUSTION_DESC') {
      list.sort((a, b) => b.exhaustionRate - a.exhaustionRate);
    } else if (sortOrder === 'CTR_DESC') {
      list.sort((a, b) => b.ctr - a.ctr);
    }
    return list;
  }, [campaigns, filterAdvertiser, searchTerm, sortOrder]);

  const selectedCampaignForPanel = useMemo(() => {
    return campaigns[selectedCmpIndex] || campaigns[0] || null;
  }, [campaigns, selectedCmpIndex]);

  return (
    <div id="app">
      <Header
        activeStaff={activeStaff}
        handleStaffSwitch={handleStaffSwitch}
        cachedPendingAudits={cachedPendingAudits}
        cachedRecentCampaign={cachedRecentCampaign}
        resetSandbox={resetSandbox}
      />

      <div className="adpilot-grid">
        <Sidebar
          filterAdvertiser={filterAdvertiser}
          setFilterAdvertiser={setFilterAdvertiser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          campaigns={sortedCampaigns}
          selectedCmpIndex={selectedCmpIndex}
          setSelectedCmpIndex={setSelectedCmpIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          campaigns={campaigns}
          creatives={creatives}
          advertisers={advertisers}
          activityLogs={activityLogs}
          deleteBudgetLog={deleteBudgetLog}
          openCampaignModal={(c) => setSelectedCampaignForModal(c)}
          testUnauthorizedApprove={testUnauthorizedApprove}
        />

        <RightPanel
          selectedCampaign={selectedCampaignForPanel}
          setSelectedCampaign={(updated) => {
            setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
          campaigns={campaigns}
          creatives={creatives}
          triggerCreativeBudgetRace={triggerCreativeBudgetRace}
          triggerPauseAuditConflict={triggerPauseAuditConflict}
          triggerPartialCampaignSave={triggerPartialCampaignSave}
        />
      </div>

      <CampaignEditModal
        campaign={selectedCampaignForModal}
        onClose={() => setSelectedCampaignForModal(null)}
        onConfirm={handleModalConfirm}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
