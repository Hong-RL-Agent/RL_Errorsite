import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import MemberEditModal from '../components/MemberEditModal.jsx';
import {
  fetchTrainers,
  fetchMembers,
  fetchMembershipPasses,
  fetchReservations,
  fetchAttendanceLogs,
  fetchActivityLogs,
  searchReservationsApi,
  patchReservationTimeApi,
  patchReservationTrainerApi,
  cancelReservationApi,
  checkInAttendanceApi,
  deductPassUnauthorizedApi,
  patchMemberPartialApi,
  deleteAttendanceLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [membershipPasses, setMembershipPasses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeTrainer, setActiveTrainer] = useState('TRN-3001');
  const [filterTrainer, setFilterTrainer] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedReservationIndex, setSelectedReservationIndex] = useState(0);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedTodayReservations, setCachedTodayReservations] = useState(18);
  const [cachedRecentMember] = useState('김동남 회원 (PT 30회권 / 18회 잔여 / 만료 2026-12-31)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadTrainers();
    await loadMembers();
    await loadMembershipPasses();
    await loadReservations();
    await loadAttendanceLogs();
    await loadActivityLogs();
  };

  const loadTrainers = async () => {
    const data = await fetchTrainers();
    setTrainers(data);
  };

  const loadMembers = async () => {
    const data = await fetchMembers();
    setMembers(data);
  };

  const loadMembershipPasses = async () => {
    const data = await fetchMembershipPasses();
    setMembershipPasses(data);
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
  };

  const loadAttendanceLogs = async () => {
    const data = await fetchAttendanceLogs();
    setAttendanceLogs(data);
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

  // Trainer Session Switch (Error 6 Target)
  const handleTrainerSwitch = (trainerId) => {
    setActiveTrainer(trainerId);
    showToast(`로그인 트레이너를 [${trainerId}] 권한으로 변경합니다.`, 'info');
    loadReservations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 회원 상세를 본 뒤 직원 B로 로그인하면 회원 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 오늘 예약 수(cachedTodayReservations) 및 최근 회원 상세 캐시(cachedRecentMember)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Time & Trainer update race condition (Error 1 Trigger)
  const triggerTimeTrainerRace = (resv) => {
    showToast('PT 예약 시간 변경(3초 지연)과 담당 트레이너 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Trainer update (0.1s done)
    patchReservationTrainerApi(resv.id, resv.trainerName);

    // 2. Time update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchReservationTimeApi(resv.id, resv.resTime);
    }, 100);

    setTimeout(async () => {
      showToast('PT 예약 시간 변경 완료 (시간은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 트레이너와 예약시간 조합이 롤백 저장됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Trainer search race condition (Error 5 Trigger)
  const triggerSearchRace = (trainerName, search) => {
    showToast(`트레이너 PT 예약 목록을 조회합니다: [${trainerName} / ${search}]`, 'info');

    if (trainerName && trainerName.includes('김피트')) {
      searchReservationsApi('김피트', 'ALL', search).then(data => {
        setReservations(data);
        showToast('김피트 트레이너 예약 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (trainerName && trainerName.includes('이웨이트')) {
      searchReservationsApi('이웨이트', 'ALL', search).then(data => {
        setReservations(data);
        showToast('이웨이트 트레이너 예약 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchReservationsApi(trainerName, 'ALL', search).then(data => {
        setReservations(data);
      });
    }
  };

  // Sort Reserve Index Mismatch (Error 3 Target)
  const openReserveMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 회원 목록을 잔여횟수순/최근방문일순으로 정렬한 뒤 예약 버튼을 누르면 
    // 사용자가 클릭한 회원이 아니라 정렬 전 원본 배열의 같은 index 회원에게 예약이 생성되는 결함입니다.
    const targetMem = sortedMembers[index];
    if (targetMem) {
      showToast(`[${targetMem.name}] 회원 PT 예약 신청 (우측 관제 패널에는 인덱스 불일치 다른 회원의 예약이 연결됨)`, 'warning');
    }
  };

  // Cancel Reservation & Check In Conflict (Error 2 Trigger)
  const triggerCancelCheckInConflict = (resv) => {
    showToast('PT 예약 취소 처리와 출석 체크를 연쇄 진행합니다.', 'info');

    // 1. Cancel Reservation (0.5s done, status = CANCELLED)
    cancelReservationApi(resv.id);

    // 2. Check In Attendance (4.0s delay with restore to ATTENDED and pass count deduct)
    setTimeout(async () => {
      await checkInAttendanceApi(resv.id);
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadReservations();
    }, 100);

    setTimeout(async () => {
      showToast('출석 체크 실행 응답 완료 (4초 지연 완료: 취소된 예약을 ATTENDED 출석 상태로 복원하고 회원권을 차감시킴)', 'danger');
      await loadReservations();
      await loadMembers();
      await loadAttendanceLogs();
    }, 4500);
  };

  // Partial Member Save (Error 8 Trigger)
  const triggerPartialMemberSave = async (id, phone, expiryDate, assignedTrainer) => {
    await patchMemberPartialApi(id, phone, expiryDate, assignedTrainer);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 회원 정보 수정 모달에서 연락처, 회원권 만료일, 담당 트레이너를 동시에 수정하면 백엔드는 연락처와 담당 트레이너만 저장하고 
    // 만료일은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 회원권 만료일, 담당 트레이너가 성공적으로 저장되었습니다.', 'success');
    await loadMembers();
  };

  // Delete Attendance Log (Error 4 Target)
  const deleteAttendanceLog = async (id) => {
    const data = await deleteAttendanceLogApi(id);
    if (data.success) {
      showToast('출석 로그를 삭제했습니다. (회원별 출석률 및 월별 매출 수치에는 계속 유지됨)', 'warning');
      await loadAttendanceLogs();
    }
  };

  // Test Unauthorized Pass Deduct (Error 7 Trigger)
  const testUnauthorizedDeduct = async (id) => {
    try {
      const res = await deductPassUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 회원권 차감 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (memberId, phone, expiryDate, assignedTrainer) => {
    await patchMemberPartialApi(memberId, phone, expiryDate, assignedTrainer);
    showToast(`[${memberId}] 회원 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedMemberForModal(null);
    await loadMembers();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FitMember 피트니스 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedReservationIndex(0);
    await loadAll();
  };

  const sortedMembers = useMemo(() => {
    let list = [...members];
    if (filterTrainer !== 'ALL') {
      list = list.filter(m => m.assignedTrainer.includes(filterTrainer));
    }
    if (searchTerm) {
      list = list.filter(m => m.name.includes(searchTerm) || m.id.includes(searchTerm) || m.phone.includes(searchTerm));
    }
    if (sortOrder === 'REMAIN_ASC') {
      list.sort((a, b) => a.remainingCount - b.remainingCount);
    } else if (sortOrder === 'VISIT_DESC') {
      list.sort((a, b) => new Date(b.recentVisit) - new Date(a.recentVisit));
    }
    return list;
  }, [members, filterTrainer, searchTerm, sortOrder]);

  const sortedReservations = useMemo(() => {
    let list = [...reservations];
    if (filterTrainer !== 'ALL') {
      list = list.filter(r => r.trainerName.includes(filterTrainer));
    }
    if (searchTerm) {
      list = list.filter(r => r.memberName.includes(searchTerm) || r.id.includes(searchTerm));
    }
    return list;
  }, [reservations, filterTrainer, searchTerm]);

  // Selected Reservation for RightPanel (Error 3 Effect)
  const selectedReservationForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedReservations[selectedReservationIndex] || reservations[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted reservations array
      return reservations[selectedReservationIndex] || reservations[0];
    }
  }, [sortedReservations, reservations, selectedReservationIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeTrainer={activeTrainer}
        handleTrainerSwitch={handleTrainerSwitch}
        cachedTodayReservations={cachedTodayReservations}
        cachedRecentMember={cachedRecentMember}
        resetSandbox={resetSandbox}
      />

      <div className="fitmember-grid">
        <Sidebar
          filterTrainer={filterTrainer}
          setFilterTrainer={setFilterTrainer}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          members={sortedMembers}
          selectedMemberIndex={selectedReservationIndex}
          setSelectedMemberIndex={setSelectedReservationIndex}
          openReserveMismatch={openReserveMismatch}
          trainers={trainers}
        />

        <CenterSection
          members={members}
          trainers={trainers}
          membershipPasses={membershipPasses}
          reservations={reservations}
          attendanceLogs={attendanceLogs}
          activityLogs={activityLogs}
          deleteAttendanceLog={deleteAttendanceLog}
          openMemberModal={(m) => setSelectedMemberForModal(m)}
          testUnauthorizedDeduct={testUnauthorizedDeduct}
        />

        <RightPanel
          selectedReservation={selectedReservationForPanel}
          setSelectedReservation={(updated) => {
            setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
          trainers={trainers}
          members={members}
          triggerTimeTrainerRace={triggerTimeTrainerRace}
          triggerCancelCheckInConflict={triggerCancelCheckInConflict}
          triggerPartialMemberSave={triggerPartialMemberSave}
        />
      </div>

      <MemberEditModal
        member={selectedMemberForModal}
        trainers={trainers}
        onClose={() => setSelectedMemberForModal(null)}
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
