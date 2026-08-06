import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchLounges, fetchSeats, fetchPassengers, fetchPasses, fetchCheckinLogs, fetchActivityLogs,
  searchPassesApi, patchPassSeatNoApi, patchPassStatusApi,
  cancelCheckinApi, completeLoungeUseApi, approveLoungeEntryUnauthorizedApi,
  patchPassengerPartialApi, deleteCheckinLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [lounges, setLounges] = useState([]);
  const [seats, setSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [passes, setPasses] = useState([]);
  const [checkinLogs, setCheckinLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-8001');
  const [filterTerminal, setFilterTerminal] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedExpiringSoonCount] = useState(8);
  const [cachedRecentPassenger] = useState('최공항 승객 (FIRST_CLASS / A-12 프라이빗 리클라이너)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadPasses(), loadLounges(), loadSeats(), loadPassengers(), loadCheckinLogs(), loadActivityLogs(), loadStaffs()]);
  const loadPasses = async () => setPasses(await fetchPasses());
  const loadLounges = async () => setLounges(await fetchLounges());
  const loadSeats = async () => setSeats(await fetchSeats());
  const loadPassengers = async () => setPassengers(await fetchPassengers());
  const loadCheckinLogs = async () => setCheckinLogs(await fetchCheckinLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 라운지 매니저를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadPasses();
    // INTENTIONAL_ERROR: cachedExpiringSoonCount and cachedRecentPassenger remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (terminal, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - T1 동편(3초 지연) 결과가 최신 T2 퍼스트(0.2초) 결과를 덮어씀
    showToast(`공항 라운지 이용권 목록 조회 중 [터미널: ${terminal} / 상태: ${status}]...`, 'info');
    searchPassesApi(terminal, status, search).then(data => {
      setPasses(data);
      if (terminal === '제1여객터미널 동편 4층 라운지') {
        showToast('T1 동편 목록 수신 완료 (3초 지연 완료 ➔ 최신 터미널 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`이용권 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedPasses[idx] 아닌 원본 passes[idx] 이용권이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedPasses[idx];
    if (clicked) {
      showToast(`[${clicked.passengerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 이용권 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusSeatRace = (pssId, target, seatNo) => {
    showToast('이용중 변경(3초 지연)과 좌석 번호 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchPassStatusApi(pssId, target.status);
    setTimeout(() => {
      patchPassSeatNoApi(pssId, seatNo);
    }, 100);
    setTimeout(async () => {
      showToast('좌석 번호 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('이용중 변경 완료 (3초 완료 - 좌석 번호 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadPasses();
    }, 4000);
  };

  const triggerCancelCompleteConflict = (pssId) => {
    showToast('체크인 취소(0.5초 완료)와 이용 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelCheckinApi(pssId);
    setTimeout(async () => {
      showToast('체크인 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadPasses();
    }, 600);
    completeLoungeUseApi(pssId);
    setTimeout(async () => {
      showToast('이용 완료 처리 (4초 완료 → CANCELLED 이용권을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadPasses();
      await loadCheckinLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, passengerName, flightNo, seatNo) => {
    await patchPassengerPartialApi(id, passengerName, '', flightNo, seatNo);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save flightNo (Error 8)
    showToast(`[${id}] 이름/좌석번호/항공편이 성공적으로 저장되었습니다.`, 'success');
    await loadPassengers();
  };

  const deleteLog = async (id) => {
    const data = await deleteCheckinLogApi(id);
    if (data.success) {
      showToast('체크인 로그 삭제 완료. (대시보드 라운지별 혼잡도 및 좌석 이용률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadCheckinLogs();
    }
  };

  const testUnauthorizedApproveEntry = async (id) => {
    const res = await approveLoungeEntryUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 라운지 입장승인 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('LoungePass 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedPasses = useMemo(() => {
    let list = [...passes];
    if (sortOrder === 'EXPIRE_ASC') {
      list.sort((a, b) => a.expireTime.localeCompare(b.expireTime));
    } else if (sortOrder === 'TIER_DESC') {
      list.sort((a, b) => b.tier.localeCompare(a.tier));
    }
    return list;
  }, [passes, sortOrder]);

  // INTENTIONAL_ERROR: selectedPass is based on original passes[] not sortedPasses[] (Error 3)
  const selectedPass = useMemo(() => passes[selectedIdx] || passes[0] || null, [passes, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedExpiringSoonCount={cachedExpiringSoonCount} cachedRecentPassenger={cachedRecentPassenger} resetSandbox={resetSandbox} />
      <div className="loungepass-grid">
        <Sidebar
          filterTerminal={filterTerminal} setFilterTerminal={setFilterTerminal}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          passes={sortedPasses} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          lounges={lounges}
        />
        <CenterSection
          passes={passes} lounges={lounges} seats={seats} passengers={passengers}
          checkinLogs={checkinLogs} activityLogs={activityLogs}
          deleteCheckinLog={deleteLog} testUnauthorizedApproveEntry={testUnauthorizedApproveEntry}
        />
        <RightPanel
          selectedPass={selectedPass}
          setSelectedPass={(u) => setPasses(prev => prev.map(p => p.id === u.id ? u : p))}
          passes={passes} passengers={passengers}
          triggerStatusSeatRace={triggerStatusSeatRace}
          triggerCancelCompleteConflict={triggerCancelCompleteConflict}
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
