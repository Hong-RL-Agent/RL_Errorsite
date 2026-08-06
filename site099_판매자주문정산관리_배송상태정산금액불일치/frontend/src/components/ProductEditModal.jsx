import React, { useState } from 'react';

export default function ProductEditModal({ product, onClose, onConfirm }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || 10000);
  const [shippingFee, setShippingFee] = useState(product?.shippingFee || 2500);

  if (!product) return null;

  const handleSave = () => {
    onConfirm(product.id, name, price, shippingFee);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🛍️ 상품 기본 정보 및 가격 수정</h3>
        <p>상품 ID: <strong style={{ color: 'var(--color-primary)' }}>{product.id}</strong> ({product.name})</p>

        <div className="form-group">
          <label>상품명:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>판매 가격:</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0'))} />
        </div>

        <div className="form-group">
          <label>기본 배송비:</label>
          <input type="number" value={shippingFee} onChange={(e) => setShippingFee(parseInt(e.target.value || '0'))} />
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
