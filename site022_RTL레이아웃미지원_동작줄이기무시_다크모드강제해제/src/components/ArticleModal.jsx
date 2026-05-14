import React from 'react';
import { X, Share2, Bookmark } from 'lucide-react';

export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <div className="article-category">{article.category}</div>
        <h2 style={{ fontSize: '36px', margin: '10px 0 20px 0', lineHeight: 1.1 }}>{article.title}</h2>
        
        <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: '14px' }}>
            <strong>By {article.author}</strong> <br/>
            <span style={{ color: 'var(--text-muted)' }}>Published {article.time}</span>
          </div>
          <div className="flex gap-10" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ background: 'none', border: '1px solid #ddd' }}><Share2 size={18} /></button>
            <button className="btn btn-outline" style={{ background: 'none', border: '1px solid #ddd' }}><Bookmark size={18} /></button>
          </div>
        </div>

        <img src={article.thumbnail} alt={article.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '30px' }} />

        <div style={{ lineHeight: 1.8, color: '#333', fontSize: '18px' }}>
          <p style={{ marginBottom: '20px' }}>{article.summary}</p>
          <p style={{ marginBottom: '20px' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
    </div>
  );
}
