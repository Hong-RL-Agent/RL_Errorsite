import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Monitor, BarChart3, History, Settings2, Bell, Search, User, 
  RefreshCcw, Download, PlusCircle, Send, Zap, TrendingUp, Database, 
  ArrowUpRight, Activity, Share2, Trash2, X, AlertTriangle, Lock, Globe, FileText
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [category, setCategory] = useState('전체');
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [summary, setSummary] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bugInfo, setBugInfo] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals & Popovers
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  // Search & Update
  const [searchTerm, setSearchTerm] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateCat, setUpdateCat] = useState('정치');

  const categories = ['전체', '정치', '스포츠', 'IT'];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const url = category === '전체' ? `${API_BASE}/news` : `${API_BASE}/news?category=${category}`;
      const [nRes, tRes, sRes, lRes] = await Promise.all([
        fetch(url),
        fetch(`${API_BASE}/news/trending`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/logs`)
      ]);
      
      const nData = await nRes.json();
      const tData = await tRes.json();
      const sData = await sRes.json();
      const lData = await lRes.json();

      setNews(nData.data || []);
      setTrending(tData.data || []);
      setSummary(sData);
      setLogs(lData.data);

      const bugId = nRes.headers.get('X-Bug-Id');
      
      // [BUG DETECTION LOGIC FOR POPUPS]
      
      // 1. Bug 01 (Invalidation Missed)
      // If we see stale count in general feed after an update was supposed to happen
      if (category === '전체' && sData.totalSource > nData.data.length && nData.data.length > 0) {
        setBugInfo({
          id: 'site089-bug01',
          title: '캐시 무효화 실패 (Bug 01)',
          message: '뉴스 소스는 업데이트되었으나, 캐시 엔진이 이를 무효화하지 못해 이전 데이터를 계속 반환하고 있습니다.'
        });
      }

      // 2. Bug 02 (Key Collision)
      if (category !== '전체' && nData.data.length > 0) {
        if (nData.data[0].category !== category) {
          setBugInfo({
            id: 'site089-bug02',
            title: '캐시 키 충돌 (Bug 02)',
            message: `'${category}' 데이터를 요청했으나, 공유 캐시 키 사용으로 인해 '${nData.data[0].category}' 데이터가 반환되었습니다.`
          });
        }
      }

      // 3. Bug 03 (Partial Update)
      // If we are in a category and the list is suspiciously small (1 item)
      if (category !== '전체' && nData.data.length === 1 && sData.totalSource > 6) {
        setBugInfo({
          id: 'site089-bug03',
          title: '부분 업데이트 누락 (Bug 03)',
          message: '업데이트 후 캐시 리스트가 파손되었습니다. 전체 목록 대신 최신 항목 1개만 유지되고 있습니다.'
        });
      }

    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateTitle) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/news/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updateTitle, category: updateCat })
      });
      setUpdateTitle('');
      showToast("뉴스 소스 업데이트 요청 완료");
      await fetchData(); // This will trigger the bug detection popups
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleIntegrityCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/news/source`);
      const data = await res.json();
      if (data.bugId === 'site089-bug04') {
        setBugInfo({
          id: 'site089-bug04',
          title: '데이터 불일치 (Bug 04)',
          message: '캐시 메모리와 원본 DB 소스 간의 데이터 체크섬이 일치하지 않습니다. 데이터 무결성 오류입니다.'
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const resetCache = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/admin/reset-cache`, { method: 'POST' });
      showToast("시스템 캐시 강제 동기화 성공");
      await fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredNews = useMemo(() => {
    return news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [news, searchTerm]);

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('news')} style={{ cursor: 'pointer' }}>
          <ShieldCheck size={32} color="var(--primary)" strokeWidth={2.5} />
          <span>NewsCore</span>
        </div>
        <nav className="nav">
          <button className={`nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
            <Monitor size={20} /> 실시간 관제
          </button>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={20} /> 대시보드
          </button>
          <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> 감사 로그
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="summary-minified">
            <div className="min-item"><span>DB Source</span><strong>{summary.totalSource || 0}</strong></div>
            <div className="min-item"><span>Cached Items</span><strong>{summary.totalCache || 0}</strong></div>
          </div>
          <button className="nav-item" style={{ marginTop: '16px', width: '100%', background: '#fee2e2', color: '#ef4444' }} onClick={resetCache}>
            <Lock size={18} /> 캐시 강제 복구
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="header">
          <div className="search-bar">
            <Search size={20} color="#666" />
            <input 
              type="text" 
              placeholder="뉴스 헤드라인 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}><Bell size={20} /></button>
            <button className="icon-btn" onClick={() => setShowSettings(true)}><Settings2 size={20} /></button>
            <div className="user-profile">
              <div className="avatar"><User size={18} /></div>
              <span>Admin_Root</span>
            </div>
          </div>
        </header>

        {activeTab === 'news' && (
          <div className="content animate-in">
            <div className="tab-row">
              <div className="categories">
                {categories.map(cat => (
                  <button key={cat} className={`cat-tab ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
                ))}
              </div>
              <div className="tab-actions">
                <button className="btn-outline" onClick={() => showToast("CSV 보고서가 준비되었습니다.")}><Download size={18} /> 내보내기</button>
                <button className="refresh-btn" onClick={() => fetchData()}><RefreshCcw size={18} className={loading ? 'spin' : ''} /> 수동 동기화</button>
              </div>
            </div>

            <div className="news-layout">
              <div className="news-list">
                <div className="section-header">
                  <h3>{category === '전체' ? '실시간 통합 피드' : `${category} 뉴스 센터`}</h3>
                  <span>{filteredNews.length} items detected</span>
                </div>
                {filteredNews.length > 0 ? filteredNews.map((item, idx) => (
                  <div key={item.id} className="news-card" onClick={() => setSelectedNews(item)}>
                    <div className="news-meta">
                      <span className="news-cat">{item.category}</span>
                      <span className="news-time">{new Date(item.createdAt).toLocaleTimeString()}</span>
                      {idx === 0 && <span className="badge-new">NEW</span>}
                    </div>
                    <h3 className="news-title">{item.title}</h3>
                    <div className="news-footer">
                      <span className="news-views"><Activity size={14} /> {item.views.toLocaleString()} 읽음</span>
                      <div className="card-actions">
                        <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); showToast("공유 링크 복사"); }}><Share2 size={16} /></button>
                        <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); showToast("삭제 권한 없음"); }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">
                    <AlertTriangle size={48} color="var(--warning)" />
                    <p>표시할 뉴스가 없습니다. (캐시 무효화 실패)</p>
                  </div>
                )}
              </div>

              <aside className="control-panel">
                <div className="panel-card highlight-border">
                  <div className="panel-header"><PlusCircle size={20} color="var(--primary)" /><h4>헤드라인 즉시 발행</h4></div>
                  <form onSubmit={handleUpdate}>
                    <div className="input-group">
                      <label>카테고리</label>
                      <select value={updateCat} onChange={(e) => setUpdateCat(e.target.value)}>
                        <option value="정치">정치</option>
                        <option value="스포츠">스포츠</option>
                        <option value="IT">IT</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>뉴스 제목</label>
                      <input type="text" placeholder="제목 입력..." value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                      <Send size={18} /> 뉴스 소스 업데이트
                    </button>
                  </form>
                </div>

                <div className="panel-card">
                  <div className="panel-header"><TrendingUp size={20} color="var(--primary)" /><h4>인기 급상승</h4></div>
                  <div className="trending-list">
                    {trending.map((t, i) => (
                      <div key={t.id} className="trending-item">
                        <span className="rank">{i+1}</span>
                        <div className="trending-info"><p className="t-title">{t.title}</p><span>{t.category}</span></div>
                        <ArrowUpRight size={14} color="#10b981" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-card">
                  <div className="panel-header"><Database size={20} color="#10b981" /><h4>무결성 대조</h4></div>
                  <button className="verify-btn" onClick={handleIntegrityCheck}><Zap size={16} /> 원본 대조 시작</button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="content animate-in">
            <h2 className="section-title">캐시 메모리 및 시스템 정합성</h2>
            <div className="dashboard-grid">
              <div className="dash-card">
                <div className="dash-icon"><Zap size={24} color="var(--primary)" /></div>
                <h3>실시간 히트율</h3>
                <div className="health-circle">{summary.hitRate}%</div>
              </div>
              <div className="dash-card">
                <div className="dash-icon"><Database size={24} color="#10b981" /></div>
                <h3>정합성 지표</h3>
                <div className="consistency-stats">
                  <div className="c-item"><span>DB Source Count</span><strong>{summary.totalSource}</strong></div>
                  <div className="c-item"><span>Cache Feed Count</span><strong>{summary.totalCache}</strong></div>
                  {summary.totalSource !== summary.totalCache && <div className="c-error"><AlertTriangle size={14} /> Invalidation Failure</div>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="content animate-in">
            <div className="log-panel">
              <div className="log-header"><h3>System Logs</h3></div>
              <div className="log-list">
                {logs.map(log => (
                  <div key={log.id} className="log-item">
                    <span className="log-time">{new Date(log.time).toLocaleTimeString()}</span>
                    <span className={`log-tag ${log.type.toLowerCase()}`}>{log.type}</span>
                    <span className="log-msg">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedNews && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
             <div className="modal-header"><h3>뉴스 상세</h3><button onClick={() => setSelectedNews(null)}><X size={20} /></button></div>
             <div className="modal-body">
                <span className="news-cat">{selectedNews.category}</span>
                <h2 style={{ marginTop: '16px' }}>{selectedNews.title}</h2>
                <p style={{ marginTop: '20px', color: '#64748b' }}>본 기사는 캐시 시스템을 통해 로드되었습니다.</p>
                <button className="btn-primary" style={{ width: '100%', marginTop: '30px' }} onClick={() => setSelectedNews(null)}>닫기</button>
             </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
             <div className="modal-header"><h3>시스템 설정</h3><button onClick={() => setShowSettings(false)}><X size={20} /></button></div>
             <div className="modal-body">
                <div className="setting-row"><span>캐시 디버깅 모드</span><input type="checkbox" defaultChecked /></div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowSettings(false)}>저장</button>
             </div>
          </div>
        </div>
      )}

      {bugInfo && (
        <div className="bug-overlay" onClick={() => setBugInfo(null)}>
          <div className="bug-modal" onClick={e => e.stopPropagation()}>
            <div className="bug-header-modal"><AlertTriangle size={28} color="#ef4444" /><span className="bug-id-tag">{bugInfo.id}</span></div>
            <h3>{bugInfo.title}</h3>
            <p>{bugInfo.message}</p>
            <button className="btn-primary" style={{ width: '100%', background: '#1e293b', marginTop: '24px' }} onClick={() => setBugInfo(null)}>확인</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
      {loading && <div className="global-loader"><RefreshCcw size={16} className="spin" /><span>PROCESSING...</span></div>}
    </div>
  );
};

export default App;
