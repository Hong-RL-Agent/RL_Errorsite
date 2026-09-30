import React from 'react';
import { Eye, Heart, MessageSquare, User } from 'lucide-react';

export default function CommunityPost({ post, onClick }) {
  return (
    <div 
      style={{
        background: 'var(--cream-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--beige-border)',
        padding: '24px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ 
          fontSize: '0.78rem', 
          fontWeight: '700', 
          padding: '3px 8px', 
          borderRadius: 'var(--radius-full)', 
          background: post.category === '꿀팁' ? 'var(--sage-light)' : 'var(--warm-beige)',
          color: post.category === '꿀팁' ? 'var(--primary-dark)' : 'var(--text-muted)'
        }}>
          {post.category}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{post.createdAt}</span>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
        {post.title}
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.content}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} color="var(--primary)" />
          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{post.authorName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Eye size={13} /> {post.views}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Heart size={13} color="#ea580c" /> {post.likes}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MessageSquare size={13} color="var(--primary)" /> {post.commentsCount}</span>
        </div>
      </div>
    </div>
  );
}
