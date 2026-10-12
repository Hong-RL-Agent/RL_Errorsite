import React from 'react';

export default function AccountCard({ user }) {
  if (!user) return null;

  return (
    <div className="account-banner">
      <div className="account-avatar-large">
        {user.avatar || '👤'}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {user.name}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            (@{user.username})
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {user.email}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {user.bio || '등록된 한줄 소개가 없습니다.'}
        </p>
      </div>
    </div>
  );
}
