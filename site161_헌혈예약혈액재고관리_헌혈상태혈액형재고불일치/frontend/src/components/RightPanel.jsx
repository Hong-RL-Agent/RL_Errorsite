import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedReservation, setSelectedReservation, reservations, donors, triggerStatusStockRace, triggerCancelStockConflict, triggerPartialSave }) {
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('010-8888-9999');
  const [bloodType, setBloodType] = useState('O+ (Rh+ O형)');
  const [bloodStockUnits, setBloodStockUnits] = useState(48);

  const target = selectedReservation || reservations[0];
  const targetDonor = donors.find(d => d.donorName === target?.donorName) || donors[0];

  useEffect(() => {
    if (target) {
      setBloodStockUnits(target.bloodStockUnits || 48);
    }
    if (targetDonor) {
      setDonorName(targetDonor.donorName || '');
      setPhone(targetDonor.phone || '010-8888-9999');
      setBloodType(targetDonor.bloodType || 'O+ (Rh+ O형)');
    }
  }, [target, targetDonor]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🩸 헌혈 상태 & 혈액형 재고 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>예약 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.rsvCode}</strong></p>
            <p>헌혈자 성명: <strong>{target.donorName}</strong> | 혈액형: <span className="center-badge">{target.bloodType}</span></p>
            <p>헌혈 센터: <strong>{target.centerName}</strong> | 시간: <small>{target.reservationTime}</small></p>
            <p>헌혈 구분: <small style={{ color: 'var(--color-warning)' }}>{target.donationType}</small></p>
            <p>센터 혈액 재고: <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{target.bloodStockUnits}팩 보유</strong></p>
            <p>헌혈 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>센터 혈액형 재고 수량 수정 (0.1초 완료):</label>
              <input type="number" min="0" value={bloodStockUnits} onChange={(e) => setBloodStockUnits(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>헌혈 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedReservation({ ...target, status: e.target.value })}>
                <option value="RESERVED">예약완료 (RESERVED)</option>
                <option value="SCREENED">문진완료 (SCREENED)</option>
                <option value="IN_PROGRESS">헌혈중 (IN_PROGRESS)</option>
                <option value="COMPLETED">헌혈완료 (COMPLETED)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusStockRace(target.id, target, bloodStockUnits)}>
              헌혈완료 변경 + 즉시 재고 수량 수정 (Error 1)
            </button>
            <small className="warn-desc">* 헌혈완료 변경(3초 지연) 직후 재고 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 재고 수량을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelStockConflict(target.id)}>
                ⚡ 예약 취소 후 혈액 재고 반영 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 재고 반영(4초 지연 완료) 시, 취소된 예약이 COMPLETED(헌혈완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 헌혈 예약을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 헌혈자 정보 수정 (Error 8)</h3>
        {targetDonor ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>헌혈자 성명:</label>
              <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>혈액형:</label>
              <input type="text" value={bloodType} onChange={(e) => setBloodType(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetDonor.id, donorName, phone, bloodType)}>
              헌혈자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 헌혈자명/혈액형/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 헌혈자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
