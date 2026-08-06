import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchFlowers, fetchBuyers, fetchAuctions, fetchWinningBids, fetchDeliveryOrders, fetchActivityLogs,
  searchAuctionsApi, patchAuctionDeliveryQtyApi, patchAuctionStatusApi,
  cancelAuctionApi, dispatchDeliveryApi, confirmAuctionUnauthorizedApi,
  patchFlowerPartialApi, deleteDeliveryOrderApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [winningBids, setWinningBids] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-4001');
  const [filterFlower, setFilterFlower] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedPendingDeliveryCount] = useState(14);
  const [cachedRecentAuction] = useState('빨간 장미 (하모니) 300단 (낙찰가: 28,000원 / 강남 플라워)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadAuctions(), loadFlowers(), loadBuyers(), loadWinningBids(), loadDeliveryOrders(), loadActivityLogs(), loadStaffs()]);
  const loadAuctions = async () => setAuctions(await fetchAuctions());
  const loadFlowers = async () => setFlowers(await fetchFlowers());
  const loadBuyers = async () => setBuyers(await fetchBuyers());
  const loadWinningBids = async () => setWinningBids(await fetchWinningBids());
  const loadDeliveryOrders = async () => setDeliveryOrders(await fetchDeliveryOrders());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 경매사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadAuctions();
    // INTENTIONAL_ERROR: cachedPendingDeliveryCount and cachedRecentAuction remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (flowerName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 장미(3초 지연) 결과가 최신 튤립(0.2초) 결과를 덮어씀
    showToast(`경매 목록 조회 중 [품목: ${flowerName} / 상태: ${status}]...`, 'info');
    searchAuctionsApi(flowerName, status, search).then(data => {
      setAuctions(data);
      if (flowerName.includes('장미')) {
        showToast('장미 품목 경매 수신 완료 (3초 지연 완료 ➔ 최신 품목 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`경매 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedAuctions[idx] 아닌 원본 auctions[idx] 경매가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedAuctions[idx];
    if (clicked) {
      showToast(`[${clicked.flowerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 경매 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusQtyRace = (aucId, target, deliveryQty) => {
    showToast('낙찰완료 변경(3초 지연)과 배송수량 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchAuctionStatusApi(aucId, target.status);
    setTimeout(() => {
      patchAuctionDeliveryQtyApi(aucId, deliveryQty);
    }, 100);
    setTimeout(async () => {
      showToast('배송수량 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('낙찰완료 변경 완료 (3초 완료 - 배송수량 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadAuctions();
    }, 4000);
  };

  const triggerCancelDispatchConflict = (aucId) => {
    showToast('낙찰 취소(0.5초 완료)와 배송 지시(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelAuctionApi(aucId);
    setTimeout(async () => {
      showToast('낙찰 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadAuctions();
    }, 600);
    dispatchDeliveryApi(aucId);
    setTimeout(async () => {
      showToast('배송 지시 처리 (4초 완료 → CANCELLED 낙찰을 READY_FOR_DELIVERY로 복원시킴 - Error 2)', 'danger');
      await loadAuctions();
      await loadDeliveryOrders();
    }, 4500);
  };

  const triggerPartialSave = async (id, flowerName, grade, tempSetting) => {
    await patchFlowerPartialApi(id, flowerName, grade, tempSetting);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save grade (Error 8)
    showToast(`[${id}] 꽃이름/등급/보관온도가 성공적으로 저장되었습니다.`, 'success');
    await loadFlowers();
  };

  const deleteLog = async (id) => {
    const data = await deleteDeliveryOrderApi(id);
    if (data.success) {
      showToast('배송 로그 삭제 완료. (대시보드 품목별 판매량 및 구매자 주문량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadDeliveryOrders();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmAuctionUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 낙찰 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FlowerBid 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedAuctions = useMemo(() => {
    let list = [...auctions];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.winningPriceWon - a.winningPriceWon);
    } else if (sortOrder === 'GRADE_DESC') {
      list.sort((a, b) => a.grade.localeCompare(b.grade));
    }
    return list;
  }, [auctions, sortOrder]);

  // INTENTIONAL_ERROR: selectedAuction is based on original auctions[] not sortedAuctions[] (Error 3)
  const selectedAuction = useMemo(() => auctions[selectedIdx] || auctions[0] || null, [auctions, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedPendingDeliveryCount={cachedPendingDeliveryCount} cachedRecentAuction={cachedRecentAuction} resetSandbox={resetSandbox} />
      <div className="flowerbid-grid">
        <Sidebar
          filterFlower={filterFlower} setFilterFlower={setFilterFlower}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          auctions={sortedAuctions} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          flowers={flowers}
        />
        <CenterSection
          auctions={auctions} flowers={flowers} buyers={buyers}
          winningBids={winningBids} deliveryOrders={deliveryOrders} activityLogs={activityLogs}
          deleteDeliveryOrder={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedAuction={selectedAuction}
          setSelectedAuction={(u) => setAuctions(prev => prev.map(a => a.id === u.id ? u : a))}
          auctions={auctions} flowers={flowers}
          triggerStatusQtyRace={triggerStatusQtyRace}
          triggerCancelDispatchConflict={triggerCancelDispatchConflict}
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
