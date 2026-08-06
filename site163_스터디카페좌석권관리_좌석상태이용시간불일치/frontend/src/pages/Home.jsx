import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchBranches, fetchMembers, fetchSeats, fetchTickets, fetchEntryLogs, fetchActivityLogs,
  searchSeatsApi, patchSeatTimeApi, patchSeatStatusApi,
  cancelTicketApi, processCheckInApi, forceCheckOutUnauthorizedApi,
  patchMemberPartialApi, deleteEntryLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [seats, setSeats] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [entryLogs, setEntryLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-5501');
  const [filterBranchName, setFilterBranchName] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedOvertimeCount] = useState(8);
  const [cachedRecentMember] = useState('A-15 독서실형 1인 몰입석 (최공부 회원 / 잔여 42.5시간)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadSeats(), loadBranches(), loadMembers(), loadTickets(), loadEntryLogs(), loadActivityLogs(), loadStaffs()]);
  const loadSeats = async () => setSeats(await fetchSeats());
  const loadBranches = async () => setBranches(await fetchBranches());
  const loadMembers = async () => setMembers(await fetchMembers());
  const loadTickets = async () => setTickets(await fetchTickets());
  const loadEntryLogs = async () => setEntryLogs(await fetchEntryLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 스터디 매니저를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadSeats();
    // INTENTIONAL_ERROR: cachedOvertimeCount and cachedRecentMember remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (branchName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 강남본점(3초 지연) 결과가 최신 신촌점(0.2초) 결과를 덮어씀
    showToast(`좌석 목록 조회 중 [지점: ${branchName} / 상태: ${status}]...`, 'info');
    searchSeatsApi(branchName, status, search).then(data => {
      setSeats(data);
      if (branchName === '강남역 본점 프리미엄관') {
        showToast('강남본점 목록 수신 완료 (3초 지연 완료 ➔ 최신 지점 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`좌석 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedSeats[idx] 아닌 원본 seats[idx] 회원이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedSeats[idx];
    if (clicked) {
      showToast(`[${clicked.currentMember}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 회원 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusTimeRace = (stId, target, remainingHours) => {
    showToast('사용중 변경(3초 지연)과 이용시간 연장(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchSeatStatusApi(stId, target.status);
    setTimeout(() => {
      patchSeatTimeApi(stId, remainingHours);
    }, 100);
    setTimeout(async () => {
      showToast('이용시간 연장/수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('사용중 변경 완료 (3초 완료 - 이용시간 연장이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadSeats();
    }, 4000);
  };

  const triggerCancelCheckInConflict = (stId) => {
    showToast('이용권 취소(0.5초 완료)와 입실 처리(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelTicketApi(stId);
    setTimeout(async () => {
      showToast('이용권 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadSeats();
    }, 600);
    processCheckInApi(stId);
    setTimeout(async () => {
      showToast('입실 처리 완료 (4초 완료 → CANCELLED 이용권을 IN_USE로 복원시킴 - Error 2)', 'danger');
      await loadSeats();
      await loadEntryLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, memberName, phone, ticketType) => {
    await patchMemberPartialApi(id, memberName, phone, ticketType);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 회원명/이용권종류/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadMembers();
  };

  const deleteLog = async (id) => {
    const data = await deleteEntryLogApi(id);
    if (data.success) {
      showToast('입퇴실 로그 삭제 완료. (대시보드 지점별 이용률 및 좌석별 회전율 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadEntryLogs();
    }
  };

  const testUnauthorizedForceCheckOut = async (id) => {
    const res = await forceCheckOutUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 강제퇴실 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('StudySeat 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedSeats = useMemo(() => {
    let list = [...seats];
    if (sortOrder === 'TIME_DESC') {
      list.sort((a, b) => b.remainingHours - a.remainingHours);
    } else if (sortOrder === 'SEAT_ASC') {
      list.sort((a, b) => a.seatNo.localeCompare(b.seatNo));
    }
    return list;
  }, [seats, sortOrder]);

  // INTENTIONAL_ERROR: selectedSeat is based on original seats[] not sortedSeats[] (Error 3)
  const selectedSeat = useMemo(() => seats[selectedIdx] || seats[0] || null, [seats, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedOvertimeCount={cachedOvertimeCount} cachedRecentMember={cachedRecentMember} resetSandbox={resetSandbox} />
      <div className="studyseat-grid">
        <Sidebar
          filterBranchName={filterBranchName} setFilterBranchName={setFilterBranchName}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          seats={sortedSeats} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          branches={branches}
        />
        <CenterSection
          seats={seats} branches={branches} members={members}
          tickets={tickets} entryLogs={entryLogs} activityLogs={activityLogs}
          deleteEntryLog={deleteLog} testUnauthorizedForceCheckOut={testUnauthorizedForceCheckOut}
        />
        <RightPanel
          selectedSeat={selectedSeat}
          setSelectedSeat={(u) => setSeats(prev => prev.map(s => s.id === u.id ? u : s))}
          seats={seats} members={members}
          triggerStatusTimeRace={triggerStatusTimeRace}
          triggerCancelCheckInConflict={triggerCancelCheckInConflict}
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
