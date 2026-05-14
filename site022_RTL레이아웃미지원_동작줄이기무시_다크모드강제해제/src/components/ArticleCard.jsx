import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function ArticleCard({ article, onClick }) {
  return (
    <div className="article-card ltr-fixed" onClick={() => onClick(article)} style={{ cursor: 'pointer' }}>
      <img src={article.thumbnail} alt={article.title} />
      <div className="article-content">
        <div className="article-category">{article.category}</div>
        <h3 className="article-title">{article.title}</h3>
        <div className="flex items-center gap-10" style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>{article.time}</span>
          <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={12} /> {article.comments}
          </span>
        </div>
      </div>
    </div>
  );
}
