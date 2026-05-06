import React from 'react';

export default function ArticleHero({ article, onClick }) {
  if (!article) return null;
  return (
    <section className="article-hero" onClick={() => onClick(article)} style={{ cursor: 'pointer' }}>
      <img src={article.thumbnail} alt={article.title} />
      <div className="article-category">{article.category}</div>
      <h2>{article.title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{article.summary}</p>
      <div style={{ marginTop: '15px', fontSize: '14px', fontWeight: 600 }}>
        By {article.author} <span style={{ margin: '0 10px', color: '#ccc' }}>|</span> {article.time}
      </div>
    </section>
  );
}
