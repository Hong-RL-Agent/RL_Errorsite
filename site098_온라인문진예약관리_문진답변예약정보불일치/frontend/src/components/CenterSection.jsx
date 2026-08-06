import React, { useState } from 'react';

export default function CenterSection({
  departments,
  questions,
  patients,
  surveys,
  appointments,
  activityLogs,
  deleteSurvey,
  openPatientModal,
  testUnauthorizedRiskUpdate
}) {
  const [activeTab, setActiveTab] = useState('PRE_EXAM_STEPPER'); // 'PRE_EXAM_STEPPER' | 'SURVEY_RESPONSES' | 'APPOINTMENTS_LOGS'
  const [step, setStep] = useState(1);

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'PRE_EXAM_STEPPER' ? 'active' : ''}`}
          onClick={() => setActiveTab('PRE_EXAM_STEPPER')}
        >
          🩺 단계별 사전문진 작성 폼 (진료과 8개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'SURVEY_RESPONSES' ? 'active' : ''}`}
          onClick={() => setActiveTab('SURVEY_RESPONSES')}
        >
          📋 환자 문진 답변 대장 (45건) & 환자 목록 (30명)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'APPOINTMENTS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('APPOINTMENTS_LOGS')}
        >
          📅 진료 예약 대장 (35건) & 원무 감사 로그
        </button>
      </div>

      {activeTab === 'PRE_EXAM_STEPPER' && (
        <div className="widget-section">
          <h2>🩺 환자 온라인 사전 문진 등록 (진과별 25개 질문 셋)</h2>

          {/* Stepper Progress Bar */}
          <div className="stepper-progress-box">
            <div className="stepper-head">
              <span>문진 작성 진행률 Step {step} / 4</span>
              <span className="step-percent">{step * 25}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${step * 25}%` }}></div>
            </div>
          </div>

          <div className="stepper-card-container">
            {step === 1 && (
              <div className="step-box">
                <h4>Step 1: 기본증상 및 발병 시기</h4>
                <p style={{ fontSize: '0.78rem' }}>현재 가장 불편하신 주요 통증 또는 증상과 발생 시기를 입력하세요.</p>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>주요 증상 및 통증 부위:</label>
                  <textarea rows="3" defaultValue="상복부 타는 듯한 둔통 및 심한 속쓰림 2주째 지속" readOnly />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="step-box">
                <h4>Step 2: 통증 강도 및 기저 질환</h4>
                <p style={{ fontSize: '0.78rem' }}>통증 강도(1~10)와 고혈압, 당뇨 등 병력을 선택하세요.</p>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>통증 강도 점수: 7점 (중증 통증)</label>
                  <input type="range" min="1" max="10" defaultValue="7" disabled />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="step-box">
                <h4>Step 3: 복용 약물 및 알레르기 수술이력</h4>
                <p style={{ fontSize: '0.78rem' }}>정기 복용 약물 및 부작용, 과거 수술 이력을 확인합니다.</p>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>복용 약물:</label>
                  <input type="text" defaultValue="혈압약 매일 아침 복용 중" readOnly />
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="step-box">
                <h4>Step 4: 예약 희망 진료과 및 최종 제출</h4>
                <p style={{ fontSize: '0.78rem' }}>진료를 희망하시는 전문 진료과를 선택하고 문진을 완성합니다.</p>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>희망 진료과:</label>
                  <select defaultValue="소화기내과" disabled>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name} ({d.doctor})</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="stepper-actions">
              <button className="save-btn" disabled={step === 1} onClick={() => setStep(prev => prev - 1)}>
                이전 단계
              </button>
              <button className="save-btn" disabled={step === 4} onClick={() => setStep(prev => prev + 1)}>
                다음 단계
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SURVEY_RESPONSES' && (
        <div className="widget-section">
          <h2>📋 제출된 사전 문진 답변 대장 (45건) 및 환자 정보 (30명)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>문진 ID</th>
                  <th>환자명</th>
                  <th>진료과</th>
                  <th>주요 통증 증상</th>
                  <th>통증 점수</th>
                  <th>위험도</th>
                  <th>제출 일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(srv => (
                  <tr key={srv.id}>
                    <td><strong>{srv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{srv.patientName} 환자</strong></td>
                    <td><span className="dept-badge">{srv.deptName}</span></td>
                    <td>{srv.chiefComplaint}</td>
                    <td><strong>{srv.painScore}/10점</strong></td>
                    <td><span className={`risk-badge ${srv.riskLevel.toLowerCase()}`}>{srv.riskLevel}</span></td>
                    <td><small>{srv.submittedAt}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteSurvey(srv.id)}>
                        🗑️ 문진 응답 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 문진 응답 삭제(DELETE) 시 목록에서는 소거되나 대시보드 위험도 평균 및 검토 대기 건수 수치에는 남음 (Error 4)</small>

          <h2 style={{ marginTop: '1.25rem' }}>👥 병원 등록 환자 목록 (30명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>환자 ID</th>
                  <th>환자 성명</th>
                  <th>성별 / 연령</th>
                  <th>연락처</th>
                  <th>신장 / 체중</th>
                  <th>복용 중인 약물</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(pat => (
                  <tr key={pat.id}>
                    <td><strong>{pat.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{pat.name} 환자</strong></td>
                    <td>{pat.gender} / {pat.age}세</td>
                    <td><small>{pat.phone}</small></td>
                    <td>{pat.height}cm / {pat.weight}kg</td>
                    <td>{pat.medication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'APPOINTMENTS_LOGS' && (
        <div className="widget-section">
          <h2>📅 사전 문진 연동 진료 예약 대장 (35건) & 📑 원무 감사 로그</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>환자명</th>
                  <th>진료과</th>
                  <th>담당 의료진</th>
                  <th>예약 시간</th>
                  <th>예약 상태</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td><strong>{apt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{apt.patientName} 환자</strong></td>
                    <td><span className="dept-badge">{apt.deptName}</span></td>
                    <td>{apt.doctorName}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{apt.appointmentTime}</strong></td>
                    <td><span className={`status-badge ${apt.status === 'CONFIRMED' ? 'completed' : 'danger'}`}>{apt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedRiskUpdate('SRV-2001', 'CRITICAL')}>
              🔒 일반 직원의 문진 위험도 수정 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 직원이 위험도 수정 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
