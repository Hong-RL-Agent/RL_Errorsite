import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchEquipments, fetchCustomers, fetchRentals, fetchReturnLogs, fetchSafetyLogs, fetchActivityLogs,
  searchRentalsApi, patchRentalReturnTimeApi, patchRentalStatusApi,
  cancelRentalApi, completeReturnApi, confirmDamageUnauthorizedApi,
  patchEquipmentPartialApi, deleteReturnLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [returnLogs, setReturnLogs] = useState([]);
  const [safetyLogs, setSafetyLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-9901');
  const [filterBranchName, setFilterBranchName] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedDelayedReturnCount] = useState(6);
  const [cachedRecentRental] = useState('야마하 FX 크루저 3인승 제트스키 (대여중 / 해운대 A선착장)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadRentals(), loadEquipments(), loadCustomers(), loadReturnLogs(), loadSafetyLogs(), loadActivityLogs(), loadStaffs()]);
  const loadRentals = async () => setRentals(await fetchRentals());
  const loadEquipments = async () => setEquipments(await fetchEquipments());
  const loadCustomers = async () => setCustomers(await fetchCustomers());
  const loadReturnLogs = async () => setReturnLogs(await fetchReturnLogs());
  const loadSafetyLogs = async () => setSafetyLogs(await fetchSafetyLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 마리나 지점장을 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadRentals();
    // INTENTIONAL_ERROR: cachedDelayedReturnCount and cachedRecentRental remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (branchName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 부산 해운대(3초 지연) 결과가 최신 제주 서귀포(0.2초) 결과를 덮어씀
    showToast(`장비 대여 목록 조회 중 [지점: ${branchName} / 상태: ${status}]...`, 'info');
    searchRentalsApi(branchName, status, search).then(data => {
      setRentals(data);
      if (branchName === '부산 해운대 마리나 센터') {
        showToast('부산 해운대 지점 수신 완료 (3초 지연 완료 ➔ 최신 지점 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`대여 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedRentals[idx] 아닌 원본 rentals[idx] 대여가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedRentals[idx];
    if (clicked) {
      showToast(`[${clicked.customerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 대여 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusTimeRace = (rntId, target, returnTime) => {
    showToast('대여중 변경(3초 지연)과 반납 예정 시간 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchRentalStatusApi(rntId, target.status);
    setTimeout(() => {
      patchRentalReturnTimeApi(rntId, returnTime);
    }, 100);
    setTimeout(async () => {
      showToast('반납 예정 시간 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('대여중 변경 완료 (3초 완료 - 반납 예정 시간 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadRentals();
    }, 4000);
  };

  const triggerCancelReturnConflict = (rntId) => {
    showToast('대여 취소(0.5초 완료)와 반납 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelRentalApi(rntId);
    setTimeout(async () => {
      showToast('대여 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadRentals();
    }, 600);
    completeReturnApi(rntId);
    setTimeout(async () => {
      showToast('반납 완료 처리 (4초 완료 → CANCELLED 대여를 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadRentals();
      await loadReturnLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, equipmentName, storageLocation, safetyGrade) => {
    await patchEquipmentPartialApi(id, equipmentName, storageLocation, safetyGrade);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save storageLocation (Error 8)
    showToast(`[${id}] 장비명/안전등급/보관위치가 성공적으로 저장되었습니다.`, 'success');
    await loadEquipments();
  };

  const deleteLog = async (id) => {
    const data = await deleteReturnLogApi(id);
    if (data.success) {
      showToast('반납 점검 로그 삭제 완료. (대시보드 장비별 손상률 및 지점별 이용률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadReturnLogs();
    }
  };

  const testUnauthorizedConfirmDamage = async (id) => {
    const res = await confirmDamageUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 손상 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MarineRent 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedRentals = useMemo(() => {
    let list = [...rentals];
    if (sortOrder === 'RETURN_ASC') {
      list.sort((a, b) => a.returnTime.localeCompare(b.returnTime));
    } else if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.feeWon - a.feeWon);
    }
    return list;
  }, [rentals, sortOrder]);

  // INTENTIONAL_ERROR: selectedRental is based on original rentals[] not sortedRentals[] (Error 3)
  const selectedRental = useMemo(() => rentals[selectedIdx] || rentals[0] || null, [rentals, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedDelayedReturnCount={cachedDelayedReturnCount} cachedRecentRental={cachedRecentRental} resetSandbox={resetSandbox} />
      <div className="marinerent-grid">
        <Sidebar
          filterBranchName={filterBranchName} setFilterBranchName={setFilterBranchName}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          rentals={sortedRentals} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          equipments={equipments}
        />
        <CenterSection
          rentals={rentals} equipments={equipments} customers={customers}
          returnLogs={returnLogs} safetyLogs={safetyLogs} activityLogs={activityLogs}
          deleteReturnLog={deleteLog} testUnauthorizedConfirmDamage={testUnauthorizedConfirmDamage}
        />
        <RightPanel
          selectedRental={selectedRental}
          setSelectedRental={(u) => setRentals(prev => prev.map(r => r.id === u.id ? u : r))}
          rentals={rentals} equipments={equipments}
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
