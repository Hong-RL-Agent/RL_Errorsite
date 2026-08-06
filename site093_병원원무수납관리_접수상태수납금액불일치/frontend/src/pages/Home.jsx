import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PatientEditModal from '../components/PatientEditModal.jsx';
import {
  fetchAdmins,
  fetchDepartments,
  fetchPatients,
  fetchRegistrations,
  fetchPayments,
  fetchActivityLogs,
  searchRegistrationsApi,
  patchRegistrationDeptApi,
  patchRegistrationAmountApi,
  cancelRegistrationApi,
  completePaymentApi,
  cancelPaymentApi,
  patchPatientPartialApi,
  deletePaymentApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-101');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedRegistrationIndex, setSelectedRegistrationIndex] = useState(0);
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedCount, setCachedCount] = useState(35);
  const [cachedRecentPatient, setCachedRecentPatient] = useState('홍길동 환자 (850101-1****** / 내과)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadDepartments();
    await loadPatients();
    await loadRegistrations();
    await loadPayments();
    await loadActivityLogs();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadDepartments = async () => {
    const data = await fetchDepartments();
    setDepartments(data);
  };

  const loadPatients = async () => {
    const data = await fetchPatients();
    setPatients(data);
  };

  const loadRegistrations = async () => {
    const data = await fetchRegistrations();
    setRegistrations(data);
  };

  const loadPayments = async () => {
    const data = await fetchPayments();
    setPayments(data);
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

  // Staff Session Switch (Error 6 Target)
  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 원무 직원을 [${staffId}] 권한으로 변경합니다.`, 'info');
    loadRegistrations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 환자 상세를 본 뒤 직원 B로 로그인하면 접수 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 처리 건수(cachedCount) 및 최근 환자 상세 요약 캐시(cachedRecentPatient)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Dept & Amount update race condition (Error 1 Trigger)
  const triggerDeptAmountRace = (reg) => {
    showToast('진료과 변경(3초 지연)과 수납 금액 수정(0.1초)을 순차 처리합니다.', 'info');

    // 1. Amount update (0.1s done)
    patchRegistrationAmountApi(reg.id, reg.amount);

    // 2. Dept update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchRegistrationDeptApi(reg.id, reg.dept);
    }, 100);

    setTimeout(async () => {
      showToast('진료과 변경 완료 (진료과는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 진료과와 새 금액 조합이 롤백 저장됨)', 'warning');
      await loadRegistrations();
    }, 4500);
  };

  // Dept & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (dept, status) => {
    showToast(`진료과 접수 목록을 조회합니다: [${dept} / ${status}]`, 'info');

    if (dept === '내과') {
      searchRegistrationsApi('내과', status).then(data => {
        setRegistrations(data);
        showToast('내과 접수 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (dept === '정형외과') {
      searchRegistrationsApi('정형외과', status).then(data => {
        setRegistrations(data);
        showToast('정형외과 접수 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchRegistrationsApi(dept, status).then(data => {
        setRegistrations(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 접수 대기열을 대기시간순으로 정렬한 뒤 상세보기 버튼을 누르면 
    // 사용자가 클릭한 환자가 아니라 정렬 전 원본 배열의 같은 index 환자 상세가 열리는 결함입니다.
    setSelectedRegistrationIndex(index);
    const clickedReg = sortedRegistrations[index];
    if (clickedReg) {
      showToast(`[${clickedReg.patientName} 환자] 상세보기 표시 알림 (우측 관제 패널에는 인덱스 불일치 환자 수납 데이터가 노출됨)`, 'warning');
    }
  };

  // Cancel & Complete Payment Conflict (Error 2 Trigger)
  const triggerCancelPaymentConflict = (reg) => {
    showToast('접수 취소 처리와 수납 완료 승인을 진행합니다.', 'info');

    // 1. Cancel Registration (0.5s done)
    cancelRegistrationApi(reg.id);

    // 2. Complete Payment & Re-activate to COMPLETED (4.0s delay)
    setTimeout(async () => {
      await completePaymentApi(reg.id);
      showToast('접수 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadRegistrations();
    }, 100);

    setTimeout(async () => {
      showToast('수납 완료 응답 완료 (4초 지연 완료: 취소된 접수를 COMPLETED 수납완료 상태로 다시 변경시킴)', 'danger');
      await loadRegistrations();
    }, 4500);
  };

  // Partial Patient Save (Error 8 Trigger)
  const triggerPartialPatientSave = async (id, phone, address, guardianName) => {
    await patchPatientPartialApi(id, phone, address, guardianName);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 환자 정보 수정 모달에서 연락처, 주소, 보호자 이름을 동시에 수정하면 백엔드는 연락처와 주소만 저장하고 
    // 보호자 이름은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 주소, 보호자 이름이 성공적으로 저장되었습니다.', 'success');
    await loadPatients();
  };

  // Delete Payment (Error 4 Target)
  const deletePayment = async (id) => {
    const data = await deletePaymentApi(id);
    if (data.success) {
      showToast('수납 내역을 삭제했습니다. (일일 매출 합계 및 진료과별 수납 통계 수치에는 계속 유지됨)', 'warning');
      await loadPayments();
    }
  };

  // Test Unauthorized Cancel Payment (Error 7 Trigger)
  const testUnauthorizedCancelPayment = async (id) => {
    try {
      const res = await cancelPaymentApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 수납 취소 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (patientId, phone, address, guardianName) => {
    await patchPatientPartialApi(patientId, phone, address, guardianName);
    showToast(`[${patientId}] 환자 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedPatientForModal(null);
    await loadPatients();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ClinicDesk 원무 수납 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedRegistrationIndex(0);
    await loadAll();
  };

  const sortedRegistrations = useMemo(() => {
    let list = [...registrations];
    if (filterDept !== 'ALL') {
      list = list.filter(r => r.dept === filterDept);
    }
    if (sortOrder === 'WAIT_DESC') {
      list.sort((a, b) => b.waitTime - a.waitTime);
    } else if (sortOrder === 'AMOUNT_DESC') {
      list.sort((a, b) => b.amount - a.amount);
    }
    return list;
  }, [registrations, filterDept, sortOrder]);

  // Selected Registration & Patient for RightPanel (Error 3 Effect)
  const selectedRegistrationForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedRegistrations[selectedRegistrationIndex] || registrations[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted registrations array
      return registrations[selectedRegistrationIndex] || registrations[0];
    }
  }, [sortedRegistrations, registrations, selectedRegistrationIndex, sortOrder]);

  const selectedPatientForPanel = useMemo(() => {
    if (!selectedRegistrationForPanel) return patients[0];
    return patients.find(p => p.id === selectedRegistrationForPanel.patientId) || patients[0];
  }, [selectedRegistrationForPanel, patients]);

  return (
    <div id="app">
      <Header
        activeStaff={activeStaff}
        handleStaffSwitch={handleStaffSwitch}
        cachedCount={cachedCount}
        cachedRecentPatient={cachedRecentPatient}
        resetSandbox={resetSandbox}
      />

      <div className="clinicdesk-grid">
        <Sidebar
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          registrations={sortedRegistrations}
          selectedRegistrationIndex={selectedRegistrationIndex}
          setSelectedRegistrationIndex={setSelectedRegistrationIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          departments={departments}
          registrations={registrations}
          payments={payments}
          activityLogs={activityLogs}
          deletePayment={deletePayment}
          openPatientModal={(pat) => setSelectedPatientForModal(pat)}
          testUnauthorizedCancelPayment={testUnauthorizedCancelPayment}
        />

        <RightPanel
          selectedRegistration={selectedRegistrationForPanel}
          setSelectedRegistration={(updated) => {
            setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
          departments={departments}
          triggerDeptAmountRace={triggerDeptAmountRace}
          triggerCancelPaymentConflict={triggerCancelPaymentConflict}
          triggerPartialPatientSave={triggerPartialPatientSave}
          selectedPatient={selectedPatientForPanel}
        />
      </div>

      <PatientEditModal
        patient={selectedPatientForModal}
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
