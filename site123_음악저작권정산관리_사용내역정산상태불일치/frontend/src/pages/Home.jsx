import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchCreators, fetchTracks, fetchRoyaltySplits, fetchSettlements, fetchUsageLogs, fetchActivityLogs,
  searchTracksApi, patchTrackSplitApi, patchTrackStatusApi,
  cancelSettlementApi, addUsageLogApi, confirmSettlementUnauthorizedApi,
  patchTrackPartialApi, deleteUsageLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [creators, setCreators] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [royaltySplits, setRoyaltySplits] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-8001');
  const [filterGenre, setFilterGenre] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedSettlingCount] = useState(12);
  const [cachedRecentTrack] = useState('별빛 아래 첫사랑 멜로디 (37,500,000원 정산확정)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadTracks(), loadCreators(), loadRoyaltySplits(), loadSettlements(), loadUsageLogs(), loadActivityLogs(), loadStaffs()]);
  const loadTracks = async () => setTracks(await fetchTracks());
  const loadCreators = async () => setCreators(await fetchCreators());
  const loadRoyaltySplits = async () => setRoyaltySplits(await fetchRoyaltySplits());
  const loadSettlements = async () => setSettlements(await fetchSettlements());
  const loadUsageLogs = async () => setUsageLogs(await fetchUsageLogs());
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
    loadTracks();
    // INTENTIONAL_ERROR: cachedSettlingCount and cachedRecentTrack remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (genre, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - K-POP(3초 지연) 결과가 최신 발라드(0.2초) 결과를 덮어씀
    showToast(`음원 목록 조회 중 [장르: ${genre} / 상태: ${status}]...`, 'info');
    searchTracksApi(genre, status, search).then(data => {
      setTracks(data);
      if (genre === 'K-POP') {
        showToast('K-POP 음원 목록 수신 완료 (3초 지연 완료 ➔ 최신 장르 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`음원 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedTracks[idx] 아닌 원본 tracks[idx] 음원이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedTracks[idx];
    if (clicked) {
      showToast(`[${clicked.title}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 음원 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusSplitRace = (trkId, target, royaltyRate) => {
    showToast('정산 상태 변경(3초 지연)과 권리 배분율 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchTrackStatusApi(trkId, target.status);
    setTimeout(() => {
      patchTrackSplitApi(trkId, royaltyRate);
    }, 100);
    setTimeout(async () => {
      showToast('권리 배분율 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('정산 상태 변경 완료 (3초 완료 - 배분율 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadTracks();
    }, 4000);
  };

  const triggerCancelUsageConflict = (trkId) => {
    showToast('정산 취소(0.5초 완료)와 사용 내역 반영(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelSettlementApi(trkId);
    setTimeout(async () => {
      showToast('정산 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadTracks();
    }, 600);
    addUsageLogApi(trkId);
    setTimeout(async () => {
      showToast('사용 내역 반영 처리 (4초 완료 → CANCELLED 정산을 SETTLING으로 복원시킴 - Error 2)', 'danger');
      await loadTracks();
      await loadUsageLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, title, genre, primaryCreatorName) => {
    await patchTrackPartialApi(id, title, genre, primaryCreatorName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save genre (Error 8)
    showToast(`[${id}] 음원 제목/장르/대표권리자가 성공적으로 저장되었습니다.`, 'success');
    await loadTracks();
  };

  const deleteLog = async (id) => {
    const data = await deleteUsageLogApi(id);
    if (data.success) {
      showToast('사용 로그 삭제 완료. (대시보드 음원별 수익 및 창작자 정산액 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadUsageLogs();
    }
  };

  const testUnauthorizedConfirm = async (id) => {
    const res = await confirmSettlementUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 정산 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('RoyaltyTune 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedTracks = useMemo(() => {
    let list = [...tracks];
    if (sortOrder === 'REV_DESC') {
      list.sort((a, b) => b.totalRevenueWon - a.totalRevenueWon);
    } else if (sortOrder === 'STREAM_DESC') {
      list.sort((a, b) => b.streamCount - a.streamCount);
    }
    return list;
  }, [tracks, sortOrder]);

  // INTENTIONAL_ERROR: selectedTrack is based on original tracks[] not sortedTracks[] (Error 3)
  const selectedTrack = useMemo(() => tracks[selectedIdx] || tracks[0] || null, [tracks, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedSettlingCount={cachedSettlingCount} cachedRecentTrack={cachedRecentTrack} resetSandbox={resetSandbox} />
      <div className="royaltytune-grid">
        <Sidebar
          filterGenre={filterGenre} setFilterGenre={setFilterGenre}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          tracks={sortedTracks} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          tracks={tracks} creators={creators} settlements={settlements}
          usageLogs={usageLogs} activityLogs={activityLogs}
          deleteUsageLog={deleteLog} testUnauthorizedConfirm={testUnauthorizedConfirm}
        />
        <RightPanel
          selectedTrack={selectedTrack}
          setSelectedTrack={(u) => setTracks(prev => prev.map(t => t.id === u.id ? u : t))}
          tracks={tracks}
          triggerStatusSplitRace={triggerStatusSplitRace}
          triggerCancelUsageConflict={triggerCancelUsageConflict}
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
