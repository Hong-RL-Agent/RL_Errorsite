import React, { useState } from 'react';

export default function ProductEditModal({ product, onClose, onConfirm }) {
  const [name, setName] = useState(product?.name || '');
  const [safetyStock, setSafetyStock] = useState(product?.safetyStock || 20);
  const [zone, setZone] = useState(product?.zone || 'A구역');

  if (!product) return null;

  const handleSave = () => {
    onConfirm(product.id, name, safetyStock, zone);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📦 상품 기본 정보 및 안전재고 수정</h3>
        <p>상품 코드: <strong style={{ color: 'var(--color-primary)' }}>{product.id}</strong> ({product.name})</p>

        <div className="form-group">
          <label>상품명:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>안전재고 수량:</label>
          <input type="number" value={safetyStock} onChange={(e) => setSafetyStock(parseInt(e.target.value || '0'))} />
        </div>

        <div className="form-group">
          <label>보관 구역:</label>
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="A구역">A구역</option>
            <option value="B구역">B구역</option>
            <option value="C구역">C구역</option>
          </select>
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)', color: '#ffffff' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장 확정
          </button>
        </div>
      </div>
    </div>
  );
}
