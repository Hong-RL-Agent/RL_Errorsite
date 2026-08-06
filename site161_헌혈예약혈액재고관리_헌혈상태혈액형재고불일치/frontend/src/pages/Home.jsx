import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchCenters, fetchDonors, fetchReservations, fetchQuestionnaires, fetchBloodLogs, fetchActivityLogs,
  searchReservationsApi, patchBloodStockUnitsApi, patchReservationStatusApi,
  cancelReservationApi, updateBloodStockLogApi, completeDonationUnauthorizedApi,
  patchDonorPartialApi, deleteBloodLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [centers, setCenters] = useState([]);
  const [donors, setDonors] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [bloodLogs, setBloodLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-7701');
  const [filterCenterName, setFilterCenterName] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedShortageCount] = useState(3);
  const [cachedRecentDonor] = useState('최생명 (O+ 전혈 400mL / 48팩 보유)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadReservations(), loadCenters(), loadDonors(), loadQuestionnaires(), loadBloodLogs(), loadActivityLogs(), loadStaffs()]);
  const loadReservations = async () => setReservations(await fetchReservations());
  const loadCenters = async () => setCenters(await fetchCenters());
  const loadDonors = async () => setDonors(await fetchDonors());
  const loadQuestionnaires = async () => setQuestionnaires(await fetchQuestionnaires());
  const loadBloodLogs = async () => setBloodLogs(await fetchBloodLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 헌혈 센터장을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadReservations();
    // INTENTIONAL_ERROR: cachedShortageCount and cachedRecentDonor remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (centerName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 서울 중앙(3초 지연) 결과가 최신 강남역(0.2초) 결과를 덮어씀
    showToast(`헌혈 예약 목록 조회 중 [센터: ${centerName} / 상태: ${status}]...`, 'info');
    searchReservationsApi(centerName, status, search).then(data => {
      setReservations(data);
      if (centerName === '서울 중앙 헌혈의 집') {
        showToast('서울 중앙 센터 수신 완료 (3초 지연 완료 ➔ 최신 센터 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`예약 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedReservations[idx] 아닌 원본 reservations[idx] 헌혈자가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedReservations[idx];
    if (clicked) {
      showToast(`[${clicked.donorName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 예약 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusStockRace = (rsvId, target, bloodStockUnits) => {
    showToast('헌혈완료 변경(3초 지연)과 재고 수량 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchReservationStatusApi(rsvId, target.status);
    setTimeout(() => {
      patchBloodStockUnitsApi(rsvId, bloodStockUnits);
    }, 100);
    setTimeout(async () => {
      showToast('혈액형 재고 수량 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('헌혈완료 변경 완료 (3초 완료 - 재고 수량 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadReservations();
    }, 4000);
  };

  const triggerCancelStockConflict = (rsvId) => {
    showToast('예약 취소(0.5초 완료)와 혈액 재고 반영(4초 지연 완료)을 연쇄 실행합니다. (Error 2)', 'info');
    cancelReservationApi(rsvId);
    setTimeout(async () => {
      showToast('예약 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadReservations();
    }, 600);
    updateBloodStockLogApi(rsvId);
    setTimeout(async () => {
      showToast('혈액 재고 반영 처리 완료 (4초 완료 → CANCELLED 예약을 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadReservations();
      await loadBloodLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, donorName, phone, bloodType) => {
    await patchDonorPartialApi(id, donorName, phone, bloodType);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 헌혈자명/혈액형/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadDonors();
  };

  const deleteLog = async (id) => {
    const data = await deleteBloodLogApi(id);
    if (data.success) {
      showToast('재고 로그 삭제 완료. (대시보드 혈액형별 보유량 및 센터별 헌혈 수 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadBloodLogs();
    }
  };

  const testUnauthorizedCompleteDonation = async (id) => {
    const res = await completeDonationUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 헌혈 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('BloodReserve 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedReservations = useMemo(() => {
    let list = [...reservations];
    if (sortOrder === 'TIME_ASC') {
      list.sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
    } else if (sortOrder === 'BLOOD_ASC') {
      list.sort((a, b) => a.bloodType.localeCompare(b.bloodType));
    }
    return list;
  }, [reservations, sortOrder]);

  // INTENTIONAL_ERROR: selectedReservation is based on original reservations[] not sortedReservations[] (Error 3)
  const selectedReservation = useMemo(() => reservations[selectedIdx] || reservations[0] || null, [reservations, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedShortageCount={cachedShortageCount} cachedRecentDonor={cachedRecentDonor} resetSandbox={resetSandbox} />
      <div className="bloodreserve-grid">
        <Sidebar
          filterCenterName={filterCenterName} setFilterCenterName={setFilterCenterName}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          reservations={sortedReservations} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          centers={centers}
        />
        <CenterSection
          reservations={reservations} centers={centers} donors={donors}
          questionnaires={questionnaires} bloodLogs={bloodLogs} activityLogs={activityLogs}
          deleteBloodLog={deleteLog} testUnauthorizedCompleteDonation={testUnauthorizedCompleteDonation}
        />
        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={(u) => setReservations(prev => prev.map(r => r.id === u.id ? u : r))}
          reservations={reservations} donors={donors}
          triggerStatusStockRace={triggerStatusStockRace}
          triggerCancelStockConflict={triggerCancelStockConflict}
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
