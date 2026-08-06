import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedOrder, setSelectedOrder, orders, passengers, triggerStatusQuantityRace, triggerCancelPickupConflict, triggerPartialSave }) {
  const [passengerName, setPassengerName] = useState('');
  const [passportEnglishName, setPassportEnglishName] = useState('CHOI GONGHANG');
  const [flightNo, setFlightNo] = useState('KE081 (대한항공 뉴욕행)');
  const [itemQuantity, setItemQuantity] = useState(4);

  const target = selectedOrder || orders[0];
  const targetPassenger = passengers.find(p => p.passengerName === target?.passengerName) || passengers[0];

  useEffect(() => {
    if (target) {
      setItemQuantity(target.itemQuantity || 4);
    }
    if (targetPassenger) {
      setPassengerName(targetPassenger.passengerName || '');
      setPassportEnglishName(targetPassenger.passportEnglishName || 'CHOI GONGHANG');
      setFlightNo(targetPassenger.flightNo || 'KE081 (대한항공 뉴욕행)');
    }
  }, [target, targetPassenger]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🛍️ 픽업 상태 & 면세품 수량 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>주문 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.orderCode}</strong></p>
            <p>승객 성명: <strong>{target.passengerName}</strong> ({target.passportEnglishName})</p>
            <p>탑승 항공편: <small style={{ color: 'var(--color-warning)' }}>{target.flightNo}</small> | 출국: <small>{target.departureTime}</small></p>
            <p>배정 인도장: <span className="counter-badge">{target.counterName}</span></p>
            <p>면세품 항목: <strong>{target.productName}</strong></p>
            <p>면세품 수량: <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{target.itemQuantity}개</strong> (총액 ${target.totalPriceUsd})</p>
            <p>픽업 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>면세품 인도 수량 수정 (0.1초 완료):</label>
              <input type="number" min="1" value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>픽업 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'READY'} onChange={(e) => setSelectedOrder({ ...target, status: e.target.value })}>
                <option value="ORDERED">주문완료 (ORDERED)</option>
                <option value="PREPARING">상품준비중 (PREPARING)</option>
                <option value="READY">준비완료 (READY)</option>
                <option value="COMPLETED">픽업완료 (COMPLETED)</option>
                <option value="CANCELLED">주문취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusQuantityRace(target.id, target, itemQuantity)}>
              준비완료 변경 + 즉시 면세품 수량 수정 (Error 1)
            </button>
            <small className="warn-desc">* 준비완료 변경(3초 지연) 직후 수량 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 수량을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelPickupConflict(target.id)}>
                ⚡ 주문 취소 후 픽업 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 주문 취소(0.5초 완료) 직후 픽업 완료(4초 지연 완료) 시, 취소된 주문이 COMPLETED(픽업완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 면세품 주문을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 출국 승객 정보 수정 (Error 8)</h3>
        {targetPassenger ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>승객 성명:</label>
              <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>여권 영문 성명:</label>
              <input type="text" value={passportEnglishName} onChange={(e) => setPassportEnglishName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>출국 항공편 (부분 저장 미반영):</label>
              <input type="text" value={flightNo} onChange={(e) => setFlightNo(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetPassenger.id, passengerName, flightNo, passportEnglishName)}>
              승객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 승객명/여권영문명/항공편 동시 수정 시 항공편만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 승객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
