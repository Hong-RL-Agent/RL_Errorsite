import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Search, 
  Star, 
  Heart, 
  Plus, 
  Clock, 
  ChevronRight,
  Filter,
  AlertCircle,
  LayoutGrid,
  Settings,
  X,
  Timer,
  Bookmark,
  ChevronLeft,
  Loader2
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard');
  const [recipes, setRecipes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [category, setCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [bugId, setBugId] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Recipe Form State
  const [newRecipe, setNewRecipe] = useState({ title: '', ingredients: '', category: 'pasta' });

  const [actionLoading, setActionLoading] = useState(null);

  const fetchRecipes = async (triggerBugId = '') => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      
      // Force 'popular' sort for BUG-02 trigger
      const currentSort = triggerBugId === 'site072-bug02' ? 'popular' : sort;
      query.append('sort', currentSort);
      
      if (category) query.append('category', category);
      if (triggerBugId) query.append('triggerBug', triggerBugId);

      const res = await fetch(`/api/recipes?${query.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setRecipes(data.data || []);
      if (data.bugId) setBugId(data.bugId);
      else setBugId(null);
    } catch (e) { 
      console.error(e);
      setRecipes([]);
    }
    setLoading(false);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchRatings = async (triggerBugId = '') => {
    setLoading(true);
    try {
      const query = triggerBugId ? `?triggerBug=${triggerBugId}` : '';
      const res = await fetch(`/api/recipes/ratings${query}`);
      const data = await res.json();
      setRatingData(data.average);
      if (data.bugId) setBugId(data.bugId);
      else setBugId(null);
    } catch (e) {}
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.data);
    } catch (e) {}
  };

  const handleLike = (id) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
  };

  const handleBookmark = (id) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, bookmarked: !r.bookmarked } : r));
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    setActionLoading('add');
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecipe,
          ingredients: newRecipe.ingredients.split(',').map(i => i.trim())
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewRecipe({ title: '', ingredients: '', category: 'pasta' });
        await Promise.all([fetchRecipes(), fetchDashboard(), fetchLogs()]);
      }
    } catch (e) {}
    setActionLoading(null);
  };

  useEffect(() => {
    if (view === 'recipes') fetchRecipes();
    if (view === 'dashboard') {
      fetchDashboard();
      fetchLogs();
    }
  }, [view, sort, category]);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <Utensils size={32} />
          <span>ChefHub</span>
        </div>
        <div className="nav-links">
          <div className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>대시보드</div>
          <div className={`nav-link ${view === 'recipes' ? 'active' : ''}`} onClick={() => setView('recipes')}>레시피 탐색</div>
          <div className={`nav-link ${view === 'ratings' ? 'active' : ''}`} onClick={() => { setView('ratings'); fetchRatings(); }}>평점 분석</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> 레시피 등록
        </button>
      </nav>

      <div className="container">
        {bugId && (
          <div className="bug-alert">
            <AlertCircle size={20} />
            <span>PPO 탐지 알림: 백엔드에서 고유 버그가 발견되었습니다. (BugID: {bugId})</span>
          </div>
        )}

        {view === 'dashboard' && (
          <div>
            <div className="page-header">
              <div className="title-group">
                <h2>서비스 현황</h2>
                <p>ChefHub 플랫폼의 실시간 통계 및 로그입니다.</p>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <span className="label">총 레시피</span>
                <span className="value">{summary?.totalRecipes || 0}</span>
              </div>
              <div className="summary-card">
                <span className="label">평균 평점</span>
                <span className="value">{summary?.avgRating || 0.0}</span>
              </div>
              <div className="summary-card">
                <span className="label">누적 좋아요</span>
                <span className="value">{summary?.totalLikes || 0}</span>
              </div>
            </div>

            <div className="log-panel">
              <h3 style={{ marginBottom: '20px', color: 'white' }}>최근 시스템 로그</h3>
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <span className="log-time">[{new Date(log.time).toLocaleTimeString()}]</span>
                  <span>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'recipes' && (
          <div>
            <div className="page-header">
              <div className="title-group">
                <h2>레시피 탐색</h2>
                <p>다양한 요리 비법을 검색하고 인기순으로 정렬해보세요.</p>
              </div>
            </div>

            <div className="controls">
              <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="요리 이름 검색..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchRecipes()}
                />
                <button className="btn-primary" onClick={() => fetchRecipes()}>검색</button>
              </div>
              <button className="btn-orange-outline" onClick={() => fetchRecipes('site072-bug01')} data-bug-id="site072-bug01">
                대소문자 일치 검색
              </button>
              <select className="select-box" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">모든 카테고리</option>
                <option value="pasta">파스타</option>
                <option value="dessert">디저트</option>
                <option value="korean">한식</option>
              </select>
              <select className="select-box" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
              </select>
              <button className="btn-orange-outline" onClick={() => fetchRecipes('site072-bug02')} data-bug-id="site072-bug02">
                인기 가중치 반영
              </button>
            </div>

            <div className="recipes-grid">
              {recipes.length > 0 ? recipes.map(r => (
                <div key={r.id} className="recipe-card">
                  <div className="recipe-img">🍳</div>
                  <div className="recipe-content">
                    <div className="recipe-cat">{r.category}</div>
                    <h3 className="recipe-title">{r.title}</h3>
                    <div className="recipe-tags">
                      {(r.ingredients || []).map(ing => <span key={ing} className="tag">{ing}</span>)}
                    </div>
                    <div className="recipe-footer">
                      <div className="rating">
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <span>{r.rating}</span>
                      </div>
                      <div className="recipe-actions">
                        <button className="action-btn like" onClick={(e) => { e.stopPropagation(); handleLike(r.id); }}>
                          <Heart size={16} fill={r.likes > 150 ? '#f97316' : 'none'} color={r.likes > 150 ? '#f97316' : 'currentColor'} />
                          <span>{r.likes}</span>
                        </button>
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleBookmark(r.id); }}>
                          <Bookmark size={16} fill={r.bookmarked ? '#fbbf24' : 'none'} color={r.bookmarked ? '#fbbf24' : 'currentColor'} />
                        </button>
                        <button className="action-btn" title="타이머">
                          <Timer size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                   <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                   <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'ratings' && (
          <div>
            <div className="page-header">
              <div className="title-group">
                <h2>평점 정밀 분석</h2>
                <p>전체 레시피의 평균 평점을 부동소수점 단위로 분석합니다.</p>
              </div>
            </div>

            <div className="summary-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <span className="label">정밀 평균 평점</span>
              <span className="value" style={{ color: ratingData < 4.5 ? 'red' : 'inherit' }}>
                {ratingData || '0.000000'}
              </span>
              <button 
                className="btn-primary" 
                style={{ marginTop: '20px' }} 
                onClick={() => fetchRatings('site072-bug03')} 
                data-bug-id="site072-bug03"
              >
                실시간 평점 데이터 동기화
              </button>
              {bugId === 'site072-bug03' && (
                <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '12px' }}>
                  * 경고: 부동소수점 정밀도 분석 중 데이터 오차가 발견되었습니다.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleAddRecipe}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>새 레시피 등록</h3>
              <X cursor="pointer" onClick={() => setShowAddModal(false)} />
            </div>
            <div className="form-group">
              <label>요리 이름</label>
              <input 
                required 
                type="text" 
                value={newRecipe.title} 
                onChange={e => setNewRecipe({...newRecipe, title: e.target.value})} 
                placeholder="예: 까르보나라"
              />
            </div>
            <div className="form-group">
              <label>재료 (쉼표로 구분)</label>
              <input 
                required 
                type="text" 
                value={newRecipe.ingredients} 
                onChange={e => setNewRecipe({...newRecipe, ingredients: e.target.value})} 
                placeholder="예: 면, 계란, 치즈"
              />
            </div>
            <div className="form-group">
              <label>카테고리</label>
              <select value={newRecipe.category} onChange={e => setNewRecipe({...newRecipe, category: e.target.value})}>
                <option value="pasta">파스타</option>
                <option value="dessert">디저트</option>
                <option value="korean">한식</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              등록 완료
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
