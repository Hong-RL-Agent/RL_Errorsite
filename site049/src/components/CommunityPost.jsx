import React from 'react';
import { Eye, Heart, MessageSquare, User } from 'lucide-react';

export default function CommunityPost({ post, onClick }) {
  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-card-header">
        <span className={`post-category-tag ${post.category}`}>
          {post.category}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
          {post.createdAt}
        </span>
      </div>

      <h3 className="post-card-title">{post.title}</h3>
      <p className="post-card-excerpt">{post.content}</p>

      <div className="post-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} color="var(--primary)" />
          <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{post.authorName}</span>
        </div>

        <div className="post-stats-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} />
            <span>{post.views}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={14} color="#e11d48" />
            <span>{post.likes}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={14} color="#2563eb" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
