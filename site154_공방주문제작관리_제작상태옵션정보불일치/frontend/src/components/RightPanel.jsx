import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedOrder, setSelectedOrder, orders, customers, triggerStatusOptionRace, triggerCancelShipConflict, triggerPartialSave }) {
  const [customerName, setCustomerName] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [optionColor, setOptionColor] = useState('딥 탄 브라운 (Deep Tan)');

  const target = selectedOrder || orders[0];
  const targetCustomer = customers.find(c => c.customerName === target?.customerName) || customers[0];

  useEffect(() => {
    if (target) {
      setOptionColor(target.optionColor || '딥 탄 브라운 (Deep Tan)');
    }
    if (targetCustomer) {
      setCustomerName(targetCustomer.customerName || '');
      setDeliveryNote(targetCustomer.deliveryNote || '부재시 문 앞 택배함 보관 부탁드립니다.');
    }
  }, [target, targetCustomer]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🛠️ 제작 상태 & 옵션 정보 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>주문 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.orderCode}</strong></p>
            <p>옵션 유형: <span className="option-badge">{target.optionType}</span></p>
            <p>주문 상품: <strong>{target.productName}</strong></p>
            <p>고객 성명: <strong>{target.customerName}</strong>님</p>
            <p>제작 마감일: <small>{target.dueDate}</small> | 결제금액: <strong style={{ color: 'var(--color-success)' }}>{target.orderPriceWon.toLocaleString()}원</strong></p>
            <p>선택 옵션 색상: <strong style={{ color: 'var(--color-warning)' }}>{target.optionColor}</strong></p>
            <p>제작 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>선택 옵션 색상 변경 (0.1초 완료):</label>
              <input type="text" value={optionColor} onChange={(e) => setOptionColor(e.target.value)} />
            </div>

            <div className="form-group">
              <label>제작 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PRODUCTION'} onChange={(e) => setSelectedOrder({ ...target, status: e.target.value })}>
                <option value="ORDERED">주문접수 (ORDERED)</option>
                <option value="IN_PRODUCTION">제작중 (IN_PRODUCTION)</option>
                <option value="INSPECTING">품질검수 (INSPECTING)</option>
                <option value="SHIPPED">발송완료 (SHIPPED)</option>
                <option value="CANCELLED">주문취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusOptionRace(target.id, target, optionColor)}>
              제작중 변경 + 즉시 옵션 색상 수정 (Error 1)
            </button>
            <small className="warn-desc">* 제작중 변경(3초 지연) 직후 옵션 색상 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 옵션 색상을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelShipConflict(target.id)}>
                ⚡ 주문 취소 후 발송 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 주문 취소(0.5초 완료) 직후 발송 완료(4초 지연 완료) 시, 취소된 주문이 SHIPPED(발송완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 주문을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 수제 주문 정보 수정 (Error 8)</h3>
        {targetCustomer ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>고객 성명:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배송 요청 메모:</label>
              <input type="text" value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} />
            </div>
            <div className="form-group">
              <label>선택 옵션 색상 (부분 저장 미반영):</label>
              <input type="text" value={optionColor} onChange={(e) => setOptionColor(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetCustomer.id, customerName, deliveryNote, optionColor)}>
              주문 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 고객명/배송메모/옵션색상 동시 수정 시 옵션색상만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
