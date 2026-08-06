import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  trainers,
  members,
  triggerTimeTrainerRace,
  triggerCancelCheckInConflict,
  triggerPartialMemberSave
}) {
  const [phone, setPhone] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [assignedTrainer, setAssignedTrainer] = useState('');

  const targetMember = members.find(m => m.id === selectedReservation?.memberId) || members[0];

  useEffect(() => {
    if (targetMember) {
      setPhone(targetMember.phone || '');
      setExpiryDate(targetMember.expiryDate || '');
      setAssignedTrainer(targetMember.assignedTrainer || '');
    }
  }, [targetMember]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* PT Reservation Time & Trainer Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>📅 PT 예약 시간 & 담당 트레이너 관제</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>예약 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedReservation.id}</strong></p>
            <p>회원명: <strong>{selectedReservation.memberName} 회원</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedReservation.status.toLowerCase()}`}>{selectedReservation.status}</span></p>

            <div className="form-group">
              <label>담당 트레이너 변경 (0.1초 완료):</label>
              <select 
                value={selectedReservation.trainerName || '김피트 (수석 트레이너)'} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, trainerName: e.target.value })}
              >
                {trainers.map(trn => (
                  <option key={trn.id} value={trn.name}>{trn.name} ({trn.specialty})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>예약 시간 변경 (Error 1 - 3초 지연):</label>
              <input 
                type="text" 
                value={selectedReservation.resTime || '14:00'} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, resTime: e.target.value })}
              />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerTimeTrainerRace(selectedReservation)}>
                예약 시간 변경 후 즉시 트레이너 변경 (Error 1)
              </button>
              <small className="warn-desc">* 시간 변경(3초 지연) 직후 트레이너 변경(0.1초 완료) 시, 3초 뒤 이전 트레이너 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCheckInConflict(selectedReservation)}>
                ⚡ 예약 취소 처리 후 출석 체크 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 출석 체크(4초 지연 완료) 시, 늦은 출석 요청이 취소된 예약을 ATTENDED 출석 상태로 복원하고 회원권을 차감시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 PT 예약 항목을 선택하세요.</div>
        )}
      </div>

      {/* Member Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 회원 인적 정보 & 만료일 수정 (Error 8)</h3>
        {targetMember ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>회원권 만료일 (부분저장 미반영):</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>담당 트레이너:</label>
              <select value={assignedTrainer} onChange={(e) => setAssignedTrainer(e.target.value)}>
                {trainers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialMemberSave(targetMember.id, phone, expiryDate, assignedTrainer)}
            >
              회원 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/만료일/담당트레이너를 동시에 수정하면 백엔드에는 만료일만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 회원을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
