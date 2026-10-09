import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';

export default function MenuOptionModal({
  menu,
  isOpen,
  onClose,
  onAddToCart
}) {
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !menu) return null;

  const toggleOption = (optId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  const optionPrices = (menu.options || [])
    .filter((o) => selectedOptionIds.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0);

  const totalPrice = (menu.price + optionPrices) * quantity;

  const handleSubmit = () => {
    onAddToCart(menu.id, quantity, selectedOptionIds);
    setSelectedOptionIds([]);
    setQuantity(1);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sheet-header">
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{menu.name}</h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-sheet-body">
          <div style={{ display: 'flex', gap: 16 }}>
            <img
              src={menu.image_url}
              alt={menu.name}
              style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{menu.description}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: 'var(--coral-primary)' }}>
                기본 가격: {menu.price?.toLocaleString()}원
              </div>
            </div>
          </div>

          {menu.options && menu.options.length > 0 && (
            <div>
              <div className="option-group-title">추가 선택 옵션 (중복 선택 가능)</div>
              {menu.options.map((opt) => {
                const isChecked = selectedOptionIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`option-choice-item ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleOption(opt.id)}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ accentColor: 'var(--coral-primary)' }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{opt.name}</span>
                    </label>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 700, color: 'var(--coral-primary)' }}>
                      +{opt.price?.toLocaleString()}원
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>수량 선택</span>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', width: 32, height: 32, cursor: 'pointer' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ padding: '0 12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fff' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', width: 32, height: 32, cursor: 'pointer' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="modal-sheet-footer">
          <button className="btn-add-to-cart-submit" onClick={handleSubmit}>
            {totalPrice.toLocaleString()}원 담기
          </button>
        </div>
      </div>
    </div>
  );
}
