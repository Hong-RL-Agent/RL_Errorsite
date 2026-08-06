import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedSurvey,
  setSelectedSurvey,
  appointments,
  triggerAnswersTimeRace,
  triggerCancelSubmitConflict,
  triggerPartialPatientSave,
  patients
}) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [medication, setMedication] = useState('');

  const targetPatient = patients.find(p => p.id === selectedSurvey?.patientId) || patients[0];

  useEffect(() => {
    if (targetPatient) {
      setHeight(targetPatient.height || 175);
      setWeight(targetPatient.weight || 72);
      setMedication(targetPatient.medication || '');
    }
  }, [targetPatient]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Survey Answers & Appointment Time Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🩺 문진 답변 & 진료 예약 관제</h3>
        {selectedSurvey ? (
          <div className="detail-panel">
            <p>문진 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedSurvey.id}</strong></p>
            <p>환자명: <strong>{selectedSurvey.patientName} 환자</strong></p>
            <p>현재 위험도: <span className={`risk-badge ${selectedSurvey.riskLevel.toLowerCase()}`}>{selectedSurvey.riskLevel}</span></p>

            <div className="form-group">
              <label>문진 증상 답변 수정 (Error 1):</label>
              <textarea 
                rows="2"
                value={selectedSurvey.chiefComplaint || ''} 
                onChange={(e) => setSelectedSurvey({ ...selectedSurvey, chiefComplaint: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>진료 예약 시간 수정 (0.1초 완료):</label>
              <input 
                type="text"
                defaultValue="2026-08-05 10:00"
                readOnly
              />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerAnswersTimeRace(selectedSurvey)}>
                답변 수정 후 즉시 예약 시간 변경 (Error 1)
              </button>
              <small className="warn-desc">* 문진 답변 수정(3초 지연) 직후 예약 시간 변경(0.1초 완료) 시, 3초 뒤 이전 예약 시간 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelSubmitConflict(selectedSurvey)}>
                ⚡ 예약 취소 후 문진 제출 연쇄 호출 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 문진 제출(4초 지연 완료) 시, 늦은 제출 요청이 취소된 예약을 CONFIRMED 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 문진 응답 항목을 선택하세요.</div>
        )}
      </div>

      {/* Patient Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 환자 기본 신체정보 수정 (Error 8)</h3>
        {targetPatient ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>키 (cm):</label>
              <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value || '0'))} />
            </div>

            <div className="form-group">
              <label>몸무게 (kg - 부분저장 미반영):</label>
              <input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value || '0'))} />
            </div>

            <div className="form-group">
              <label>복용 중인 약물:</label>
              <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialPatientSave(targetPatient.id, height, weight, medication)}
            >
              환자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 키/몸무게/복용약을 동시에 수정하면 백엔드에는 몸무게만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 환자를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
