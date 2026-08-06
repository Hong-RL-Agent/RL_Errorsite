import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import RoomMoveModal from '../components/RoomMoveModal.jsx';
import {
  fetchNurses,
  fetchRooms,
  fetchPatients,
  fetchMedications,
  fetchRoomLogs,
  searchPatientsApi,
  patchMedicationStatusApi,
  patchPatientRoomApi,
  dischargePatientApi,
  addMedicationRecordApi,
  patchPatientMemoPartialApi,
  deleteMedicationApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [nurses, setNurses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [roomLogs, setRoomLogs] = useState([]);

  const [activeNurse, setActiveNurse] = useState('NRS-001');
  const [filterWard, setFilterWard] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale room cache for Error 1
  const [previousRoomNoCache, setPreviousRoomNoCache] = useState('301호');

  // Session stats cache (Error 6 Target)
  const [cachedScheduledCount, setCachedScheduledCount] = useState(14);
  const [cachedRecentPatientSummary, setCachedRecentPatientSummary] = useState('김철수 환자 (301호 / 3A병동)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadNurses();
    await loadRooms();
    await loadPatients();
    await loadMedications();
    await loadRoomLogs();
  };

  const loadNurses = async () => {
    const data = await fetchNurses();
    setNurses(data);
  };

  const loadRooms = async () => {
    const data = await fetchRooms();
    setRooms(data);
  };

  const loadPatients = async () => {
    const data = await fetchPatients();
    setPatients(data);
    if (data.length > 0) {
      setPreviousRoomNoCache(data[0].roomNo);
    }
  };

  const loadMedications = async () => {
    const data = await fetchMedications();
    setMedications(data);
  };

  const loadRoomLogs = async () => {
    const data = await fetchRoomLogs();
    setRoomLogs(data);
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

  // Nurse Session Switch (Error 6 Target)
  const handleNurseSwitch = (nurseId) => {
    setActiveNurse(nurseId);
    showToast(`로그인 계정을 [${nurseId}] 간호사로 변경합니다.`, 'info');
    loadPatients();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 간호사 A가 담당 환자 목록을 본 뒤 간호사 B로 로그인하면 환자 목록은 B 담당 기준으로 바뀌지만, 
    // 상단 투약 예정 개수 및 최근 환자 요약 캐시(cachedScheduledCount, cachedRecentPatientSummary)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Room Transfer & Medication Status update race (Error 1 Trigger)
  const triggerRoomMedicationRace = (pat) => {
    showToast('병실 이동과 투약 완료 처리를 순차 요청합니다.', 'info');

    // 1. Medication status update (0.1s done) with STALE room cache!
    const targetMed = medications.find(m => m.patientId === pat.id);
    if (targetMed) {
      patchMedicationStatusApi(targetMed.id, 'COMPLETED', previousRoomNoCache);
    }

    // 2. Patient room transfer (3.0s delay)
    setTimeout(() => {
      patchPatientRoomApi(pat.id, pat.roomNo, pat.ward, 'ADMIN');
    }, 100);

    setPreviousRoomNoCache(pat.roomNo);

    setTimeout(async () => {
      showToast('병실 이동 완료 (병실은 갱신되었으나 3초 지연 완료로 투약 기록의 병실이 이전 병실로 롤백 저장됨)', 'warning');
      await loadPatients();
      await loadMedications();
    }, 4500);
  };

  // Ward & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (ward, status) => {
    showToast(`병동 환자 목록 필터를 조회합니다: [${ward} / ${status}]`, 'info');

    if (ward === '3A') {
      searchPatientsApi('3A', status).then(data => {
        setPatients(data);
        showToast('3A 병동 입원 환자 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (ward === '3B') {
      searchPatientsApi('3B', status).then(data => {
        setPatients(data);
        showToast('3B 병동 입원 환자 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchPatientsApi(ward, status).then(data => {
        setPatients(data);
      });
    }
  };

  // Severity Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 환자 목록을 중증도순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 환자가 아니라 정렬 전 원본 배열의 같은 index 환자 상세가 열리는 결함입니다.
    setSelectedPatientIndex(index);
    const clickedPatient = sortedPatients[index];
    if (clickedPatient) {
      showToast(`[${clickedPatient.name}] 상세보기 표시 알림 완료 (우측 상세 패널에는 인덱스 불일치 데이터가 노출됨)`, 'warning');
    }
  };

  // Discharge Patient & Add Medication Conflict (Error 2 Trigger)
  const triggerDischargeMedicationConflict = (pat) => {
    showToast('환자 퇴원 처리와 처방 투약 기록 추가를 진행합니다.', 'info');

    // 1. Discharge Patient (0.5s done)
    dischargePatientApi(pat.id);

    // 2. Add Medication Record & Re-activate (4.0s delay)
    setTimeout(async () => {
      await addMedicationRecordApi(pat.id, pat.name, pat.roomNo, pat.ward, "추가 처방 수액", "16:00", "1회 IV");
      showToast('환자 퇴원 처리 완료 (0.5초 완료)', 'warning');
      await loadPatients();
    }, 100);

    setTimeout(async () => {
      showToast('투약 기록 추가 완료 (4초 지연 완료: 퇴원된 환자를 다시 ADMITTED 입원중 상태로 재활성화시킴)', 'danger');
      await loadPatients();
      await loadMedications();
    }, 4500);
  };

  // Partial Memo Save (Error 8 Trigger)
  const triggerPartialMemoSave = async (id, precautions, guardianPhone, nurseMemo) => {
    await patchPatientMemoPartialApi(id, precautions, guardianPhone, nurseMemo);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 환자 메모 수정 모달에서 주의사항, 보호자 연락처, 간호 메모를 동시에 수정하면 백엔드는 주의사항과 간호 메모만 저장하고 
    // 보호자 연락처는 이전 값을 유지하지만, 프론트엔드는 세 값이 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('주의사항, 보호자 연락처, 간호 메모가 성공적으로 수정되었습니다.', 'success');
    await loadPatients();
  };

  // Delete Medication (Error 4 Target)
  const deleteMedication = async (id) => {
    const data = await deleteMedicationApi(id);
    if (data.success) {
      showToast('투약 기록을 삭제했습니다. (병동 완료율 및 간호사 처리량 그래프 수치에는 계속 유지됨)', 'warning');
      await loadMedications();
    }
  };

  // Test Unauthorized Room Move (Error 7 Trigger)
  const testUnauthorizedRoomMove = async (id) => {
    try {
      const res = await patchPatientRoomApi(id, '302호', '3A', 'NURSE');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (patientId, roomNo, ward) => {
    await patchPatientRoomApi(patientId, roomNo, ward, 'ADMIN');
    showToast(`[${roomNo}] 병실로 이동 확정되었습니다.`, 'success');
    setSelectedPatientForModal(null);
    await loadPatients();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('WardMate 병동 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedPatientIndex(0);
    await loadAll();
  };

  const sortedPatients = useMemo(() => {
    let list = [...patients];
    if (filterWard !== 'ALL') {
      list = list.filter(p => p.ward === filterWard);
    }
    if (filterStatus !== 'ALL') {
      list = list.filter(p => p.status === filterStatus);
    }
    if (sortOrder === 'SEVERITY_DESC') {
      list.sort((a, b) => b.severity - a.severity);
    }
    return list;
  }, [patients, filterWard, filterStatus, sortOrder]);

  // Selected Patient for RightPanel (Error 3 Effect)
  const selectedPatientForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedPatients[selectedPatientIndex] || patients[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted patients array
      return patients[selectedPatientIndex] || patients[0];
    }
  }, [sortedPatients, patients, selectedPatientIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeNurse={activeNurse}
        handleNurseSwitch={handleNurseSwitch}
        cachedScheduledCount={cachedScheduledCount}
        cachedRecentPatientSummary={cachedRecentPatientSummary}
        resetSandbox={resetSandbox}
      />

      <div className="wardmate-grid">
        <Sidebar
          filterWard={filterWard}
          setFilterWard={setFilterWard}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          patients={sortedPatients}
          selectedPatientIndex={selectedPatientIndex}
          setSelectedPatientIndex={setSelectedPatientIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          patients={sortedPatients}
          rooms={rooms}
          medications={medications}
          nurses={nurses}
          deleteMedication={deleteMedication}
          openRoomMoveModal={(pat) => setSelectedPatientForModal(pat)}
          testUnauthorizedRoomMove={testUnauthorizedRoomMove}
        />

        <RightPanel
          selectedPatient={selectedPatientForPanel}
          setSelectedPatient={(updated) => {
            setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
          }}
          triggerRoomMedicationRace={triggerRoomMedicationRace}
          rooms={rooms}
          triggerDischargeMedicationConflict={triggerDischargeMedicationConflict}
          triggerPartialMemoSave={triggerPartialMemoSave}
        />
      </div>

      <RoomMoveModal
        patient={selectedPatientForModal}
        rooms={rooms}
        onClose={() => setSelectedPatientForModal(null)}
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
