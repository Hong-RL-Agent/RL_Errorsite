import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import PatientEditModal from '../components/PatientEditModal.jsx';
import {
  fetchAdmins,
  fetchDepartments,
  fetchQuestions,
  fetchPatients,
  fetchSurveys,
  fetchAppointments,
  fetchActivityLogs,
  searchSurveysApi,
  patchSurveyAnswersApi,
  patchAppointmentTimeApi,
  cancelAppointmentApi,
  submitSurveyApi,
  updateSurveyRiskApi,
  patchPatientPartialApi,
  deleteSurveyApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-101');
  const [filterDept, setFilterDept] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedSurveyIndex, setSelectedSurveyIndex] = useState(0);
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedIncompleteSurvey, setCachedIncompleteSurvey] = useState(3);
  const [cachedRecentAppointment, setCachedRecentAppointment] = useState('김동남 환자 (소화기내과 / 2026-08-05 10:00)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadDepartments();
    await loadQuestions();
    await loadPatients();
    await loadSurveys();
    await loadAppointments();
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

  const loadQuestions = async () => {
    const data = await fetchQuestions();
    setQuestions(data);
  };

  const loadPatients = async () => {
    const data = await fetchPatients();
    setPatients(data);
  };

  const loadSurveys = async () => {
    const data = await fetchSurveys();
    setSurveys(data);
  };

  const loadAppointments = async () => {
    const data = await fetchAppointments();
    setAppointments(data);
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

  // Patient Session Switch (Error 6 Target)
  const handleAdminSwitch = (adminId) => {
    setActiveAdmin(adminId);
    showToast(`로그인 환자/관계자를 [${adminId}] 권한으로 변경합니다.`, 'info');
    loadSurveys();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 환자 A가 문진 내역을 본 뒤 환자 B로 로그인하면 문진 목록은 B 기준으로 바뀌지만, 
    // 상단 진행 중 문진(cachedIncompleteSurvey) 및 최근 예약 요약 캐시(cachedRecentAppointment)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Answers & Appointment Time update race condition (Error 1 Trigger)
  const triggerAnswersTimeRace = (srv) => {
    showToast('문진 답변 수정(3초 지연)과 진료 예약 시간 변경(0.1초)을 순차 처리합니다.', 'info');

    const linkedApt = appointments.find(a => a.id === srv.appointmentId) || appointments[0];

    // 1. Appointment time update (0.1s done)
    patchAppointmentTimeApi(linkedApt.id, '2026-08-09 15:30');

    // 2. Survey answers update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchSurveyAnswersApi(srv.id, srv.chiefComplaint, srv.painScore);
    }, 100);

    setTimeout(async () => {
      showToast('문진 답변 수정 완료 (답변은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 예약 시간과 새 답변 조합이 롤백 저장됨)', 'warning');
      await loadSurveys();
      await loadAppointments();
    }, 4500);
  };

  // Dept search race condition (Error 5 Trigger)
  const triggerSearchRace = (deptName, search) => {
    showToast(`진료과 문진 목록을 조회합니다: [${deptName} / ${search}]`, 'info');

    if (deptName === '소화기내과') {
      searchSurveysApi('소화기내과', 'ALL', search).then(data => {
        setSurveys(data);
        showToast('소화기내과 문진 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (deptName === '정형외과') {
      searchSurveysApi('정형외과', 'ALL', search).then(data => {
        setSurveys(data);
        showToast('정형외과 문진 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchSurveysApi(deptName, 'ALL', search).then(data => {
        setSurveys(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 문진 내역을 위험도순/통증점수순으로 정렬한 뒤 상세 보기 버튼을 누르면 
    // 사용자가 클릭한 문진이 아니라 정렬 전 원본 배열의 같은 index 문진 상세가 열리는 결함입니다.
    setSelectedSurveyIndex(index);
    const clickedSrv = sortedSurveys[index];
    if (clickedSrv) {
      showToast(`[${clickedSrv.patientName} 환자] 문진 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 환자의 답변/위험도가 표시됨)`, 'warning');
    }
  };

  // Cancel Appointment & Submit Survey Conflict (Error 2 Trigger)
  const triggerCancelSubmitConflict = (srv) => {
    showToast('예약 취소 처리와 사전 문진 제출을 연쇄 진행합니다.', 'info');

    const linkedApt = appointments.find(a => a.id === srv.appointmentId) || appointments[0];

    // 1. Cancel Appointment (0.5s done, status = CANCELLED)
    cancelAppointmentApi(linkedApt.id);

    // 2. Submit Survey (4.0s delay with appointment restore to CONFIRMED)
    setTimeout(async () => {
      await submitSurveyApi(srv.patientId, srv.patientName, srv.deptName, '긴급 재문진 응답 제출', linkedApt.id);
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadAppointments();
    }, 100);

    setTimeout(async () => {
      showToast('문진 제출 응답 완료 (4초 지연 완료: 취소된 예약을 CONFIRMED 상태로 복원시킴)', 'danger');
      await loadSurveys();
      await loadAppointments();
    }, 4500);
  };

  // Partial Patient Save (Error 8 Trigger)
  const triggerPartialPatientSave = async (id, height, weight, medication) => {
    await patchPatientPartialApi(id, height, weight, medication);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 환자 기본정보 수정 모달에서 키, 몸무게, 복용약을 동시에 수정하면 백엔드는 키와 복용약만 저장하고 
    // 몸무게는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('환자 키, 몸무게, 복용약이 성공적으로 저장되었습니다.', 'success');
    await loadPatients();
  };

  // Delete Survey (Error 4 Target)
  const deleteSurvey = async (id) => {
    const data = await deleteSurveyApi(id);
    if (data.success) {
      showToast('사전 문진 응답을 삭제했습니다. (대시보드 위험도 평균 및 검토 대기 수치에는 계속 유지됨)', 'warning');
      await loadSurveys();
    }
  };

  // Test Unauthorized Risk Update (Error 7 Trigger)
  const testUnauthorizedRiskUpdate = async (id, riskLevel) => {
    try {
      const res = await updateSurveyRiskApi(id, riskLevel, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 위험도 수정 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (patientId, height, weight, medication) => {
    await patchPatientPartialApi(patientId, height, weight, medication);
    showToast(`[${patientId}] 환자 신체정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedPatientForModal(null);
    await loadPatients();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MediSurvey 사전 문진 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedSurveyIndex(0);
    await loadAll();
  };

  const sortedSurveys = useMemo(() => {
    let list = [...surveys];
    if (filterDept !== 'ALL') {
      list = list.filter(s => s.deptName === filterDept);
    }
    if (searchTerm) {
      list = list.filter(s => s.patientName.includes(searchTerm) || s.id.includes(searchTerm));
    }
    if (sortOrder === 'RISK_DESC') {
      const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0));
    } else if (sortOrder === 'PAIN_DESC') {
      list.sort((a, b) => b.painScore - a.painScore);
    }
    return list;
  }, [surveys, filterDept, searchTerm, sortOrder]);

  // Selected Survey for RightPanel (Error 3 Effect)
  const selectedSurveyForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedSurveys[selectedSurveyIndex] || surveys[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted surveys array
      return surveys[selectedSurveyIndex] || surveys[0];
    }
  }, [sortedSurveys, surveys, selectedSurveyIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedIncompleteSurvey={cachedIncompleteSurvey}
        cachedRecentAppointment={cachedRecentAppointment}
        resetSandbox={resetSandbox}
      />

      <div className="medisurvey-grid">
        <Sidebar
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          surveys={sortedSurveys}
          selectedSurveyIndex={selectedSurveyIndex}
          setSelectedSurveyIndex={setSelectedSurveyIndex}
          openDetailMismatch={openDetailMismatch}
          departments={departments}
        />

        <CenterSection
          departments={departments}
          questions={questions}
          patients={patients}
          surveys={surveys}
          appointments={appointments}
          activityLogs={activityLogs}
          deleteSurvey={deleteSurvey}
          openPatientModal={(pat) => setSelectedPatientForModal(pat)}
          testUnauthorizedRiskUpdate={testUnauthorizedRiskUpdate}
        />

        <RightPanel
          selectedSurvey={selectedSurveyForPanel}
          setSelectedSurvey={(updated) => {
            setSurveys(prev => prev.map(s => s.id === updated.id ? updated : s));
          }}
          appointments={appointments}
          triggerAnswersTimeRace={triggerAnswersTimeRace}
          triggerCancelSubmitConflict={triggerCancelSubmitConflict}
          triggerPartialPatientSave={triggerPartialPatientSave}
          patients={patients}
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
