import React from 'react';

export function Spinner({ label = '불러오는 중…' }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function PostSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton skeleton-image" />
          <div className="skeleton skeleton-line" style={{ width: '70%' }} />
        </div>
      ))}
    </>
  );
}

export function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🫧</div>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}

export function ErrorNotice({ message }) {
  return <div className="error-notice">{message}</div>;
}

export function StatusBadge({ tone = 'coral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
