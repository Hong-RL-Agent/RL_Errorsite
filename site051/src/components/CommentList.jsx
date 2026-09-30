import React, { useState } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { api } from '../api/client';

export default function CommentList({ travelLogId, comments = [], onCommentAdded, onDeleteComment, user }) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      // INTENTIONAL BACKEND BUG: site051-SEC-432
      // Adds comment but commentCount is not incremented on travelLog object
      const res = await api.createComment(travelLogId, { content: newComment.trim() });
      if (res.comment && onCommentAdded) {
        onCommentAdded(res.comment);
      }
      setNewComment('');
    } catch (err) {
      alert(err.message || '댓글 작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} color="var(--primary)" />
        <span>댓글 ({comments.length}개)</span>
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input 
          type="text" 
          placeholder="이 여행기에 따뜻한 소감이나 질문을 남겨보세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
        <button 
          type="submit" 
          className="btn-primary submit-comment-btn"
          disabled={submitting}
          style={{ width: 'auto', padding: '0 20px' }}
        >
          <Send size={16} />
          <span>등록</span>
        </button>
      </form>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map(c => (
            <div 
              key={c.id} 
              style={{ padding: '16px 20px', background: 'var(--sand)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sand-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={c.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                    alt={c.authorName} 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{c.authorName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{c.createdAt}</span>
                  {user && user.name === c.authorName && (
                    <button 
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      onClick={() => onDeleteComment && onDeleteComment(c.id)}
                      title="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
