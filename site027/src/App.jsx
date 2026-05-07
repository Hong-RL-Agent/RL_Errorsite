import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Dog, 
  PlusCircle, 
  TrendingUp, 
  Search, 
  Heart, 
  Clock, 
  Info, 
  X,
  PawPrint,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:9136/api';

const PostCard = ({ post, onLike, onClick }) => {
  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-img-placeholder">
        <Dog size={48} strokeWidth={1.5} />
      </div>
      <div className="post-info">
        <div className="post-header">
          <span className="post-name">{post.name}</span>
          <span className={`badge badge-${post.status}`}>{post.status}</span>
        </div>
        <div className="post-meta">
          {post.breed} • {post.age}살
        </div>
        <div className="post-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#9E9E9E' }}>
            <Clock size={14} />
            <span>{String(post.createdAt).slice(0, 10)}</span>
          </div>
          <button className="like-btn" onClick={(e) => onLike(post.id, e)}>
            <Heart size={18} fill={post.likes > 10 ? "var(--primary-orange)" : "none"} />
            <span>{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bugId, setBugId] = useState(null);

  // Fetch Overview Data
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await response.json();
      setSummary(data);
      setBugId(data.bugId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/posts?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchQuery) url += `search=${searchQuery}`;
      
      const response = await fetch(url);
      const res = await response.json();
      setPosts(res.data);
      setBugId(res.bugId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Popular Posts
  const fetchPopular = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/popular`);
      const res = await response.json();
      setPopularPosts(res.data);
      setBugId(res.bugId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Post Detail
  const fetchDetail = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`);
      const data = await response.json();
      setSelectedPost(data);
      setBugId(data.bugId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/posts/${id}/like`, { method: 'POST' });
      if (activeTab === 'posts') fetchPosts();
      if (activeTab === 'popular') fetchPopular();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'popular') fetchPopular();
    if (activeTab === 'search') setPosts([]);
  }, [activeTab, statusFilter]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/search?q=${searchQuery}`);
      const data = await response.json();
      setPosts(data);
      setBugId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <PawPrint size={32} />
          <span>DogAdopt</span>
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            data-bug-id="site027-bug04"
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
            data-bug-id="site027-bug01"
          >
            <Dog size={20} />
            Posts
          </button>
          <button 
            className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={20} />
            Create Post
          </button>
          <button 
            className={`nav-item ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
            data-bug-id="site027-bug02"
          >
            <TrendingUp size={20} />
            Popular
          </button>
          <button 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={20} />
            Search
          </button>
        </nav>

        {bugId && (
          <div style={{ marginTop: 'auto', padding: '1rem', background: '#FFF3E0', borderRadius: '12px', fontSize: '0.8rem', color: '#E65100' }}>
            <strong>Active Bug:</strong> {bugId}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>Admin User</div>
              <div style={{ fontSize: '0.8rem', color: '#795548' }}>site027-manager</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FF8D29', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
               <Info size={20} style={{ margin: 'auto' }} />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Posts</span>
                <span className="stat-value">{summary?.totalPosts || 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Likes</span>
                <span className="stat-value">{summary?.totalLikes || 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">System Status</span>
                <span className="stat-value" style={{ color: '#2E7D32', fontSize: '1.2rem' }}>Operational</span>
              </div>
            </div>
            
            <div className="welcome-banner" style={{ background: 'var(--accent-cream)', padding: '2rem', borderRadius: '24px', color: 'var(--text-dark)' }}>
              <h3>Welcome to Adoption Board</h3>
              <p>현재 {summary?.totalPosts}마리의 친구들이 새로운 가족을 기다리고 있습니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="tab-content">
            <div className="filters" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <div className="posts-grid">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onLike={handleLike} onClick={() => fetchDetail(post.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="tab-content">
             {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <div className="posts-grid">
                {popularPosts.map(post => (
                  <PostCard key={post.id} post={post} onLike={handleLike} onClick={() => fetchDetail(post.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="tab-content">
            <form onSubmit={handleSearch} className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="강아지 이름이나 품종을 검색하세요..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '0 2rem' }}>검색</button>
            </form>

            <div className="posts-grid">
              {posts.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onClick={() => fetchDetail(post.id)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="tab-content" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="stat-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>새 게시글 작성</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                fetch(`${API_BASE}/posts`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                }).then(() => setActiveTab('posts'));
              }}>
                <div className="form-group">
                  <label>이름</label>
                  <input name="name" required placeholder="예: 초코" />
                </div>
                <div className="form-group">
                  <label>나이</label>
                  <input name="age" type="number" required placeholder="예: 2" />
                </div>
                <div className="form-group">
                  <label>품종</label>
                  <input name="breed" required placeholder="예: 푸들" />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea name="description" rows="4" placeholder="성격이나 특징을 적어주세요..."></textarea>
                </div>
                <button type="submit" className="submit-btn">게시글 등록하기</button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedPost(null)} data-bug-id="site027-bug03">
                <X size={24} />
              </button>
              <h2 className="modal-title">{selectedPost.name}의 상세 정보</h2>
              <div className="post-meta" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <span className={`badge badge-${selectedPost.status}`}>{selectedPost.status}</span>
                <span>{selectedPost.breed}</span>
                <span>{selectedPost.age}살</span>
              </div>
              <div className="modal-description">
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-light)' }}>설명</h4>
                <p>{selectedPost.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                  <Clock size={16} />
                  <span>등록일: {selectedPost.createdAt}</span>
                </div>
                <button className="submit-btn" style={{ width: 'auto' }} onClick={() => setSelectedPost(null)}>닫기</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
