import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedOrder,
  setSelectedOrder,
  settlements,
  products,
  triggerStatusSettlementRace,
  triggerCancelTrackingConflict,
  triggerPartialProductSave
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(10000);
  const [shippingFee, setShippingFee] = useState(2500);

  const targetProduct = products.find(p => p.id === selectedOrder?.productId) || products[0];

  useEffect(() => {
    if (targetProduct) {
      setName(targetProduct.name || '');
      setPrice(targetProduct.price || 10000);
      setShippingFee(targetProduct.shippingFee || 2500);
    }
  }, [targetProduct]);

  const linkedSettlement = settlements.find(s => s.orderId === selectedOrder?.id) || settlements[0];

  return (
    <aside className="panel-section operations-sidebar">
      {/* Delivery Status & Settlement Amount Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>📦 배송 상태 & 정산 금액 관제</h3>
        {selectedOrder ? (
          <div className="detail-panel">
            <p>주문 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedOrder.id}</strong></p>
            <p>구매자: <strong>{selectedOrder.buyerName}</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>

            <div className="form-group">
              <label>배송 상태 변경 (Error 1):</label>
              <select 
                value={selectedOrder.status || 'PAID'} 
                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
              >
                <option value="PAID">결제완료</option>
                <option value="PREPARING">상품준비</option>
                <option value="SHIPPING">배송중</option>
                <option value="DELIVERED">배송완료</option>
                <option value="CONFIRMED">구매확정</option>
                <option value="CANCELLED">취소</option>
                <option value="RETURNED">반품</option>
              </select>
            </div>

            <div className="form-group">
              <label>정산 금액 수정 (0.1초 완료):</label>
              <input 
                type="number"
                defaultValue={linkedSettlement?.settlementAmount || 300000}
                onChange={(e) => {}}
              />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerStatusSettlementRace(selectedOrder, linkedSettlement?.id)}>
                상태 변경 후 즉시 정산액 수정 (Error 1)
              </button>
              <small className="warn-desc">* 배송 상태 변경(3초 지연) 직후 정산 금액 수정(0.1초 완료) 시, 3초 뒤 이전 배송 상태 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelTrackingConflict(selectedOrder)}>
                ⚡ 주문 취소 후 송장 등록 연쇄 호출 (Error 2)
              </button>
              <small className="warn-desc">* 주문 취소(0.5초 완료) 직후 송장 등록(4초 지연 완료) 시, 늦은 송장 요청이 취소된 주문을 SHIPPING 배송중 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 주문 항목을 선택하세요.</div>
        )}
      </div>

      {/* Product Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🛍️ 상품 기본 정보 수정 (Error 8)</h3>
        {targetProduct ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>상품명:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>판매 가격 (부분저장 미반영):</label>
              <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0'))} />
            </div>

            <div className="form-group">
              <label>기본 배송비:</label>
              <input type="number" value={shippingFee} onChange={(e) => setShippingFee(parseInt(e.target.value || '0'))} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialProductSave(targetProduct.id, name, price, shippingFee)}
            >
              상품 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 상품명/판매가/배송비를 동시에 수정하면 백엔드에는 판매가만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 상품을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
