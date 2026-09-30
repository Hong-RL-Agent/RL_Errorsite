import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function EmptyState({ 
  icon, 
  title = "항목이 없습니다", 
  description = "새로운 클래스를 탐색하고 취미를 시작해보세요.",
  actionText,
  onAction
}) {
  return (
    <div style={{
      padding: '48px 20px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'var(--soft-blue-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--soft-blue)',
        marginBottom: 4
      }}>
        {icon || <Sparkles size={28} />}
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.5 }}>{description}</p>

      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="btn btn-primary"
          style={{ marginTop: 8 }}
        >
          <span>{actionText}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
