import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchWholesalers, fetchItems, fetchAuctions, fetchShipmentLogs, fetchActivityLogs,
  searchAuctionsApi, patchAuctionQuantityApi, patchAuctionStatusApi,
  cancelAuctionApi, confirmShipmentApi, confirmWinUnauthorizedApi,
  patchItemPartialApi, deleteShipmentLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [items, setItems] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [shipmentLogs, setShipmentLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-4001');
  const [filterOrigin, setFilterOrigin] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedWinPendingCount] = useState(14);
  const [cachedRecentAuction] = useState('제주 광어 450kg (낙찰가 28,500원 / 중도매인 105호)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadAuctions(), loadWholesalers(), loadItems(), loadShipmentLogs(), loadActivityLogs(), loadStaffs()]);
  const loadAuctions = async () => setAuctions(await fetchAuctions());
  const loadWholesalers = async () => setWholesalers(await fetchWholesalers());
  const loadItems = async () => setItems(await fetchItems());
  const loadShipmentLogs = async () => setShipmentLogs(await fetchShipmentLogs());
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
    loadAuctions();
    // INTENTIONAL_ERROR: cachedWinPendingCount and cachedRecentAuction remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (origin, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 제주(3초 지연) 결과가 최신 부산(0.2초) 결과를 덮어씀
    showToast(`경매 목록 조회 중 [산지: ${origin} / 상태: ${status}]...`, 'info');
    searchAuctionsApi(origin, status, search).then(data => {
      setAuctions(data);
      if (origin.includes('제주')) {
        showToast('제주 산지 수산물 수신 완료 (3초 지연 완료 ➔ 최신 산지 결과를 덮어썼을 수 있음)', 'warning');
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
      showToast(`[${clicked.itemName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 경매 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusQuantityRace = (aucId, target, quantityKg) => {
    showToast('낙찰완료 변경(3초 지연)과 출하 수량 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchAuctionStatusApi(aucId, target.status);
    setTimeout(() => {
      patchAuctionQuantityApi(aucId, quantityKg);
    }, 100);
    setTimeout(async () => {
      showToast('출하 수량 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('낙찰완료 변경 완료 (3초 완료 - 수량 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadAuctions();
    }, 4000);
  };

  const triggerCancelShipmentConflict = (aucId) => {
    showToast('낙찰 취소(0.5초 완료)와 출하 확정(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelAuctionApi(aucId);
    setTimeout(async () => {
      showToast('낙찰 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadAuctions();
    }, 600);
    confirmShipmentApi(aucId);
    setTimeout(async () => {
      showToast('출하 확정 처리 (4초 완료 → CANCELLED 낙찰을 SHIPPED로 복원시킴 - Error 2)', 'danger');
      await loadAuctions();
      await loadShipmentLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, itemName, origin, tempStorage) => {
    await patchItemPartialApi(id, itemName, origin, tempStorage);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save origin (Error 8)
    showToast(`[${id}] 품목명/산지/보관온도가 성공적으로 저장되었습니다.`, 'success');
    await loadItems();
  };

  const deleteLog = async (id) => {
    const data = await deleteShipmentLogApi(id);
    if (data.success) {
      showToast('출하 로그 삭제 완료. (대시보드 품목별 시세 및 중도매인 낙찰량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadShipmentLogs();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmWinUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 낙찰 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FishAuction 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedAuctions = useMemo(() => {
    let list = [...auctions];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.winPriceWon - a.winPriceWon);
    } else if (sortOrder === 'QTY_DESC') {
      list.sort((a, b) => b.quantityKg - a.quantityKg);
    }
    return list;
  }, [auctions, sortOrder]);

  const origins = useMemo(() => ['제주 서귀포', '부산 자갈치', '전남 여수', '충남 보령', '강원 속초'], []);

  // INTENTIONAL_ERROR: selectedAuction is based on original auctions[] not sortedAuctions[] (Error 3)
  const selectedAuction = useMemo(() => auctions[selectedIdx] || auctions[0] || null, [auctions, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedWinPendingCount={cachedWinPendingCount} cachedRecentAuction={cachedRecentAuction} resetSandbox={resetSandbox} />
      <div className="fishauction-grid">
        <Sidebar
          filterOrigin={filterOrigin} setFilterOrigin={setFilterOrigin}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          auctions={sortedAuctions} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          origins={origins}
        />
        <CenterSection
          auctions={auctions} items={items} wholesalers={wholesalers}
          shipmentLogs={shipmentLogs} activityLogs={activityLogs}
          deleteShipmentLog={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedAuction={selectedAuction}
          setSelectedAuction={(u) => setAuctions(prev => prev.map(a => a.id === u.id ? u : a))}
          auctions={auctions} items={items}
          triggerStatusQuantityRace={triggerStatusQuantityRace}
          triggerCancelShipmentConflict={triggerCancelShipmentConflict}
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
