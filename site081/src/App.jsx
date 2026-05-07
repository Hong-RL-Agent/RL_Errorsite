import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Settings, 
  Maximize, 
  LayoutDashboard, 
  Video, 
  Activity, 
  Terminal,
  RefreshCcw,
  SkipForward,
  SkipBack,
  AlertCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('player');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferLevel, setBufferLevel] = useState(0);
  const [playerStatus, setPlayerStatus] = useState('IDLE'); // IDLE, PLAYING, BUFFERING, ERROR
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Streaming state
  const streamOffset = useRef(0);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/videos`);
      const data = await res.json();
      setVideos(data.data);
      if (data.data.length > 0) setSelectedVideo(data.data[0]);
    } catch (e) { console.error(e); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data.data);
    } catch (e) { console.error(e); }
  };

  const startStream = async (trigger = null) => {
    setLoading(true);
    setPlayerStatus('BUFFERING');
    setBugInfo(null);

    let detectedBugId = null;
    let headerContentLength = null;

    try {
      const start = streamOffset.current;
      const end = start + 20000;
      
      const url = trigger ? `${API_BASE}/video/stream?trigger=${trigger}` : `${API_BASE}/video/stream`;
      const res = await fetch(url, {
        headers: { 'Range': `bytes=${start}-${end}` }
      });

      detectedBugId = res.headers.get('X-Bug-Id');
      headerContentLength = res.headers.get('Content-Length');
      
      if (!res.ok && res.status !== 206) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      // Detection for Bugs based on Headers (Bug 01, 02, 04)
      if (detectedBugId === 'site081-bug01') {
        setBugInfo({ 
          id: 'site081-bug01', 
          message: "[오류 #1] Range 오프셋 계산 오류 (site081-bug01): 요청한 구간(Range)과 다른 데이터가 반환되어 영상 싱크가 어긋났습니다." 
        });
        setPlayerStatus('ERROR');
        return;
      }
      
      if (detectedBugId === 'site081-bug02') {
        setBugInfo({ 
          id: 'site081-bug02', 
          message: "[오류 #2] 청크 경계 손실 (site081-bug02): 데이터 전송 중 일부 청크 구간이 유실되어 영상의 연속성이 파괴되었습니다." 
        });
        setPlayerStatus('ERROR');
        return;
      }

      // Read chunk for Bug 03 and Bug 04 (Premature Termination)
      const reader = res.body.getReader();
      let receivedLength = 0;

      try {
        while(true) {
          const {done, value} = await reader.read();
          if (done) break;
          receivedLength += value.length;
        }
      } catch (streamErr) {
        // If stream is interrupted and we have Bug 04 header
        if (detectedBugId === 'site081-bug04') {
          // Fall through to detection
        } else {
          throw streamErr;
        }
      }

      // Final Detection Logic
      if (detectedBugId === 'site081-bug04') {
        setBugInfo({ 
          id: 'site081-bug04', 
          message: "[오류 #4] 스트림 조기 종료 (site081-bug04): 전체 데이터가 전송되기 전에 서버와의 연결이 강제로 종료되었습니다." 
        });
        setPlayerStatus('ERROR');
      }
      else if (headerContentLength && parseInt(headerContentLength) !== receivedLength) {
        setBugInfo({ 
          id: 'site081-bug03', 
          message: `[오류 #3] 부분 응답 길이 불일치 (site081-bug03): 응답 헤더의 Content-Length(${headerContentLength})와 실제 수신 데이터(${receivedLength})가 일치하지 않습니다.` 
        });
        setPlayerStatus('ERROR');
      }
      else {
        // Success
        setBufferLevel(prev => Math.min(prev + 15, 100));
        setPlayerStatus('PLAYING');
        setIsPlaying(true);
      }

    } catch (e) {
      console.error("Stream Error:", e);
      // Secondary check if bug was intended but catch was hit
      if (detectedBugId) {
        const bugNum = detectedBugId.slice(-1);
        const bugMessages = {
          '1': "[오류 #1] Range 오프셋 계산 오류 (site081-bug01)",
          '2': "[오류 #2] 청크 경계 손실 (site081-bug02)",
          '3': "[오류 #3] 부분 응답 길이 불일치 (site081-bug03)",
          '4': "[오류 #4] 스트림 조기 종료 (site081-bug04)"
        };
        setBugInfo({ 
          id: detectedBugId, 
          message: bugMessages[bugNum] || `[오류] 시스템 결함 감지 (${detectedBugId})`
        });
      } else {
        setBugInfo({ id: 'site081-bug00', message: "네트워크 통신 장애 또는 서버 연결에 실패했습니다." });
      }
      setPlayerStatus('ERROR');
    } finally {
      setLoading(false);
      fetchLogs();
    }
  };

  const handleSeek = (percentage) => {
    const newTime = (percentage / 100) * (selectedVideo?.duration || 100);
    setCurrentTime(newTime);
    streamOffset.current = Math.floor(percentage * 10000); // Simulate byte offset
    setBufferLevel(percentage - 5);
    startStream('bug01'); // Seek triggers bug01
  };

  useEffect(() => {
    fetchVideos();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <ShieldAlert size={32} />
          <span>STREAM MASTER</span>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'player' ? 'active' : ''}`} onClick={() => setActiveTab('player')}>
            <Video size={20} /> Video Player
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <Terminal size={20} /> System Logs
          </div>
        </nav>
        <div style={{ marginTop: 'auto', padding: '20px', background: '#111', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '5px' }}>NODE STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
             <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>ONLINE</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{activeTab.toUpperCase()}</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div className="stat-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem' }}>Server Time: 15:28:15</span>
             </div>
             <button className="btn-outline" style={{ padding: '8px' }} onClick={() => { fetchSummary(); fetchLogs(); }}>
                <RefreshCcw size={16} />
             </button>
          </div>
        </header>

        {activeTab === 'dashboard' && summary && (
          <div style={{ padding: '40px' }}>
            <div className="stats-grid">
               <div className="stat-card">
                  <div className="stat-label">Total Repository</div>
                  <div className="stat-value">{summary.totalVideos} Videos</div>
               </div>
               <div className="stat-card">
                  <div className="stat-label">Active Connections</div>
                  <div className="stat-value">{summary.activeStreams} Nodes</div>
               </div>
               <div className="stat-card">
                  <div className="stat-label">Uptime</div>
                  <div className="stat-value">{summary.serverUptime}</div>
               </div>
               <div className="stat-card">
                  <div className="stat-label">Aggregated Bandwidth</div>
                  <div className="stat-value">{summary.bandwidthUsage}</div>
               </div>
            </div>
            
            <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
               <h3>Node Performance Monitor</h3>
               <div style={{ marginTop: '20px', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                  {[...Array(60)].map((_, i) => (
                    <div key={i} style={{ flex: 1, background: i % 10 === 0 ? 'var(--primary)' : '#222', height: `${Math.random() * 100}%` }}></div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'player' && (
          <div style={{ display: 'flex', gap: '30px', padding: '40px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                 <div>
                    <h2 style={{ marginBottom: '4px' }}>{selectedVideo?.title}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MPEG-DASH / 4K STREAMING NODE #081</span>
                 </div>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <span className={`badge badge-${playerStatus.toLowerCase()}`}>
                      {playerStatus}
                    </span>
                 </div>
              </div>

              <div className="video-screen">
                 {playerStatus === 'BUFFERING' && <div className="buffering-anim" style={{ color: 'var(--primary)' }}><RefreshCcw size={48} className="spin" /></div>}
                 {playerStatus === 'ERROR' && <div style={{ textAlign: 'center', color: 'var(--danger)' }}><AlertCircle size={48} /><p style={{ marginTop: '10px' }}>MEDIA_ERR_DECODE_FAILED</p></div>}
                 
                 <div className="video-overlay">
                    <div className="timeline-container" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      handleSeek((x / rect.width) * 100);
                    }}>
                      <div className="timeline-buffer" style={{ width: `${bufferLevel}%` }}></div>
                      <div className="timeline-progress" style={{ width: `${(currentTime / (selectedVideo?.duration || 100)) * 100}%` }}></div>
                    </div>
                    <div className="player-controls">
                      <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <SkipBack size={20} style={{ cursor: 'pointer' }} />
                      <SkipForward size={20} style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {Math.floor((selectedVideo?.duration || 0) / 60)}:{((selectedVideo?.duration || 0) % 60).toString().padStart(2, '0')}
                      </span>
                      <Volume2 size={20} style={{ marginLeft: 'auto' }} />
                      <Settings size={20} />
                      <Maximize size={20} />
                    </div>
                 </div>
              </div>

              {bugInfo && (
                <div style={{ marginTop: '20px', padding: '24px', background: 'rgba(225, 29, 72, 0.05)', border: '2px solid var(--primary)', borderRadius: '12px', boxShadow: '0 0 20px rgba(225, 29, 72, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '16px' }}>
                     <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900 }}>
                        {bugInfo.id.slice(-1)}
                     </div>
                     <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>VULNERABILITY DETECTED</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#eee', lineHeight: '1.6' }}>
                     <div style={{ marginBottom: '8px' }}>
                       <span style={{ color: 'var(--primary)', fontWeight: 700 }}>BUG_ID:</span> 
                       <span style={{ background: '#333', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', fontSize: '0.85rem' }}>{bugInfo.id}</span>
                       <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', fontSize: '0.85rem', fontWeight: 800 }}># {bugInfo.id.slice(-1)}</span>
                     </div>
                     <div>{bugInfo.message}</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '40px' }}>
                 <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    시스템 최적화 및 유지관리
                 </h3>
                 <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button className="btn-outline" onClick={() => startStream('bug01')} data-bug-id="site081-bug01">
                       대역폭 부하 분산 테스트
                    </button>
                    <button className="btn-outline" onClick={() => startStream('bug02')} data-bug-id="site081-bug02">
                       자동 화질 최적화
                    </button>
                    <button className="btn-outline" onClick={() => startStream('bug03')} data-bug-id="site081-bug03">
                       오프라인 영상 다운로드
                    </button>
                    <button className="btn-outline" onClick={() => startStream('bug04')} data-bug-id="site081-bug04">
                       플레이어 캐시 초기화
                    </button>
                 </div>
              </div>
            </div>

            <div style={{ width: '300px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Next Episodes</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {videos.map(v => (
                    <div key={v.id} 
                         style={{ display: 'flex', gap: '12px', cursor: 'pointer', opacity: selectedVideo?.id === v.id ? 1 : 0.6 }}
                         onClick={() => setSelectedVideo(v)}>
                       <div style={{ width: '80px', height: '45px', background: '#222', borderRadius: '4px', flexShrink: 0 }}></div>
                       <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{v.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.floor(v.duration / 60)}:00</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div style={{ padding: '40px' }}>
            <div className="log-panel">
               {logs.map(log => (
                 <div key={log.id} className="log-entry">
                   <span style={{ color: '#555' }}>[{new Date(log.time).toLocaleTimeString()}]</span>
                   <span style={{ color: '#0ea5e9' }}> {log.method}</span>
                   <span> {log.url}</span>
                   <span style={{ color: log.status === 206 ? 'var(--success)' : 'var(--danger)' }}> HTTP {log.status}</span>
                   {log.bugId && <span className="log-bug"> [BUG: {log.bugId}]</span>}
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
