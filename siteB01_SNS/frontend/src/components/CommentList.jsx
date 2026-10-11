import React from 'react';
import { formatDate } from '../utils/format';
import Avatar from './Avatar';

export default function CommentList({ comments, onDelete, onOpenProfile }) {
  if (comments.length === 0) return <p className="muted comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.</p>;
  return (
    <ul className="comment-list">
      {comments.map((c) => (
        <li key={c.id} className="comment-item">
          <Avatar user={c.author} size={32} onClick={() => onOpenProfile(c.author.id)} />
          <div className="comment-body">
            <div>
              <button className="link-btn" onClick={() => onOpenProfile(c.author.id)}>{c.author.display_name}</button>{' '}
              <span className="comment-text">{c.content}</span>
            </div>
            <span className="muted small">{formatDate(c.created_at)}</span>
          </div>
          {c.is_mine && (
            <button className="link-btn danger small" onClick={() => onDelete(c.id)}>삭제</button>
          )}
        </li>
      ))}
    </ul>
  );
}
