import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedRecord, setSelectedRecord, records, triggerStatusFeeRace, triggerCancelSettlementConflict, triggerPartialSave }) {
  const [carNo, setCarNo] = useState('');
  const [carType, setCarType] = useState('');
  const [phone, setPhone] = useState('');
  const [feeWon, setFeeWon] = useState(12000);

  const target = selectedRecord || records[0];

  useEffect(() => {
    if (target) {
      setCarNo(target.carNo || '');
      setCarType(target.carType || '');
      setPhone(target.phone || '');
      setFeeWon(target.feeWon || 12000);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚘 주차면 상태 & 정산 요금 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>입출차 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.recCode}</strong></p>
            <p>차량 번호: <strong style={{ fontSize: '0.88rem' }}>{target.carNo}</strong> ({target.carType})</p>
            <p>주차장: <strong>{target.lotName}</strong> | 주차면: <strong style={{ color: 'var(--color-primary)' }}>{target.spaceNo}</strong></p>
            <p>입차: <small>{target.inTime}</small> | 주차시간: <strong>{target.durationMinutes}분</strong></p>
            <p>정산 요금: <strong style={{ color: 'var(--color-warning)' }}>{target.feeWon.toLocaleString()}원</strong></p>
            <p>주차/정산 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>정산 요금 수정 (0.1초 완료):</label>
              <input type="number" value={feeWon} onChange={(e) => setFeeWon(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>주차면 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'OCCUPIED'} onChange={(e) => setSelectedRecord({ ...target, status: e.target.value })}>
                <option value="VACANT">빈주차면 (VACANT)</option>
                <option value="OCCUPIED">주차중 (OCCUPIED)</option>
                <option value="EXITED">출차완료 (EXITED)</option>
                <option value="SETTLED">정산완료 (SETTLED)</option>
                <option value="UNPAID">미납 (UNPAID)</option>
                <option value="CANCELLED">출차취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusFeeRace(target.id, target, feeWon)}>
              사용중 변경 + 즉시 요금 수정 (Error 1)
            </button>
            <small className="warn-desc">* 사용중 변경(3초 지연) 직후 요금 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 요금을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelSettlementConflict(target.id)}>
                ⚡ 출차 취소 후 정산 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 출차 취소(0.5초 완료) 직후 정산 완료(4초 지연 완료) 시, 취소된 출차가 SETTLED(정산완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 차량을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 차량 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>차량 번호:</label>
              <input type="text" value={carNo} onChange={(e) => setCarNo(e.target.value)} />
            </div>
            <div className="form-group">
              <label>차종 (부분 저장 미반영):</label>
              <input type="text" value={carType} onChange={(e) => setCarType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, carNo, carType, phone)}>
              차량 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 차량번호/차종/연락처 동시 수정 시 차종만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 차량을 선택하세요.</div>}
      </div>
    </aside>
  );
}
