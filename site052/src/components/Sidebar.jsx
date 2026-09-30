import React from 'react';

export default function Sidebar({ activePage, setActivePage, filterBranch, setFilterBranch, branches = [] }) {
  return (
    <aside style={{
      width: '240px',
      background: 'white',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      padding: '20px',
      height: 'fit-content'
    }}>
      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-500)', textTransform: 'uppercase', marginBottom: '12px' }}>
        센터 지점 바로가기
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => { setFilterBranch('all'); setActivePage('rooms'); }}
          style={{
            textAlign: 'left',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: filterBranch === 'all' ? '700' : '500',
            color: filterBranch === 'all' ? 'var(--indigo-600)' : 'var(--navy-700)',
            background: filterBranch === 'all' ? 'var(--indigo-50)' : 'transparent',
            transition: 'var(--transition)'
          }}
        >
          📍 전체 지점 (All)
        </button>
        {branches.map(b => (
          <button
            key={b.id}
            onClick={() => { setFilterBranch(b.name); setActivePage('rooms'); }}
            style={{
              textAlign: 'left',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: filterBranch === b.name ? '700' : '500',
              color: filterBranch === b.name ? 'var(--indigo-600)' : 'var(--navy-700)',
              background: filterBranch === b.name ? 'var(--indigo-50)' : 'transparent',
              transition: 'var(--transition)'
            }}
          >
            {b.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
