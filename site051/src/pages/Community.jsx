import React, { useState } from 'react';
import { Plus, MessageSquare, Heart, Eye, User } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const initialPosts = [
  {
    id: 1,
    title: "제주도 렌터카 vs 뚜벅이 버스여행 솔직 비교 후기 🚗🚌",
    content: "제주 여행 5번 다녀오면서 느낀 건 동쪽 코스(함덕, 김녕)는 버스도 생각보다 배차가 괜찮은데, 서귀포 중산간 쪽 오름이나 숲길은 무조건 렌터카가 훨씬 시간 절약이 됩니다!",
    category: "여행팁",
    authorName: "김민지",
    likes: 35,
    views: 280,
    commentsCount: 6,
    createdAt: "2026-09-24 16:00"
  },
  {
    id: 2,
    title: "오사카 간사이공항 입국 심사 비짓재팬웹(VJW) QR 꿀팁 ✈️",
    content: "비행기 착륙 전에 미리 스크린샷 캡처해두시면 공항 와이파이 안 터져도 버벅임 없이 1분 컷으로 입국 심사 통과 가능해요. 여권 정보랑 입국 날짜 다시 한번 확인하세요!",
    category: "여행정보",
    authorName: "이주원",
    likes: 42,
    views: 310,
    commentsCount: 4,
    createdAt: "2026-09-25 11:30"
  },
  {
    id: 3,
    title: "부산 영도 흰여울마을 숨은 노을 스팟 추천 🌅",
    content: "해안터널 지나서 나오는 자갈마당 쪽 벤치가 해 질 녘에 사람도 덜 붐비고 사진도 정말 그림처럼 나와요!",
    category: "명소추천",
    authorName: "박서준",
    likes: 29,
    views: 190,
    commentsCount: 3,
    createdAt: "2026-09-25 18:20"
  }
];

export default function Community({ user, navigate }) {
  const [posts, setPosts] = useState(initialPosts);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('여행팁');
  const [content, setContent] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newP = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category,
      authorName: user ? user.name : "김민지",
      likes: 0,
      views: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setPosts([newP, ...posts]);
    setShowModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '880px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            여행자 커뮤니티
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            여행 꿀팁, 실시간 현지 날씨, 동행 찾기 등 다양한 이야기를 나눠보세요.
          </p>
        </div>

        <button className="btn-primary" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>이야기 작성</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.map(p => (
          <div 
            key={p.id}
            style={{
              background: 'var(--sand-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--sand-border)',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            onClick={() => navigate(`/community/${p.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                {p.category}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{p.createdAt}</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              {p.title}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {p.content}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--primary)" />
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.authorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Eye size={13} /> {p.views}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Heart size={13} color="#f43f5e" /> {p.likes}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MessageSquare size={13} color="var(--primary)" /> {p.commentsCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">새 이야기 작성</h3>
              <button className="icon-button" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="여행팁">여행 팁/노하우</option>
                  <option value="여행정보">실시간 여행 정보</option>
                  <option value="명소추천">숨은 명소 추천</option>
                  <option value="자유수다">자유 수다</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">제목</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">내용</label>
                <textarea 
                  className="form-textarea" 
                  rows={6}
                  placeholder="여행자들과 나누고 싶은 이야기를 적어주세요"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
