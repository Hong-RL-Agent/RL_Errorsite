import React from 'react';
import { Utensils } from 'lucide-react';

export default function EmptyState({ title = "등록된 레시피가 없습니다", message = "새로운 요리 아이디어를 등록하거나 검색 조건을 변경해보세요.", onAction, actionLabel }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: 'var(--cream-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--beige-border)',
      margin: '20px 0'
    }}>
      <Utensils size={44} color="var(--text-light)" style={{ marginBottom: '16px' }} />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 20px' }}>
        {message}
      </p>
      {onAction && actionLabel && (
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
