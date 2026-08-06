import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchLanes, fetchInstructors, fetchMembers, fetchAttendanceLogs, fetchActivityLogs,
  searchMembersApi, patchMemberLaneApi, patchMemberStatusApi,
  cancelClassApi, completeAttendanceApi, changeLaneUnauthorizedApi,
  patchMemberPartialApi, deleteAttendanceLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-6001');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedAbsenceCount] = useState(6);
  const [cachedRecentMember] = useState('홍길동 (상급자 자유형 턴 특화반 / 1번 레인)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadMembers(), loadLanes(), loadInstructors(), loadAttendanceLogs(), loadActivityLogs(), loadStaffs()]);
  const loadMembers = async () => setMembers(await fetchMembers());
  const loadLanes = async () => setLanes(await fetchLanes());
  const loadInstructors = async () => setInstructors(await fetchInstructors());
  const loadAttendanceLogs = async () => setAttendanceLogs(await fetchAttendanceLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 직원을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadMembers();
    // INTENTIONAL_ERROR: cachedAbsenceCount and cachedRecentMember remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (level, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 상급(3초 지연) 결과가 최신 중급(0.2초) 결과를 덮어씀
    showToast(`강습 회원 목록 조회 중 [레벨: ${level} / 상태: ${status}]...`, 'info');
    searchMembersApi(level, status, search).then(data => {
      setMembers(data);
      if (level === '상급 (ADVANCED)') {
        showToast('상급반 회원 수신 완료 (3초 지연 완료 ➔ 최신 레벨 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`회원 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedMembers[idx] 아닌 원본 members[idx] 회원이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedMembers[idx];
    if (clicked) {
      showToast(`[${clicked.name}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 회원 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusLaneRace = (mbId, target, laneNo) => {
    showToast('진행중 변경(3초 지연)과 레인 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchMemberStatusApi(mbId, target.status);
    setTimeout(() => {
      patchMemberLaneApi(mbId, laneNo);
    }, 100);
    setTimeout(async () => {
      showToast('강습 배정 레인 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('진행중 변경 완료 (3초 완료 - 레인 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadMembers();
    }, 4000);
  };

  const triggerCancelAttendanceConflict = (mbId) => {
    showToast('강습 취소(0.5초 완료)와 출석 처리(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelClassApi(mbId);
    setTimeout(async () => {
      showToast('강습 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadMembers();
    }, 600);
    completeAttendanceApi(mbId);
    setTimeout(async () => {
      showToast('출석 처리 완료 (4초 완료 → CANCELLED 회원을 ATTENDED로 복원시킴 - Error 2)', 'danger');
      await loadMembers();
      await loadAttendanceLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, name, phone, level) => {
    await patchMemberPartialApi(id, name, phone, level);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/강습레벨/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadMembers();
  };

  const deleteLog = async (id) => {
    const data = await deleteAttendanceLogApi(id);
    if (data.success) {
      showToast('출석 로그 삭제 완료. (대시보드 강습반별 출석률 및 레인 이용률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadAttendanceLogs();
    }
  };

  const testUnauthorizedChangeLane = async (id) => {
    const res = await changeLaneUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 레인 변경 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('SwimClass 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedMembers = useMemo(() => {
    let list = [...members];
    if (sortOrder === 'ATTEND_DESC') {
      list.sort((a, b) => b.attendanceRatePercent - a.attendanceRatePercent);
    } else if (sortOrder === 'REG_ASC') {
      list.sort((a, b) => a.regDate.localeCompare(b.regDate));
    }
    return list;
  }, [members, sortOrder]);

  // INTENTIONAL_ERROR: selectedMember is based on original members[] not sortedMembers[] (Error 3)
  const selectedMember = useMemo(() => members[selectedIdx] || members[0] || null, [members, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedAbsenceCount={cachedAbsenceCount} cachedRecentMember={cachedRecentMember} resetSandbox={resetSandbox} />
      <div className="swimclass-grid">
        <Sidebar
          filterLevel={filterLevel} setFilterLevel={setFilterLevel}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          members={sortedMembers} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          lanes={lanes}
        />
        <CenterSection
          members={members} lanes={lanes} instructors={instructors}
          attendanceLogs={attendanceLogs} activityLogs={activityLogs}
          deleteAttendanceLog={deleteLog} testUnauthorizedChangeLane={testUnauthorizedChangeLane}
        />
        <RightPanel
          selectedMember={selectedMember}
          setSelectedMember={(u) => setMembers(prev => prev.map(m => m.id === u.id ? u : m))}
          members={members} lanes={lanes}
          triggerStatusLaneRace={triggerStatusLaneRace}
          triggerCancelAttendanceConflict={triggerCancelAttendanceConflict}
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
