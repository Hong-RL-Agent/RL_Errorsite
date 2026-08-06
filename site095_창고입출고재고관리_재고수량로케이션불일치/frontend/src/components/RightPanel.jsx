import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedProduct,
  setSelectedProduct,
  locations,
  triggerLocationStockRace,
  triggerPartialProductSave,
  testUnauthorizedStockUpdate
}) {
  const [name, setName] = useState('');
  const [safetyStock, setSafetyStock] = useState(20);
  const [zone, setZone] = useState('A구역');

  useEffect(() => {
    if (selectedProduct) {
      setName(selectedProduct.name || '');
      setSafetyStock(selectedProduct.safetyStock || 20);
      setZone(selectedProduct.zone || 'A구역');
    }
  }, [selectedProduct]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Location & Stock Quantity Edit Widget (Error 1 & 7 Targets) */}
      <div className="detail-widget">
        <h3>📍 로케이션 이동 & 재고 수량 관제</h3>
        {selectedProduct ? (
          <div className="detail-panel">
            <p>상품 코드: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedProduct.id}</strong></p>
            <p>상품명: <strong>{selectedProduct.name}</strong></p>
            <p>현재 위치: <strong>{selectedProduct.location}</strong> ({selectedProduct.zone})</p>

            <div className="form-group">
              <label>로케이션 이동 (Error 1):</label>
              <select 
                value={selectedProduct.location || 'LOC-A01'} 
                onChange={(e) => {
                  const locObj = locations.find(l => l.id === e.target.value);
                  setSelectedProduct({ 
                    ...selectedProduct, 
                    location: e.target.value,
                    zone: locObj?.zone || selectedProduct.zone
                  });
                }}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.id} ({loc.zone} - {loc.rack})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>재고 수량 수정 ({selectedProduct.unit}):</label>
              <div className="input-row">
                <input 
                  type="number" 
                  value={selectedProduct.stock || 0} 
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value || '0') })}
                />
                <button className="save-btn" onClick={() => triggerLocationStockRace(selectedProduct)}>
                  위치/수량 수정 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 로케이션 이동(3초 지연) 직후 재고 수량 수정(0.1초 완료) 시, 3초 뒤 이전 로케이션이 동봉된 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => testUnauthorizedStockUpdate(selectedProduct.id, 999)}>
                🔒 권한 없는 사원의 재고 수량 수정 시도 (Error 7)
              </button>
              <small className="warn-desc">* 사원 계정이 재고 수량 수정 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 상품 항목을 선택하세요.</div>
        )}
      </div>

      {/* Product Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>📦 상품 기본 정보 수정 (Error 8)</h3>
        {selectedProduct ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>상품명:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>안전재고 수량:</label>
              <input type="number" value={safetyStock} onChange={(e) => setSafetyStock(parseInt(e.target.value || '0'))} />
            </div>

            <div className="form-group">
              <label>보관 구역 (부분저장 미반영):</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="A구역">A구역</option>
                <option value="B구역">B구역</option>
                <option value="C구역">C구역</option>
              </select>
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialProductSave(selectedProduct.id, name, safetyStock, zone)}
            >
              상품 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 상품명/안전재고/보관구역을 동시에 수정하면 백엔드에는 보관구역만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 상품을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
