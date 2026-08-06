import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchStudios, fetchGears, fetchReservations, fetchRentalLogs, fetchActivityLogs,
  searchGearsApi, patchGearTimeApi, patchGearStatusApi,
  cancelReservationApi, completeReturnApi, disposeGearUnauthorizedApi,
  patchGearPartialApi, deleteRentalLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [studios, setStudios] = useState([]);
  const [gears, setGears] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [rentalLogs, setRentalLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-6001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedReturnPendingCount] = useState(16);
  const [cachedRecentGear] = useState('RED V-RAPTOR 8K 시네마 카메라 (가동률 88.5% / A스튜디오)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadGears(), loadStudios(), loadReservations(), loadRentalLogs(), loadActivityLogs(), loadStaffs()]);
  const loadGears = async () => setGears(await fetchGears());
  const loadStudios = async () => setStudios(await fetchStudios());
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadRentalLogs = async () => setRentalLogs(await fetchRentalLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadGears();
    // INTENTIONAL_ERROR: cachedReturnPendingCount and cachedRecentGear remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 4K 시네마 카메라(3초 지연) 결과가 최신 지미집(0.2초) 결과를 덮어씀
    showToast(`장비 목록 조회 중 [유형: ${category} / 상태: ${status}]...`, 'info');
    searchGearsApi(category, status, search).then(data => {
      setGears(data);
      if (category === '4K 시네마 카메라') {
        showToast('4K 시네마 카메라 수신 완료 (3초 지연 완료 ➔ 최신 유형 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`장비 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedGears[idx] 아닌 원본 gears[idx] 장비가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedGears[idx];
    if (clicked) {
      showToast(`[${clicked.gearName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 장비 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusTimeRace = (gerId, target, startTime, endTime) => {
    showToast('대여중 변경(3초 지연)과 예약시간 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchGearStatusApi(gerId, target.status);
    setTimeout(() => {
      patchGearTimeApi(gerId, startTime, endTime);
    }, 100);
    setTimeout(async () => {
      showToast('예약시간 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('대여중 변경 완료 (3초 완료 - 예약시간 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadGears();
      await loadReservations();
    }, 4000);
  };

  const triggerCancelReturnConflict = (gerId) => {
    showToast('예약 취소(0.5초 완료)와 장비 반납 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(gerId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadGears();
    }, 600);
    completeReturnApi(gerId);
    setTimeout(async () => {
      showToast('장비 반납 완료 처리 (4초 완료 → CANCELLED 예약을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadGears();
      await loadRentalLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, gearName, location, inspectionDate) => {
    await patchGearPartialApi(id, gearName, location, inspectionDate);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save location (Error 8)
    showToast(`[${id}] 장비명/보관위치/점검일이 성공적으로 저장되었습니다.`, 'success');
    await loadGears();
  };

  const deleteLog = async (id) => {
    const data = await deleteRentalLogApi(id);
    if (data.success) {
      showToast('대여 로그 삭제 완료. (대시보드 장비별 사용률 및 스튜디오 예약률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadRentalLogs();
    }
  };

  const testUnauthorizedDispose = async (id) => {
    const res = await disposeGearUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 장비 폐기 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('StudioGear 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedGears = useMemo(() => {
    let list = [...gears];
    if (sortOrder === 'UTIL_DESC') {
      list.sort((a, b) => b.utilizationRate - a.utilizationRate);
    } else if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.dailyFeeWon - a.dailyFeeWon);
    }
    return list;
  }, [gears, sortOrder]);

  const categories = useMemo(() => ['4K 시네마 카메라', '방송 조명셋', '음향 마이크', '지미집/크레인', '무선 수신기'], []);

  // INTENTIONAL_ERROR: selectedGear is based on original gears[] not sortedGears[] (Error 3)
  const selectedGear = useMemo(() => gears[selectedIdx] || gears[0] || null, [gears, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedReturnPendingCount={cachedReturnPendingCount} cachedRecentGear={cachedRecentGear} resetSandbox={resetSandbox} />
      <div className="studiogear-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          gears={sortedGears} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          categories={categories}
        />
        <CenterSection
          gears={gears} studios={studios} reservations={reservations}
          rentalLogs={rentalLogs} activityLogs={activityLogs}
          deleteRentalLog={deleteLog} testUnauthorizedDispose={testUnauthorizedDispose}
        />
        <RightPanel
          selectedGear={selectedGear}
          setSelectedGear={(u) => setGears(prev => prev.map(g => g.id === u.id ? u : g))}
          gears={gears} reservations={reservations}
          triggerStatusTimeRace={triggerStatusTimeRace}
          triggerCancelReturnConflict={triggerCancelReturnConflict}
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
