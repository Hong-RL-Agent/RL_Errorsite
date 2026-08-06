import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchAppointments,
  searchAppointmentsApi,
  fetchTestResults,
  fetchTestResultDetailApi,
  fetchDoctors,
  fetchPatients,
  patchDoctorApi,
  patchTimeSlotApi,
  cancelAppointmentApi,
  patchSymptomsApi,
  deleteAppointmentApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [activePatient, setActivePatient] = useState('PAT-01');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateSortOrder, setDateSortOrder] = useState('NONE');

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale doctor cache for Error 1
  const [previousDoctorCache, setPreviousDoctorCache] = useState({ id: 'DOC-01', name: '김내과 전문의' });

  // Patient session stats cache (Error 6 Target)
  const [cachedLatestTestResult, setCachedLatestTestResult] = useState('간수치 AST 45, ALT 52 (경도 상승)');
  const [cachedUnreadNoticeCount, setCachedUnreadNoticeCount] = useState(2);
  const [cachedPrescriptionSummary, setCachedPrescriptionSummary] = useState('위산분비억제제 30일분, 소화제 14일분');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAppointments();
    await loadTestResults();
    await loadDoctors();
    await loadPatients();
  };

  const loadAppointments = async () => {
    const data = await fetchAppointments();
    setAppointments(data);
    if (data.length > 0 && !selectedAppointment) {
      setSelectedAppointment(data[0]);
      setPreviousDoctorCache({ id: data[0].doctorId, name: data[0].doctorName });
    }
  };

  const loadTestResults = async () => {
    const data = await fetchTestResults();
    setTestResults(data);
    if (data.length > 0 && !selectedTestDetail) {
      selectTestResult(data[0]);
    }
  };

  const selectTestResult = async (test) => {
    try {
      const detail = await fetchTestResultDetailApi(test.id);
      setSelectedTestDetail(detail);
    } catch (e) {
      setSelectedTestDetail(test);
    }
  };

  const loadDoctors = async () => {
    const data = await fetchDoctors();
    setDoctors(data);
  };

  const loadPatients = async () => {
    const data = await fetchPatients();
    setPatients(data);
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

  // Patient Session Switch (Error 6 Target)
  const handlePatientSwitch = (patientId) => {
    setActivePatient(patientId);
    showToast(`로그인 환자 계정을 [${patientId}] 회원으로 변경합니다.`, 'info');
    loadAppointments();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 환자 A의 진료/검사 내역을 본 뒤 환자 B로 로그인하면 예약 목록은 B 기준으로 바뀌지만, 
    // 최근 검사 결과 수치, 미확인 알림, 처방전 요약 캐시(cachedLatestTestResult, cachedUnreadNoticeCount)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // TimeSlot & Doctor update race (Error 1 Trigger)
  const triggerTimeDoctorRace = (apt) => {
    showToast('진료 예약 시간 조정과 담당 의사 변경을 순차 요청합니다.', 'info');

    patchDoctorApi(apt.id, apt.doctorId, apt.doctorName);

    setTimeout(() => {
      patchTimeSlotApi(apt.id, apt.date, apt.timeSlot, previousDoctorCache.id, previousDoctorCache.name);
    }, 100);

    setPreviousDoctorCache({ id: apt.doctorId, name: apt.doctorName });

    setTimeout(async () => {
      showToast('시간 변경 완료 (시간대는 갱신되었으나 3초 지연 완료로 담당 의사가 이전 의사로 롤백 저장됨)', 'warning');
      await loadAppointments();
    }, 4500);
  };

  // Dept & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (deptId, status) => {
    showToast(`진료과 검색 필터를 조회합니다: [${deptId} / ${status}]`, 'info');

    if (deptId === 'INTERNAL') {
      searchAppointmentsApi('INTERNAL', status).then(data => {
        setAppointments(data);
        showToast('소화기내과 진료 예약 검색 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (deptId === 'ORTHO') {
      searchAppointmentsApi('ORTHO', status).then(data => {
        setAppointments(data);
        showToast('정형외과 진료 예약 검색 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchAppointmentsApi(deptId, status).then(data => {
        setAppointments(data);
      });
    }
  };

  // Date Sort Appointment Edit Index Mismatch (Error 3 Target)
  const confirmAppointmentEdit = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 예약 목록을 날짜순으로 정렬한 뒤 예약 변경 버튼을 누르면 
    // 화면의 정렬 인덱스를 원본 예약 배열(appointments)에 대입하여 클릭한 예약이 아닌 엉뚱한 예약 항목이 수정 선택되는 결함입니다.
    const targetApt = appointments[index];
    if (!targetApt) {
      showToast('예약 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    setSelectedAppointment(targetApt);
    showToast(`[${targetApt.patientName} - ${targetApt.deptName}] 예약 선택 완료 (정렬 인덱스 불일치 오선택 가능)`, 'warning');
  };

  // Cancel & Symptoms Conflict (Error 2 Trigger)
  const triggerCancelSymptomsConflict = (apt) => {
    showToast('진료 예약 취소 처리와 증상 수정을 진행합니다.', 'info');

    // 1. Cancel Appointment (0.5s done)
    cancelAppointmentApi(apt.id);

    // 2. Update Symptoms & Re-activate (4.0s delay)
    setTimeout(async () => {
      await patchSymptomsApi(apt.id, `${apt.symptoms} (증상 수정 완료)`);
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadAppointments();
    }, 100);

    setTimeout(async () => {
      showToast('증상 수정 완료 (4초 지연 완료: 취소된 예약을 다시 CONFIRMED 확정 상태로 재활성화시킴)', 'danger');
      await loadAppointments();
    }, 4500);
  };

  // Delete Appointment (Error 4 Target)
  const deleteAppointment = async (id) => {
    const data = await deleteAppointmentApi(id);
    if (data.success) {
      showToast('예약을 삭제했습니다. (병원 대시보드의 총 예약 수 및 진료과별 수용률 통계 수치에는 계속 유지됨)', 'warning');
      await loadAppointments();
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MediCheck 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedAppointment(null);
    await loadAll();
  };

  const sortedAppointments = useMemo(() => {
    let list = [...appointments];
    if (filterDept !== 'ALL') {
      list = list.filter(a => a.deptId === filterDept);
    }
    if (filterStatus !== 'ALL') {
      list = list.filter(a => a.status === filterStatus);
    }
    if (dateSortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.date.localeCompare(b.date));
    } else if (dateSortOrder === 'DATE_DESC') {
      list.sort((a, b) => b.date.localeCompare(a.date));
    }
    return list;
  }, [appointments, filterDept, filterStatus, dateSortOrder]);

  const patientAppointments = useMemo(() => {
    return appointments.filter(a => a.patientId === activePatient);
  }, [appointments, activePatient]);

  const selectedPatientInfo = useMemo(() => {
    return patients.find(p => p.id === activePatient);
  }, [patients, activePatient]);

  return (
    <div id="app">
      <Header
        activePatient={activePatient}
        handlePatientSwitch={handlePatientSwitch}
        cachedLatestTestResult={cachedLatestTestResult}
        cachedUnreadNoticeCount={cachedUnreadNoticeCount}
        cachedPrescriptionSummary={cachedPrescriptionSummary}
        resetSandbox={resetSandbox}
      />

      <div className="medicheck-grid">
        <Sidebar
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          dateSortOrder={dateSortOrder}
          setDateSortOrder={setDateSortOrder}
          triggerSearchRace={triggerSearchRace}
          appointments={sortedAppointments}
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
          confirmAppointmentEdit={confirmAppointmentEdit}
        />

        <CenterSection
          testResults={testResults}
          patientAppointments={patientAppointments}
          deleteAppointment={deleteAppointment}
          selectedPatientInfo={selectedPatientInfo}
        />

        <RightPanel
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
          triggerTimeDoctorRace={triggerTimeDoctorRace}
          triggerCancelSymptomsConflict={triggerCancelSymptomsConflict}
          selectedTestDetail={selectedTestDetail}
        />
      </div>

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
