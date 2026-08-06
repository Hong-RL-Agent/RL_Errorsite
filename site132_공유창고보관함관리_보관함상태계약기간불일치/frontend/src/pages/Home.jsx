import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchBranches, fetchCustomers, fetchLockers, fetchContracts, fetchInOutLogs, fetchActivityLogs,
  searchLockersApi, patchLockerPeriodApi, patchLockerStatusApi,
  terminateContractApi, processItemInApi, terminateContractUnauthorizedApi,
  patchCustomerPartialApi, deleteInOutLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [inOutLogs, setInOutLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-1001');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedExpiringCount] = useState(12);
  const [cachedRecentLocker] = useState('B-205 (BoxSpace 홍대입구점 / Medium 85,000원)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadLockers(), loadBranches(), loadCustomers(), loadContracts(), loadInOutLogs(), loadActivityLogs(), loadStaffs()]);
  const loadLockers = async () => setLockers(await fetchLockers());
  const loadBranches = async () => setBranches(await fetchBranches());
  const loadCustomers = async () => setCustomers(await fetchCustomers());
  const loadContracts = async () => setContracts(await fetchContracts());
  const loadInOutLogs = async () => setInOutLogs(await fetchInOutLogs());
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
    loadLockers();
    // INTENTIONAL_ERROR: cachedExpiringCount and cachedRecentLocker remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (branchId, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - BRN-01 강남(3초 지연) 결과가 최신 BRN-02 홍대(0.2초) 결과를 덮어씀
    showToast(`보관함 목록 조회 중 [지점: ${branchId} / 상태: ${status}]...`, 'info');
    searchLockersApi(branchId, status, search).then(data => {
      setLockers(data);
      if (branchId === 'BRN-01') {
        showToast('강남역점 보관함 목록 수신 완료 (3초 지연 완료 ➔ 최신 지점 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`보관함 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedLockers[idx] 아닌 원본 lockers[idx] 보관함이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedLockers[idx];
    if (clicked) {
      showToast(`[${clicked.lockerNo}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 보관함 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerPeriodStatusRace = (lckId, target, startDate, endDate) => {
    showToast('계약 기간 변경(3초 지연)과 사용중 상태 변경(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchLockerPeriodApi(lckId, startDate, endDate);
    setTimeout(() => {
      patchLockerStatusApi(lckId, target.status);
    }, 100);
    setTimeout(async () => {
      showToast('보관함 상태 변경 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('계약 기간 변경 완료 (3초 완료 - 보관함 상태 변경이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadLockers();
    }, 4000);
  };

  const triggerTerminateInConflict = (lckId) => {
    showToast('계약 종료(0.5초 완료)와 물품 입고(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    terminateContractApi(lckId);
    setTimeout(async () => {
      showToast('계약 종료 완료 (0.5초 완료 → 상태: TERMINATED)', 'warning');
      await loadLockers();
    }, 600);
    processItemInApi(lckId);
    setTimeout(async () => {
      showToast('물품 입고 처리 (4초 완료 → TERMINATED 계약을 IN_USE로 복원시킴 - Error 2)', 'danger');
      await loadLockers();
      await loadInOutLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, customerName, phone, memo) => {
    await patchCustomerPartialApi(id, customerName, phone, memo);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/연락처/보관품 메모가 성공적으로 저장되었습니다.`, 'success');
    await loadCustomers();
  };

  const deleteLog = async (id) => {
    const data = await deleteInOutLogApi(id);
    if (data.success) {
      showToast('입출고 로그 삭제 완료. (대시보드 지점별 점유율 및 월별 계약 수 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadInOutLogs();
    }
  };

  const testUnauthorizedTerminate = async (id) => {
    const res = await terminateContractUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 계약 종료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('BoxSpace 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedLockers = useMemo(() => {
    let list = [...lockers];
    if (sortOrder === 'EXPIRY_ASC') {
      list.sort((a, b) => a.endDate.localeCompare(b.endDate));
    } else if (sortOrder === 'FEE_DESC') {
      list.sort((a, b) => b.monthlyFeeWon - a.monthlyFeeWon);
    }
    return list;
  }, [lockers, sortOrder]);

  // INTENTIONAL_ERROR: selectedLocker is based on original lockers[] not sortedLockers[] (Error 3)
  const selectedLocker = useMemo(() => lockers[selectedIdx] || lockers[0] || null, [lockers, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedExpiringCount={cachedExpiringCount} cachedRecentLocker={cachedRecentLocker} resetSandbox={resetSandbox} />
      <div className="boxspace-grid">
        <Sidebar
          filterBranch={filterBranch} setFilterBranch={setFilterBranch}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          lockers={sortedLockers} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          branches={branches}
        />
        <CenterSection
          lockers={lockers} branches={branches} contracts={contracts}
          inOutLogs={inOutLogs} activityLogs={activityLogs}
          deleteInOutLog={deleteLog} testUnauthorizedTerminate={testUnauthorizedTerminate}
        />
        <RightPanel
          selectedLocker={selectedLocker}
          setSelectedLocker={(u) => setLockers(prev => prev.map(l => l.id === u.id ? u : l))}
          lockers={lockers} customers={customers}
          triggerPeriodStatusRace={triggerPeriodStatusRace}
          triggerTerminateInConflict={triggerTerminateInConflict}
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
