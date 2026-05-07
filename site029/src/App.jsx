import React, { useState, useEffect } from 'react';
import { 
  Music, 
  TrendingUp, 
  Search, 
  Disc, 
  Play, 
  ChevronUp, 
  ChevronDown, 
  Minus, 
  Info, 
  AlertTriangle,
  X,
  Heart,
  ListMusic,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('top100');
  const [songs, setSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [minPlaysFilter, setMinPlaysFilter] = useState('');
  const [bugId, setBugId] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchChart();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const fetchChart = async (genre = '', minPlays = '', search = '') => {
    setLoading(true);
    setError(null);
    setBugId(null);
    try {
      let url = `${API_BASE}/charts?`;
      if (genre) url += `genre=${genre}&`;
      if (minPlays) url += `minPlays=${minPlays}&`;
      if (search) url += `search=${search}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.data === null) {
        setError('차트 데이터를 불러올 수 없습니다. 장르를 확인해주세요.');
        setSongs([]);
      } else {
        setSongs(data.data || []);
      }
      
      if (data.bugId) setBugId(data.bugId);
    } catch (e) {
      setError('서버 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopular = async () => {
    setLoading(true);
    setBugId(null);
    try {
      const res = await fetch(`${API_BASE}/charts/popular`);
      const data = await res.json();
      setPopularSongs(data.data || []);
      if (data.bugId) setBugId(data.bugId);
      setActiveTab('popular');
    } catch (e) {
      setError('인기 차트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchChart(genreFilter, minPlaysFilter, searchQuery);
    setActiveTab('top100');
  };

  const handleGenreClick = (genre) => {
    setGenreFilter(genre);
    fetchChart(genre, minPlaysFilter, searchQuery);
    setActiveTab('top100');
  };

  const triggerBug03 = () => {
    // BUG 03: genre AND minPlays logic error (OR used in backend)
    setGenreFilter('pop');
    setMinPlaysFilter('1000000');
    fetchChart('pop', '1000000', searchQuery);
  };

  const triggerBug01 = () => {
    // BUG 01: unknown genre returns null
    fetchChart('unknown');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Music size={32} color="#00d4ff" />
          <span>NEON MUSIC</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li 
              className={`nav-item ${activeTab === 'top100' ? 'active' : ''}`}
              onClick={() => { setActiveTab('top100'); fetchChart(); }}
            >
              <TrendingUp size={20} /> 실시간 Top 100
            </li>
            <li 
              className={`nav-item ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={fetchPopular}
              data-bug-id="site029-bug04"
            >
              <Heart size={20} /> 명예의 전당 (Popular)
            </li>
            <li 
              className={`nav-item ${activeTab === 'genres' ? 'active' : ''}`}
              onClick={() => setActiveTab('genres')}
            >
              <ListMusic size={20} /> 장르별 차트
            </li>
            <li 
              className="nav-item"
              onClick={triggerBug01}
              data-bug-id="site029-bug01"
            >
              <AlertTriangle size={20} /> 엣지 케이스 테스트
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'var(--glass)', borderRadius: '15px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SYSTEM STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>OPERATIONAL</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <form className="search-container" onSubmit={handleSearch}>
            <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="곡명, 아티스트 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="filter-btn" 
              onClick={triggerBug03}
              data-bug-id="site029-bug03"
            >
              <Filter size={16} style={{ marginRight: '0.5rem' }} /> 복합 필터 (BUG 03)
            </button>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(45deg, var(--neon-purple), var(--neon-pink))' }}></div>
          </div>
        </header>

        {bugId && (
          <div className="error-container fade-in">
            <Info color="#ff3366" />
            <div>
              <div style={{ fontWeight: 800 }}>BACKEND BUG DETECTED</div>
              <div style={{ fontSize: '0.85rem' }}>ID: <span className="bug-id-badge">{bugId}</span></div>
            </div>
            <button onClick={() => setBugId(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="error-container fade-in" style={{ border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertTriangle color="#f59e0b" />
            <div style={{ color: '#f59e0b' }}>{error}</div>
          </div>
        )}

        {activeTab === 'top100' && (
          <div className="fade-in">
            <div className="summary-grid">
              <div className="stat-card">
                <div className="stat-label">Total Songs</div>
                <div className="stat-value">{summary?.totalSongs || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Top Plays</div>
                <div className="stat-value">{summary?.topPlays?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Listeners</div>
                <div className="stat-value">{summary?.activeListeners?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">System Uptime</div>
                <div className="stat-value" style={{ color: '#00ff88' }}>99.9%</div>
              </div>
            </div>

            <div className="filter-bar">
              {['', 'K-Pop', 'Pop', 'Hip-Hop', 'Indie', 'Rock'].map(g => (
                <button 
                  key={g}
                  className={`filter-btn ${genreFilter === g ? 'active' : ''}`}
                  onClick={() => handleGenreClick(g)}
                >
                  {g || '전체'}
                </button>
              ))}
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>Global Top 100 Chart</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updated 1 min ago</span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Chart...</div>
              ) : (
                songs.map((song) => (
                  <div key={song.id} className="chart-item" onClick={() => setSelectedSong(song)} data-bug-id="site029-bug02">
                    <div className="rank-num">{song.rank}</div>
                    <div className="rank-change">
                      {song.rankChange > 0 ? (
                        <span className="rank-up"><ChevronUp size={14} /> {song.rankChange}</span>
                      ) : song.rankChange < 0 ? (
                        <span className="rank-down"><ChevronDown size={14} /> {Math.abs(song.rankChange)}</span>
                      ) : (
                        <span className="rank-same"><Minus size={14} /></span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="song-img"></div>
                      <div className="song-info">
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                    </div>
                    <div style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>{song.genre}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{song.plays.toLocaleString()} plays</div>
                    <div style={{ textAlign: 'right' }}><Play size={18} color="var(--text-muted)" /></div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="fade-in">
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <TrendingUp color="var(--neon-pink)" /> Most Popular (Buggy Sorting)
            </h2>
            <div className="chart-container">
              {popularSongs.map((song, idx) => (
                <div key={song.id} className="chart-item" onClick={() => setSelectedSong(song)}>
                  <div className="rank-num">{idx + 1}</div>
                  <div className="rank-change"><Minus size={14} color="#666" /></div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="song-img" style={{ background: 'linear-gradient(45deg, var(--neon-pink), #5500aa)' }}></div>
                    <div className="song-info">
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                  <div style={{ color: 'var(--neon-pink)', fontWeight: 600 }}>{song.genre}</div>
                  <div style={{ color: 'white', fontWeight: 700 }}>{song.plays.toLocaleString()} plays</div>
                  <div style={{ textAlign: 'right' }}><Play size={18} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '5rem' }}>
            <Disc size={64} color="var(--neon-purple)" style={{ marginBottom: '2rem' }} />
            <h2>장르 탐색 모드</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>카테고리별 정밀 분석 데이터를 준비 중입니다.</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedSong && (
          <div className="modal-overlay" onClick={() => setSelectedSong(null)}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedSong(null)}><X size={24} /></button>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ width: 150, height: 150, borderRadius: '20px', background: 'linear-gradient(135deg, #333, #000)', border: '2px solid var(--neon-purple)' }}></div>
                <div>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{selectedSong.title}</h2>
                  <p style={{ fontSize: '1.2rem', color: 'var(--neon-blue)', marginBottom: '1.5rem' }}>{selectedSong.artist}</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="stat-card" style={{ padding: '0.8rem 1.2rem' }}>
                      <div className="stat-label" style={{ fontSize: '0.6rem' }}>Rank</div>
                      <div className="stat-value" style={{ fontSize: '1.2rem' }}>#{selectedSong.rank}</div>
                    </div>
                    <div className="stat-card" style={{ padding: '0.8rem 1.2rem' }}>
                      <div className="stat-label" style={{ fontSize: '0.6rem' }}>Genre</div>
                      <div className="stat-value" style={{ fontSize: '1.2rem' }}>{selectedSong.genre}</div>
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '2rem' }}>
                이 곡은 최근 글로벌 차트에서 급격한 상승세를 보이고 있는 아티스트의 최신작입니다. 
                강렬한 비트와 서정적인 멜로디가 조화를 이루며 리스너들의 귀를 사로잡고 있습니다.
              </p>
              <button 
                className="filter-btn" 
                style={{ width: '100%', padding: '1rem', background: 'var(--neon-purple)' }}
                onClick={() => alert('서비스 준비 중입니다. 곧 정식 스트리밍을 시작합니다!')}
              >
                <Play size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> 바로 재생하기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
