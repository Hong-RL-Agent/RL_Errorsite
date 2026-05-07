import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Box, 
  Activity, 
  Cpu, 
  Database, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  Hash, 
  Code,
  FileText,
  RefreshCw,
  LogOut,
  User,
  Settings,
  MoreHorizontal,
  Zap,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:9187/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bugToasts, setBugToasts] = useState([]);
  const [popular, setPopular] = useState([]);

  const addBugToast = (id, message) => {
    const toast = { id: Date.now(), bugId: id, message };
    setBugToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setBugToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  };

  const fetchData = async () => {
    try {
      const [sumRes, popRes, logRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/summary`).then(r => r.json()),
        fetch(`${API_BASE}/popular`).then(r => r.json()),
        fetch(`${API_BASE}/logs`).then(r => r.json())
      ]);
      setSummary(sumRes);
      setPopular(popRes.data);
      setLogs(logRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (e, qOverride = null) => {
    if (e) e.preventDefault();
    const searchQ = qOverride || query;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search?q=${searchQ}`);
      const data = await res.json();
      setResults(data.data);
      
      // Natural Bug Triggering
      if (data.bugId) {
        addBugToast(data.bugId, data.message || "Search Pipeline Anomaly Detected");
      }
      data.data.forEach(item => {
        if (item.bugId) addBugToast(item.bugId, `Logic Consistency Failure: ${item.bugId}`);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Natural Bug Triggers
  const testTokenizer = () => {
    setQuery('ReactJS');
    handleSearch(null, 'ReactJS');
  };

  const runIndexAudit = () => {
    setQuery('Node');
    handleSearch(null, 'Node');
  };

  const optimizeRanking = () => {
    setQuery('async');
    handleSearch(null, 'async');
  };

  const auditHighlights = () => {
    setQuery('useEffect');
    handleSearch(null, 'useEffect');
  };

  const chartData = [
    { name: '01:00', v: 30 }, { name: '02:00', v: 45 }, { name: '03:00', v: 35 },
    { name: '04:00', v: 60 }, { name: '05:00', v: 55 }, { name: '06:00', v: 80 }, { name: '07:00', v: 75 },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo-area">
          <Layers size={28} />
          <span>DevPortal</span>
        </div>

        <div className="nav-menu" style={{ flex: 1 }}>
          <div className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <Search size={20} /> <span>문서 탐색</span>
          </div>
          <div className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <Activity size={20} /> <span>시스템 현황</span>
          </div>
          <div className={`nav-link ${activeTab === 'index' ? 'active' : ''}`} onClick={() => setActiveTab('index')}>
            <Database size={20} /> <span>데이터 관리</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="nav-link" onClick={() => alert("User Config")}>
            <User size={20} /> <span>Admin JD</span>
          </div>
          <div className="nav-link" style={{ color: '#f43f5e' }} onClick={() => window.location.reload()}>
            <LogOut size={20} /> <span>로그아웃</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-wrapper">
        {activeTab === 'search' && (
          <div className="view-search">
            <div className="search-section">
              <h1 style={{ fontSize: '2.5rem', marginBottom: '32px', textAlign: 'center', fontWeight: 800 }}>
                통합 기술 문서 <span style={{ color: 'var(--accent)' }}>검색</span>
              </h1>
              <form className="search-box-wrap" onSubmit={handleSearch}>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="무엇을 찾으시나요? (예: React, Node, Async...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="search-actions">
                  {/* Integrated Bug 1: Tokenizer Preview */}
                  <button type="button" className="icon-btn" title="Tokenize Preview" onClick={testTokenizer} data-bug-id="site078-bug01">
                    <Hash size={18} />
                  </button>
                  <button type="submit" className="btn-primary">검색</button>
                </div>
              </form>
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {popular.map(kw => (
                  <span key={kw} className="badge" style={{ cursor: 'pointer' }} onClick={() => handleSearch(null, kw)}>#{kw}</span>
                ))}
              </div>
            </div>

            <div className="results-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--text-secondary)' }}>검색 결과 ({results.length})</h3>
                {/* Integrated Bug 3: AI Ranking */}
                <button className="icon-btn" style={{ fontSize: '0.8rem', gap: '8px' }} onClick={optimizeRanking} data-bug-id="site078-bug03">
                  <Zap size={14} /> AI 랭킹 최적화
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                  <RefreshCw className="spin" size={48} color="var(--accent)" />
                </div>
              ) : results.length > 0 ? (
                results.map(doc => (
                  <div key={doc.id} className="doc-card">
                    <div className="doc-header">
                      <div>
                        <div className="doc-title">{doc.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{doc.category} / {doc.lang}</div>
                      </div>
                      <div className="badge">SCORE: {doc.score || '9.8'}</div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                      {doc.content}
                    </p>
                    <div className="doc-snippet">
                      <div className="snippet-action">
                        {/* Integrated Bug 4: Highlight Audit */}
                        <button className="icon-btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={auditHighlights} data-bug-id="site078-bug04">
                          <Code size={12} /> Audit Highlight
                        </button>
                      </div>
                      {doc.offsetError ? (
                        <div style={{ color: '#888' }}>
                          ... {doc.content.slice(0,10)} <span className="hl-bug">{doc.highlight}</span> {doc.content.slice(20,40)} ...
                        </div>
                      ) : (
                        <code>{doc.snippet}</code>
                      )}
                    </div>
                  </div>
                ))
              ) : query && (
                <div style={{ textAlign: 'center', padding: '100px', background: 'var(--bg-panel)', borderRadius: '24px' }}>
                  <AlertCircle size={64} color="var(--text-secondary)" style={{ marginBottom: '24px' }} />
                  <h2>결과를 찾을 수 없습니다</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>검색 엔진 인덱스 상태를 확인해 보세요.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="view-stats">
            <h1 style={{ marginBottom: '48px' }}>시스템 데이터 <span style={{ color: 'var(--accent)' }}>인덱싱 현황</span></h1>
            
            <div className="stats-container" style={{ marginBottom: '48px' }}>
              <div className="stat-box">
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>전체 문서 소스</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>1,024</div>
              </div>
              <div className="stat-box" data-bug-id={summary?.bugId}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>인덱스 완료</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent)' }}>992</div>
                {/* Integrated Bug 2: Index Audit */}
                <button className="icon-btn btn-verify" onClick={runIndexAudit} data-bug-id="site078-bug02">
                  <ShieldCheck size={18} />
                </button>
              </div>
              <div className="stat-box">
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>데이터 무결성</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: '#f59e0b' }}>DEGRADED</div>
              </div>
            </div>

            <div className="stat-box" style={{ height: '400px', marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '24px' }}>검색 정확도 추이 (7D)</h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <ChartTooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={4} dot={{ fill: 'var(--accent)', r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="stat-box">
              <h3 style={{ marginBottom: '24px' }}>시스템 처리 로그</h3>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{log.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: log.status === 'success' ? 'var(--accent)' : 'var(--warning)', fontWeight: 800 }}>
                    {log.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'index' && (
          <div style={{ textAlign: 'center', padding: '120px' }}>
            <Cpu size={80} color="var(--text-secondary)" className="spin" style={{ marginBottom: '32px' }} />
            <h1 style={{ fontSize: '2rem' }}>인덱스 재구축 중...</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>백엔드 파이프라인 정기 점검 중입니다. 잠시 후 다시 시도해 주세요.</p>
            <button className="btn-primary" style={{ marginTop: '40px' }} onClick={() => setActiveTab('search')}>검색창으로 이동</button>
          </div>
        )}
      </main>

      {/* Bug Toasts */}
      <div className="toast-layer">
        {bugToasts.map(toast => (
          <div key={toast.id} className="bug-toast" data-bug-id={toast.bugId}>
            <AlertCircle color="#f43f5e" size={24} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>PIPE_LOG: {toast.bugId}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
