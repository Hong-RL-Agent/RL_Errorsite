import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedCall, setSelectedCall, calls, drivers, triggerStatusFeeRace, triggerCancelCompleteConflict, triggerPartialSave }) {
  const [driverName, setDriverName] = useState('');
  const [carNo, setCarNo] = useState('');
  const [phone, setPhone] = useState('');
  const [actualFeeWon, setActualFeeWon] = useState(18500);

  const target = selectedCall || calls[0];
  const targetDriver = drivers.find(d => d.driverName === target?.driverName) || drivers[0];

  useEffect(() => {
    if (target) {
      setActualFeeWon(target.actualFeeWon || 18500);
    }
    if (targetDriver) {
      setDriverName(targetDriver.driverName || '');
      setCarNo(targetDriver.carNo || '');
      setPhone(targetDriver.phone || '');
    }
  }, [target, targetDriver]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚖 배차 상태 & 운행 요금 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>호출 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.callCode}</strong></p>
            <p>구간: <strong style={{ fontSize: '0.85rem' }}>{target.origin} ➔ {target.destination}</strong></p>
            <p>권역: <span className="region-badge">{target.region}</span> | 거이: <strong>{target.distanceKm}km</strong></p>
            <p>담당 기사: <strong>{target.driverName}</strong> ({target.carNo})</p>
            <p>운행 미터기 요금: <strong style={{ color: 'var(--color-warning)' }}>{target.actualFeeWon.toLocaleString()}원</strong></p>
            <p>배차/운행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>운행 요금 수정 (0.1초 완료):</label>
              <input type="number" value={actualFeeWon} onChange={(e) => setActualFeeWon(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>배차/운행 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_DRIVE'} onChange={(e) => setSelectedCall({ ...target, status: e.target.value })}>
                <option value="PENDING">호출접수 (PENDING)</option>
                <option value="DISPATCHED">배차완료 (DISPATCHED)</option>
                <option value="IN_DRIVE">운행중 (IN_DRIVE)</option>
                <option value="COMPLETED">운행완료 (COMPLETED)</option>
                <option value="SETTLED">정산확정 (SETTLED)</option>
                <option value="CANCELLED">호출취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusFeeRace(target.id, target, actualFeeWon)}>
              운행중 변경 + 즉시 요금 수정 (Error 1)
            </button>
            <small className="warn-desc">* 운행중 변경(3초 지연) 직후 요금 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 요금을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCompleteConflict(target.id)}>
                ⚡ 호출 취소 후 운행 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 호출 취소(0.5초 완료) 직후 운행 완료(4초 지연 완료) 시, 취소된 호출이 COMPLETED(운행완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 호출을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 기사 정보 수정 (Error 8)</h3>
        {targetDriver ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>기사 성명:</label>
              <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>등록 차량번호:</label>
              <input type="text" value={carNo} onChange={(e) => setCarNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetDriver.id, driverName, carNo, phone)}>
              기사 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/차량번호/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 기사를 선택하세요.</div>}
      </div>
    </aside>
  );
}
