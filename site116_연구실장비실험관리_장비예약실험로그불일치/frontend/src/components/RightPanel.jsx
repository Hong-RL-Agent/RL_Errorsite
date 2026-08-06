import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedEquipment, setSelectedEquipment, equipments, reservations, triggerTimeExpLogRace, triggerCancelUseConflict, triggerPartialSave }) {
  const [eqName, setEqName] = useState('');
  const [location, setLocation] = useState('');
  const [inspectCycleDays, setInspectCycleDays] = useState(30);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [expTitle, setExpTitle] = useState('');

  const target = selectedEquipment || equipments[0];

  useEffect(() => {
    if (target) {
      setEqName(target.name || '');
      setLocation(target.location || '');
      setInspectCycleDays(target.inspectCycleDays || 30);
    }
  }, [target]);

  const rsvOfTarget = reservations.filter(r => target && r.equipmentId === target.id);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🧪 장비 예약 & 실험 로그 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>장비명: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.name}</strong></p>
            <p>분류: <strong>{target.category}</strong> | 설치 위치: <strong>{target.location}</strong></p>
            <p>사용률: <strong style={{ color: 'var(--color-success)' }}>{target.usageRate}%</strong></p>
            <p>담당자: <strong>{target.managerName}</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>예약 시작 시간 (Error 1 - 3초 지연):</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div className="form-group">
              <label>예약 종료 시간:</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>

            <div className="form-group">
              <label>실험 로그 주제 작성 (0.1초 완료):</label>
              <input type="text" placeholder="실험 주제 입력..." value={expTitle} onChange={(e) => setExpTitle(e.target.value)} />
            </div>

            <button className="save-btn" onClick={() => {
              const rsv = rsvOfTarget[0] || reservations[0];
              if (rsv) triggerTimeExpLogRace(rsv.id, target, startTime, endTime, expTitle);
            }}>
              예약 시간 변경 + 즉시 실험로그 작성 (Error 1)
            </button>
            <small className="warn-desc">* 예약 시간 변경(3초 지연) 직후 실험로그 작성(0.1초 완료) 시, 3초 뒤 시간 변경이 구 DB 스냅샷으로 실험로그를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => {
                const rsv = rsvOfTarget[0] || reservations[0];
                if (rsv) triggerCancelUseConflict(rsv.id);
              }}>
                ⚡ 예약 취소 후 장비 사용완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 사용완료(4초 지연 완료) 시, 취소된 예약이 COMPLETED로 복원됨 (Error 2)</small>
            </div>

            {rsvOfTarget.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
                <strong style={{ color: 'var(--color-dark)' }}>예약 이력:</strong>
                {rsvOfTarget.map(r => (
                  <div key={r.id} style={{ marginTop: '0.2rem', color: 'var(--color-text)' }}>
                    ▸ {r.researcherName} ({r.reserveDate} {r.startTime}~{r.endTime}) <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <div className="empty-lbl-dark">관제할 장비를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 장비 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>장비명:</label>
              <input type="text" value={eqName} onChange={(e) => setEqName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>위치 (부분 저장 미반영):</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label>점검 주기 (일):</label>
              <input type="number" value={inspectCycleDays} onChange={(e) => setInspectCycleDays(Number(e.target.value))} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, eqName, location, inspectCycleDays)}>
              장비 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 장비명/위치/점검주기 동시 수정 시 위치만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 장비를 선택하세요.</div>}
      </div>
    </aside>
  );
}
