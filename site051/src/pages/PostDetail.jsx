import React, { useState } from 'react';
import { ArrowLeft, Heart, Eye, MessageSquare, Send, User } from 'lucide-react';

export default function PostDetail({ id, user, navigate }) {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, authorName: "이주원", content: "정말 알찬 꿀팁이네요! 저장해둡니다.", createdAt: "2026-09-24 17:00" },
    { id: 2, authorName: "박서준", content: "동쪽 버스 배차 정보 감사해요~", createdAt: "2026-09-24 18:30" }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const c = {
      id: Date.now(),
      authorName: user ? user.name : "김민지",
      content: newComment.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setComments([...comments, c]);
    setNewComment('');
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '820px' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => navigate('/community')}
      >
        <ArrowLeft size={18} />
        <span>커뮤니티 목록으로</span>
      </button>

      <article style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'inline-block', marginBottom: '12px' }}>
          여행 팁
        </span>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
          제주도 렌터카 vs 뚜벅이 버스여행 솔직 비교 후기 🚗🚌
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color="var(--primary)" />
            <strong style={{ color: 'var(--text-main)' }}>김민지</strong>
            <span>• 2026-09-24 16:00</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> 280</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} color="#f43f5e" /> {35 + (liked ? 1 : 0)}</span>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>
          제주 여행 5번 다녀오면서 느낀 건 동쪽 코스(함덕, 김녕)는 버스도 생각보다 배차가 괜찮은데, 서귀포 중산간 쪽 오름이나 숲길은 무조건 렌터카가 훨씬 시간 절약이 됩니다! 일정 짤 때 동쪽 해안가 위주라면 뚜벅이도 충분히 추천드려요.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn-secondary"
            onClick={() => setLiked(!liked)}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              color: liked ? '#f43f5e' : 'var(--text-main)',
              borderColor: liked ? '#fecdd3' : 'var(--sand-border)',
              background: liked ? '#fff1f2' : 'var(--sand)'
            }}
          >
            <Heart size={18} fill={liked ? '#f43f5e' : 'none'} color={liked ? '#f43f5e' : 'currentColor'} />
            <span style={{ fontWeight: '700' }}>도움이 돼요 ({35 + (liked ? 1 : 0)})</span>
          </button>
        </div>
      </article>

      {/* Comments */}
      <section style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <span>댓글 ({comments.length})</span>
        </h3>

        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="댓글을 입력하세요..." 
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding: '14px 18px', background: 'var(--sand)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.authorName}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.createdAt}</span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>{c.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
