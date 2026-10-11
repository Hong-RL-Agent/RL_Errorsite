import React, { useState } from 'react';
import { likePost, unlikePost } from '../api';
import { assetUrl } from '../api/client';
import { emitPostEvent } from '../hooks/postEvents';
import { useToast } from '../hooks/useToast.jsx';
import { formatDate } from '../utils/format';
import Avatar from './Avatar';
import { StatusBadge } from './Feedback';

export default function PostCard({ post, onOpen, onOpenProfile }) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const toggleLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = post.liked_by_me ? await unlikePost(post.id) : await likePost(post.id);
      emitPostEvent({ type: 'update', id: post.id, patch: { liked_by_me: res.liked, like_count: res.like_count } });
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card post-card">
      <header className="post-head">
        <Avatar user={post.author} size={40} onClick={() => onOpenProfile(post.author.id)} />
        <div className="post-author">
          <button className="link-btn" onClick={() => onOpenProfile(post.author.id)}>{post.author.display_name}</button>
          <span className="muted">@{post.author.username} · {formatDate(post.created_at)}</span>
        </div>
        {post.is_mine && <StatusBadge tone="lavender">내 게시물</StatusBadge>}
      </header>

      <img
        className="post-image"
        src={assetUrl(post.image_url)}
        alt={`${post.author.display_name}의 게시물`}
        loading="lazy"
        onClick={() => onOpen(post.id)}
      />

      <div className="post-actions">
        <button className={`action-btn${post.liked_by_me ? ' on' : ''}`} onClick={toggleLike} aria-pressed={post.liked_by_me}>
          {post.liked_by_me ? '❤️' : '🤍'} <span>{post.like_count}</span>
        </button>
        <button className="action-btn" onClick={() => onOpen(post.id)}>
          💬 <span>{post.comment_count}</span>
        </button>
      </div>

      <p className="post-caption">{post.caption}</p>
      {post.comment_count > 0 && (
        <button className="link-btn muted" onClick={() => onOpen(post.id)}>댓글 {post.comment_count}개 모두 보기</button>
      )}
    </article>
  );
}
