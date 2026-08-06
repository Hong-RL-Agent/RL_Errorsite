import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedPatient,
  setSelectedPatient,
  triggerRoomMedicationRace,
  rooms,
  triggerDischargeMedicationConflict,
  triggerPartialMemoSave
}) {
  const [precautions, setPrecautions] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [nurseMemo, setNurseMemo] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      setPrecautions(selectedPatient.precautions || '');
      setGuardianPhone(selectedPatient.guardianPhone || '');
      setNurseMemo(selectedPatient.nurseMemo || '');
    }
  }, [selectedPatient]);

  return (
    <aside className="panel-section operations-sidebar">
      <!-- Room Transfer & Medication Status (Error 1 Target) -->
      <div className="detail-widget">
        <h3>🏥 병실 이동 & 투약 완료 처리</h3>
        {selectedPatient ? (
          <div className="detail-panel">
            <p>환자 성함: <strong>{selectedPatient.name}</strong> ({selectedPatient.gender}/{selectedPatient.age}세)</p>
            <p>현재 병실: <strong className="room-tag">{selectedPatient.roomNo}</strong> ({selectedPatient.ward})</p>
            <p>진단명: <strong>{selectedPatient.diagnosis}</strong></p>
            <p>담당 간호사: <strong style={{ color: 'var(--color-primary)' }}>{selectedPatient.nurseName}</strong></p>

            <div className="form-group">
              <label>이동 대상 병실 선택:</label>
              <select 
                value={selectedPatient.roomNo || '301호'} 
                onChange={(e) => {
                  const rm = rooms.find(r => r.roomNo === e.target.value);
                  setSelectedPatient({ ...selectedPatient, roomNo: e.target.value, ward: rm?.ward || selectedPatient.ward });
                }}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.roomNo}>{r.roomNo} ({r.ward}) - {r.currentCount}/{r.capacity}베드</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>투약 완료 변경 (Error 1):</label>
              <div className="input-row">
                <button className="save-btn" onClick={() => triggerRoomMedicationRace(selectedPatient)}>
                  병실 이동 & 투약완료 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 병실 이동(3초 지연 완료) 직후 투약 완료(0.1초 완료) 시, 3초 뒤 이전 병실 정보가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="discharge-btn" onClick={() => triggerDischargeMedicationConflict(selectedPatient)}>
                ⚡ 환자 퇴원 후 처방 투약 추가 (Error 2)
              </button>
              <small className="warn-desc">* 퇴원 처리(0.5초 완료) 직후 투약 등록(4초 지연 완료) 시, 늦은 등록 요청이 퇴원 환자를 다시 입원중 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 환자 항목을 선택하세요.</div>
        )}
      </div>

      <!-- Patient Memo Partial Save Widget (Error 8 Target) -->
      <div className="detail-widget">
        <h3>📝 환자 메모 & 보호자 연락처 수정 (Error 8)</h3>
        {selectedPatient ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>주의사항:</label>
              <input type="text" value={precautions} onChange={(e) => setPrecautions(e.target.value)} />
            </div>

            <div className="form-group">
              <label>보호자 연락처 (부분저장 미반영):</label>
              <input type="text" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>간호 메모:</label>
              <input type="text" value={nurseMemo} onChange={(e) => setNurseMemo(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialMemoSave(selectedPatient.id, precautions, guardianPhone, nurseMemo)}
            >
              메모 수정 저장 (Error 8)
            </button>
            <small className="warn-desc">* 주의사항/보호자연락처/간호메모 수정 시 백엔드에는 보호자연락처만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">메모를 수정할 환자 항목을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
