import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedTicket, setSelectedTicket, tickets, guardians, triggerStatusHoursRace, triggerCancelUsageConflict, triggerPartialSave }) {
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('부모 (모)');
  const [allowedHours, setAllowedHours] = useState(2);

  const target = selectedTicket || tickets[0];
  const targetGuardian = guardians.find(g => g.guardianName === target?.guardianName) || guardians[0];

  useEffect(() => {
    if (target) {
      setAllowedHours(target.allowedHours || 2);
    }
    if (targetGuardian) {
      setGuardianName(targetGuardian.guardianName || '');
      setPhone(targetGuardian.phone || '');
      setRelationship(targetGuardian.relationship || '부모 (모)');
    }
  }, [target, targetGuardian]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎠 입장 상태 & 이용시간 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>입장 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.ticketCode}</strong></p>
            <p>키즈카페 매장: <span className="store-badge">{target.storeName}</span></p>
            <p>아동 이름: <strong>{target.childName}</strong> | 동반: <strong>{target.guardianName}</strong></p>
            <p>입장 시각: <small>{target.enterTime}</small></p>
            <p>기본/연장 시간: <strong style={{ color: 'var(--color-warning)' }}>{target.allowedHours}시간</strong> (남은시간: {target.remainingMin}분)</p>
            <p>추가 정산 요금: <strong style={{ color: 'var(--color-success)' }}>{target.extraFeeWon.toLocaleString()}원</strong></p>
            <p>입장 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>이용시간 1시간 연장 (0.1초 완료):</label>
              <input type="number" value={allowedHours} onChange={(e) => setAllowedHours(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>입장 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedTicket({ ...target, status: e.target.value })}>
                <option value="WAITING">입장대기 (WAITING)</option>
                <option value="IN_USE">이용중 (IN_USE)</option>
                <option value="EXTENDED">연장중 (EXTENDED)</option>
                <option value="CHECKED_OUT">퇴장완료 (CHECKED_OUT)</option>
                <option value="CANCELLED">입장취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusHoursRace(target.id, target, allowedHours)}>
              이용중 변경 + 즉시 시간 연장 (Error 1)
            </button>
            <small className="warn-desc">* 이용중 변경(3초 지연) 직후 시간 연장(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 이용시간을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelUsageConflict(target.id)}>
                ⚡ 입장 취소 후 놀이 이용 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 입장 취소(0.5초 완료) 직후 놀이 이용 등록(4초 지연 완료) 시, 취소된 입장권이 IN_USE(이용중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 입장권을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 동반 보호자 정보 수정 (Error 8)</h3>
        {targetGuardian ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>보호자 성명:</label>
              <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>아동과의 관계:</label>
              <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetGuardian.id, guardianName, phone, relationship)}>
              보호자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 보호자명/아동관계/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 보호자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
