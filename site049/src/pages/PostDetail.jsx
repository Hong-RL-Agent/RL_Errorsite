import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Heart, MessageSquare, Send, Trash2, Edit3, User, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function PostDetail({ id, user, navigate }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  const loadPostAndComments = async () => {
    setLoading(true);
    try {
      const p = await api.getPost(id);
      setPost(p);
      const c = await api.getComments(id);
      setComments(c || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.likePost(id);
      setPost(prev => ({ ...prev, likes: res.likes }));
      setLiked(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const created = await api.createComment(id, { content: newComment.trim() });
      setComments(prev => [...prev, created]);
      setNewComment('');
      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
    } catch (err) {
      alert(err.message || '댓글 등록에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await api.deletePost(id);
      navigate('/community');
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-light)' }}>
        게시글을 불러오는 중입니다...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>게시글을 찾을 수 없습니다.</h2>
        <button className="btn-primary" style={{ display: 'inline-flex', width: 'auto', marginTop: '16px' }} onClick={() => navigate('/community')}>
          커뮤니티 목록으로
        </button>
      </div>
    );
  }

  const isAuthor = user && (user.id === post.authorId || user.name === post.authorName);

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => navigate('/community')}
      >
        <ArrowLeft size={18} />
        <span>커뮤니티 목록으로</span>
      </button>

      {/* Post Article */}
      <article style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--cream-border)',
        padding: '36px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span className={`post-category-tag ${post.category}`}>
            {post.category}
          </span>
          {isAuthor && (
            <button className="btn-danger-outline" onClick={handleDeletePost}>
              <Trash2 size={14} />
              <span>삭제</span>
            </button>
          )}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.3' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-light)', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color="var(--primary)" />
            <strong style={{ color: 'var(--text-main)' }}>{post.authorName}</strong>
            <span>•</span>
            <span>{post.createdAt}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={15} /> {post.views}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={15} color="#e11d48" /> {post.likes}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={15} color="#2563eb" /> {comments.length}</span>
          </div>
        </div>

        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }} 
          />
        )}

        <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>
          {post.content}
        </div>

        {/* Like Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn-secondary"
            onClick={handleLike}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              color: liked ? '#e11d48' : 'var(--text-main)',
              borderColor: liked ? '#fecaca' : 'var(--cream-border)',
              background: liked ? '#fff1f2' : 'var(--cream-alt)'
            }}
          >
            <Heart size={18} fill={liked ? '#e11d48' : 'none'} color={liked ? '#e11d48' : 'currentColor'} />
            <span style={{ fontWeight: '700' }}>응원해요 ({post.likes})</span>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--cream-border)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <span>댓글 ({comments.length})</span>
        </h3>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          <input 
            type="text" 
            placeholder="따뜻한 응원이나 질문을 남겨보세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>
            <Send size={16} />
            <span>등록</span>
          </button>
        </form>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map(c => (
            <div 
              key={c.id}
              style={{
                padding: '16px 20px',
                background: 'var(--cream-alt)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--cream-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{c.authorName}</span>
                  {c.authorRole === 'organizer' && (
                    <span className="user-role-badge organizer" style={{ fontSize: '0.7rem' }}>주최자</span>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{c.createdAt}</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
