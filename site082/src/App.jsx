import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Zap, 
  AlertCircle, 
  Search,
  Bell,
  Heart,
  User,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [experimentConfig, setExperimentConfig] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchRecommendations = async (trigger = null, userType = 'regular') => {
    setLoading(true);
    setBugInfo(null);
    try {
      const url = trigger 
        ? `${API_BASE}/recommendations?userId=1&trigger=${trigger}&userType=${userType}` 
        : `${API_BASE}/recommendations?userId=1&userType=${userType}`;
      const res = await fetch(url);
      const data = await res.json();
      setRecommendations(data.items);
      
      const xBugId = res.headers.get('X-Bug-Id') || data.bugId;
      
      if (xBugId && xBugId.startsWith('site082-bug')) {
        const bugNum = xBugId.slice(-1);
        const bugMessages = {
          '1': "[오류 #1] 실험군 할당 불안정 (site082-bug01): 동일 유저임에도 요청마다 추천 상품이 무작위로 변경되고 있습니다.",
          '3': "[오류 #3] 플래그 캐시 불일치 (site082-bug03): 실험 설정 변경 사항이 즉시 반영되지 않고 이전 설정이 유지되고 있습니다.",
          '4': "[오류 #4] 사용자 세그먼트 매칭 오류 (site082-bug04): 신규 회원 대상 추천 로직이 일반 회원에게도 잘못 노출되고 있습니다."
        };
        setBugInfo({ id: xBugId, num: bugNum, message: bugMessages[bugNum] || "정의되지 않은 버그입니다." });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); fetchLogs(); }
  };

  const fetchStats = async (trigger = null) => {
    setLoading(true);
    setBugInfo(null);
    try {
      const url = trigger ? `${API_BASE}/experiments/stats?trigger=${trigger}` : `${API_BASE}/experiments/stats`;
      const res = await fetch(url);
      const data = await res.json();
      const xBugId = res.headers.get('X-Bug-Id');
      setStats(data);
      
      if (xBugId === 'site082-bug02') {
        setBugInfo({ 
          id: xBugId, 
          num: '2', 
          message: "[오류 #2] 롤아웃 비율 계산 오류 (site082-bug02): 설정된 롤아웃 비율(30%)보다 실제 노출 비중(75%)이 비정상적으로 높습니다." 
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); fetchLogs(); }
  };

  const updateExperiment = async () => {
    try {
      await fetch(`${API_BASE}/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollout: 50, active: true })
      });
      // Trigger bug 03 check
      fetchRecommendations('bug03');
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

  useEffect(() => {
    fetchProducts();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'recommendations') fetchRecommendations();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Zap size={28} />
          <span>SmartMall</span>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <ShoppingBag size={20} /> Home
          </div>
          <div className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
            <Heart size={20} /> Recommendations
          </div>
          <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <BarChart3 size={20} /> Experiment Stats
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <LayoutDashboard size={20} /> Admin Logs
          </div>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '20px', background: '#f0f4ff', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>NODE STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <CheckCircle2 size={14} color="var(--success)" />
            <span>Connected: site082</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div style={{ position: 'relative', width: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#999' }} size={18} />
            <input type="text" placeholder="원하는 상품을 검색해보세요" style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Bell size={22} style={{ color: '#666', cursor: 'pointer' }} onClick={() => alert('알림 목록이 없습니다.')} />
            <User size={22} style={{ color: '#666', cursor: 'pointer' }} onClick={() => alert('마이페이지로 이동합니다.')} />
          </div>
        </header>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div>
            <div className="hero-banner">
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>여름 시즌 오프 <br/> 최대 70% 할인</h1>
                <p style={{ opacity: 0.9, marginBottom: '20px' }}>한정 수량, 지금 바로 만나보세요.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn" style={{ background: '#fff', color: 'var(--primary)' }} onClick={() => alert('프로모션 페이지로 이동합니다.')}>자세히 보기</button>
                  <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff' }} onClick={() => updateExperiment()}>알림 설정 최신화</button>
                </div>
              </div>
              <div style={{ fontSize: '8rem' }}>🔥</div>
            </div>

            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              인기 상품 리스트
              <span className="badge badge-best">TOP 10</span>
            </h2>
            <div className="product-grid">
              {products.map(p => (
                <div key={p.id} className="card" onClick={() => alert(`${p.name} 상품 상세 페이지로 이동합니다.`)} style={{ cursor: 'pointer' }}>
                  <div className="card-img">{p.img}</div>
                  <div className="card-body">
                    <div className="card-cat">{p.category}</div>
                    <div className="card-title">{p.name}</div>
                    <div className="card-price">{p.price.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2>당신을 위한 맞춤 추천</h2>
                <p style={{ color: '#666' }}>AI가 분석한 최신 트렌드 상품입니다.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => fetchRecommendations('bug01')}>
                  <RefreshCw size={14} /> 추천 목록 새로고침
                </button>
                <button className="btn btn-primary" onClick={() => fetchRecommendations('bug04')}>
                  첫 구매 혜택 적용하기
                </button>
              </div>
            </div>

            <div className="product-grid" style={{ marginBottom: '40px' }}>
              {recommendations.map(p => (
                <div key={p.id} className="card" style={{ border: '2px solid #e0f2fe', cursor: 'pointer' }} onClick={() => alert(`${p.name} 추천 상품 상세 정보입니다.`)}>
                  <div className="card-img" style={{ background: '#f0f9ff' }}>{p.img}</div>
                  <div className="card-body">
                    <div className="badge badge-new">AI 추천</div>
                    <div className="card-title">{p.name}</div>
                    <div className="card-price">{p.price.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2>실험 데이터 분석 대시보드</h2>
              <button className="btn btn-outline" onClick={() => fetchStats('bug02')}>
                리포트 상세 동기화
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">대상 실험</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{stats?.name || 'Loading...'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">설정 롤아웃</div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats?.expected}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">실제 노출 비율</div>
                <div className="stat-value" style={{ color: stats?.actual > stats?.expected ? 'var(--danger)' : 'var(--success)' }}>
                  {stats?.actual}%
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">표본 수</div>
                <div className="stat-value">12,402</div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>시스템 보안 및 운영 로그</h2>
            <div className="log-panel">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <span style={{ color: '#888' }}>[{new Date(log.time).toLocaleTimeString()}]</span>
                  <span style={{ color: '#00ddeb' }}> {log.method}</span>
                  <span style={{ color: '#fff' }}> {log.url}</span>
                  <span style={{ color: log.bugId ? 'var(--secondary)' : '#0f0' }}> 
                    {log.status} {log.bugId ? `[BUG: ${log.bugId}]` : '[OK]'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bug Notification Popup */}
        {bugInfo && (
          <div className="bug-popup">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', color: 'var(--secondary)' }}>
              <div style={{ background: 'var(--secondary)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900 }}>
                {bugInfo.num}
              </div>
              <h3 style={{ fontWeight: 800 }}>VULNERABILITY DETECTED</h3>
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>ID:</span> 
                <span style={{ marginLeft: '10px', background: '#f1f1f1', padding: '2px 8px', borderRadius: '4px' }}>{bugInfo.id}</span>
              </div>
              <p>{bugInfo.message}</p>
            </div>
            <button className="btn" style={{ marginTop: '20px', width: '100%', background: '#eee', color: '#333' }} onClick={() => setBugInfo(null)}>닫기</button>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw className="spin" size={20} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>데이터 분석 중...</span>
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
