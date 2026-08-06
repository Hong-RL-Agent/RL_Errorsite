import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchPlants, fetchSubscribers, fetchDeliveries, fetchHealthLogs, fetchReplacements, fetchActivityLogs,
  searchSubscribersApi, patchSubscriberHealthStatusApi, patchSubscriberDeliveryStatusApi,
  cancelSubscriptionApi, approveReplacementApi, approveReplacementUnauthorizedApi,
  patchPlantPartialApi, deleteHealthLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [plants, setPlants] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-3001');
  const [filterPlantType, setFilterPlantType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedReplacementPendingCount] = useState(7);
  const [cachedRecentSubscriber] = useState('윤그린 님 올리브나무 대형 화분 (POOR 시듦 / 교체대기)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadSubscribers(), loadPlants(), loadDeliveries(), loadHealthLogs(), loadReplacements(), loadActivityLogs(), loadStaffs()]);
  const loadSubscribers = async () => setSubscribers(await fetchSubscribers());
  const loadPlants = async () => setPlants(await fetchPlants());
  const loadDeliveries = async () => setDeliveries(await fetchDeliveries());
  const loadHealthLogs = async () => setHealthLogs(await fetchHealthLogs());
  const loadReplacements = async () => setReplacements(await fetchReplacements());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 원예 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadSubscribers();
    // INTENTIONAL_ERROR: cachedReplacementPendingCount and cachedRecentSubscriber remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (plantType, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 몬스테라(3초 지연) 결과가 최신 다육식물(0.2초) 결과를 덮어씀
    showToast(`화분 구독 고객 목록 조회 중 [유형: ${plantType} / 상태: ${status}]...`, 'info');
    searchSubscribersApi(plantType, status, search).then(data => {
      setSubscribers(data);
      if (plantType === '관엽식물 몬스테라') {
        showToast('몬스테라 수신 완료 (3초 지연 완료 ➔ 최신 식물 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`고객 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedSubscribers[idx] 아닌 원본 subscribers[idx] 고객이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedSubscribers[idx];
    if (clicked) {
      showToast(`[${clicked.subscriberName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 고객 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusHealthRace = (subId, target, healthStatus) => {
    showToast('배송완료 변경(3초 지연)과 건강 상태 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchSubscriberDeliveryStatusApi(subId, target.status);
    setTimeout(() => {
      patchSubscriberHealthStatusApi(subId, healthStatus);
    }, 100);
    setTimeout(async () => {
      showToast('식물 건강 상태 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('배송완료 변경 완료 (3초 완료 - 건강 상태 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadSubscribers();
    }, 4000);
  };

  const triggerCancelReplacementConflict = (subId) => {
    showToast('구독 취소(0.5초 완료)와 화분 교체 승인(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelSubscriptionApi(subId);
    setTimeout(async () => {
      showToast('구독 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadSubscribers();
    }, 600);
    approveReplacementApi(subId);
    setTimeout(async () => {
      showToast('화분 교체 승인 처리 (4초 완료 → CANCELLED 구독을 REPLACING으로 복원시킴 - Error 2)', 'danger');
      await loadSubscribers();
      await loadReplacements();
    }, 4500);
  };

  const triggerPartialSave = async (id, plantName, waterCycle, sunlightGrade) => {
    await patchPlantPartialApi(id, plantName, waterCycle, sunlightGrade);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save waterCycle (Error 8)
    showToast(`[${id}] 식물명/햇빛등급/물주기가 성공적으로 저장되었습니다.`, 'success');
    await loadPlants();
  };

  const deleteLog = async (id) => {
    const data = await deleteHealthLogApi(id);
    if (data.success) {
      showToast('건강도 로그 삭제 완료. (대시보드 식물별 건강도 및 교체율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadHealthLogs();
    }
  };

  const testUnauthorizedApproveReplacement = async (id) => {
    const res = await approveReplacementUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 교체 승인 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('PlantSub 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedSubscribers = useMemo(() => {
    let list = [...subscribers];
    if (sortOrder === 'HEALTH_ASC') {
      list.sort((a, b) => a.healthStatus.localeCompare(b.healthStatus));
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
    }
    return list;
  }, [subscribers, sortOrder]);

  // INTENTIONAL_ERROR: selectedSubscriber is based on original subscribers[] not sortedSubscribers[] (Error 3)
  const selectedSubscriber = useMemo(() => subscribers[selectedIdx] || subscribers[0] || null, [subscribers, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedReplacementPendingCount={cachedReplacementPendingCount} cachedRecentSubscriber={cachedRecentSubscriber} resetSandbox={resetSandbox} />
      <div className="plantsub-grid">
        <Sidebar
          filterPlantType={filterPlantType} setFilterPlantType={setFilterPlantType}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          subscribers={sortedSubscribers} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          plants={plants}
        />
        <CenterSection
          subscribers={subscribers} plants={plants} deliveries={deliveries}
          healthLogs={healthLogs} replacements={replacements} activityLogs={activityLogs}
          deleteHealthLog={deleteLog} testUnauthorizedApproveReplacement={testUnauthorizedApproveReplacement}
        />
        <RightPanel
          selectedSubscriber={selectedSubscriber}
          setSelectedSubscriber={(u) => setSubscribers(prev => prev.map(s => s.id === u.id ? u : s))}
          subscribers={subscribers} plants={plants}
          triggerStatusHealthRace={triggerStatusHealthRace}
          triggerCancelReplacementConflict={triggerCancelReplacementConflict}
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
