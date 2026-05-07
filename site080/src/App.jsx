import React, { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, 
  Rss, 
  Database, 
  Terminal, 
  RefreshCcw, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Plus,
  Activity
} from 'lucide-react';

const API_BASE = 'http://localhost:9189/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [bugToasts, setBugToasts] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // For ETag/304 tracking
  const lastETag = useRef(null);

  const addBugToast = (id, message) => {
    const toast = { id: Date.now(), bugId: id, message };
    setBugToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setBugToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  };

  const fetchNews = async (trigger = null) => {
    setLoading(true);
    try {
      const headers = {};
      if (lastETag.current && trigger !== 'bug02') {
        headers['If-None-Match'] = lastETag.current;
      } else if (lastETag.current && trigger === 'bug02') {
        headers['If-None-Match'] = lastETag.current; // Send it but bug02 will ignore
      }

      const url = trigger ? `${API_BASE}/news?trigger=${trigger}` : `${API_BASE}/news`;
      const res = await fetch(url, { headers });
      
      if (res.status === 304) {
        // Normal 304 behavior
        setLoading(false);
        return;
      }

      const data = await res.json();
      setNews(data.data);
      
      const newTag = res.headers.get('ETag') || data.etag;
      
      // Detection Logic for Bug 01: ETag mismatch
      if (trigger === 'bug01') {
        if (lastETag.current && lastETag.current !== newTag) {
          addBugToast('site080-bug01', "[오류 #1] ETag 일관성 결함: 동일한 리소스에 대해 매번 새로운 ETag가 발급되어 브라우저 캐시가 무력화됩니다.");
        }
      }

      // Detection Logic for Bug 02: Conditional Request Ignore
      if (trigger === 'bug02') {
        if (res.status === 200 && headers['If-None-Match']) {
          addBugToast('site080-bug02', "[오류 #2] 조건부 요청 무시: 클라이언트가 If-None-Match 헤더를 보냈으나 서버가 304(Not Modified) 대신 200(OK)으로 응답합니다.");
        }
      }

      lastETag.current = newTag;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCacheStatus = async (trigger = null) => {
    try {
      const url = trigger ? `${API_BASE}/cache/status?trigger=${trigger}` : `${API_BASE}/cache/status`;
      const res = await fetch(url);
      const data = await res.json();
      setCacheStatus(data);

      if (data.bugId === 'site080-bug03') {
        addBugToast('site080-bug03', "[오류 #3] 캐시 무효화 실패: 데이터 업데이트 후에도 캐시 서버의 통계 데이터가 갱신되지 않고 과거의 상태를 유지합니다.");
      }
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data.data);
    } catch (e) { console.error(e); }
  };

  const handleAddNews = async () => {
    if (!newTitle || !newContent) return;
    try {
      const res = await fetch(`${API_BASE}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTitle('');
        setNewContent('');
        // Triggering bug02 usually happens when checking status after update
        addBugToast(null, "뉴스가 성공적으로 등록되었습니다.");
      }
    } catch (e) { console.error(e); }
  };

  const readDetail = async (id, trigger = null) => {
    try {
      const url = trigger ? `${API_BASE}/news/${id}?trigger=${trigger}` : `${API_BASE}/news/${id}`;
      const res = await fetch(url);
      const data = await res.json();
      setSelectedArticle(data);

      if (data.bugId === 'site080-bug04') {
        addBugToast('site080-bug04', "[오류 #4] Stale 데이터 반환: 캐시 만료(TTL)가 경과했음에도 불구하고 최신 데이터 대신 메모리에 남아있는 만료된 데이터를 반환합니다.");
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'news') fetchNews();
    if (activeTab === 'cache') fetchCacheStatus();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <Newspaper size={32} />
          <span>NEWS MASTER</span>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
            <Rss size={20} /> 실시간 피드
          </div>
          <div className={`nav-item ${activeTab === 'cache' ? 'active' : ''}`} onClick={() => setActiveTab('cache')}>
            <Database size={20} /> 캐시 모니터링
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <Terminal size={20} /> 시스템 로그
          </div>
        </nav>

        <div className="sidebar-footer" style={{ fontSize: '0.7rem', color: '#555' }}>
          &copy; 2026 site080 News Engine
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>{activeTab === 'news' ? 'Top Stories' : activeTab.toUpperCase()}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>전문 캐싱 엔진 기반 실시간 뉴스 플랫폼</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'news' && (
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> 뉴스 등록
              </button>
            )}
            <button className="btn-outline" onClick={() => {
              if (activeTab === 'news') fetchNews();
              if (activeTab === 'cache') fetchCacheStatus();
              if (activeTab === 'logs') fetchLogs();
            }}>
              <RefreshCcw size={16} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </header>

        {activeTab === 'news' && (
          <div className="view-news">
            <div className="cache-panel">
              <div className="cache-stat">
                <span className="stat-label">System Status</span>
                <span className="stat-value" style={{ color: 'var(--success)' }}>ONLINE</span>
              </div>
              <div className="cache-stat">
                <span className="stat-label">Active ETag</span>
                <span className="stat-value" style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
                  {lastETag.current ? lastETag.current.substring(0, 12) + '...' : 'NONE'}
                </span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="btn-outline" onClick={() => fetchNews('bug01')} data-bug-id="site080-bug01">
                  뉴스 피드 동기화
                </button>
                <button className="btn-outline" onClick={() => fetchNews('bug02')} data-bug-id="site080-bug02">
                  브라우저 캐시 최적화 확인
                </button>
              </div>
            </div>

            <div className="news-grid">
              {news.map(item => (
                <article key={item.id} className="news-card">
                  <div className="card-tag">{item.category || 'NEWS'}</div>
                  <div className="card-content">
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.content}</p>
                    <div className="card-footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} /> {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      <button className="btn-outline" style={{ fontSize: '0.7rem' }} onClick={() => readDetail(item.id, item.id === 1 ? 'bug04' : null)} data-bug-id={item.id === 1 ? 'site080-bug04' : ''}>
                        상세 보기
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="view-cache">
            <div className="cache-panel" style={{ background: '#111', color: 'white' }}>
              <div className="cache-stat">
                <span className="stat-label" style={{ color: '#888' }}>Cache Hits</span>
                <span className="stat-value" style={{ color: 'var(--success)' }}>{cacheStatus?.hit}</span>
              </div>
              <div className="cache-stat">
                <span className="stat-label" style={{ color: '#888' }}>Cache Misses</span>
                <span className="stat-value" style={{ color: 'var(--danger)' }}>{cacheStatus?.miss}</span>
              </div>
              <div className="cache-stat">
                <span className="stat-label" style={{ color: '#888' }}>Last Invalidation</span>
                <span className="stat-value" style={{ fontSize: '0.9rem' }}>{cacheStatus?.lastUpdated}</span>
              </div>
              <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => fetchCacheStatus('bug03')} data-bug-id="site080-bug03">
                통계 새로고침
              </button>
            </div>
            
            <div style={{ background: 'white', padding: '30px', border: '1px solid var(--border)' }}>
              <h3>Cache Performance Analysis</h3>
              <p style={{ margin: '15px 0', color: 'var(--text-muted)' }}>서버 메모리 캐시 상태와 정합성을 실시간으로 모니터링합니다.</p>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px' }}>
                <div style={{ flex: 1, background: 'var(--success)', height: `${(cacheStatus?.hit / (cacheStatus?.hit + cacheStatus?.miss || 1)) * 100}%`, position: 'relative' }}>
                   <span style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center' }}>HIT</span>
                </div>
                <div style={{ flex: 1, background: 'var(--danger)', height: `${(cacheStatus?.miss / (cacheStatus?.hit + cacheStatus?.miss || 1)) * 100}%`, position: 'relative' }}>
                   <span style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center' }}>MISS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="view-logs">
            <div className="log-container">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <span style={{ color: '#888' }}>[{new Date(log.time).toLocaleTimeString()}]</span>
                  <span className="log-method"> {log.method}</span>
                  <span className="log-url"> {log.url}</span>
                  <span className="log-status"> HTTP {log.status}</span>
                  {log.bugId && <span className="log-bug"> [BUG: {log.bugId}]</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '20px' }}>긴급 뉴스 등록</h2>
            <div className="form-group">
              <label>헤드라인</label>
              <input type="text" className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="기사 제목을 입력하세요" />
            </div>
            <div className="form-group">
              <label>본문 내용</label>
              <textarea className="form-input" style={{ height: '120px' }} value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="기사 내용을 입력하세요" />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddNews}>속보 긴급 업데이트</button>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {selectedArticle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
               <span className="badge-live">LIVE</span>
               <button className="btn-outline" onClick={() => setSelectedArticle(null)}>닫기</button>
            </div>
            <h2 style={{ marginBottom: '15px' }}>{selectedArticle.title}</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
               발행 시간: {new Date(selectedArticle.timestamp).toLocaleString()}
            </div>
            <p style={{ lineHeight: '1.6', color: '#333' }}>{selectedArticle.content}</p>
            {selectedArticle.bugId && (
              <div style={{ marginTop: '30px', padding: '15px', background: '#fff7ed', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                캐시 데이터 신뢰성 경고: {selectedArticle.bugId}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="toast-container">
        {bugToasts.map(toast => (
          <div key={toast.id} className="toast" data-bug-id={toast.bugId}>
            <div className="toast-icon">
              {toast.bugId ? <AlertTriangle size={20} color="#f59e0b" /> : <Info size={20} color="#3b82f6" />}
            </div>
            <div className="toast-body">
              <div className="toast-header">
                {toast.bugId ? `시스템 로직 오류 감지 (${toast.bugId})` : '알림'}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
