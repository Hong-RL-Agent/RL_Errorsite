import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConflictModal({
  isOpen,
  onClose,
  errorMessage
}) {
  if (!isOpen) return null;

  return (
    <div className="conflict-modal-overlay" onClick={onClose}>
      <div className="conflict-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="conflict-header">
          <AlertTriangle size={24} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700 }}>
            409 Conflict — 결제 실패
          </h3>
        </div>

        <p style={{ fontSize: 14, color: '#f7f4ef', lineHeight: 1.6, marginBottom: 16 }}>
          결제를 완료할 수 없습니다. 상품 재고가 부족합니다.
        </p>

        <div style={{
          background: 'var(--bg-pine-deep)',
          padding: 14,
          borderRadius: 8,
          border: '1px solid rgba(244, 63, 94, 0.3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          color: '#fb7185',
          marginBottom: 20
        }}>
          {errorMessage || 'OUT_OF_STOCK: Requested quantity exceeds available backend inventory in database.'}
        </div>

        <button
          className="btn-place-order"
          style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', color: '#fb7185' }}
          onClick={onClose}
        >
          확인 및 장바구니로 돌아가기
        </button>
      </div>
    </div>
  );
}
