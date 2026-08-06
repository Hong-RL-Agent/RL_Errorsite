import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedProduct, setSelectedProduct, products, stores, triggerStatusDiscountRace, triggerCancelSoldOutConflict, triggerPartialSave }) {
  const [productName, setProductName] = useState('');
  const [storageTemp, setStorageTemp] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discountRatePercent, setDiscountRatePercent] = useState(30);

  const target = selectedProduct || products[0];

  useEffect(() => {
    if (target) {
      setProductName(target.productName || '');
      setStorageTemp(target.storageTemp || '');
      setExpiryDate(target.expiryDate || '');
      setDiscountRatePercent(target.discountRatePercent || 30);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🥬 폐기 상태 & 타임세일 할인율 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>상품 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.prodCode}</strong></p>
            <p>상품명: <strong style={{ fontSize: '0.85rem' }}>{target.productName}</strong></p>
            <p>매장: <span className="store-badge">{target.storeName}</span> | 보관: <strong>{target.storageTemp}</strong></p>
            <p>원래 가격: <small>{target.originalPriceWon.toLocaleString()}원</small> | 할인율: <strong style={{ color: 'var(--color-warning)' }}>{target.discountRatePercent}% Off</strong></p>
            <p>현재 판매가: <strong style={{ color: 'var(--color-success)' }}>{target.currentPriceWon.toLocaleString()}원</strong></p>
            <p>유통기한: <small>{target.expiryDate}</small> | 재고: <strong>{target.stockQty}개</strong></p>
            <p>진열/폐기 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>타임세일 할인율 수정 (0.1초 완료):</label>
              <input type="number" value={discountRatePercent} onChange={(e) => setDiscountRatePercent(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>진열/폐기 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'DISPOSAL_PENDING'} onChange={(e) => setSelectedProduct({ ...target, status: e.target.value })}>
                <option value="NORMAL">정상판매 (NORMAL)</option>
                <option value="DISCOUNTED">할인판매 (DISCOUNTED)</option>
                <option value="DISPOSAL_PENDING">폐기예정 (DISPOSAL_PENDING)</option>
                <option value="DISPOSED">폐기완료 (DISPOSED)</option>
                <option value="SOLD_OUT">판매완료 (SOLD_OUT)</option>
                <option value="CANCELLED">폐기취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusDiscountRace(target.id, target, discountRatePercent)}>
              폐기예정 변경 + 즉시 할인율 수정 (Error 1)
            </button>
            <small className="warn-desc">* 폐기예정 변경(3초 지연) 직후 할인율 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 할인율을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelSoldOutConflict(target.id)}>
                ⚡ 폐기 취소 후 판매 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 폐기 취소(0.5초 완료) 직후 판매 완료(4초 지연 완료) 시, 취소된 상품이 SOLD_OUT(판매완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 상품을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 상품 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>신선식품 상품명:</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>보관 온도 (부분 저장 미반영):</label>
              <input type="text" value={storageTemp} onChange={(e) => setStorageTemp(e.target.value)} />
            </div>
            <div className="form-group">
              <label>유통기한 마감시각:</label>
              <input type="text" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, productName, storageTemp, expiryDate)}>
              상품 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 상품명/보관온도/유통기한 동시 수정 시 보관온도만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 상품을 선택하세요.</div>}
      </div>
    </aside>
  );
}
