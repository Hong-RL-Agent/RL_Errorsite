import React from 'react';

export default function NoticeCard({ notice, onSelectNotice }) {
  return (
    <div 
      onClick={() => onSelectNotice && onSelectNotice(notice)}
      style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
      className="notice-item-hover"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {notice.important && (
            <span style={{
              background: 'var(--rose-50)',
              color: 'var(--rose-500)',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              중요
            </span>
          )}
          <span style={{ fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: '600' }}>
            {notice.branch}
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--navy-500)' }}>
          {notice.date}
        </span>
      </div>

      <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--navy-900)' }}>
        {notice.title}
      </div>

      <div style={{
        fontSize: '0.85rem',
        color: 'var(--navy-600)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {notice.content}
      </div>
    </div>
  );
}
