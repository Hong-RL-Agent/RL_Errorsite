import React, { useState } from 'react';

export default function MenuEditModal({ menu, onClose, onConfirm }) {
  const [name, setName] = useState(menu?.name || '');
  const [price, setPrice] = useState(menu?.price || 0);
  const [mainIngredient, setMainIngredient] = useState(menu?.mainIngredient || '');

  if (!menu) return null;

  const handleSave = () => {
    onConfirm(menu.id, name, price, mainIngredient);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🍕 레스토랑 메뉴명, 가격 및 주재료 수정</h3>
        <p>메뉴 ID: <strong style={{ color: 'var(--color-primary)' }}>{menu.id}</strong> ({menu.name})</p>

        <div className="form-group">
          <label>메뉴명:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>판매 가격:</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>

        <div className="form-group">
          <label>대표 주재료:</label>
          <input type="text" value={mainIngredient} onChange={(e) => setMainIngredient(e.target.value)} />
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
