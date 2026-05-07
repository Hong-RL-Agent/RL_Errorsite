import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Clock, 
  Star, 
  Layout, 
  List, 
  History, 
  AlertCircle,
  Menu,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({});
  const [sortBy, setSortBy] = useState('latest');
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const fetchPosts = async (sort = 'latest') => {
    setLoading(true);
    setBugInfo(null);
    try {
      const url = sort === 'popular' ? `${API_BASE}/posts?sort=popular` : `${API_BASE}/posts`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.data);
      if (data.bugId) setBugInfo({ id: data.bugId, type: '정렬/순서 오류' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setBugInfo(null);
    try {
      const res = await fetch(`${API_BASE}/recommendations`);
      const data = await res.json();
      setRecommendations(data.data);
      if (data.bugId) setBugInfo({ id: data.bugId, type: '추천 가중치 역전' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setBugInfo(null);
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data.data);
      if (data.bugId) setBugInfo({ id: data.bugId, type: '최신성 반영 실패' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`${API_BASE}/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      // Refresh current view
      if (activeTab === 'feed') fetchPosts(sortBy);
      else if (activeTab === 'recommendations') fetchRecommendations();
      fetchSummary();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') fetchPosts(sortBy);
    else if (activeTab === 'ranking') fetchPosts('popular');
    else if (activeTab === 'recommendations') fetchRecommendations();
    else if (activeTab === 'logs') fetchLogs();
    fetchSummary();
  }, [activeTab, sortBy]);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <TrendingUp size={32} />
          <span>PostRank</span>
        </div>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
            <Layout size={20} /> Feed
          </li>
          <li className={`nav-item ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>
            <Star size={20} /> Ranking
          </li>
          <li className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
            <ThumbsUp size={20} /> Recommendations
          </li>
          <li className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> Audit Logs
          </li>
        </ul>

        <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>SYSTEM ACTIVE</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#888' }}>Version 086.1.0 (Stable)</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>{activeTab === 'feed' ? 'Community Feed' : activeTab === 'ranking' ? 'Top Rankings' : activeTab === 'recommendations' ? 'For You' : 'System Logs'}</h1>
            <p style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{summary.totalPosts} posts • {summary.totalViews?.toLocaleString()} views • {summary.totalLikes?.toLocaleString()} likes</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#999' }} size={18} />
              <input 
                type="text" 
                placeholder="Search posts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid var(--border)', width: '250px' }} 
              />
            </div>
            <button className="btn-primary" style={{ background: '#000' }} onClick={() => alert("새 게시글 작성 기능을 준비 중입니다.")}><MessageSquare size={18} /> Write</button>
          </div>
        </header>

        {activeTab === 'feed' && (
          <>
            <div className="controls-row">
              <div className="tabs">
                <button className={`tab-btn ${sortBy === 'latest' ? 'active' : ''}`} onClick={() => setSortBy('latest')}>최신순</button>
                <button className={`tab-btn ${sortBy === 'popular' ? 'active' : ''}`} onClick={() => setSortBy('popular')} data-bug-id="site086-bug01">인기순</button>
                <button className="tab-btn" onClick={() => fetchPosts(sortBy)} data-bug-id="site086-bug02">정렬 기준 동기화</button>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`tab-btn ${filterActive ? 'active' : ''}`} onClick={() => setFilterActive(!filterActive)}><Filter size={16} /> Filter</button>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="latest">Latest</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>

            <div className="post-grid">
              {filteredPosts.map((post, idx) => (
                <div key={`${post.id}-${idx}`} className="post-card">
                  <div className="post-tags">
                    {post.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <div className="post-meta">
                    <span className="post-author">{post.author}</span>
                    <div className="post-stats">
                      <div className="stat-item"><Eye size={14} /> {post.views.toLocaleString()}</div>
                      <button className="like-btn" onClick={() => handleLike(post.id)} data-bug-id="site086-bug03">
                        <ThumbsUp size={14} /> {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPosts.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'var(--text-sub)', fontWeight: 700 }}>
                  일치하는 게시글이 없습니다.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'ranking' && (
          <div className="post-grid">
            {posts.slice(0, 8).map((post, idx) => (
              <div key={post.id} className="post-card">
                <div className={`rank-badge rank-${idx + 1}`}>{idx + 1}위</div>
                <div className="post-tags">
                  {post.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                </div>
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span>
                  <div className="post-stats">
                    <div className="stat-item"><Eye size={14} /> {post.views.toLocaleString()}</div>
                    <div className="stat-item"><ThumbsUp size={14} /> {post.likes}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="controls-row">
              <h2 style={{ fontWeight: 800 }}>당신을 위한 맞춤 콘텐츠</h2>
              <button className="btn-primary" onClick={fetchRecommendations} data-bug-id="site086-bug04">순서 새로고침</button>
            </div>
            {recommendations.map((post, idx) => (
              <div key={post.id} className="rec-item" onClick={() => alert(`${post.title} 게시글로 이동합니다.`)} style={{ cursor: 'pointer' }}>
                <div className="rec-rank">{(idx + 1).toString().padStart(2, '0')}</div>
                <div style={{ flex: 1 }}>
                  <div className="rec-score">추천 점수: {post.score}점</div>
                  <h3 className="post-title" style={{ marginBottom: '8px' }}>{post.title}</h3>
                  <div className="post-author">{post.author} • {post.views} views</div>
                </div>
                <ChevronRight size={24} color="#ccc" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="log-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 800 }}>Audit Logs</h2>
              <button className="tab-btn" onClick={fetchLogs} data-bug-id="site086-bug03">로그 새로고침</button>
            </div>
            {logs.map(log => (
              <div key={log.id} className="log-entry">
                <span className="log-time">[{log.time.substring(11, 19)}]</span>
                <span className={`log-status ${log.status}`}>{log.status}</span>
                <span className="log-msg">{log.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bug Alert Popup */}
        {bugInfo && (
          <div className="bug-alert">
            <div className="bug-id-tag">{bugInfo.id}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', marginBottom: '10px' }}>
              <AlertCircle size={24} />
              <h4 style={{ fontWeight: 800 }}>시스템 로직 결함 감지</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.5', fontWeight: 600 }}>
              [{bugInfo.type}] 백엔드 데이터 처리 중 예상치 못한 편차가 탐지되었습니다. PPO 에이전트의 정밀 분석이 필요합니다.
            </p>
            <button className="btn-primary" style={{ width: '100%', marginTop: '15px', background: '#f43f5e' }} onClick={() => setBugInfo(null)}>확인</button>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', padding: '10px 20px', borderRadius: '30px', fontWeight: 800, fontSize: '0.8rem', zIndex: 1100 }}>
            PROCESSING...
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
