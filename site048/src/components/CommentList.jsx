import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { fetchApi } from '../api/client';

export default function CommentList({ postId, comments, onRefresh, onShowToast }) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    fetchApi(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: commentText })
    })
      .then(() => {
        setCommentText('');
        setSubmitting(false);
        if (onShowToast) onShowToast('댓글이 등록되었습니다.', 'success');
        if (onRefresh) onRefresh();
      })
      .catch(err => {
        setSubmitting(false);
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={16} color="var(--soft-blue)" /> 댓글 ({comments.length})
      </h4>

      {/* Add Comment Box */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
        <input
          id="input-new-comment"
          type="text"
          placeholder="따뜻한 댓글과 의견을 남겨주세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="form-input"
          disabled={submitting}
        />
        <button id="btn-submit-comment" type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0 18px' }}>
          <Send size={15} />
        </button>
      </form>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {comments.map(c => (
          <div
            key={c.id}
            id={`comment-item-${c.id}`}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--cream-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={c.authorAvatar} alt={c.authorName} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                <strong style={{ fontSize: 12, color: 'var(--primary-navy)' }}>{c.authorName}</strong>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 2, paddingLeft: 30 }}>
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
