import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchFacilities, fetchGuardians, fetchChildren, fetchTickets, fetchUsageLogs, fetchActivityLogs,
  searchTicketsApi, patchTicketAllowedHoursApi, patchTicketStatusApi,
  cancelTicketApi, recordUsageLogApi, forceCheckoutUnauthorizedApi,
  patchGuardianPartialApi, deleteUsageLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-2001');
  const [filterStore, setFilterStore] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedOvertimeCount] = useState(8);
  const [cachedRecentTicket] = useState('자이언트 볼풀 & 트램펄린 파크 (강남 본점 / 혼잡)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadTickets(), loadFacilities(), loadGuardians(), loadChildren(), loadUsageLogs(), loadActivityLogs(), loadStaffs()]);
  const loadTickets = async () => setTickets(await fetchTickets());
  const loadFacilities = async () => setFacilities(await fetchFacilities());
  const loadGuardians = async () => setGuardians(await fetchGuardians());
  const loadChildren = async () => setChildrenList(await fetchChildren());
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
    showToast(`로그인 키즈카페 매니저를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadTickets();
    // INTENTIONAL_ERROR: cachedOvertimeCount and cachedRecentTicket remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (storeName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 강남 본점(3초 지연) 결과가 최신 잠실점(0.2초) 결과를 덮어씀
    showToast(`키즈카페 입장권 목록 조회 중 [매장: ${storeName} / 상태: ${status}]...`, 'info');
    searchTicketsApi(storeName, status, search).then(data => {
      setTickets(data);
      if (storeName === '강남 본점 플래그십') {
        showToast('강남 본점 입장권 수신 완료 (3초 지연 완료 ➔ 최신 매장 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`입장권 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedTickets[idx] 아닌 원본 tickets[idx] 입장권이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedTickets[idx];
    if (clicked) {
      showToast(`[${clicked.childName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 입장권 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusHoursRace = (tckId, target, allowedHours) => {
    showToast('이용중 변경(3초 지연)과 이용시간 연장(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchTicketStatusApi(tckId, target.status);
    setTimeout(() => {
      patchTicketAllowedHoursApi(tckId, allowedHours);
    }, 100);
    setTimeout(async () => {
      showToast('기본 이용시간 1시간 연장 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('이용중 변경 완료 (3초 완료 - 이용시간 연장이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadTickets();
    }, 4000);
  };

  const triggerCancelUsageConflict = (tckId) => {
    showToast('입장 취소(0.5초 완료)와 놀이 이용 등록(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelTicketApi(tckId);
    setTimeout(async () => {
      showToast('입장 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadTickets();
    }, 600);
    recordUsageLogApi(tckId);
    setTimeout(async () => {
      showToast('놀이시설 이용 처리 (4초 완료 → CANCELLED 입장권을 IN_USE로 복원시킴 - Error 2)', 'danger');
      await loadTickets();
      await loadUsageLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, guardianName, phone, relationship) => {
    await patchGuardianPartialApi(id, guardianName, phone, relationship);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 보호자명/아동관계/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadGuardians();
  };

  const deleteLog = async (id) => {
    const data = await deleteUsageLogApi(id);
    if (data.success) {
      showToast('이용 로그 삭제 완료. (대시보드 시설별 이용률 및 매장별 입장 수 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadUsageLogs();
    }
  };

  const testUnauthorizedForceCheckout = async (id) => {
    const res = await forceCheckoutUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 강제퇴장 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('KidsPlay 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedTickets = useMemo(() => {
    let list = [...tickets];
    if (sortOrder === 'REM_ASC') {
      list.sort((a, b) => a.remainingMin - b.remainingMin);
    } else if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.enterTime.localeCompare(b.enterTime));
    }
    return list;
  }, [tickets, sortOrder]);

  // INTENTIONAL_ERROR: selectedTicket is based on original tickets[] not sortedTickets[] (Error 3)
  const selectedTicket = useMemo(() => tickets[selectedIdx] || tickets[0] || null, [tickets, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedOvertimeCount={cachedOvertimeCount} cachedRecentTicket={cachedRecentTicket} resetSandbox={resetSandbox} />
      <div className="kidsplay-grid">
        <Sidebar
          filterStore={filterStore} setFilterStore={setFilterStore}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          tickets={sortedTickets} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          facilities={facilities}
        />
        <CenterSection
          tickets={tickets} facilities={facilities} guardians={guardians} childrenList={childrenList}
          usageLogs={usageLogs} activityLogs={activityLogs}
          deleteUsageLog={deleteLog} testUnauthorizedForceCheckout={testUnauthorizedForceCheckout}
        />
        <RightPanel
          selectedTicket={selectedTicket}
          setSelectedTicket={(u) => setTickets(prev => prev.map(t => t.id === u.id ? u : t))}
          tickets={tickets} guardians={guardians}
          triggerStatusHoursRace={triggerStatusHoursRace}
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
