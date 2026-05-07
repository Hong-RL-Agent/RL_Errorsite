import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  LayoutDashboard, 
  Star, 
  MessageSquare, 
  History, 
  Search, 
  ArrowRight, 
  Bell, 
  User, 
  AlertTriangle, 
  Navigation, 
  Layers, 
  MoreVertical,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Map as MapIcon,
  Compass,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const CATEGORY_COLORS = {
  '카페': '#10b981', // Green
  '식당': '#f59e0b', // Amber
  '문화': '#3b82f6', // Blue
  '미용': '#8b5cf6'  // Purple
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [places, setPlaces] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCoords, setSearchCoords] = useState({ lat: '', lng: '' });

  useEffect(() => {
    initApp();
  }, [activeTab]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initApp = async () => {
    setLoading(true);
    if (activeTab === 'dashboard') await fetchSummary();
    if (activeTab === 'places') await fetchPlaces();
    if (activeTab === 'favorites') await fetchFavorites();
    if (activeTab === 'reviews') await fetchReviews(currentPage);
    if (activeTab === 'logs') await fetchLogs();
    setLoading(false);
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/dashboard/summary');
    setSummary(await res.json());
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    setLogs(data.data);
  };

  const fetchPlaces = async (lat = 37.5665, lng = 126.9780, sort = '') => {
    const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&sort=${sort}`);
    const data = await res.json();
    setPlaces(data.data);
    if (data.bugId) {
      setBug({ id: data.bugId });
      window.alert(`[버그 탐지] ${data.bugId} 오류가 발생했습니다!`);
    } else {
      setBug(null);
    }
  };

  const fetchFavorites = async () => {
    const res = await fetch('/api/favorites');
    const data = await res.json();
    setFavorites(data.data);
  };

  const fetchReviews = async (page = 1) => {
    const res = await fetch(`/api/reviews?page=${page}&limit=5`);
    const data = await res.json();
    setReviews(data.data);
    if (data.bugId) {
      setBug({ id: data.bugId });
      window.alert(`[버그 탐지] ${data.bugId} 오류가 발생했습니다!`);
    } else {
      setBug(null);
    }
  };

  const addFavorite = async (placeId) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'current_user', placeId })
    });
    const data = await res.json();
    if (data.bugId) {
      window.alert(`[버그 탐지] ${data.bugId} 오류가 발생했습니다!`);
      setBug({ id: data.bugId });
    }
    showToast("즐겨찾기에 등록되었습니다.", "success");
    fetchFavorites();
  };

  const handleSearch = (triggerBug = false) => {
    const lat = triggerBug ? 37.5665 : (searchCoords.lat || 37.5665);
    const lng = triggerBug ? 126.9780 : (searchCoords.lng || 126.9780);
    fetchPlaces(lat, lng);
    showToast(`위치 검색 완료: (${lat}, ${lng})`);
  };

  return (
    <div className="portal-container">
      {toast && (
        <div className={`toast-popup ${toast.type} fade-in`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar (site043 Style) */}
      <aside className="portal-sidebar">
        <div className="portal-brand">
           <MapIcon size={28} />
           <span>MAP<strong>PORTAL</strong></span>
        </div>
        
        <nav className="portal-nav">
           <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> 대시보드
           </div>
           <div className={`nav-item ${activeTab === 'places' ? 'active' : ''}`} onClick={() => setActiveTab('places')}>
              <MapPin size={20} /> 장소 탐색
           </div>
           <div className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
              <Star size={20} /> 즐겨찾기
           </div>
           <div className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              <MessageSquare size={20} /> 리뷰 관리
           </div>
           <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
              <History size={20} /> 운영 로그
           </div>
        </nav>

        <div className="sidebar-bottom">
           <div className="user-box">
              <User size={18} />
              <span>관리자 계정</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="portal-main">
        <header className="portal-header">
           <div className="h-left">
              <h2>{
                activeTab === 'dashboard' ? '운영 요약' : 
                activeTab === 'places' ? '장소 탐색' : 
                activeTab === 'favorites' ? '내 즐겨찾기' :
                activeTab === 'reviews' ? '리뷰 모니터링' : '시스템 로그'
              }</h2>
              <span className="h-sub">실시간 위치 기반 서비스 운영 현황</span>
           </div>
           <div className="h-right">
              <div className="search-group">
                 <Search size={16} />
                 <input type="text" placeholder="장소명 검색..." />
              </div>
              <button className="h-btn"><Bell size={20} /></button>
              <button className="btn-primary" onClick={() => setActiveTab('places')}><Navigation size={18} /> 경로 찾기</button>
           </div>
        </header>

        {/* Bug Alert Strip Removed as per request (Popups only) */}

        <div className="view-content">
           {activeTab === 'dashboard' && (
             <div className="view-dashboard fade-in">
                <div className="stat-row">
                   <div className="stat-card">
                      <span className="label">전체 등록 장소</span>
                      <span className="val">{summary?.totalPlaces || 0}</span>
                   </div>
                   <div className="stat-card">
                      <span className="label">즐겨찾기 활성</span>
                      <span className="val">{summary?.totalFavorites || 0}</span>
                   </div>
                   <div className="stat-card accent">
                      <span className="label">누적 리뷰 수</span>
                      <span className="val">{summary?.totalReviews || 0}</span>
                   </div>
                </div>

                <div className="dash-grid">
                   <div className="panel white-panel">
                      <div className="p-head">
                         <h3>실시간 위치 로그</h3>
                         <RefreshCw className="clickable" size={16} onClick={() => initApp()} />
                      </div>
                      <div className="log-list-mini">
                         {logs.slice(0, 5).map((l, i) => (
                           <div key={i} className="log-mini-item">
                              <span className="time">[{new Date(l.time).toLocaleTimeString()}]</span>
                              <span className="msg">{l.msg}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="panel white-panel center-align">
                      <h3>서비스 상태</h3>
                      <div className="status-chart">
                         <div className="b" style={{height: '30%'}}></div>
                         <div className="b" style={{height: '50%'}}></div>
                         <div className="b active" style={{height: '80%'}}></div>
                         <div className="b" style={{height: '40%'}}></div>
                      </div>
                      <button className="btn-outline" onClick={() => handleSearch(false)}>상태 리포트 생성</button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'places' && (
             <div className="view-places fade-in">
                <div className="places-control glass-panel">
                   <div className="c-left">
                      <Compass size={20} />
                      <strong>좌표 기반 탐색</strong>
                   </div>
                   <div className="c-right">
                      <button className="btn-sm" data-bug-id="site063-bug01" onClick={() => handleSearch(true)}>정밀 위치 조회</button>
                      <button className="btn-sm accent" data-bug-id="site063-bug02" onClick={() => fetchPlaces(37.5665, 126.9780, 'distance')}>거리순 정렬</button>
                   </div>
                </div>

                <div className="places-list">
                   {places.map(p => (
                     <div key={p.id} className="place-card white-panel">
                        <div className="card-top">
                           <div className="p-tag" style={{backgroundColor: CATEGORY_COLORS[p.category]}}>{p.category}</div>
                           <Star 
                            size={20} 
                            className={`fav-star ${favorites.find(f => f.placeId === p.id) ? 'active' : ''}`} 
                            onClick={() => addFavorite(p.id)}
                            data-bug-id="site063-bug03"
                           />
                        </div>
                        <div className="card-main">
                           <h4>{p.name}</h4>
                           <div className="coords">
                              <MapPin size={12} /> {p.lat}, {p.lng}
                           </div>
                        </div>
                        <div className="card-foot">
                           <span className="dist"><Navigation size={14} /> {p.distance.toFixed(2)}km</span>
                           <button className="btn-go" onClick={() => showToast("상세 정보 보기")}>상세보기</button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'favorites' && (
             <div className="view-favorites fade-in">
                <div className="favorites-list white-panel">
                   <div className="table-header">
                      <span>장소 ID</span>
                      <span>사용자</span>
                      <span>등록 시간</span>
                      <span>비고</span>
                   </div>
                   {favorites.length === 0 ? (
                     <div className="empty-state">즐겨찾기가 없습니다.</div>
                   ) : (
                     favorites.map((f, i) => (
                       <div key={i} className="table-row">
                          <span className="f-id">PLACE #{f.placeId}</span>
                          <span>{f.userId}</span>
                          <span>{new Date(f.addedAt).toLocaleString()}</span>
                          <button className="btn-txt-red" onClick={() => showToast("삭제 권한 없음")}>제거</button>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}

           {activeTab === 'reviews' && (
             <div className="view-reviews fade-in">
                <div className="reviews-header glass-panel">
                   <Filter size={18} />
                   <strong>전체 리뷰 모니터링 (Page {currentPage})</strong>
                </div>
                <div className="reviews-list">
                   {reviews.map(r => (
                     <div key={r.id} className="review-item white-panel">
                        <div className="r-user">
                           <div className="u-avatar">{r.user[0]}</div>
                           <div className="u-info">
                              <strong>{r.user}</strong>
                              <span>{new Date(r.date).toLocaleDateString()}</span>
                           </div>
                        </div>
                        <p className="r-text">{r.text}</p>
                        <div className="r-meta">PLACE ID: #{r.placeId}</div>
                     </div>
                   ))}
                </div>
                <div className="pagination">
                   <button 
                    className="p-btn" 
                    onClick={() => { setCurrentPage(1); fetchReviews(1); }}
                    disabled={currentPage === 1}
                   >
                     <ChevronLeft size={18} />
                   </button>
                   <button className={`p-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => { setCurrentPage(1); fetchReviews(1); }}>1</button>
                   <button 
                    className={`p-btn ${currentPage === 2 ? 'active' : ''}`} 
                    onClick={() => { setCurrentPage(2); fetchReviews(2); }}
                    data-bug-id="site063-bug04"
                   >2</button>
                   <button 
                    className="p-btn" 
                    onClick={() => { setCurrentPage(2); fetchReviews(2); }}
                    disabled={currentPage === 2}
                   >
                     <ChevronRight size={18} />
                   </button>
                </div>
             </div>
           )}

           {activeTab === 'logs' && (
             <div className="view-logs fade-in">
                <div className="log-panel white-panel">
                   <div className="p-head">
                      <h3>실시간 운영 트랜잭션</h3>
                      <button className="btn-txt" onClick={fetchLogs}>새로고침</button>
                   </div>
                   <div className="log-scroll">
                      {logs.map((l, i) => (
                        <div key={i} className="log-entry">
                           <span className="time">[{new Date(l.time).toLocaleTimeString()}]</span>
                           <span className="msg">{l.msg}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>
      </main>

      {/* PPO Agent Monitor */}
      <div className="ppo-monitor">
         <div className="mon-head">PPO-ENVIRONMENT-MONITOR</div>
         <div className="mon-body">
            <div className="mon-row"><span>BUG DETECTED</span><span className={`v highlight ${bug ? 'active' : ''}`}>{bug ? 'YES' : 'NO'}</span></div>
            <div className="mon-row"><span>BUG ID</span><span className="v highlight">{bug ? bug.id : 'NONE'}</span></div>
            <div className="mon-row"><span>SITE ID</span><span className="v">site063</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
