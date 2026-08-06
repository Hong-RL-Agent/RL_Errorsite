import React, { useState } from 'react';

export default function CenterSection({
  testResults,
  patientAppointments,
  deleteAppointment,
  selectedPatientInfo
}) {
  const [activeTab, setActiveTab] = useState('TEST_RESULTS'); // 'TEST_RESULTS' | 'PATIENT_APPOINTMENTS' | 'HOSPITAL_STATS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'TEST_RESULTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TEST_RESULTS')}
        >
          🔬 임상 검사 결과 리포트 (20건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PATIENT_APPOINTMENTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PATIENT_APPOINTMENTS')}
        >
          📋 내 진료 예약 내역 (25건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'HOSPITAL_STATS' ? 'active' : ''}`}
          onClick={() => setActiveTab('HOSPITAL_STATS')}
        >
          🏥 병원 수용률 & 대시보드
        </button>
      </div>

      {activeTab === 'TEST_RESULTS' && (
        <div className="widget-section">
          <h2>🔬 임상 검사 결과 리포트 대장 (최소 20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>검사 ID</th>
                  <th>환자명</th>
                  <th>검사 항목</th>
                  <th>분류</th>
                  <th>검사 소견 / 수치</th>
                  <th>검사일자</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map(tr => (
                  <tr key={tr.id}>
                    <td><strong>{tr.id}</strong></td>
                    <td>{tr.patientName}</td>
                    <td>{tr.testName}</td>
                    <td><span className="dept-tag">{tr.category}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{tr.resultValue}</strong></td>
                    <td>{tr.testedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PATIENT_APPOINTMENTS' && (
        <div className="widget-section">
          <h2>📋 내 진료 예약 내역 대장 (최소 25개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>진료과</th>
                  <th>담당 의사</th>
                  <th>예약 일시</th>
                  <th>주호소 증상</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {patientAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td><strong>{apt.id}</strong></td>
                    <td>{apt.deptName}</td>
                    <td>{apt.doctorName}</td>
                    <td>{apt.date} {apt.timeSlot}</td>
                    <td><small>{apt.symptoms}</small></td>
                    <td><span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                    <td>
                      <button 
                        className="delete-btn-sm"
                        onClick={() => deleteAppointment(apt.id)}
                      >
                        🗑️ 취소/삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 예약 삭제(DELETE) 시 내역에서는 소거되나 병원 대시보드의 총 예약 수 및 진료과별 수용률 통계 그래프에는 유지됨 (Error 4)</small>
        </div>
      )}

      {activeTab === 'HOSPITAL_STATS' && selectedPatientInfo && (
        <div className="widget-section">
          <h2>🏥 병원 진료실 배정 & 진료과별 수용률</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>진료과</th>
                  <th>담당 전문의</th>
                  <th>진료실 번호</th>
                  <th>일일 수용률</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>소화기내과 (INTERNAL)</strong></td>
                  <td>김내과 전문의</td>
                  <td>101호 진료실</td>
                  <td>85% (가동중)</td>
                </tr>
                <tr>
                  <td><strong>순환기내과 (CARDIO)</strong></td>
                  <td>이심장 전문의</td>
                  <td>102호 진료실</td>
                  <td>78% (가동중)</td>
                </tr>
                <tr>
                  <td><strong>정형외과 (ORTHO)</strong></td>
                  <td>박정형 전문의</td>
                  <td>201호 진료실</td>
                  <td>90% (혼잡)</td>
                </tr>
                <tr>
                  <td><strong>신경과 (NEURO)</strong></td>
                  <td>최신경 전문의</td>
                  <td>202호 진료실</td>
                  <td>65% (원활)</td>
                </tr>
                <tr>
                  <td><strong>피부과 (DERMA)</strong></td>
                  <td>강피부 전문의</td>
                  <td>301호 진료실</td>
                  <td>70% (가동중)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
