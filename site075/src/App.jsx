import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Search, 
  Volume2, 
  ListMusic, 
  BarChart3, 
  Mic2, 
  Radio, 
  AlertCircle, 
  Activity,
  Heart,
  Terminal,
  LayoutGrid
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard');
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bugId, setBugId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchEpisodes = async (sort = 'latest') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/episodes?sort=${sort}`);
      const data = await res.json();
      setEpisodes(data.data);
    } catch (e) {}
    setLoading(false);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.data);
    } catch (e) {}
  };

  const triggerStream = async (id, type = '') => {
    setLoading(true);
    try {
      let url = `/api/stream/${id}`;
      let headers = {};
      if (type === 'site075-bug01') {
        url += `?triggerBug=site075-bug01`;
        headers['Range'] = 'bytes=0-1000';
      } else if (type === 'site075-bug02') {
        url += `?triggerBug=site075-bug02`;
      } else if (type === 'site075-bug03') {
        url += `?triggerBug=site075-bug03`;
      } else if (type === 'site075-bug04') {
        url += `?triggerBug=site075-bug04&chunked=true`;
      }

      const res = await fetch(url, { headers });
      const xBugId = res.headers.get('X-Bug-Id');
      console.log('Stream Request Result:', { type, xBugId });
      setBugId(xBugId || null);
      setIsPlaying(true);
      fetchLogs(); // Refresh logs to show the bug log
    } catch (e) {
      console.error('Stream Error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
    fetchLogs();
    fetchEpisodes();
  }, []);

  const handleEpisodeClick = (ep) => {
    setCurrentEp(ep);
    triggerStream(ep.id);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Radio size={32} />
          <span>StreamCast</span>
        </div>
        <div className="nav-group">
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <BarChart3 size={20} /> Dashboard
          </div>
          <div className={`nav-item ${view === 'episodes' ? 'active' : ''}`} onClick={() => setView('episodes')}>
            <ListMusic size={20} /> Episodes
          </div>
          <div className={`nav-item ${view === 'player' ? 'active' : ''}`} onClick={() => setView('player')}>
            <Mic2 size={20} /> Global Player
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="main-viewport">
        <header className="header">
          <h1>{view.toUpperCase()}</h1>
          <button className="btn-ghost"><Search size={24} /></button>
        </header>

        {bugId && (
          <div className="alert-banner">
            <AlertCircle size={20} />
            <div>
              <strong>Streaming Fault Detected: {bugId}</strong>
              <div style={{ fontSize: '0.75rem' }}>PPO 에이전트가 데이터 무결성 오류를 감지했습니다.</div>
            </div>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white' }} onClick={() => setBugId(null)}>&times;</button>
          </div>
        )}

        {view === 'dashboard' && (
          <div>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="card-label">총 에피소드</div>
                <div className="card-value">{summary?.totalEpisodes || 0}</div>
              </div>
              <div className="summary-card">
                <div className="card-label">누적 재생수</div>
                <div className="card-value">{summary?.totalPlays.toLocaleString() || 0}</div>
              </div>
            </div>
            <div className="grid-episodes">
              {episodes.map(ep => (
                <div key={ep.id} className="episode-card" onClick={() => handleEpisodeClick(ep)}>
                  <div className="episode-img"><Mic2 size={48} /></div>
                  <h3>{ep.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'episodes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {episodes.map(ep => (
              <div key={ep.id} className="summary-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{ep.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ep.host}</div>
                </div>
                <button className="btn-ghost" onClick={() => handleEpisodeClick(ep)}>재생</button>
              </div>
            ))}
          </div>
        )}

        {view === 'player' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '280px', height: '280px', margin: '0 auto 32px', background: 'linear-gradient(var(--primary), var(--secondary))', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic2 size={100} color="white" />
            </div>
            <h2>{currentEp?.title || '선택된 에피소드 없음'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{currentEp?.host}</p>

            <div style={{ display: 'flex', gap: '24px', textAlign: 'left' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>에피소드 타임라인</h4>
                <div 
                  className="nav-item" 
                  style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', marginBottom: '8px', padding: '12px', borderRadius: '8px' }}
                  onClick={() => triggerStream(currentEp?.id || 1, 'site075-bug01')}
                  data-bug-id="site075-bug01"
                >
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>05:20</span> 하이라이트 구간 재생
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="episode-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: 0 }} onClick={() => triggerStream(currentEp?.id || 1, 'site075-bug02')} data-bug-id="site075-bug02">
                  <span>빠른 재생 모드</span>
                  <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: bugId === 'site075-bug02' ? 'var(--primary)' : '#3f3f46' }}></div>
                </div>
                <div className="episode-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: 0, cursor: 'pointer' }} onClick={() => triggerStream(currentEp?.id || 1, 'site075-bug03')} data-bug-id="site075-bug03">
                  <span style={{ fontWeight: 600 }}>저사양 기기 최적화</span>
                  <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: bugId === 'site075-bug03' ? 'var(--secondary)' : '#3f3f46', position: 'relative', transition: 'all 0.3s' }}>
                     <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: bugId === 'site075-bug03' ? '19px' : '3px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
                <div className="episode-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: 0, cursor: 'pointer' }} onClick={() => triggerStream(currentEp?.id || 1, 'site075-bug04')} data-bug-id="site075-bug04">
                  <span style={{ fontWeight: 600 }}>공간 음향 효과 적용</span>
                  <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: bugId === 'site075-bug04' ? 'var(--accent)' : '#3f3f46', position: 'relative', transition: 'all 0.3s' }}>
                     <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: bugId === 'site075-bug04' ? '19px' : '3px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="log-panel" style={{ marginTop: '40px' }}>
          <Terminal size={16} /> <strong>Streaming Logs</strong>
          {logs.map(log => (
            <div key={log.id} style={{ fontSize: '0.8rem', marginTop: '4px' }}>[{new Date(log.time).toLocaleTimeString()}] {log.msg}</div>
          ))}
        </div>
      </main>

      <footer className="player-bar">
        <div className="current-track">
          <div className="track-thumb"></div>
          <div>
            <div style={{ fontWeight: 700 }}>{currentEp?.title || 'Not Playing'}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{currentEp?.host}</div>
          </div>
        </div>
        <div className="player-controls">
          <div className="playback-btns">
            <SkipBack size={20} />
            <div className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </div>
            <SkipForward size={20} />
          </div>
          <div className="progress-container" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="progress-bar"><div className="progress-fill" style={{ width: isPlaying ? '40%' : '0%' }}></div></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
          <Volume2 size={20} />
          <LayoutGrid size={20} />
        </div>
      </footer>
    </div>
  );
};

export default App;
