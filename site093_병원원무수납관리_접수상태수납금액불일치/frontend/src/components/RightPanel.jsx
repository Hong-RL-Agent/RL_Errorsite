import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedRegistration,
  setSelectedRegistration,
  departments,
  triggerDeptAmountRace,
  triggerCancelPaymentConflict,
  triggerPartialPatientSave,
  selectedPatient
}) {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      setPhone(selectedPatient.phone || '');
      setAddress(selectedPatient.address || '');
      setGuardianName(selectedPatient.guardianName || '');
    }
  }, [selectedPatient]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Registration Dept & Payment Amount Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>💳 접수 진료과 & 수납 금액 관제</h3>
        {selectedRegistration ? (
          <div className="detail-panel">
            <p>번호표: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedRegistration.ticketNo}</strong> ({selectedRegistration.id})</p>
            <p>환자명: <strong>{selectedRegistration.patientName} 환자</strong></p>

            <div className="form-group">
              <label>진료과 변경 (Error 1):</label>
              <select 
                value={selectedRegistration.dept || '내과'} 
                onChange={(e) => setSelectedRegistration({ ...selectedRegistration, dept: e.target.value })}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.doctor})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>수납 금액 수정 (원):</label>
              <div className="input-row">
                <input 
                  type="number" 
                  value={selectedRegistration.amount || 0} 
                  onChange={(e) => setSelectedRegistration({ ...selectedRegistration, amount: parseInt(e.target.value || '0') })}
                />
                <button className="save-btn" onClick={() => triggerDeptAmountRace(selectedRegistration)}>
                  수납금 수정 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 진료과 변경(3초 지연) 직후 수납금액 수정(0.1초 완료) 시, 3초 뒤 이전 진료과가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelPaymentConflict(selectedRegistration)}>
                ⚡ 접수 취소 후 수납 완료 승인 (Error 2)
              </button>
              <small className="warn-desc">* 접수 취소(0.5초 완료) 직후 수납 완료(4초 지연 완료) 시, 늦은 수납 완료 요청이 취소된 접수를 COMPLETED 수납완료 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 접수/수납 항목을 선택하세요.</div>
        )}
      </div>

      {/* Patient Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🏥 환자 인적사항 수정 (Error 8)</h3>
        {selectedPatient ? (
          <div className="detail-panel">
            <p>환자 번호: <strong>{selectedPatient.id}</strong> ({selectedPatient.name})</p>

            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>주소:</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label>보호자 이름 (부분저장 미반영):</label>
              <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialPatientSave(selectedPatient.id, phone, address, guardianName)}
            >
              환자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/주소/보호자 이름을 동시에 수정하면 백엔드에는 보호자 이름만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 환자를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
