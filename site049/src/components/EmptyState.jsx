import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ title = "데이터가 없습니다", message = "조건을 변경하거나 새로운 활동을 탐색해보세요.", onAction, actionLabel }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: 'var(--surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--cream-border)',
      margin: '20px 0'
    }}>
      <SearchX size={48} color="var(--text-light)" style={{ marginBottom: '16px' }} />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 20px' }}>
        {message}
      </p>
      {onAction && actionLabel && (
        <button className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '10px 20px' }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
