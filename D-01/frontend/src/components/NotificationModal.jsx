import React from 'react';
import { Bell, CheckCheck, X, Info, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkRead 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '480px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={18} color="#A78BFA" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              시스템 알림 센터
            </h3>
          </div>
          <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              새로운 알림이 없습니다.
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: n.is_read ? 'var(--bg-input)' : 'rgba(139, 92, 246, 0.08)',
                  border: n.is_read ? '1px solid var(--border-subtle)' : '1px solid rgba(139, 92, 246, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {!n.is_read && (
                  <span style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#8B5CF6'
                  }} />
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {n.title}
                  </span>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)'
                  }}>
                    {n.category}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '8px' }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {n.created_at}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: n.is_read ? 'var(--text-muted)' : '#A78BFA' }}>
                    {n.is_read ? '확인됨' : '클릭하여 읽음 표시'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
