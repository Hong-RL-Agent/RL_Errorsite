import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import UnitEditModal from '../components/UnitEditModal.jsx';
import {
  fetchStaffs,
  fetchUnits,
  fetchBills,
  fetchReservations,
  fetchComplaints,
  fetchActivityLogs,
  searchReservationsApi,
  patchReservationTimeApi,
  patchReservationAttendeesApi,
  cancelReservationApi,
  updateBillPaymentStatusApi,
  markBillPaidUnauthorizedApi,
  patchUnitPartialApi,
  deleteReservationLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [units, setUnits] = useState([]);
  const [bills, setBills] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeResident, setActiveResident] = useState('UNIT-101');
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedComplaintIndex, setSelectedComplaintIndex] = useState(0);
  const [selectedUnitForModal, setSelectedUnitForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedUnpaidAmount, setCachedUnpaidAmount] = useState(245000);
  const [cachedRecentBooking] = useState('101동 101호 (김동남 - 헬스장 19:00~21:00 / 2명 이용)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadStaffs();
    await loadUnits();
    await loadBills();
    await loadReservations();
    await loadComplaints();
    await loadActivityLogs();
  };

  const loadStaffs = async () => {
    const data = await fetchStaffs();
    setStaffs(data);
  };

  const loadUnits = async () => {
    const data = await fetchUnits();
    setUnits(data);
  };

  const loadBills = async () => {
    const data = await fetchBills();
    setBills(data);
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
  };

  const loadComplaints = async () => {
    const data = await fetchComplaints();
    setComplaints(data);
  };

  const loadActivityLogs = async () => {
    const data = await fetchActivityLogs();
    setActivityLogs(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Resident Session Switch (Error 6 Target)
  const handleResidentSwitch = (unitId) => {
    setActiveResident(unitId);
    showToast(`로그인 입주 세대를 [${unitId}] 권한으로 변경합니다.`, 'info');
    loadBills();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 입주민 A가 관리비 상세를 본 뒤 입주민 B로 로그인하면 관리비 목록은 B 세대 기준으로 바뀌지만, 
    // 상단 미납 금액(cachedUnpaidAmount) 및 최근 시설 예약 캐시(cachedRecentBooking)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Time & Attendees update race condition (Error 1 Trigger)
  const triggerTimeAttendeesRace = (resv) => {
    showToast('시설 예약 시간 변경(3초 지연)과 이용 인원 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Attendees update (0.1s done)
    patchReservationAttendeesApi(resv.id, resv.attendees);

    // 2. Time update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchReservationTimeApi(resv.id, resv.resTime);
    }, 100);

    setTimeout(async () => {
      showToast('시설 예약 시간 변경 완료 (시간은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 인원과 예약시간 조합이 롤백 저장됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Building search race condition (Error 5 Trigger)
  const triggerSearchRace = (building, search) => {
    showToast(`동별 시설 예약 목록을 조회합니다: [${building} / ${search}]`, 'info');

    if (building === '101동') {
      searchReservationsApi('101동', 'ALL', search).then(data => {
        setReservations(data);
        showToast('101동 시설 예약 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (building === '102동') {
      searchReservationsApi('102동', 'ALL', search).then(data => {
        setReservations(data);
        showToast('102동 시설 예약 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchReservationsApi(building, 'ALL', search).then(data => {
        setReservations(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 민원 목록을 처리기한순/긴급도순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 민원이 아니라 정렬 전 원본 배열의 같은 index 민원 상세가 열리는 결함입니다.
    setSelectedComplaintIndex(index);
    const clickedCmp = sortedComplaints[index];
    if (clickedCmp) {
      showToast(`[${clickedCmp.title}] 민원 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 민원의 세대 번호/메모가 표시됨)`, 'warning');
    }
  };

  // Cancel Reservation & Payment Status Conflict (Error 2 Trigger)
  const triggerCancelPaymentConflict = (resv) => {
    showToast('시설 예약 취소 처리와 관리비 납부 상태 갱신을 연쇄 진행합니다.', 'info');

    // 1. Cancel Reservation (0.5s done, status = CANCELLED)
    cancelReservationApi(resv.id);

    // 2. Update Bill Payment Status (4.0s delay with restore to CONFIRMED)
    setTimeout(async () => {
      const targetBill = bills.find(b => b.unitId === resv.unitId);
      if (targetBill) {
        await updateBillPaymentStatusApi(targetBill.id);
      }
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadReservations();
    }, 100);

    setTimeout(async () => {
      showToast('납부 상태 갱신 응답 완료 (4초 지연 완료: 취소된 예약을 CONFIRMED 예약완료 상태로 복원시킴)', 'danger');
      await loadReservations();
      await loadBills();
    }, 4500);
  };

  // Partial Unit Save (Error 8 Trigger)
  const triggerPartialUnitSave = async (id, phone, carNo, note) => {
    await patchUnitPartialApi(id, phone, carNo, note);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 세대 정보 수정 모달에서 연락처, 차량번호, 입주민 메모를 동시에 수정하면 백엔드는 연락처와 입주민 메모만 저장하고 
    // 차량번호는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 등록 차량번호, 특이사항 메모가 성공적으로 저장되었습니다.', 'success');
    await loadUnits();
  };

  // Delete Reservation Log (Error 4 Target)
  const deleteReservationLog = async (id) => {
    const data = await deleteReservationLogApi(id);
    if (data.success) {
      showToast('시설 예약 로그를 삭제했습니다. (시설별 이용률 및 세대별 예약 횟수 수치에는 계속 유지됨)', 'warning');
      await loadActivityLogs();
    }
  };

  // Test Unauthorized Bill Payment (Error 7 Trigger)
  const testUnauthorizedPayment = async (id) => {
    try {
      const res = await markBillPaidUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 관리비 수납 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (unitId, phone, carNo, note) => {
    await patchUnitPartialApi(unitId, phone, carNo, note);
    showToast(`[${unitId}] 세대 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedUnitForModal(null);
    await loadUnits();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('AptLife 아파트 단지 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedComplaintIndex(0);
    await loadAll();
  };

  const sortedComplaints = useMemo(() => {
    let list = [...complaints];
    if (filterBuilding !== 'ALL') {
      list = list.filter(c => c.building === filterBuilding);
    }
    if (searchTerm) {
      list = list.filter(c => c.title.includes(searchTerm) || c.building.includes(searchTerm) || c.room.includes(searchTerm));
    }
    if (sortOrder === 'DEADLINE_ASC') {
      list.sort((a, b) => a.deadline.localeCompare(b.deadline));
    } else if (sortOrder === 'URGENCY_DESC') {
      const urgencyRank = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      list.sort((a, b) => (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0));
    }
    return list;
  }, [complaints, filterBuilding, searchTerm, sortOrder]);

  const selectedReservationForPanel = useMemo(() => {
    return reservations[0] || null;
  }, [reservations]);

  return (
    <div id="app">
      <Header
        activeResident={activeResident}
        handleResidentSwitch={handleResidentSwitch}
        cachedUnpaidAmount={cachedUnpaidAmount}
        cachedRecentBooking={cachedRecentBooking}
        resetSandbox={resetSandbox}
      />

      <div className="aptlife-grid">
        <Sidebar
          filterBuilding={filterBuilding}
          setFilterBuilding={setFilterBuilding}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          complaints={sortedComplaints}
          selectedComplaintIndex={selectedComplaintIndex}
          setSelectedComplaintIndex={setSelectedComplaintIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          units={units}
          bills={bills}
          reservations={reservations}
          complaints={complaints}
          activityLogs={activityLogs}
          deleteReservationLog={deleteReservationLog}
          openUnitModal={(u) => setSelectedUnitForModal(u)}
          testUnauthorizedPayment={testUnauthorizedPayment}
        />

        <RightPanel
          selectedReservation={selectedReservationForPanel}
          setSelectedReservation={(updated) => {
            setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
          units={units}
          bills={bills}
          triggerTimeAttendeesRace={triggerTimeAttendeesRace}
          triggerCancelPaymentConflict={triggerCancelPaymentConflict}
          triggerPartialUnitSave={triggerPartialUnitSave}
        />
      </div>

      <UnitEditModal
        unit={selectedUnitForModal}
        onClose={() => setSelectedUnitForModal(null)}
        onConfirm={handleModalConfirm}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
