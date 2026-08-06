import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchAltars, fetchReservations, fetchSchedules, fetchVisitorGuides, fetchActivityLogs,
  searchAltarsApi, patchReservationScheduleTextApi, patchAltarStatusApi,
  cancelReservationApi, addVisitorGuideApi, terminateAltarUnauthorizedApi,
  patchClientPartialApi, deleteVisitorGuideApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [altars, setAltars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [visitorGuides, setVisitorGuides] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-5001');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedInUseCount] = useState(12);
  const [cachedRecentAltar] = useState('특실 101호 (故 홍길동 님 / 150평형)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadAltars(), loadReservations(), loadSchedules(), loadVisitorGuides(), loadActivityLogs(), loadStaffs()]);
  const loadAltars = async () => setAltars(await fetchAltars());
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadSchedules = async () => setSchedules(await fetchSchedules());
  const loadVisitorGuides = async () => setVisitorGuides(await fetchVisitorGuides());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 장례지도사를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadAltars();
    // INTENTIONAL_ERROR: cachedInUseCount and cachedRecentAltar remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (status, search) => {
    // INTENTIONAL_ERROR: Error 5 - VACANT(3초 지연) 결과가 최신 IN_USE(0.2초) 결과를 덮어씀
    showToast(`빈소 목록 조회 중 [상태: ${status}]...`, 'info');
    searchAltarsApi(status, search).then(data => {
      setAltars(data);
      if (status === 'VACANT') {
        showToast('대기 빈소 목록 수신 완료 (3초 지연 완료 ➔ 최신 상태 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`빈소 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedAltars[idx] 아닌 원본 altars[idx] 빈소가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedAltars[idx];
    if (clicked) {
      showToast(`[${clicked.altarNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 빈소 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusScheduleRace = (resId, target, scheduleText) => {
    showToast('사용중 변경(3초 지연)과 장례 일정 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchAltarStatusApi(target.id, target.status);
    setTimeout(() => {
      patchReservationScheduleTextApi(resId, scheduleText);
    }, 100);
    setTimeout(async () => {
      showToast('장례 일정 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('사용중 변경 완료 (3초 완료 - 장례 일정 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadAltars();
      await loadReservations();
    }, 4000);
  };

  const triggerCancelGuideConflict = (resId, visitorGroup, visitorCount) => {
    showToast('예약 취소(0.5초 완료)와 조문객 안내 등록(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(resId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReservations();
    }, 600);
    addVisitorGuideApi(resId, visitorGroup, visitorCount);
    setTimeout(async () => {
      showToast('조문객 안내 등록 처리 (4초 완료 → CANCELLED 예약을 GUIDING으로 복원시킴 - Error 2)', 'danger');
      await loadReservations();
      await loadVisitorGuides();
    }, 4500);
  };

  const triggerPartialSave = async (id, clientName, phone, requests) => {
    await patchClientPartialApi(id, clientName, phone, requests);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/연락처/요청사항이 성공적으로 저장되었습니다.`, 'success');
    await loadReservations();
  };

  const deleteLog = async (id) => {
    const data = await deleteVisitorGuideApi(id);
    if (data.success) {
      showToast('조문객 안내 로그 삭제 완료. (대시보드 빈소별 방문자 수 및 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadVisitorGuides();
    }
  };

  const testUnauthorizedTerminate = async (id) => {
    const res = await terminateAltarUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 빈소 강제종료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MemorialDesk 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedAltars = useMemo(() => {
    let list = [...altars];
    if (sortOrder === 'ENTRY_ASC') {
      list.sort((a, b) => a.entryDate.localeCompare(b.entryDate));
    } else if (sortOrder === 'SIZE_DESC') {
      list.sort((a, b) => b.size.localeCompare(a.size));
    }
    return list;
  }, [altars, sortOrder]);

  // INTENTIONAL_ERROR: selectedAltar is based on original altars[] not sortedAltars[] (Error 3)
  const selectedAltar = useMemo(() => altars[selectedIdx] || altars[0] || null, [altars, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedInUseCount={cachedInUseCount} cachedRecentAltar={cachedRecentAltar} resetSandbox={resetSandbox} />
      <div className="memorialdesk-grid">
        <Sidebar
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          altars={sortedAltars} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
        />
        <CenterSection
          altars={altars} reservations={reservations} schedules={schedules}
          visitorGuides={visitorGuides} activityLogs={activityLogs}
          deleteVisitorGuide={deleteLog} testUnauthorizedTerminate={testUnauthorizedTerminate}
        />
        <RightPanel
          selectedAltar={selectedAltar}
          setSelectedAltar={(u) => setAltars(prev => prev.map(a => a.id === u.id ? u : a))}
          altars={altars} reservations={reservations}
          triggerStatusScheduleRace={triggerStatusScheduleRace}
          triggerCancelGuideConflict={triggerCancelGuideConflict}
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
