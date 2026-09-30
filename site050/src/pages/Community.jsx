import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquarePlus } from 'lucide-react';
import CommunityPost from '../components/CommunityPost';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function Community({ user, navigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('전체');
  const [showModal, setShowModal] = useState(false);

  // New Post Form
  const [title, setTitle] = useState('');
  const [postCategory, setPostCategory] = useState('요리자랑');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['전체', '요리자랑', '꿀팁', '자유수다'];

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts({ category });
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await api.createPost({
        title: title.trim(),
        content: content.trim(),
        category: postCategory,
        imageUrl: imageUrl.trim() || null
      });
      setShowModal(false);
      setTitle('');
      setContent('');
      setImageUrl('');
      fetchPosts();
    } catch (err) {
      alert(err.message || '작성 실패');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '880px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            홈쿡 커뮤니티
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            오늘 만든 맛있는 요리 자랑과 숨겨진 조리 꿀팁을 함께 공유해보세요.
          </p>
        </div>

        <button className="btn-primary" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>글쓰기</span>
        </button>
      </div>

      {/* Categories */}
      <div className="category-pills-row">
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

      {/* Posts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          커뮤니티 글을 불러오는 중입니다...
        </div>
      ) : posts.length === 0 ? (
        <EmptyState 
          title="등록된 글이 없습니다"
          message="첫 번째 요리 이야기를 시작해보세요!"
          actionLabel="글쓰기"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <h3 className="modal-title">커뮤니티 글 작성</h3>
              <button className="icon-button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">게시판 분류</label>
                <select className="form-select" value={postCategory} onChange={e => setPostCategory(e.target.value)}>
                  <option value="요리자랑">요리자랑</option>
                  <option value="꿀팁">요리 꿀팁</option>
                  <option value="자유수다">자유수다</option>
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
                  placeholder="레시피 후기나 조리 팁을 자유롭게 공유해주세요"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">완성 사진 URL (선택)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
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
