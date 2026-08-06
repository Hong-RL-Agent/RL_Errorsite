import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchInstruments, fetchCustomers, fetchRepairs, fetchEstimates, fetchRepairLogs, fetchActivityLogs,
  searchRepairsApi, patchRepairEstimatePriceApi, patchRepairStatusApi,
  cancelRepairApi, completeRepairApi, completeRepairUnauthorizedApi,
  patchCustomerPartialApi, deleteRepairLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [repairLogs, setRepairLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-4001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedEstimatingCount] = useState(12);
  const [cachedRecentRepair] = useState('스트라디바리우스 카피 바이올린 4/4 (35만원 / 수리중)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadRepairs(), loadInstruments(), loadCustomers(), loadEstimates(), loadRepairLogs(), loadActivityLogs(), loadStaffs()]);
  const loadRepairs = async () => setRepairs(await fetchRepairs());
  const loadInstruments = async () => setInstruments(await fetchInstruments());
  const loadCustomers = async () => setCustomers(await fetchCustomers());
  const loadEstimates = async () => setEstimates(await fetchEstimates());
  const loadRepairLogs = async () => setRepairLogs(await fetchRepairLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 공방 마스터를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadRepairs();
    // INTENTIONAL_ERROR: cachedEstimatingCount and cachedRecentRepair remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 현악기(3초 지연) 결과가 최신 관악기(0.2초) 결과를 덮어씀
    showToast(`악기 수리 접수 목록 조회 중 [카테고리: ${category} / 상태: ${status}]...`, 'info');
    searchRepairsApi(category, status, search).then(data => {
      setRepairs(data);
      if (category === '현악기 (바이올린 / 첼로 / 비올라)') {
        showToast('현악기 수신 완료 (3초 지연 완료 ➔ 최신 카테고리 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`접수 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedRepairs[idx] 아닌 원본 repairs[idx] 접수가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedRepairs[idx];
    if (clicked) {
      showToast(`[${clicked.customerName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 접수 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusPriceRace = (rprId, target, estimatePriceWon) => {
    showToast('수리중 변경(3초 지연)과 견적 금액 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchRepairStatusApi(rprId, target.status);
    setTimeout(() => {
      patchRepairEstimatePriceApi(rprId, estimatePriceWon);
    }, 100);
    setTimeout(async () => {
      showToast('악기 수리 견적 금액 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('수리중 변경 완료 (3초 완료 - 견적 금액 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadRepairs();
    }, 4000);
  };

  const triggerCancelCompleteConflict = (rprId) => {
    showToast('수리 취소(0.5초 완료)와 출고 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelRepairApi(rprId);
    setTimeout(async () => {
      showToast('수리 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadRepairs();
    }, 600);
    completeRepairApi(rprId);
    setTimeout(async () => {
      showToast('출고 완료 처리 (4초 완료 → CANCELLED 접수를 COMPLETED로 복원시킴 - Error 2)', 'danger');
      await loadRepairs();
      await loadRepairLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, customerName, phone, storageNo) => {
    await patchCustomerPartialApi(id, customerName, phone, storageNo);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save phone (Error 8)
    showToast(`[${id}] 이름/보관번호/연락처가 성공적으로 저장되었습니다.`, 'success');
    await loadCustomers();
  };

  const deleteLog = async (id) => {
    const data = await deleteRepairLogApi(id);
    if (data.success) {
      showToast('작업 로그 삭제 완료. (대시보드 악기별 평균 수리비 및 처리량 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadRepairLogs();
    }
  };

  const testUnauthorizedCompleteRepair = async (id) => {
    const res = await completeRepairUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 출고 완료 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('InstrumentFix 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedRepairs = useMemo(() => {
    let list = [...repairs];
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.estimatePriceWon - a.estimatePriceWon);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.rptDate.localeCompare(b.rptDate));
    }
    return list;
  }, [repairs, sortOrder]);

  // INTENTIONAL_ERROR: selectedRepair is based on original repairs[] not sortedRepairs[] (Error 3)
  const selectedRepair = useMemo(() => repairs[selectedIdx] || repairs[0] || null, [repairs, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedEstimatingCount={cachedEstimatingCount} cachedRecentRepair={cachedRecentRepair} resetSandbox={resetSandbox} />
      <div className="instrumentfix-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          repairs={sortedRepairs} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          instruments={instruments}
        />
        <CenterSection
          repairs={repairs} instruments={instruments} customers={customers} estimates={estimates}
          repairLogs={repairLogs} activityLogs={activityLogs}
          deleteRepairLog={deleteLog} testUnauthorizedCompleteRepair={testUnauthorizedCompleteRepair}
        />
        <RightPanel
          selectedRepair={selectedRepair}
          setSelectedRepair={(u) => setRepairs(prev => prev.map(r => r.id === u.id ? u : r))}
          repairs={repairs} customers={customers}
          triggerStatusPriceRace={triggerStatusPriceRace}
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
