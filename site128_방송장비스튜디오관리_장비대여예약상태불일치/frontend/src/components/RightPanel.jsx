import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedGear, setSelectedGear, gears, reservations, triggerStatusTimeRace, triggerCancelReturnConflict, triggerPartialSave }) {
  const [gearName, setGearName] = useState('');
  const [location, setLocation] = useState('');
  const [inspectionDate, setInspectionDate] = useState('2026-08-01');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const target = selectedGear || gears[0];

  useEffect(() => {
    if (target) {
      setGearName(target.gearName || '');
      setLocation(target.location || '');
      setInspectionDate(target.inspectionDate || '2026-08-01');
      const resv = reservations.find(r => r.gearId === target.id);
      if (resv) {
        setStartTime(resv.startTime || '09:00');
        setEndTime(resv.endTime || '18:00');
      }
    }
  }, [target, reservations]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎬 장비 대여 & 예약 시간 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>장비명: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.gearName}</strong></p>
            <p>보관 위치: <strong>{target.location}</strong> | 가동률: <strong>{target.utilizationRate}%</strong></p>
            <p>일일 대여료: <strong style={{ color: 'var(--color-success)' }}>{target.dailyFeeWon.toLocaleString()}원</strong></p>
            <p>장비/대여 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>스튜디오 예약 시간 변경 (0.1초 완료):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <span style={{ color: 'var(--color-muted)' }}>~</span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>장비 대여 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'RENTED'} onChange={(e) => setSelectedGear({ ...target, status: e.target.value })}>
                <option value="RESERVED">예약대기 (RESERVED)</option>
                <option value="RENTED">대여중 (RENTED)</option>
                <option value="COMPLETED">사용완료 (COMPLETED)</option>
                <option value="INSPECTING">점검중 (INSPECTING)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusTimeRace(target.id, target, startTime, endTime)}>
              대여중 변경 + 즉시 예약시간 변경 (Error 1)
            </button>
            <small className="warn-desc">* 장비 대여 상태 변경(3초 지연) 직후 예약 시간 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 예약 시간을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelReturnConflict(target.id)}>
                ⚡ 예약 취소 후 장비 반납 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 장비 반납 완료(4초 지연 완료) 시, 취소된 예약이 COMPLETED(사용완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 장비를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 방송 장비 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>장비명:</label>
              <input type="text" value={gearName} onChange={(e) => setGearName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>보관 위치 (부분 저장 미반영):</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label>최근 점검일:</label>
              <input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, gearName, location, inspectionDate)}>
              장비 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 장비명/보관위치/점검일 동시 수정 시 보관위치만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 장비를 선택하세요.</div>}
      </div>
    </aside>
  );
}
