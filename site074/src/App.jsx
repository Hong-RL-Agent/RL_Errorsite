import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Hash, 
  TrendingUp, 
  PieChart, 
  Search, 
  Plus, 
  AlertTriangle, 
  Database,
  Zap,
  Activity,
  Maximize2,
  RefreshCw,
  Terminal,
  Layers,
  LayoutDashboard
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard');
  const [hashtags, setHashtags] = useState([]);
  const [trends, setTrends] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [bugId, setBugId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [userProfile] = useState({ name: '이주이 분석가', role: 'Senior Analyst' });

  const fetchHashtags = async (triggerBug = '') => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (triggerBug) query.append('triggerBug', triggerBug);

      const res = await fetch(`/api/hashtags?${query.toString()}`);
      const data = await res.json();
      setHashtags(data.data);
      if (data.bugId) setBugId(data.bugId);
      else if (triggerBug) setBugId(null);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchTrends = async (triggerBug = '') => {
    setLoading(true);
    try {
      const query = triggerBug ? `?triggerBug=${triggerBug}` : '';
      const res = await fetch(`/api/trends${query}`);
      const data = await res.json();
      setTrends(data.data);
      if (data.bugId) setBugId(data.bugId);
      else if (triggerBug) setBugId(null);
    } catch (e) {}
    setLoading(false);
  };

  const fetchStats = async (triggerBug = '') => {
    setLoading(true);
    try {
      const query = triggerBug ? `?triggerBug=${triggerBug}` : '';
      const res = await fetch(`/api/stats/sample${query}`);
      const data = await res.json();
      setStats(data.trendScore);
      if (data.bugId) setBugId(data.bugId);
      else if (triggerBug) setBugId(null);
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

  const handleAddTag = async (triggerBug = '') => {
    if (!newTag) return;
    setLoading(true);
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag.startsWith('#') ? newTag : '#' + newTag, triggerBug })
      });
      const data = await res.json();
      if (data.bugId) setBugId(data.bugId);
      else setBugId(null); // Clear bugId on safe registration

      setShowAddModal(false);
      setNewTag('');
      fetchHashtags();
      fetchLogs();
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
    fetchLogs();
    if (view === 'hashtags') fetchHashtags();
    if (view === 'trends') fetchTrends();
    if (view === 'stats') fetchStats();
  }, [view]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Zap size={28} />
          <span>TrendLens AI</span>
        </div>
        
        <div className="user-section">
          <div className="user-avatar">{userProfile.name[0]}</div>
          <div className="user-info">
            <div className="user-name">{userProfile.name}</div>
            <div className="user-role">{userProfile.role}</div>
          </div>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={20} /> 실시간 대시보드
          </div>
          <div className={`nav-item ${view === 'hashtags' ? 'active' : ''}`} onClick={() => setView('hashtags')}>
            <Hash size={20} /> 트렌드 인벤토리
          </div>
          <div className={`nav-item ${view === 'trends' ? 'active' : ''}`} onClick={() => setView('trends')}>
            <TrendingUp size={20} /> 시계열 변화 분석
          </div>
          <div className={`nav-item ${view === 'stats' ? 'active' : ''}`} onClick={() => setView('stats')}>
            <PieChart size={20} /> 통계 모델링
          </div>
        </nav>

        <div className="system-status">
          <div className="status-header">엔진 상태</div>
          <div className="status-body">
            <div className="status-dot"></div>
            <span>분석 엔진 최적화 완료</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{
              view === 'dashboard' ? '실시간 트렌드 요약' :
              view === 'hashtags' ? '해시태그 탐색 엔진' :
              view === 'trends' ? '시계열 변화 모니터링' : '지능형 샘플링 통계'
            }</h1>
            <p className="header-sub">최신 소셜 데이터를 기반으로 한 분석 결과입니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-neon" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> 해시태그 수집 등록
            </button>
          </div>
        </header>

        {bugId && (
          <div className="alert-neon">
            <AlertTriangle size={24} />
            <div>
              <strong>PPO 탐지 경고:</strong> 시스템 로직에서 심각한 데이터 정합성 오류가 발견되었습니다.
              <div style={{ fontSize: '0.813rem', marginTop: '4px', opacity: 0.8 }}>발견된 버그 ID: {bugId}</div>
            </div>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setBugId(null)}>&times;</button>
          </div>
        )}

        {view === 'dashboard' && (
          <div>
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-label">분석된 해시태그</div>
                <div className="stat-value">{summary?.totalTags.toLocaleString() || '0'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">현재 인기 1위</div>
                <div className="stat-value" style={{ color: 'var(--secondary)' }}>{summary?.topTag || '#-'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">활성 분석가</div>
                <div className="stat-value">{summary?.activeUsers.toLocaleString() || '0'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div className="trend-list">
                <h3 style={{ marginBottom: '24px' }}>실시간 인기 급상승</h3>
                {hashtags.slice(0, 5).map((h, i) => (
                  <div key={h.id} className="list-item">
                    <div className="tag-info">
                      <div className="tag-rank">0{i+1}</div>
                      <div className="tag-name">{h.tag}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{h.count.toLocaleString()}회</span>
                       {h.trend === 'up' ? <TrendingUp size={16} color="var(--accent)" /> : <Activity size={16} color="var(--danger)" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="log-panel">
                 <h4 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Terminal size={16} /> 분석 엔진 로그</h4>
                 {logs.map(log => (
                   <div key={log.id} className="log-entry">
                     <span>{new Date(log.time).toLocaleTimeString()}</span> {log.msg}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {view === 'hashtags' && (
          <div>
             <div className="controls">
               <div className="input-group">
                 <input 
                  className="input-glow" 
                  placeholder="분석할 키워드를 입력하세요..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchHashtags()}
                 />
                 <button className="btn-primary-small" onClick={() => fetchHashtags()}>검색</button>
               </div>
               <button className="btn-secondary-outline" onClick={() => fetchHashtags('site074-bug01')} data-bug-id="site074-bug01">
                 글로벌 다국어 검색 고도화
               </button>
             </div>

             <div className="trend-list">
                {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><RefreshCw className="spin" /></div> : 
                 hashtags.map((h, idx) => {
                  const isDuplicate = hashtags.filter(item => item.id === h.id).length > 1;
                  return (
                    <div key={idx} className={`list-item ${isDuplicate ? 'id-conflict' : ''}`} style={isDuplicate ? { border: '2px solid var(--secondary)', background: 'rgba(255,0,128,0.1)', animation: 'blink 1s infinite' } : {}}>
                      <div className="tag-info">
                        <div className="tag-name" style={{ color: h.tag.length < 3 && h.tag.includes('맛') ? 'var(--secondary)' : 'inherit' }}>{h.tag}</div>
                        {h.tag.length < 3 && h.tag.includes('맛') && <span className="error-tag">인코딩 손상됨</span>}
                        {isDuplicate && <span className="error-tag orange" style={{ backgroundColor: 'var(--secondary)', color: 'white' }}><AlertTriangle size={12} /> 시스템 정합성 파괴됨</span>}
                      </div>
                      <div className="id-badge" style={{ backgroundColor: isDuplicate ? 'var(--danger)' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 'bold' }}>
                        {isDuplicate ? 'CONFLICT' : 'UID'}: {h.id}
                      </div>
                    </div>
                  );
                 })}
             </div>
          </div>
        )}

        {view === 'trends' && (
          <div>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h3 style={{ marginBottom: '4px' }}>시간대별 영향력 지수</h3>
                 <p style={{ color: 'var(--text-muted)' }}>데이터 압축 최적화 기술을 사용하여 트렌드 변화를 실시간 스트리밍합니다.</p>
               </div>
               <button className="btn-neon" onClick={() => fetchTrends('site074-bug02')} data-bug-id="site074-bug02">
                 최적화 압축 데이터 로드
               </button>
            </div>

            <div className="trend-list" style={{ height: '400px' }}>
              <div className="chart-container">
                {trends.map((t, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${t.score}%` }}>
                    <div className="chart-label">{t.hour}</div>
                  </div>
                ))}
              </div>
              {trends.length < 5 && trends.length > 0 && (
                <div style={{ marginTop: '40px', color: 'var(--danger)', fontSize: '0.875rem' }}>
                  * 경고: 데이터 압축 해제 중 {trends.length}개 항목만 로드되었습니다. (데이터 유실 의심)
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <div className="stat-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
               <div className="stat-label">종합 트렌드 파워 지수</div>
               <div className="stat-value" style={{ fontSize: '4rem', color: stats > 100 ? 'var(--secondary)' : 'var(--accent)' }}>
                 {stats || '0.0'}
               </div>
               <button className="btn-neon" style={{ marginTop: '24px', marginInline: 'auto' }} onClick={() => fetchStats('site074-bug04')} data-bug-id="site074-bug04">
                 <Maximize2 size={18} /> 정밀 샘플링 통계 실행
               </button>
            </div>
            
            <div className="trend-list" style={{ width: '100%' }}>
               <h4 style={{ marginBottom: '20px' }}>샘플링 알고리즘 분석</h4>
               <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                 샘플링 왜곡이 발생할 경우, 특정 시간대의 고득점 데이터만 추출되어 전체 지수가 비정상적으로 높게 산출됩니다. 
                 PPO 에이전트는 이 왜곡된 결과값을 감지하여 버그를 식별해야 합니다.
               </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '24px', width: '400px', border: '1px solid var(--border)', margin: 'auto' }}>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.4' }}>
              * <strong>표준 등록:</strong> 고유성을 보장하지만 수집 속도가 약간 느립니다.<br/>
              * <strong>병렬 등록:</strong> 처리 속도가 매우 빠르지만, ID 생성 정밀도 하락으로 인한 <strong>중복 충돌</strong> 위험이 있습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-neon" style={{ flex: 1 }} onClick={() => handleAddTag()}>안전한 실시간 등록</button>
              <button className="btn-secondary-outline" style={{ flex: 1 }} onClick={() => handleAddTag('site074-bug03')} data-bug-id="site074-bug03">
                고성능 병렬 등록
              </button>
            </div>
            <button style={{ width: '100%', marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>취소</button>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
