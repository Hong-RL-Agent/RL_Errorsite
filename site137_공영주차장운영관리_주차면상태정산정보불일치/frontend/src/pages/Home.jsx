import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchParkingLots, fetchParkingSpaces, fetchParkingRecords, fetchSettlements, fetchActivityLogs,
  searchRecordsApi, patchRecordFeeApi, patchSpaceStatusApi,
  cancelExitApi, completeSettlementApi, cancelSettlementUnauthorizedApi,
  patchVehiclePartialApi, deleteSettlementApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [records, setRecords] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-7001');
  const [filterLot, setFilterLot] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedUnpaidCount] = useState(14);
  const [cachedRecentRecord] = useState('123가 4567 (강남역 노외 A-12 / 12,000원)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadRecords(), loadParkingLots(), loadParkingSpaces(), loadSettlements(), loadActivityLogs(), loadStaffs()]);
  const loadRecords = async () => setRecords(await fetchParkingRecords());
  const loadParkingLots = async () => setParkingLots(await fetchParkingLots());
  const loadParkingSpaces = async () => setParkingSpaces(await fetchParkingSpaces());
  const loadSettlements = async () => setSettlements(await fetchSettlements());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 관제 관리자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadRecords();
    // INTENTIONAL_ERROR: cachedUnpaidCount and cachedRecentRecord remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (lotId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - LOT-01(3초 지연) 결과가 최신 LOT-02(0.2초) 결과를 덮어씀
    showToast(`차량 입출차 목록 조회 중 [주차장: ${lotId} / 상태: ${status}]...`, 'info');
    searchRecordsApi(lotId, status, search).then(data => {
      setRecords(data);
      if (lotId === 'LOT-01') {
        showToast('강남역 공영 목록 수신 완료 (3초 지연 완료 ➔ 최신 주차장 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`차량 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedRecords[idx] 아닌 원본 records[idx] 차량이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedRecords[idx];
    if (clicked) {
      showToast(`[${clicked.carNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 차량 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusFeeRace = (recId, target, feeWon) => {
    showToast('사용중 변경(3초 지연)과 요금 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchSpaceStatusApi(recId, target.status);
    setTimeout(() => {
      patchRecordFeeApi(recId, feeWon);
    }, 100);
    setTimeout(async () => {
      showToast('요금 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('사용중 변경 완료 (3초 완료 - 요금 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadRecords();
    }, 4000);
  };

  const triggerCancelSettlementConflict = (recId) => {
    showToast('출차 취소(0.5초 완료)와 정산 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelExitApi(recId);
    setTimeout(async () => {
      showToast('출차 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadRecords();
    }, 600);
    completeSettlementApi(recId);
    setTimeout(async () => {
      showToast('정산 완료 처리 (4초 완료 → CANCELLED 차량을 SETTLED로 복원시킴 - Error 2)', 'danger');
      await loadRecords();
      await loadSettlements();
    }, 4500);
  };

  const triggerPartialSave = async (id, carNo, carType, phone) => {
    await patchVehiclePartialApi(id, carNo, carType, phone);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save carType (Error 8)
    showToast(`[${id}] 차량번호/차종/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadRecords();
  };

  const deleteLog = async (id) => {
    const data = await deleteSettlementApi(id);
    if (data.success) {
      showToast('정산 로그 삭제 완료. (대시보드 주차장별 매출 및 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadSettlements();
    }
  };

  const testUnauthorizedCancel = async (id) => {
    const res = await cancelSettlementUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 정산 취소 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ParkControl 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedRecords = useMemo(() => {
    let list = [...records];
    if (sortOrder === 'TIME_DESC') {
      list.sort((a, b) => b.durationMinutes - a.durationMinutes);
    } else if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.feeWon - a.feeWon);
    }
    return list;
  }, [records, sortOrder]);

  // INTENTIONAL_ERROR: selectedRecord is based on original records[] not sortedRecords[] (Error 3)
  const selectedRecord = useMemo(() => records[selectedIdx] || records[0] || null, [records, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedUnpaidCount={cachedUnpaidCount} cachedRecentRecord={cachedRecentRecord} resetSandbox={resetSandbox} />
      <div className="parkcontrol-grid">
        <Sidebar
          filterLot={filterLot} setFilterLot={setFilterLot}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          records={sortedRecords} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          parkingLots={parkingLots}
        />
        <CenterSection
          parkingSpaces={parkingSpaces} parkingRecords={records}
          settlements={settlements} activityLogs={activityLogs}
          deleteSettlement={deleteLog} testUnauthorizedCancel={testUnauthorizedCancel}
        />
        <RightPanel
          selectedRecord={selectedRecord}
          setSelectedRecord={(u) => setRecords(prev => prev.map(r => r.id === u.id ? u : r))}
          records={records}
          triggerStatusFeeRace={triggerStatusFeeRace}
          triggerCancelSettlementConflict={triggerCancelSettlementConflict}
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
