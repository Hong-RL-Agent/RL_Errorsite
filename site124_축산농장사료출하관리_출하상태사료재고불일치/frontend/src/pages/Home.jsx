import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchBarns, fetchFeeds, fetchLivestocks, fetchShipments, fetchFeedLogs, fetchActivityLogs,
  searchLivestocksApi, patchLivestockFeedApi, patchLivestockStatusApi,
  cancelShipmentApi, addHealthRecordApi, confirmShipmentUnauthorizedApi,
  patchLivestockPartialApi, deleteFeedLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [barns, setBarns] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [livestocks, setLivestocks] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [feedLogs, setFeedLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9001');
  const [filterBarn, setFilterBarn] = useState('ALL');
  const [filterHealth, setFilterHealth] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedShipmentPendingCount] = useState(20);
  const [cachedRecentLivestock] = useState('한우 410-002-123456 (사료 잔량 4,500kg / 출하대기)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadLivestocks(), loadBarns(), loadFeeds(), loadShipments(), loadFeedLogs(), loadActivityLogs(), loadStaffs()]);
  const loadLivestocks = async () => setLivestocks(await fetchLivestocks());
  const loadBarns = async () => setBarns(await fetchBarns());
  const loadFeeds = async () => setFeeds(await fetchFeeds());
  const loadShipments = async () => setShipments(await fetchShipments());
  const loadFeedLogs = async () => setFeedLogs(await fetchFeedLogs());
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
    loadLivestocks();
    // INTENTIONAL_ERROR: cachedShipmentPendingCount and cachedRecentLivestock remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (barnId, healthStatus, search) => {
    // INTENTIONAL_ERROR: Error 5 - BARN-01(3초 지연) 결과가 최신 BARN-02(0.2초) 결과를 덮어씀
    showToast(`개체 목록 조회 중 [축사: ${barnId} / 건강: ${healthStatus}]...`, 'info');
    searchLivestocksApi(barnId, healthStatus, search).then(data => {
      setLivestocks(data);
      if (barnId === 'BARN-01') {
        showToast('BARN-01 축사 개체 수신 완료 (3초 지연 완료 ➔ 최신 축사 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`개체 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedLivestocks[idx] 아닌 원본 livestocks[idx] 개체가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedLivestocks[idx];
    if (clicked) {
      showToast(`[${clicked.earTagNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 개체 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusFeedRace = (livId, target, feedStockKg) => {
    showToast('출하확정 변경(3초 지연)과 사료 재고 차감(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchLivestockStatusApi(livId, target.status);
    setTimeout(() => {
      patchLivestockFeedApi(livId, feedStockKg);
    }, 100);
    setTimeout(async () => {
      showToast('사료 재고 차감 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('출하확정 변경 완료 (3초 완료 - 사료 재고가 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadLivestocks();
    }, 4000);
  };

  const triggerCancelHealthConflict = (livId) => {
    showToast('출하 취소(0.5초 완료)와 건강 기록 등록(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelShipmentApi(livId);
    setTimeout(async () => {
      showToast('출하 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadLivestocks();
    }, 600);
    addHealthRecordApi(livId);
    setTimeout(async () => {
      showToast('건강 기록 등록 처리 (4초 완료 → CANCELLED 개체를 SHIPMENT_PENDING으로 복원시킴 - Error 2)', 'danger');
      await loadLivestocks();
    }, 4500);
  };

  const triggerPartialSave = async (id, weightKg, healthStatus, barnId) => {
    await patchLivestockPartialApi(id, weightKg, healthStatus, barnId);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save healthStatus (Error 8)
    showToast(`[${id}] 개체 체중/건강상태/축사위치가 성공적으로 저장되었습니다.`, 'success');
    await loadLivestocks();
  };

  const deleteLog = async (id) => {
    const data = await deleteFeedLogApi(id);
    if (data.success) {
      showToast('급여 로그 삭제 완료. (대시보드 사료 사용량 및 성과 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadFeedLogs();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmShipmentUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 출하 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FarmHerd 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedLivestocks = useMemo(() => {
    let list = [...livestocks];
    if (sortOrder === 'WEIGHT_DESC') {
      list.sort((a, b) => b.weightKg - a.weightKg);
    } else if (sortOrder === 'AGE_DESC') {
      list.sort((a, b) => b.ageMonths - a.ageMonths);
    }
    return list;
  }, [livestocks, sortOrder]);

  // INTENTIONAL_ERROR: selectedLivestock is based on original livestocks[] not sortedLivestocks[] (Error 3)
  const selectedLivestock = useMemo(() => livestocks[selectedIdx] || livestocks[0] || null, [livestocks, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedShipmentPendingCount={cachedShipmentPendingCount} cachedRecentLivestock={cachedRecentLivestock} resetSandbox={resetSandbox} />
      <div className="farmherd-grid">
        <Sidebar
          filterBarn={filterBarn} setFilterBarn={setFilterBarn}
          filterHealth={filterHealth} setFilterHealth={setFilterHealth}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          livestocks={sortedLivestocks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          barns={barns}
        />
        <CenterSection
          livestocks={livestocks} barns={barns} feeds={feeds}
          shipments={shipments} feedLogs={feedLogs} activityLogs={activityLogs}
          deleteFeedLog={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedLivestock={selectedLivestock}
          setSelectedLivestock={(u) => setLivestocks(prev => prev.map(l => l.id === u.id ? u : l))}
          livestocks={livestocks} barns={barns}
          triggerStatusFeedRace={triggerStatusFeedRace}
          triggerCancelHealthConflict={triggerCancelHealthConflict}
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
