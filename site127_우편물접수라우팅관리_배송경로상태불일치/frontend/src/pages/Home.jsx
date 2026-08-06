import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchHubs, fetchRoutesList, fetchParcels, fetchDeliveryLogs, fetchActivityLogs,
  searchParcelsApi, patchParcelRouteApi, patchParcelStatusApi,
  returnParcelApi, completeDeliveryApi, completeDeliveryUnauthorizedApi,
  patchRecipientPartialApi, deleteDeliveryLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-5001');
  const [filterHub, setFilterHub] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedHoldCount] = useState(14);
  const [cachedRecentParcel] = useState('EB-987654321-KR (동서울HUB ➔ 대전HUB 라우팅)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadParcels(), loadHubs(), loadRoutesList(), loadDeliveryLogs(), loadActivityLogs(), loadStaffs()]);
  const loadParcels = async () => setParcels(await fetchParcels());
  const loadHubs = async () => setHubs(await fetchHubs());
  const loadRoutesList = async () => setRoutesList(await fetchRoutesList());
  const loadDeliveryLogs = async () => setDeliveryLogs(await fetchDeliveryLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadParcels();
    // INTENTIONAL_ERROR: cachedHoldCount and cachedRecentParcel remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (hubId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - HUB-01(3초 지연) 결과가 최신 HUB-02(0.2초) 결과를 덮어씀
    showToast(`우편물 목록 조회 중 [센터: ${hubId} / 상태: ${status}]...`, 'info');
    searchParcelsApi(hubId, status, search).then(data => {
      setParcels(data);
      if (hubId === 'HUB-01') {
        showToast('동서울 센터 우편물 수신 완료 (3초 지연 완료 ➔ 최신 센터 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`우편물 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedParcels[idx] 아닌 원본 parcels[idx] 우편물이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedParcels[idx];
    if (clicked) {
      showToast(`[${clicked.trackingNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 우편물 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerRouteStatusRace = (pclId, target) => {
    showToast('배송 경로 변경(3초 지연)과 배달중 상태 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchParcelRouteApi(pclId, target.routeId, target.routeName);
    setTimeout(() => {
      patchParcelStatusApi(pclId, target.status);
    }, 100);
    setTimeout(async () => {
      showToast('배송 상태 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('배송 경로 변경 완료 (3초 완료 - 배송 상태 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadParcels();
    }, 4000);
  };

  const triggerReturnCompleteConflict = (pclId) => {
    showToast('반송 처리(0.5초 완료)와 배송 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    returnParcelApi(pclId);
    setTimeout(async () => {
      showToast('반송 처리 완료 (0.5초 완료 → 상태: RETURNED)', 'warning');
      await loadParcels();
    }, 600);
    completeDeliveryApi(pclId);
    setTimeout(async () => {
      showToast('배송 완료 처리 (4초 완료 → RETURNED 우편물을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadParcels();
      await loadDeliveryLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, recipientName, recipientPhone, deliveryAddress) => {
    await patchRecipientPartialApi(id, recipientName, recipientPhone, deliveryAddress);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save recipientPhone (Error 8)
    showToast(`[${id}] 수취인 이름/연락처/배송주소가 성공적으로 저장되었습니다.`, 'success');
    await loadParcels();
  };

  const deleteLog = async (id) => {
    const data = await deleteDeliveryLogApi(id);
    if (data.success) {
      showToast('배송 로그 삭제 완료. (대시보드 센터별 처리량 및 반송률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadDeliveryLogs();
    }
  };

  const testUnauthorizedComplete = async (id) => {
    const res = await completeDeliveryUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 배송 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('PostRoute 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedParcels = useMemo(() => {
    let list = [...parcels];
    if (sortOrder === 'DATE_DESC') {
      list.sort((a, b) => b.registerDate.localeCompare(a.registerDate));
    } else if (sortOrder === 'DIST_DESC') {
      list.sort((a, b) => b.distanceKm - a.distanceKm);
    }
    return list;
  }, [parcels, sortOrder]);

  // INTENTIONAL_ERROR: selectedParcel is based on original parcels[] not sortedParcels[] (Error 3)
  const selectedParcel = useMemo(() => parcels[selectedIdx] || parcels[0] || null, [parcels, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedHoldCount={cachedHoldCount} cachedRecentParcel={cachedRecentParcel} resetSandbox={resetSandbox} />
      <div className="postroute-grid">
        <Sidebar
          filterHub={filterHub} setFilterHub={setFilterHub}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          parcels={sortedParcels} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          hubs={hubs}
        />
        <CenterSection
          parcels={parcels} hubs={hubs} routesList={routesList}
          deliveryLogs={deliveryLogs} activityLogs={activityLogs}
          deleteDeliveryLog={deleteLog} testUnauthorizedComplete={testUnauthorizedComplete}
        />
        <RightPanel
          selectedParcel={selectedParcel}
          setSelectedParcel={(u) => setParcels(prev => prev.map(p => p.id === u.id ? u : p))}
          parcels={parcels} routesList={routesList}
          triggerRouteStatusRace={triggerRouteStatusRace}
          triggerReturnCompleteConflict={triggerReturnCompleteConflict}
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
