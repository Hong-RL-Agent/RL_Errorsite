import React from 'react';

export default function TrendingSidebar({ keywords, articles }) {
  return (
    <aside className="trending-sidebar">
      <div style={{ marginBottom: '40px' }}>
        <h3>Popular Keywords</h3>
        <div className="flex flex-wrap gap-10" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {keywords.map(kw => (
            <span key={kw} style={{ background: '#eee', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>#{kw}</span>
          ))}
        </div>
      </div>

      <div>
        <h3>Trending Now</h3>
        <ul className="trending-list">
          {articles.map((art, index) => (
            <li key={art.id} className="trending-item">
              <span className="trending-num">{index + 1}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3, marginBottom: '5px' }}>{art.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{art.views} views</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
