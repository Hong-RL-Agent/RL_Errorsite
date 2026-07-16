import React, { useState, useEffect } from 'react';

export default function App() {
  // Session / Patient Switching
  const [currentPatient, setCurrentPatient] = useState('patient-A');
  const [userRole, setUserRole] = useState('patient'); // 'patient' for 김환자, 'guardian' for 김아들

  // Clinical Databases
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [billingItems, setBillingItems] = useState([]);

  // Active Lab Detail view (Error 1 Stale cache reference target)
  const [activeLabTest, setActiveLabTest] = useState({
    id: "lab-01",
    patientId: "patient-A",
    title: "일반 혈액 검사 (Hb)",
    date: "2026-07-10",
    value: 14.5,
    referenceMin: 13.0,
    referenceMax: 17.0,
    unit: "g/dL",
    status: "NORMAL"
  });

  // Questionnaire Wizard states (Error 3)
  const [qStep, setQStep] = useState(1);
  const [qFever, setQFever] = useState('no');
  const [qCough, setQCough] = useState('no');
  const [qSymptoms, setQSymptoms] = useState('');

  // Info Leaked states (Error 5)
  const [leakedInfo, setLeakedInfo] = useState(null);

  // Download simulation target (Error 1 leak checker)
  const [downloadedReportId, setDownloadedReportId] = useState(null);

  // UI notifications and toasts
  const [toasts, setToasts] = useState([]);
  const [activeSection, setActiveSection] = useState('timeline'); // 'timeline' | 'billing' | 'questionnaire'

  useEffect(() => {
    loadPatients();
    loadAppointments();
    loadLabTests();
    loadPrescriptions();
    loadBilling();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      showToast('환자 대장 로딩 실패', 'danger');
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      showToast('예약 데이터 로딩 실패', 'danger');
    }
  };

  const loadLabTests = async () => {
    try {
      const res = await fetch('/api/labs');
      const data = await res.json();
      setLabTests(data);
    } catch (err) {
      showToast('검사 기록 로딩 실패', 'danger');
    }
  };

  const loadPrescriptions = async () => {
    try {
      const res = await fetch('/api/prescriptions');
      const data = await res.json();
      setPrescriptions(data);
    } catch (err) {
      showToast('처방 내역 로딩 실패', 'danger');
    }
  };

  const loadBilling = async () => {
    try {
      const res = await fetch('/api/billing');
      const data = await res.json();
      setBillingItems(data);
    } catch (err) {
      showToast('영수증 비용 로딩 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Switch Patient Profile (Error 1 Trigger)
  const handleSwitchPatient = (patientId) => {
    setCurrentPatient(patientId);
    
    // Configure userRole role flag for backend permission tests
    if (patientId === 'patient-B') {
      setUserRole('guardian');
    } else {
      setUserRole('patient');
    }

    // Reset leaked states
    setLeakedInfo(null);
    setDownloadedReportId(null);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Session
    // DESCRIPTION: 환자 B(김아들)로 프로필을 전환할 때, 메인화면의 이름과 예약 일정 목록은 
    // 정상적으로 B의 데이터로 바뀌지만, 이전에 열어둔 상세 검사 결과 객체(`activeLabTest`)는 
    // 초기화하거나 갱신하지 않고 A(김환자)의 잔존 캐시 상태 그대로 노출해 버립니다.
    // 이 상태에서 검사 다운로드를 클릭하면 A의 검사 ID가 서버 다운로드 요청 매개변수로 유출됩니다.
  };

  // Reschedule & Cancel appointment consecutively (Error 2 Logic)
  const handleRescheduleAndCancelDemo = (apptId) => {
    // 1. Send update request (PUT, takes 3 seconds delay to write to database)
    fetch(`/api/appointments/${apptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time: '2026-07-15 16:30',
        doctor: '내과 이원장',
        patientId: currentPatient
      })
    });

    // 2. Immediately send delete cancel request (DELETE, takes 0.1 seconds)
    setTimeout(async () => {
      const res = await fetch(`/api/appointments/${apptId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('진료 예약 취소 응답 성공 (0.1초 완료)', 'success');
        
        // Remove locally immediately
        setAppointments(prev => prev.filter(a => a.id !== apptId));
      }
    }, 100);

    // Inform that PUT completes after 3 seconds, resurrecting the appointment
    setTimeout(() => {
      showToast('예약 변경 지연 쓰기 완료 (예약 부활 확인)', 'warning');
      loadAppointments();
    }, 3200);
  };

  // Questionnaire Submit (Error 3 Logic)
  const handleSubmitQuestionnaire = () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Network
    // DESCRIPTION: 이전 단계 답변과 새로운 답변 페이로드를 병렬 비동기(Double-Submit)로 
    // 동시 전송하여 네트워크 충돌을 일으킵니다. 
    // 서버는 이를 필드 혼합 병합하여, 일부 문항은 이전 오염값, 일부는 새 값으로 뒤섞어 저장합니다.
    const stalePayload = { fever: 'yes', cough: 'no', symptoms: '이전 단계의 피로 축적 잔존 데이터' };
    const newPayload = { fever: qFever, cough: qCough, symptoms: qSymptoms };

    // Request 1: Stale draft
    fetch('/api/questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stalePayload)
    });

    // Request 2: New draft
    fetch('/api/questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPayload)
    });

    showToast('문진표 결과 전송 완료 (이중 제출 레이스 컨디션)', 'warning');
  };

  // Delete Prescription (Error 4 Logic)
  const handleDeletePrescription = async (presId) => {
    try {
      const res = await fetch(`/api/prescriptions/${presId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('처방전 목록에서 처방 기록이 제거되었습니다.', 'success');
        // Updates local prescriptions
        setPrescriptions(prev => prev.filter(p => p.id !== presId));
      }
    } catch (err) {
      showToast('처방 삭제 실패', 'danger');
    }
  };

  // Request Forbidden Lab Test Details (Error 5 Logic)
  const handleLoadForbiddenTest = async (testId) => {
    try {
      const res = await fetch(`/api/labs/${testId}?userRole=${userRole}`);
      const data = await res.json();

      if (res.status === 403) {
        showToast(`접근 제한: ${data.error}`, 'danger');
        // Leak the data from error response body
        setLeakedInfo({
          title: data.title,
          leakValue: data.leakValue
        });
      } else {
        setActiveLabTest(data);
        showToast(`[${data.title}] 검사 결과 정보 로드 완료`, 'info');
      }
    } catch (err) {
      showToast('데이터 조회 에러', 'danger');
    }
  };

  // Download Report simulation (Error 1 leak)
  const simulateDownloadReport = () => {
    // Send to state to show the user what was transmitted
    setDownloadedReportId(activeLabTest.id);
    showToast(`검사결과 레포트 다운로드 요청 전송 (ID: ${activeLabTest.id})`, 'warning');
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('의료 정보 데이터가 원본 상태로 복구되었습니다.', 'warning');
        loadAppointments();
        loadPrescriptions();
        loadBilling();
        setCurrentPatient('patient-A');
        setUserRole('patient');
        setLeakedInfo(null);
        setDownloadedReportId(null);
        setQStep(1);
        setQFever('no');
        setQCough('no');
        setQSymptoms('');
      }
    } catch (err) {
      showToast('초기화 API 에러', 'danger');
    }
  };

  // Computed total sum for Billing page (Error 4 Target)
  const totalBillingAmount = billingItems.reduce((sum, item) => sum + item.cost, 0);

  const patientObj = patients.find(p => p.id === currentPatient) || { name: "로딩중", role: "본인", age: 0, disease: "" };
  const patientAppointments = appointments.filter(a => a.patientId === currentPatient);
  const patientLabs = labTests.filter(l => l.patientId === currentPatient);

  return (
    <div className="mediportal-app">
      
      {/* Top Navigation banner */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
          </svg>
          <span className="logo-title">MediPortal</span>
          <span className="logo-subtitle">스마트 환자 진료 포털</span>
        </div>

        <nav className="header-nav">
          <button className={activeSection === 'timeline' ? 'active' : ''} onClick={() => setActiveSection('timeline')}>
            📅 예약/진료 타임라인
          </button>
          <button className={activeSection === 'billing' ? 'active' : ''} onClick={() => setActiveSection('billing')}>
            🧾 진료 수납/영수증
          </button>
          <button className={activeSection === 'questionnaire' ? 'active' : ''} onClick={() => setActiveSection('questionnaire')}>
            📝 사전 문진 작성
          </button>
        </nav>

        <button onClick={handleResetSandbox} className="reset-sandbox-btn">
          ⚠️ 진료 초기화
        </button>
      </header>

      {/* Main Grid: Patient profile sidebar, Center Timeline, Right Quick Calendar */}
      <div className="medi-workspace-grid">
        
        {/* Left Column: Patient Profile Card & Patient Switch */}
        <aside className="panel-section profile-card-panel">
          <div className="panel-header">
            <h3>👥 환자 / 보호자 프로필</h3>
          </div>

          <div className="patient-avatar-box">
            <div className="avatar-circle">🏥</div>
            <div className="profile-details">
              <h4>{patientObj.name}님</h4>
              <span className="badge role">{patientObj.role}</span>
              <p className="age">만 {patientObj.age}세</p>
            </div>
          </div>

          <div className="clinical-alert-box">
            <strong>📋 진단 질병정보</strong>
            <p>{patientObj.disease}</p>
          </div>

          {/* Profile Switch (Error 1 Target trigger) */}
          <div className="profile-switching-group">
            <label>👤 진료 계정 위임 전환</label>
            <div className="btn-stack">
              <button 
                onClick={() => handleSwitchPatient('patient-A')}
                className={`patient-btn ${currentPatient === 'patient-A' ? 'active' : ''}`}
              >
                본인: 김환자
              </button>
              <button 
                onClick={() => handleSwitchPatient('patient-B')}
                className={`patient-btn ${currentPatient === 'patient-B' ? 'active' : ''}`}
              >
                자녀: 김아들 (Error 1)
              </button>
            </div>
          </div>

          <div className="guardian-warning-tip">
            * 자녀(김아들)로 전환 시, 보호자 등급 권한(Guardian)으로 접근 레벨이 격하됩니다.
          </div>
        </aside>

        {/* Center Column: 예약/검사 타임라인 or 수납 or 문진표 */}
        <main className="panel-section main-content-timeline">
          
          {/* TAB 1: RESERVATION & LAB TIMELINE */}
          {activeSection === 'timeline' && (
            <div className="timeline-view-wrapper">
              
              {/* Doctor Appointments Subpanel */}
              <div className="sub-panel">
                <div className="sub-header">
                  <h3>📅 예약된 의사 진료 타임라인</h3>
                </div>

                <div className="appointments-stack">
                  {patientAppointments.map(appt => (
                    <div key={appt.id} className="appointment-card">
                      <div className="appt-info">
                        <strong>{appt.doctor}</strong>
                        <span className="appt-time">🕒 진료시간: {appt.time}</span>
                      </div>
                      
                      <div className="appt-actions">
                        <button 
                          onClick={() => handleRescheduleAndCancelDemo(appt.id)}
                          className="appt-btn reschedule-cancel"
                        >
                          🕒 16:30으로 변경 후 바로 취소하기 (Error 2)
                        </button>
                      </div>
                    </div>
                  ))}

                  {patientAppointments.length === 0 && (
                    <p className="empty-msg">예약된 외래 진료 기록이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* Lab Test Results with Graph */}
              <div className="sub-panel labs-results-container">
                <div className="sub-header">
                  <h3>🧪 검사 결과 수치 및 그래프 분석</h3>
                </div>

                <div className="labs-two-column-grid">
                  
                  {/* Labs List items */}
                  <ul className="labs-items-list">
                    {patientLabs.map(test => (
                      <li 
                        key={test.id} 
                        className={`lab-item ${activeLabTest?.id === test.id ? 'selected' : ''}`}
                        onClick={() => setActiveLabTest(test)}
                      >
                        <span className="lab-title">{test.title}</span>
                        <strong className="lab-val">{test.value} {test.unit}</strong>
                      </li>
                    ))}
                    
                    {/* Blocked Special Lab (Error 5 Trigger) */}
                    {currentPatient === 'patient-B' && (
                      <li 
                        className="lab-item forbidden-item"
                        onClick={() => handleLoadForbiddenTest('lab-15')}
                      >
                        🔒 [비공개] 유전자 변형 특수 검사 (Error 5)
                      </li>
                    )}
                  </ul>

                  {/* SVG Chart & Details Panel (Error 1 Target) */}
                  <div className="lab-details-graph-card">
                    {activeLabTest && (
                      <div className="details-container">
                        <h4>📊 {activeLabTest.title} 결과 데이터</h4>
                        <div className="ref-range-tip">
                          정상 범위 기준: {activeLabTest.referenceMin} ~ {activeLabTest.referenceMax} {activeLabTest.unit}
                        </div>

                        {/* SVG Bar representation */}
                        <div className="svg-graph-box">
                          <svg width="100%" height="80" viewBox="0 0 300 80">
                            <rect x="10" y="30" width="280" height="20" rx="3" fill="#1e293b" stroke="#334155" />
                            {/* Normal range bar */}
                            <rect x="50" y="30" width="180" height="20" fill="rgba(13, 148, 136, 0.15)" />
                            {/* Current value marker */}
                            <circle cx={50 + (activeLabTest.value / activeLabTest.referenceMax) * 150} cy="40" r="8" fill="#0ea5e9" />
                          </svg>
                          <div className="graph-meta">
                            <span>낮음</span>
                            <span>검사 수치: <strong>{activeLabTest.value}</strong></span>
                            <span>높음</span>
                          </div>
                        </div>

                        {/* Download Trigger */}
                        <button onClick={simulateDownloadReport} className="download-report-btn">
                          📥 검사 결과지 다운로드 받기
                        </button>

                        {downloadedReportId && (
                          <p className="leaked-id-alert">
                            ⚠️ 다운로드 요청 전송 완료: [ID: <code>{downloadedReportId}</code>] 
                            (현재 환자는 {currentPatient}이나 A의 검사지 ID가 다운로드 매개변수로 유출됨!)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Error 5 Leak Info presentation */}
                {leakedInfo && (
                  <div className="leaked-info-payload-box">
                    <h5>🔥 백엔드 403 응답 정보 유출 (Leaked Payload)</h5>
                    <p>검사 타이틀: <code>{leakedInfo.title}</code></p>
                    <p>유출 수치 정보: <code>{leakedInfo.leakValue}</code></p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: BILLING & PRESCRIPTIONS LIST */}
          {activeSection === 'billing' && (
            <div className="billing-view-wrapper">
              
              <div className="labs-two-column-grid">
                
                {/* Prescriptions Stack */}
                <div className="sub-panel">
                  <div className="sub-header">
                    <h3>💊 처방 내역 및 의약품 복약 지도</h3>
                  </div>

                  <div className="prescriptions-stack">
                    {prescriptions.filter(p => p.patientId === currentPatient).map(pres => (
                      <div key={pres.id} className="prescription-card">
                        <div className="pres-header">
                          <strong>💊 {pres.medicine}</strong>
                          <button 
                            onClick={() => handleDeletePrescription(pres.id)} 
                            className="del-pres-btn"
                            title="처방 제거 (Error 4)"
                          >
                            제거
                          </button>
                        </div>
                        <p className="dose-txt">{pres.dose}</p>
                        <span className="fee-lbl">약제 처방 비용: {pres.fee.toLocaleString()}원</span>
                      </div>
                    ))}

                    {prescriptions.filter(p => p.patientId === currentPatient).length === 0 && (
                      <p className="empty-msg">활성화된 복약 처방 기록이 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* Medical Receipt billing info (Error 4) */}
                <div className="sub-panel">
                  <div className="sub-header">
                    <h3>🧾 외래 진료비 수납 내역 영수증</h3>
                  </div>

                  <ul className="billing-items-list">
                    {billingItems.map((b, i) => (
                      <li key={i} className="bill-item">
                        <span>{b.title}</span>
                        <strong>{b.cost.toLocaleString()}원</strong>
                      </li>
                    ))}
                  </ul>

                  <div className="billing-grand-total">
                    <span>수납할 총 금액</span>
                    <strong className="grand-price">{totalBillingAmount.toLocaleString()}원</strong>
                  </div>
                  <p className="error-msg-hint">* 약제 처방전을 삭제하더라도 총액 계산 내역에는 약제비가 공제되지 않고 남아있습니다. (Error 4)</p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: STEPPER QUESTIONNAIRE */}
          {activeSection === 'questionnaire' && (
            <div className="questionnaire-view-wrapper">
              <div className="sub-header">
                <h3>📝 외래 내원전 문진표 작성</h3>
                <span className="step-badge">단계: {qStep} / 3</span>
              </div>

              {/* Wizard Steps */}
              <div className="questionnaire-wizard-box">
                {qStep === 1 && (
                  <div className="step-content">
                    <h4>Q1. 현재 37.5도 이상의 발열 증상이 있습니까?</h4>
                    <div className="options-row">
                      <label>
                        <input type="radio" name="fever" value="yes" checked={qFever === 'yes'} onChange={(e) => setQFever(e.target.value)} />
                        네, 열이 납니다.
                      </label>
                      <label>
                        <input type="radio" name="fever" value="no" checked={qFever === 'no'} onChange={(e) => setQFever(e.target.value)} />
                        아니오, 정상 체온입니다.
                      </label>
                    </div>
                    <button onClick={() => setQStep(2)} className="wizard-btn next">다음 단계</button>
                  </div>
                )}

                {qStep === 2 && (
                  <div className="step-content">
                    <h4>Q2. 최근 3일 이내에 잦은 기침이나 호흡 곤란이 있었습니까?</h4>
                    <div className="options-row">
                      <label>
                        <input type="radio" name="cough" value="yes" checked={qCough === 'yes'} onChange={(e) => setQCough(e.target.value)} />
                        네, 기침이 납니다.
                      </label>
                      <label>
                        <input type="radio" name="cough" value="no" checked={qCough === 'no'} onChange={(e) => setQCough(e.target.value)} />
                        아니오, 기침이 없습니다.
                      </label>
                    </div>
                    <div className="nav-buttons">
                      <button onClick={() => setQStep(1)} className="wizard-btn back">이전</button>
                      <button onClick={() => setQStep(3)} className="wizard-btn next">다음 단계</button>
                    </div>
                  </div>
                )}

                {qStep === 3 && (
                  <div className="step-content">
                    <h4>Q3. 기타 앓고 계시는 동반 증상을 기술해 주세요.</h4>
                    <textarea 
                      value={qSymptoms} 
                      onChange={(e) => setQSymptoms(e.target.value)} 
                      placeholder="증상을 입력하세요... (예: 두통, 소화불량 등)"
                      className="symptoms-textarea"
                      rows="4"
                    ></textarea>
                    
                    <div className="nav-buttons">
                      <button onClick={() => setQStep(2)} className="wizard-btn back">이전으로 돌아가 답변 수정 (Error 3)</button>
                      <button onClick={handleSubmitQuestionnaire} className="wizard-btn submit">문진표 최종 제출</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Right Column: Doctor schedule list & Today notifications */}
        <aside className="panel-section schedule-notifications-sidebar">
          
          <div className="sub-panel">
            <div className="sub-header">
              <h3>👨‍⚕️ 오늘의 외래 담당의 일정</h3>
            </div>
            
            <ul className="doc-schedule-list">
              <li>
                <strong>내과 이원장</strong>
                <span className="status possible">오전 진료 가능</span>
              </li>
              <li>
                <strong>소아과 박과장</strong>
                <span className="status possible">오후 진료 가능</span>
              </li>
              <li>
                <strong>이비인후과 김의사</strong>
                <span className="status closed">진료 마감</span>
              </li>
            </ul>
          </div>

          <div className="sub-panel">
            <div className="sub-header">
              <h3>🔔 MediPortal 실시간 병원 알림</h3>
            </div>
            
            <ul className="alert-notifications-stack">
              <li className="alert-item unread">
                <span className="time">10:15</span>
                <p>김환자님, 간기능 수치(ALT)가 기준치를 초과하여 추적관찰 권장드립니다.</p>
              </li>
              <li className="alert-item">
                <span className="time">어제</span>
                <p>김아들 어린이의 아토피 연고 처방전이 성공적으로 전송 완료되었습니다.</p>
              </li>
            </ul>
          </div>

        </aside>

      </div>

      {/* Floating Alerts Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
