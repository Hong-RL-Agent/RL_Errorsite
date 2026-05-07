import React, { useState, useEffect } from 'react';
import { 
  Home, 
  TrendingUp, 
  Layers, 
  History, 
  FlaskConical, 
  Search, 
  Play, 
  Plus, 
  Info, 
  X, 
  AlertTriangle,
  ChevronRight,
  MonitorPlay,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [movies, setMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBug, setActiveBug] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === 'popular') fetchPopular();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setMovies(data.data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopular = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies/popular`);
      const data = await res.json();
      setPopularMovies(data.data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/watch/history`);
      const data = await res.json();
      setHistory(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMovieDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/movies/${id}`);
      const data = await res.json();
      setSelectedMovie(data);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      console.error(e);
    }
  };

  const startWatching = async (movieId) => {
    try {
      await fetch(`${API_BASE}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
      });
      alert("영화를 재생합니다. (Mock Play)");
      fetchHistory();
    } catch (e) {
      console.error(e);
    }
  };

  const runMutationTest = async () => {
    try {
      const res = await fetch(`${API_BASE}/test/mutate`);
      const data = await res.json();
      setActiveBug(data);
      alert(`테스트 완료: 영화 ID ${data.movieId}의 평점이 ${data.newRating}으로 변경되었습니다.`);
      fetchMovies();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">STREAM X</div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> 홈
            </li>
            <li className={`nav-item ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => setActiveTab('popular')}>
              <TrendingUp size={20} /> 대세 콘텐츠
            </li>
            <li className={`nav-item ${activeTab === 'genres' ? 'active' : ''}`} onClick={() => setActiveTab('genres')}>
              <Layers size={20} /> 장르
            </li>
            <li className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <History size={20} /> 시청 기록
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
            <MonitorPlay size={14} />
            <span>Premium Plan Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div className="search-bar">
            <Search size={20} color="#666" />
            <input 
              type="text" 
              placeholder="영화, 시리즈 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-bug-id="site033-bug01"
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <Zap size={20} color="white" />
             <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e50914' }}></div>
          </div>
        </header>

        {activeBug && (
          <div className="bug-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AlertTriangle size={20} />
              <div>
                <span style={{ fontWeight: 700 }}>시스템 로직 이상 감지:</span> {activeBug.type}
              </div>
              <span className="bug-id-tag">{activeBug.bugId}</span>
            </div>
            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
          </div>
        )}

        {activeTab === 'home' && (
          <div className="fade-in">
             <section className="movie-section">
                <h3>지금 뜨는 영화</h3>
                <div className="movie-grid">
                   {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="movie-card skeleton"></div>) : 
                    <>
                      {movies.map(movie => (
                        <div key={movie.id} className="movie-card" onClick={() => fetchMovieDetail(movie.id)}>
                           <img src={movie.img} alt={movie.title} />
                           <div className="movie-info-overlay">
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{movie.title}</div>
                              <div className="movie-rating">★ {movie.rating}</div>
                           </div>
                        </div>
                      ))}
                      {!searchQuery && (
                        <div className="movie-card" onClick={() => fetchMovieDetail(999)} data-bug-id="site033-bug03">
                           <img src="https://picsum.photos/seed/mystery/400/600" alt="미스터리 박스" />
                           <div className="movie-info-overlay">
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>미스터리 박스</div>
                              <div className="movie-rating">★ ??</div>
                           </div>
                        </div>
                      )}
                    </>
                   }
                </div>
                {!loading && movies.length === 0 && searchQuery && (
                   <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                      검색 결과가 없습니다. (언어/유니코드 처리 확인 필요)
                   </div>
                )}
             </section>
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="fade-in">
             <section className="movie-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <h3>대세 콘텐츠 정렬</h3>
                   <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={fetchPopular} data-bug-id="site033-bug02">정렬 기준 확인</button>
                </div>
                <div className="movie-grid">
                   {popularMovies.map((movie, idx) => (
                      <div key={movie.id} className="movie-card" onClick={() => fetchMovieDetail(movie.id)}>
                         <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{idx + 1}</div>
                         <img src={movie.img} alt={movie.title} />
                         <div className="movie-info-overlay">
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{movie.title}</div>
                            <div className="movie-rating">★ {movie.rating}</div>
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {['SF', '액션', '드라마', '애니메이션', '로맨스', '공포', '스릴러', '다큐멘터리'].map(g => (
                  <div key={g} className="lab-panel" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { setSearchQuery(''); alert(`${g} 장르 필터는 현재 준비 중입니다.`); }}>
                     <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{g}</div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="fade-in">
             <section className="movie-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <h3>시청 중인 콘텐츠</h3>
                   <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={runMutationTest} data-bug-id="site033-bug04">시청 데이터 동기화</button>
                </div>
                <div className="movie-grid">
                   {history.length === 0 ? (
                      <div style={{ color: '#666', padding: '2rem' }}>시청 기록이 없습니다.</div>
                   ) : (
                      history.map((movie, i) => (
                        <div key={i} className="movie-card">
                           <img src={movie.img} alt={movie.title} />
                           <div style={{ height: 4, background: '#e50914', width: '70%', position: 'absolute', bottom: 0 }}></div>
                        </div>
                      ))
                   )}
                </div>
             </section>
          </div>
        )}

      </main>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <button className="modal-close" onClick={() => setSelectedMovie(null)}><X size={24} /></button>
               <div className="modal-hero">
                  <img src={selectedMovie.img || 'https://picsum.photos/seed/unknown/800/400'} alt={selectedMovie.title} />
                  <div className="modal-hero-overlay"></div>
                  <div style={{ position: 'absolute', bottom: '2rem', left: '2.5rem' }}>
                     <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{selectedMovie.title}</h2>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => startWatching(selectedMovie.id)}><Play fill="black" size={20} /> 재생</button>
                        <button className="btn btn-secondary" onClick={() => alert("찜 목록에 추가되었습니다.")}><Plus size={20} /> 내가 찜한 리스트</button>
                     </div>
                  </div>
               </div>
               <div className="modal-body">
                  <div style={{ display: 'flex', gap: '2rem' }}>
                     <div style={{ flex: 2 }}>
                        <div style={{ color: '#46d369', fontWeight: 700, marginBottom: '1rem' }}>{selectedMovie.rating ? `${(selectedMovie.rating * 10).toFixed(0)}% 일치` : '평점 정보 없음'}</div>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>{selectedMovie.desc}</p>
                     </div>
                     <div style={{ flex: 1, fontSize: '0.9rem' }}>
                        <div style={{ marginBottom: '0.8rem' }}><span style={{ color: '#777' }}>장르:</span> {selectedMovie.genre}</div>
                        <div style={{ marginBottom: '0.8rem' }}><span style={{ color: '#777' }}>특징:</span> 흥미진진, 긴장감 넘치는</div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
