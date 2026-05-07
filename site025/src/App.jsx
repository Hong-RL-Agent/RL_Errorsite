import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Zap, 
  BarChart3, 
  Users, 
  Search, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight,
  Info,
  AlertCircle,
  LayoutDashboard,
  BrainCircuit,
  X
} from 'lucide-react';

const API_BASE = '/api';

// UI Strings in Korean to avoid JSX parsing issues with non-ASCII
const UI = {
  TITLE: 'MBTI 넥서스',
  COMPATIBILITY: '궁합 매칭',
  TRENDS: '인기 트렌드',
  VECTORS: '글로벌 벡터',
  DEEP_SEARCH: '정밀 검색',
  SYSTEM_STATUS: '시스템 상태',
  CONNECTED: '연결됨',
  DISCONNECTED: '연결 끊김',
  SEARCH_PLACEHOLDER: 'MBTI 유형 검색...',
  AGENT_NAME: 'PPO 학습 에이전트',
  ANOMALY_DETECTED: '이상 징후 감지됨 (시뮬레이션)',
  TOTAL_USERS: '전체 사용자',
  DAILY_MATCHES: '일일 매칭 수',
  ACTIVE_INDEXERS: '활성 인덱서',
  SYSTEM_UPTIME: '시스템 가동률',
  YOUR_MBTI: '당신의 MBTI',
  PARTNER_MBTI: '상대방의 MBTI',
  SELECT_TYPE: '자신의 성격 유형을 선택하세요',
  SELECT_PARTNER_TYPE: '상대방의 성격 유형을 선택하세요',
  ANALYZE: '궁합 분석하기',
  MATCH_ID: '매칭 ID',
  SYNC_INDEX: '동기화 지수',
  UPDATE_TRENDS: '트렌드 업데이트',
  TOP_MATCHED: '이번 주 최다 매칭 유형',
  MATCH_COUNT: '매칭 건수',
  SYNC_VECTORS: '벡터 동기화',
  VECTOR_DESC: '시뮬레이션된 선호도 가중치 및 동기화 상태입니다.',
  TREND_DESC: '가장 많이 조회된 MBTI 조합 및 데이터 분포입니다.',
  IDEAL: '최고의',
  GOOD: '좋은',
  CHALLENGING: '도전적인',
  MATCH_TEXT: '궁합!'
};

