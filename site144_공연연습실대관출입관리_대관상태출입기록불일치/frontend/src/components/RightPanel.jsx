import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedBooking, setSelectedBooking, bookings, users, triggerStatusEntryTimeRace, triggerCancelCheckinConflict, triggerPartialSave }) {
  const [userName, setUserName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [entryTime, setEntryTime] = useState('2026-08-05 13:55');

  const target = selectedBooking || bookings[0];
  const targetUser = users.find(u => u.userName === target?.userName) || users[0];

  useEffect(() => {
    if (target) {
      setEntryTime(target.entryTime || '2026-08-05 13:55');
    }
    if (targetUser) {
      setUserName(targetUser.userName || '');
      setTeamName(targetUser.teamName || '');
      setPhone(targetUser.phone || '');
    }
  }, [target, targetUser]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎭 대관 상태 & 출입 시각 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>예약 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.bookingCode}</strong></p>
            <p>연습실: <span className="room-badge">{target.roomName}</span></p>
            <p>이용자: <strong>{target.userName}</strong> ({target.teamName})</p>
            <p>대관 일자: <small>{target.bookingDate}</small> | 예약: <strong>{target.startTime}~{target.endTime}</strong></p>
            <p>출입 인정 시각: <strong style={{ color: 'var(--color-warning)' }}>{target.entryTime}</strong></p>
            <p>대관 결제 금액: <strong style={{ color: 'var(--color-success)' }}>{target.totalFeeWon.toLocaleString()}원</strong></p>
            <p>대관 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>출입 시각 수정 (0.1초 완료):</label>
              <input type="text" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} />
            </div>

            <div className="form-group">
              <label>대관 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedBooking({ ...target, status: e.target.value })}>
                <option value="RESERVED">예약확정 (RESERVED)</option>
                <option value="IN_USE">사용중 (IN_USE)</option>
                <option value="COMPLETED">사용완료 (COMPLETED)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusEntryTimeRace(target.id, target, entryTime)}>
              사용중 변경 + 즉시 출입시각 수정 (Error 1)
            </button>
            <small className="warn-desc">* 사용중 변경(3초 지연) 직후 출입시각 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 출입시각을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCheckinConflict(target.id)}>
                ⚡ 예약 취소 후 출입 확인 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 출입 확인(4초 지연 완료) 시, 취소된 예약이 IN_USE(사용중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 예약을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 이용자 정보 수정 (Error 8)</h3>
        {targetUser ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>이용자 성명:</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>소속 크루 / 팀명:</label>
              <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetUser.id, userName, phone, teamName)}>
              이용자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/소속팀/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 이용자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
