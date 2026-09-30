import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquarePlus } from 'lucide-react';
import CommunityPost from '../components/CommunityPost';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function Community({ user, navigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('전체');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('후기');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState('');

  const categories = ['전체', '후기', '정보', '공지'];

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts({ category, search });
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await api.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        imageUrl: newImage.trim() || null
      });
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      setNewImage('');
      fetchPosts();
    } catch (err) {
      alert(err.message || '게시글 작성에 실패했습니다.');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <div className="community-header-bar">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            이웃 커뮤니티
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            봉사활동 생생 후기와 준비 꿀팁, 따뜻한 이야기를 이웃들과 나누어보세요.
          </p>
        </div>

        <button className="btn-primary" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>게시글 작성</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="category-pills-row" style={{ marginBottom: 0 }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="커뮤니티 글 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
          />
          <button className="btn-secondary" onClick={fetchPosts} style={{ padding: '8px 14px' }}>
            <Search size={15} />
          </button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          게시글을 불러오는 중입니다...
        </div>
      ) : posts.length === 0 ? (
        <EmptyState 
          title="등록된 게시글이 없습니다"
          message="첫 번째 이야기의 주인공이 되어보세요!"
          actionLabel="게시글 작성하기"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="post-card-list">
          {posts.map(post => (
            <CommunityPost 
              key={post.id} 
              post={post} 
              onClick={() => navigate(`/community/${post.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">새 게시글 작성</h3>
              <button className="icon-button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">분류</label>
                <select 
                  className="form-select" 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="후기">활동 후기</option>
                  <option value="정보">봉사 정보/꿀팁</option>
                  <option value="공지">주최자 공지</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">제목</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="제목을 입력하세요" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">내용</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="활동 소감이나 전하고 싶은 이야기를 자유롭게 작성해주세요" 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">사진 URL (선택사항)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://example.com/photo.jpg" 
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
