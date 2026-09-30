import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, ThumbsUp, User, Search, RefreshCw } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { fetchApi } from '../api/client';

export default function Community({ onSelectPost, onShowToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Create Post Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('후기');
  const [content, setContent] = useState('');

  const loadPosts = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (selectedCategory && selectedCategory !== 'all') queryParams.append('category', selectedCategory);

    fetchApi(`/api/posts?${queryParams.toString()}`)
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPosts();
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    fetchApi('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        content
      })
    })
      .then(newPost => {
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        if (onShowToast) onShowToast('커뮤니티 글이 등록되었습니다.', 'success');
        loadPosts();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  const categories = [
    { id: 'all', label: '전체 글' },
    { id: '후기', label: '수강 후기' },
    { id: '모임', label: '출사/동행 모임' },
    { id: '질문', label: '취미 Q&A' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Controls */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
            수강생 커뮤니티
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            클래스 참여 생생 후기, 취미 질문, 출사 동행을 자유롭게 나눠보세요.
          </p>
        </div>

        <button 
          id="btn-open-create-post"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>게시글 작성</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              id={`tab-community-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: selectedCategory === cat.id ? 'var(--soft-blue)' : '#ffffff',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-main)',
                border: '1px solid var(--border-color)'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, maxWidth: 300, width: '100%' }}>
          <input
            id="input-post-search"
            type="text"
            placeholder="게시글 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="form-input"
            style={{ padding: '6px 12px', fontSize: 13 }}
          />
          <button type="submit" className="btn btn-navy btn-sm">
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* Posts List */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          게시글 목록을 불러오는 중입니다...
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={32} />}
          title="등록된 게시글이 없습니다"
          description="첫 번째로 취미 커뮤니티에 이야기를 공유해보세요."
          actionText="게시글 작성하기"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map(post => (
            <div
              key={post.id}
              id={`post-card-${post.id}`}
              onClick={() => onSelectPost && onSelectPost(post.id)}
              className="card"
              style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-blue">{post.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)' }}>
                {post.title}
              </h3>

              <p style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.content}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 10,
                borderTop: '1px solid var(--border-light)',
                fontSize: 12,
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={post.authorAvatar} alt={post.authorName} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                  <span>{post.authorName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ThumbsUp size={13} color="var(--soft-blue)" />
                  <span>{post.likes || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새로운 커뮤니티 글 작성"
      >
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">분류 카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
              <option value="후기">수강 후기</option>
              <option value="모임">출사/동행 모임</option>
              <option value="질문">취미 Q&A</option>
              <option value="자유">자유 수다</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">제목</label>
            <input
              id="input-create-post-title"
              type="text"
              placeholder="게시글 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">본문 내용</label>
            <textarea
              id="textarea-create-post-content"
              rows={5}
              placeholder="솔직한 후기나 궁금한 점을 작성해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-submit-create-post" type="submit" className="btn btn-primary">
              게시글 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