function App() {
  const [activeTab, setActiveTab] = useState('match');
  const [loading, setLoading] = useState(false);
  const [mbtis, setMbtis] = useState([]);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [popularMatches, setPopularMatches] = useState([]);
  const [realtimeVectors, setRealtimeVectors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastBugId, setLastBugId] = useState(null);

  useEffect(() => {
    fetchMbtis();
    fetchSummary();
    fetchHealth();
  }, []);

  useEffect(() => {
    if (activeTab === 'trends') fetchPopular();
    if (activeTab === 'vectors') fetchRealtime();
  }, [activeTab]);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) { console.error(e); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const fetchMbtis = async () => {
    try {
      const res = await fetch(`${API_BASE}/mbti`);
      const data = await res.json();
      setMbtis(data.data || []);
    } catch (e) { console.error(e); }
  };

  const calculateMatch = async () => {
    if (!selectedA || !selectedB) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/match/${selectedA}/${selectedB}`);
      const data = await res.json();
      setMatchResult(data);
      if (data.bugId) setLastBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchPopular = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/matches/popular`);
      const data = await res.json();
      setPopularMatches(data.data || []);
      if (data.bugId) setLastBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchRealtime = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/matches/realtime`);
      const data = await res.json();
      setRealtimeVectors(data.data || []);
      if (data.bugId) setLastBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/search?q=${val}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      if (data.bugId) setLastBugId(data.bugId);
    } catch (e) { console.error(e); }
  };

  const renderMatchTab = () => (
    <div className="fade-in-up">
      <div className="match-builder">
        <div className="mbti-selector-card">
          <h3>{UI.YOUR_MBTI}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{UI.SELECT_TYPE}</p>
          <div className="mbti-grid">
            {mbtis.map(m => (
              <button 
                key={`a-${m}`} 
                className={`mbti-btn ${selectedA === m ? 'selected' : ''}`}
                onClick={() => setSelectedA(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mbti-selector-card">
          <h3>{UI.PARTNER_MBTI}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{UI.SELECT_PARTNER_TYPE}</p>
          <div className="mbti-grid">
            {mbtis.map(m => (
              <button 
                key={`b-${m}`} 
                className={`mbti-btn ${selectedB === m ? 'selected' : ''}`}
                onClick={() => setSelectedB(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <button 
          className="btn-primary" 
          onClick={calculateMatch} 
          disabled={!selectedA || !selectedB}
          data-bug-id="site025-bug04"
        >
          <Zap size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          {UI.ANALYZE}
        </button>
      </div>

      {matchResult && (
        <div className="result-card fade-in-up">
          <div className="score-circle">
            {matchResult.score}%
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {matchResult.type === 'Ideal' ? UI.IDEAL : matchResult.type === 'Good' ? UI.GOOD : UI.CHALLENGING} {UI.MATCH_TEXT}
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', textAlign: 'center' }}>{matchResult.analysis}</p>
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{UI.SYNC_INDEX}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{matchResult.traitsUsed}/5</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{UI.MATCH_ID}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>#X-92</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTrendsTab = () => (
    <div className="fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>{UI.TRENDS}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{UI.TREND_DESC}</p>
        </div>
        <button className="btn-primary" onClick={fetchPopular} data-bug-id="site025-bug01" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
          <RefreshCw size={16} /> {UI.UPDATE_TRENDS}
        </button>
      </div>

      <div className="list-card">
        {popularMatches.map((item, idx) => (
          <div key={item.mbti} className="item-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {idx + 1}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{item.mbti}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{UI.TOP_MATCHED}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{item.count.toLocaleString()}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{UI.MATCH_COUNT}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVectorsTab = () => (
    <div className="fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>{UI.VECTORS}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{UI.VECTOR_DESC}</p>
        </div>
        <button className="btn-primary" onClick={fetchRealtime} data-bug-id="site025-bug02" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
          <Activity size={16} /> {UI.SYNC_VECTORS}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {realtimeVectors.map(v => (
          <div key={v.mbti} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{v.mbti}</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '1rem 0', overflow: 'hidden' }}>
              <div style={{ width: `${v.weight * 100}%`, height: '100%', background: v.weight > 0 ? 'var(--accent)' : '#475569' }}></div>
            </div>
            <div style={{ fontSize: '0.7rem', color: v.weight > 0 ? 'var(--text-white)' : 'var(--text-muted)' }}>
              {new Date(v.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {loading && <div className="loading-bar" style={{ width: '100%' }}></div>}
      
      <aside className="sidebar">
        <div className="logo">
          <BrainCircuit size={32} />
          <span>{UI.TITLE}</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'match' ? 'active' : ''}`} onClick={() => setActiveTab('match')}>
              <Heart size={20} /> {UI.COMPATIBILITY}
            </li>
            <li className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
              <BarChart3 size={20} /> {UI.TRENDS}
            </li>
            <li className={`nav-item ${activeTab === 'vectors' ? 'active' : ''}`} onClick={() => setActiveTab('vectors')}>
              <Zap size={20} /> {UI.VECTORS}
            </li>
            <li className="nav-item" onClick={() => setShowModal(true)}>
              <Search size={20} /> {UI.DEEP_SEARCH}
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>{UI.SYSTEM_STATUS}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: health?.ok ? '#10b981' : '#f43f5e' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{health?.ok ? UI.CONNECTED : UI.DISCONNECTED}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header>
          <div className="search-bar" style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={UI.SEARCH_PLACEHOLDER} 
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '30px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              data-bug-id="site025-bug03"
            />
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#1e1b4b', borderRadius: '15px', padding: '1rem', border: '1px solid var(--glass-border)', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                {searchResults.map(r => (
                  <div key={r.mbti} className="item-row" style={{ border: 'none', cursor: 'pointer' }}>
                    <strong>{r.mbti}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="user-profile">
            <Users size={18} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{UI.AGENT_NAME}</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}></div>
          </div>
        </header>

        {lastBugId && (
          <div className="fade-in-up" style={{ marginBottom: '2rem', padding: '1rem 1.5rem', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid var(--secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AlertCircle size={20} color="var(--secondary)" />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{UI.ANOMALY_DETECTED}</span>
                <span className="bug-id-badge">{lastBugId}</span>
              </div>
            </div>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setLastBugId(null)} />
          </div>
        )}

        <div className="summary-grid">
          <div className="stat-card">
            <div className="stat-label">{UI.TOTAL_USERS}</div>
            <div className="stat-value">{summary?.totalUsers?.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{UI.DAILY_MATCHES}</div>
            <div className="stat-value">{summary?.dailyMatches?.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{UI.ACTIVE_INDEXERS}</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{summary?.activeIndexers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{UI.SYSTEM_UPTIME}</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{summary?.uptime}</div>
          </div>
        </div>

        {activeTab === 'match' && renderMatchTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'vectors' && renderVectorsTab()}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content fade-in-up" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>{UI.DEEP_SEARCH}</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
              {UI.DEEP_SEARCH} 엔진은 현재 최적화된 인덱싱을 실행 중입니다. 전 세계 데이터베이스에서 특정 MBTI 패턴을 검색할 수 있습니다.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '15px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} />
                <strong>PPO 관측 모드 활성화</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                실시간 인덱싱 블랙아웃 이벤트를 모니터링하고 있습니다.
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowModal(false)}>엔진 종료</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
