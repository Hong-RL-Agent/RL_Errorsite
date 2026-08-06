import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedSeat, setSelectedSeat, seats, members, triggerStatusTimeRace, triggerCancelCheckInConflict, triggerPartialSave }) {
  const [memberName, setMemberName] = useState('');
  const [phone, setPhone] = useState('010-9999-3333');
  const [ticketType, setTicketType] = useState('100시간 충전권 (잔여 42시간)');
  const [remainingHours, setRemainingHours] = useState(42.5);

  const target = selectedSeat || seats[0];
  const targetMember = members.find(m => m.memberName === target?.currentMember) || members[0];

  useEffect(() => {
    if (target) {
      setRemainingHours(target.remainingHours || 42.5);
    }
    if (targetMember) {
      setMemberName(targetMember.memberName || '');
      setPhone(targetMember.phone || '010-9999-3333');
      setTicketType(targetMember.ticketType || '100시간 충전권 (잔여 42시간)');
    }
  }, [target, targetMember]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📚 좌석 상태 & 이용시간 연장 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>좌석 번호: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.seatNo}</strong></p>
            <p>지점: <span className="branch-badge">{target.branchName}</span></p>
            <p>이용 회원: <strong>{target.currentMember}</strong>님</p>
            <p>입실 시각: <small>{target.startTime}</small> | 퇴실 예정: <small style={{ color: 'var(--color-warning)' }}>{target.endTime}</small></p>
            <p>잔여 이용시간: <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{target.remainingHours}시간</strong></p>
            <p>좌석 이용 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>이용시간 연장/수정 (0.1초 완료):</label>
              <input type="number" step="0.5" min="0" value={remainingHours} onChange={(e) => setRemainingHours(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>좌석 이용 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedSeat({ ...target, status: e.target.value })}>
                <option value="AVAILABLE">빈좌석 (AVAILABLE)</option>
                <option value="IN_USE">사용중 (IN_USE)</option>
                <option value="AWAY">외출중 (AWAY)</option>
                <option value="CHECKED_OUT">퇴실완료 (CHECKED_OUT)</option>
                <option value="CANCELLED">이용권취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusTimeRace(target.id, target, remainingHours)}>
              사용중 변경 + 즉시 이용시간 연장 (Error 1)
            </button>
            <small className="warn-desc">* 사용중 변경(3초 지연) 직후 이용시간 연장(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 이용시간을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCheckInConflict(target.id)}>
                ⚡ 이용권 취소 후 입실 처리 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 이용권 취소(0.5초 완료) 직후 입실 처리(4초 지연 완료) 시, 취소된 이용권이 IN_USE(사용중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 좌석을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 회원 정보 수정 (Error 8)</h3>
        {targetMember ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>회원 성명:</label>
              <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>이용권 종류:</label>
              <input type="text" value={ticketType} onChange={(e) => setTicketType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetMember.id, memberName, phone, ticketType)}>
              회원 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 회원명/이용권종류/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 회원을 선택하세요.</div>}
      </div>
    </aside>
  );
}
