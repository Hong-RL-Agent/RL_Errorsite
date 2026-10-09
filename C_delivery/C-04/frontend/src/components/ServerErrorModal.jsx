import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

export default function ServerErrorModal({
  isOpen,
  onClose,
  errorMessage
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop-overlay" onClick={onClose} />
      <div className="modal-dialog-box" style={{ maxWidth: 480, border: '1px solid rgba(244, 63, 94, 0.4)' }}>
        <div className="modal-header" style={{ background: 'rgba(244, 63, 94, 0.08)' }}>
          <div className="error-modal-header">
            <AlertOctagon size={20} />
            <h3>500 Internal Server Error</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="error-code-badge">HTTP 500</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Server execution faulted</span>
          </div>
          <p style={{ fontSize: 13.5, color: '#f8fafc', lineHeight: 1.6, marginBottom: 16 }}>
            {errorMessage || '서버 처리 중 예기치 않은 오류가 발생하였습니다. 데이터 스트림 버퍼 크기 초과로 인해 요청이 중단되었습니다.'}
          </p>
          <div style={{
            background: 'var(--bg-input)',
            padding: 12,
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            color: '#fb7185',
            border: '1px solid rgba(244, 63, 94, 0.2)'
          }}>
            Error: Length constraint violation at BufferStream.write() - Payload exceeded maximum allowable uncompressed limit.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-draft"
            style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }}
            onClick={onClose}
          >
            확인 (Close)
          </button>
        </div>
      </div>
    </>
  );
}
