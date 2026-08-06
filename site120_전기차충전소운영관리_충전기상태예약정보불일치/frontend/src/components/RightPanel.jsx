import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedCharger, setSelectedCharger, chargers, reservations, triggerTimeChargerRace, triggerCancelChargeConflict, triggerPartialSave }) {
  const [locationFloor, setLocationFloor] = useState('');
  const [maxKw, setMaxKw] = useState(200);
  const [inspectMemo, setInspectMemo] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('14:40');

  const target = selectedCharger || chargers[0];

  useEffect(() => {
    if (target) {
      setLocationFloor(target.locationFloor || '');
      setMaxKw(target.maxKw || 200);
      setInspectMemo(target.inspectMemo || '');
    }
  }, [target]);

  const rsvOfTarget = reservations.filter(r => target && r.chargerId === target.id);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>⚡ 충전기 예약 & 제어 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>충전기 ID: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.id}</strong></p>
            <p>충전소: <strong>{target.stationName}</strong></p>
            <p>타입: <strong>{target.chargerType} ({target.maxKw}kW)</strong></p>
            <p>위치: <strong>{target.locationFloor}</strong></p>
            <p>누적 충전량: <strong style={{ color: 'var(--color-success)' }}>{target.totalKwCharged.toLocaleString()}kWh</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배정 충전기 변경 (0.1초 완료):</label>
              <select value={target.id} onChange={(e) => {
                const c = chargers.find(x => x.id === e.target.value);
                if (c) setSelectedCharger(c);
              }}>
                {chargers.map(c => <option key={c.id} value={c.id}>{c.id} - {c.stationName.split(' ')[0]} ({c.chargerType})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>예약 시간 변경 (Error 1 - 3초 지연):</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <button className="save-btn" onClick={() => {
              const rsv = rsvOfTarget[0] || reservations[0];
              if (rsv) triggerTimeChargerRace(rsv.id, target, startTime, endTime);
            }}>
              예약 시간 변경 + 즉시 충전기 변경 (Error 1)
            </button>
            <small className="warn-desc">* 예약 시간 변경(3초 지연) 직후 충전기 변경(0.1초 완료) 시, 3초 뒤 시간 변경이 구 DB 스냅샷으로 충전기 배정을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => {
                const rsv = rsvOfTarget[0] || reservations[0];
                if (rsv) triggerCancelChargeConflict(rsv.id);
              }}>
                ⚡ 예약 취소 후 충전 시작 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 충전 시작(4초 지연 완료) 시, 취소된 예약을 CHARGING(충전중)으로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 충전기를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 충전기 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>설치 위치/층수:</label>
              <input type="text" value={locationFloor} onChange={(e) => setLocationFloor(e.target.value)} />
            </div>
            <div className="form-group">
              <label>최대 충전속도(kW) (부분 저장 미반영):</label>
              <input type="number" value={maxKw} onChange={(e) => setMaxKw(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>점검 메모:</label>
              <input type="text" value={inspectMemo} onChange={(e) => setInspectMemo(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, locationFloor, maxKw, inspectMemo)}>
              충전기 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 위치/충전속도/점검메모 동시 수정 시 충전속도만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 충전기를 선택하세요.</div>}
      </div>
    </aside>
  );
}
