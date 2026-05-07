import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  RefreshCcw, 
  ShoppingBag, 
  AlertCircle, 
  Clock, 
  Globe, 
  ArrowRightLeft,
  Search,
  LogOut,
  Bell,
  ChevronDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API_BASE = 'http://localhost:9185/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [rates, setRates] = useState([]);
  const [prices, setPrices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New States for Interactivity
  const [bugToasts, setBugToasts] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Converter state
  const [convAmount, setConvAmount] = useState(100);
  const [convFrom, setConvFrom] = useState('USD');
  const [convTo, setConvTo] = useState('KRW');
  const [convResult, setConvResult] = useState(null);

  const addBugToast = (id, message) => {
    const newToast = { id: Date.now(), bugId: id, message };
    setBugToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setBugToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, rateRes, priceRes, logRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/summary`).then(r => r.json()),
        fetch(`${API_BASE}/rates`).then(r => r.json()),
        fetch(`${API_BASE}/prices`).then(r => r.json()),
        fetch(`${API_BASE}/logs`).then(r => r.json())
      ]);

      setSummary(sumRes);
      setRates(rateRes.data);
      setPrices(priceRes.data);
      setLogs(logRes.data);

      // Check for bugs and notify
      if (sumRes.bugId) addBugToast(sumRes.bugId, "로케일 포맷 불일치 취약점이 대시보드에서 감지되었습니다.");
      if (rateRes.data.some(r => r.bugId)) addBugToast("site076-bug03", "KST 시간대 변환 로직에서 오프셋 오류가 발생했습니다.");
    } catch (err) {
      setError("Failed to fetch data from API. Please ensure server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/convert?from=${convFrom}&to=${convTo}&amount=${convAmount}`);
      const data = await res.json();
      setConvResult(data);
      
      if (data.bugId) {
        addBugToast(data.bugId, "환율 계산 엔진에서 하드코딩된 오류 값이 감지되었습니다!");
      }
    } catch (err) {
      setError("Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = () => {
    fetchData();
    addBugToast("site076-bug02", "가격 계산 중 부동소수점 정밀도 오류가 발생했습니다.");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout? (Simulation)")) {
      alert("Logging out...");
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 1500);
    }
  };

  const handleBellClick = () => {
    setNotifications(0);
    alert("All notifications marked as read.");
  };

  const chartData = [
    { name: '08:00', rate: 1318 },
    { name: '10:00', rate: 1322 },
    { name: '12:00', rate: 1320 },
    { name: '14:00', rate: 1325 },
    { name: '16:00', rate: 1321 },
    { name: '18:00', rate: 1319 },
    { name: '20:00', rate: 1323 },
  ];

  return (
    <div className="app-container">
      {/* Bug Toasts */}
      <div className="bug-toast-container">
        {bugToasts.map(toast => (
          <div key={toast.id} className="bug-toast">
            <AlertCircle size={20} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>VULNERABILITY DETECTED: {toast.bugId}</div>
              <div style={{ fontSize: '11px' }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Globe className="text-primary" />
          <span>GlobalExchange</span>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'rates' ? 'active' : ''}`}
            onClick={() => setActiveTab('rates')}
          >
            <TrendingUp size={20} />
            <span>Rates</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'converter' ? 'active' : ''}`}
            onClick={() => setActiveTab('converter')}
          >
            <RefreshCcw size={20} />
            <span>Converter</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'prices' ? 'active' : ''}`}
            onClick={() => setActiveTab('prices')}
          >
            <ShoppingBag size={20} />
            <span>Prices</span>
          </div>
        </nav>

        <div className="nav-item mt-auto" style={{ marginTop: 'auto' }} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>
            {activeTab === 'dashboard' && 'Market Overview'}
            {activeTab === 'rates' && 'Live Exchange Rates'}
            {activeTab === 'converter' && 'Currency Converter'}
            {activeTab === 'prices' && 'Price Comparison'}
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative' }}>
            <div className="glass" style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search markets..." 
                style={{ border: 'none', background: 'transparent', width: '150px', padding: 0 }} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
              {isSearching && (
                <div className="search-overlay">
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Searching for "{searchQuery}"...</div>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleBellClick}>
              <Bell size={20} color="var(--text-muted)" />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              onClick={() => setShowProfile(!showProfile)}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>JD</div>
              <ChevronDown size={14} />
            </div>

            {showProfile && (
              <div className="profile-dropdown">
                <div className="dropdown-item"><Globe size={14} /> Account Settings</div>
                <div className="dropdown-item"><TrendingUp size={14} /> My Portfolios</div>
                <div className="dropdown-item" style={{ borderTop: '1px solid var(--border)', color: 'var(--danger)' }} onClick={handleLogout}><LogOut size={14} /> Sign Out</div>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid">
              <div className="card" onClick={() => fetchData()}>
                <div className="card-title">
                  Total Portfolio Value
                  <TrendingUp size={16} className="text-primary" />
                </div>
                <div className="card-value">{summary?.totalValue || '0.00 USD'}</div>
                <div className="card-subtitle">+2.4% from yesterday</div>
                {summary?.bugId && <div className="bug-indicator" title="Locale Format Inconsistency Detected">Bug ID: {summary.bugId}</div>}
              </div>
              <div className="card" onClick={() => alert("User management system is currently in read-only mode.")}>
                <div className="card-title">Active Users</div>
                <div className="card-value">{summary?.activeUsers || '0'}</div>
                <div className="card-subtitle" style={{ color: 'var(--text-muted)' }}>Real-time connections</div>
              </div>
              <div className="card" onClick={() => fetchData()}>
                <div className="card-title">Daily Trading Volume</div>
                <div className="card-value">{summary?.dailyVolume || '0.00'}</div>
                <div className="card-subtitle">+12% vs last week</div>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="card glass">
                <div className="card-title">USD/KRW Performance</div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Recent Activity Logs</div>
                <div className="logs-list">
                  {logs.map(log => (
                    <div key={log.id} className="log-item">
                      <div>
                        <div style={{ fontWeight: 600 }}>{log.message}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                      <span className={`log-type ${log.type}`}>{log.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {summary?.bugId && (
              <div className="bug-alert">
                <AlertCircle className="bug-alert-icon" />
                <div className="bug-alert-content">
                  <h4>로케일 포맷 불일치 (site076-bug04)</h4>
                  <p><strong>원인:</strong> 동일 대시보드 내에서 통화 표시 형식이 국가별 규칙(미국식 vs 유럽식)에 따라 다르게 혼용되고 있습니다. 'Total Value'는 독일식(.)을, 'Active Users'는 미국식(,)을 사용 중입니다.</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'rates' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Rate (per 1 USD)</th>
                  <th>Last Update (KST)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rates.map(rate => (
                  <tr key={rate.currency}>
                    <td style={{ fontWeight: 600 }}>{rate.currency}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rate.rate.toFixed(4)}</td>
                    <td data-bug-id="site076-bug03">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} className="text-muted" />
                        <span className={rate.currency === 'KRW' ? 'price-error' : ''}>
                          {new Date(rate.time).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      {rate.bugId && rate.currency === 'KRW' && (
                        <div style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '4px' }}>
                          <strong>시간대 변환 오류 (site076-bug03):</strong> UTC를 KST로 변환하는 과정에서 오프셋 설정 오류로 인해 잘못된 과거 시간이 표시되고 있습니다.
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="log-type success">Stable</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="card">
              <div className="card-title">Conversion Tool</div>
              <div className="converter-form">
                <div className="form-group">
                  <label>Amount</label>
                  <input 
                    type="number" 
                    value={convAmount} 
                    onChange={(e) => setConvAmount(e.target.value)} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>From</label>
                    <select value={convFrom} onChange={(e) => setConvFrom(e.target.value)}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="KRW">KRW - Korean Won</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                    <ArrowRightLeft size={20} className="text-muted" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>To</label>
                    <select value={convTo} onChange={(e) => setConvTo(e.target.value)}>
                      <option value="KRW">KRW - Korean Won</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={handleConvert} 
                  data-bug-id="site076-bug01"
                >
                  <RefreshCcw size={18} />
                  Convert Currency
                </button>
              </div>

              {convResult && (
                <div className="result-area">
                  <div className="result-value">
                    {convResult.amount} {convResult.from} = 
                    <span style={{ color: convResult.bugId ? 'var(--danger)' : 'var(--primary)' }}>
                      {" "}{convResult.converted.toLocaleString()} {convResult.to}
                    </span>
                  </div>
                  {convResult.bugId && (
                    <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px' }}>환율 변환 오류 (site076-bug01)</div>
                      <div style={{ fontSize: '11px' }}><strong>원인:</strong> USD에서 KRW로 변환 시 실제 시장 환율(1320.5) 대신 하드코딩된 잘못된 환율(1500.25)이 적용되어 과대 계산되었습니다.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="card glass">
              <div className="card-title">Market Insight</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                The Korean Won has been volatile recently due to interest rate fluctuations. We recommend monitoring real-time rates before large conversions.
              </p>
              <div style={{ marginTop: '20px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#92400e', fontWeight: 600, fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  <span>Important Note</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                  Standard processing fees apply to all conversions between USD and KRW.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Original (USD)</th>
                  <th>Final Price (Incl. Tax)</th>
                  <th>Inventory</th>
                </tr>
              </thead>
              <tbody>
                {prices.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td><span className="log-type info">{item.category}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>${item.priceUSD.toFixed(2)}</td>
                    <td data-bug-id="site076-bug02">
                      <span className="price-cell price-error">
                        ${item.price}
                      </span>
                      {item.bugId && (
                        <div style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '4px' }}>
                          <strong>부동소수점 반올림 오류 (site076-bug02):</strong> (0.1 + 0.2 - 0.3)과 같은 소수점 연산 정밀도 문제로 인해 가격에 오차가 발생했습니다.
                        </div>
                      )}
                    </td>
                    <td>{item.stock} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '24px' }}>
              <button 
                className="btn" 
                style={{ width: 'auto' }} 
                onClick={handleRecalculate}
                data-bug-id="site076-bug02"
              >
                Recalculate Prices
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--sidebar-bg)', color: 'white', padding: '8px 16px', borderRadius: '24px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow)' }}>
            <RefreshCcw size={14} className="animate-spin" />
            Synchronizing data...
          </div>
        )}
        
        {error && (
          <div className="bug-alert" style={{ borderLeftColor: 'var(--danger)', background: '#fee2e2' }}>
            <AlertCircle className="bug-alert-icon" style={{ color: 'var(--danger)' }} />
            <div className="bug-alert-content">
              <h4 style={{ color: '#991b1b' }}>System Error</h4>
              <p style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
