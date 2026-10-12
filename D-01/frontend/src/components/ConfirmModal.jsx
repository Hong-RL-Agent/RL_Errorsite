import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = '해지 확인',
  cancelText = '취소'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 110 }}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '440px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FDA4AF' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              {title}
            </h3>
          </div>
          <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={onCancel}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {message}
          </p>
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-muted)', 
            background: 'var(--bg-input)', 
            padding: '12px', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            해지 신청 즉시 잔여 기간 동안만 이용 가능하며, 이후 모든 데이터 접근 권한이 제한될 수 있습니다.
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 24px' }}>
          <button className="btn btn-outline btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
