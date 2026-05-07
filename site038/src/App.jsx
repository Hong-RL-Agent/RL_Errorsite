import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  LayoutDashboard, 
  Utensils, 
  History as HistoryIcon, 
  Network, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Clock, 
  RefreshCcw, 
  ShieldAlert,
  ChevronRight,
  Activity,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkLogs, setNetworkLogs] = useState([]);
  const [newMeal, setNewMeal] = useState({ food: '', calories: '', category: 'Lunch' });

  useEffect(() => {
    fetchMeals();
    fetchSummary();
  }, []);

  const addLog = (msg, type = 'info') => {
    setNetworkLogs(prev => [`[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${msg}`, ...prev].slice(0, 15));
  };

  const fetchMeals = async (isSlow = false) => {
    setIsLoading(true);
    setActiveBug(null);
    const url = isSlow ? `${API_BASE}/meals?slow=true` : `${API_BASE}/meals`;
    addLog(`Requesting: GET ${url}`);

    try {
      const start = Date.now();
      const res = await fetch(url);
      const duration = Date.now() - start;
      const data = await res.json();
      
      addLog(`Response: ${res.status} (${duration}ms)`, res.ok ? 'success' : 'error');

      if (res.ok) {
        setMeals(data.data);
        if (data.bugId) setActiveBug(data);
      } else {
        if (data.bugId) setActiveBug(data);
        addLog(`Error detected: ${data.error || 'Unknown'}`, 'error');
      }
    } catch (e) {
      addLog(`Network Failure: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const handleAddMeal = async (forceRetry = false) => {
    const payload = forceRetry ? { food: 'pizza', calories: 800 } : newMeal;
    if (!payload.food) return;

    addLog(`POST ${API_BASE}/meals - Sending data...`);
    
    try {
      const res = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.bugId === 'site038-bug03') {
        setActiveBug(data);
        addLog(`BUG DETECTED: Retry-without-backoff`, 'error');
        for(let i=1; i<=data.retryCount; i++) {
           addLog(`Immediate Retry ${i}/${data.retryCount}... (No delay)`);
        }
      }

      if (data.saved) {
        addLog(`Meal saved successfully`, 'success');
        setNewMeal({ food: '', calories: '', category: 'Lunch' });
        fetchMeals();
        fetchSummary();
      }
    } catch (e) { addLog(`Post failed: ${e.message}`, 'error'); }
  };

  const runStarvationTest = async () => {
    setActiveBug(null);
    addLog(`Starting Retry Starvation Test...`);
    try {
      const res = await fetch(`${API_BASE}/meals/retry-test`);
      const data = await res.json();
      if (data.bugId) {
        setActiveBug(data);
        addLog(`Processed: ${data.processed}, Starved: ${data.starved}`, 'error');
        data.starvedRequests.forEach(req => addLog(`STUCK REQUEST: ${req}`, 'error'));
      }
    } catch (e) { }
  };

  const deleteMeal = async (id) => {
    try {
      await fetch(`${API_BASE}/meals/${id}`, { method: 'DELETE' });
      fetchMeals();
      fetchSummary();
    } catch (e) {}
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <HeartPulse size={32} />
          <span>CALO TRACK</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </li>
            <li className={`nav-item ${activeTab === 'meals' ? 'active' : ''}`} onClick={() => setActiveTab('meals')}>
              <Utensils size={20} /> Meals
            </li>
            <li className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <HistoryIcon size={20} /> History
            </li>
            <li className={`nav-item ${activeTab === 'network' ? 'active' : ''}`} onClick={() => setActiveTab('network')}>
              <Network size={20} /> Network Test
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: '#f0fdf4', borderRadius: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-green)' }}>
              <Activity size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Healthy Connection</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => fetchMeals()}>
                <RefreshCcw size={18} /> Sync
             </button>
          </div>
        </header>

        {activeBug && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="banner banner-error">
             <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <ShieldAlert size={24} />
                <div>
                   <strong style={{ display: 'block' }}>Network Engine Fault: {activeBug.type}</strong>
                   <span style={{ fontSize: '0.85rem' }}>{activeBug.error || 'Abnormal response processing detected.'}</span>
                </div>
                <span className="bug-tag">{activeBug.bugId}</span>
             </div>
             <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="stats-grid">
                <div className="stat-card">
                   <div className="label">Total Calories</div>
                   <div className="value">{summary?.totalCalories} kcal</div>
                </div>
                <div className="stat-card">
                   <div className="label">Meal Count</div>
                   <div className="value">{summary?.mealCount} meals</div>
                </div>
                <div className="stat-card">
                   <div className="label">Average kcal</div>
                   <div className="value">{summary?.averageCalories} kcal</div>
                </div>
             </div>

             <div className="log-container">
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                   <Wifi size={18} /> <span>Network Transmission Logs</span>
                </div>
                {networkLogs.map((log, i) => (
                  <div key={i} className="log-entry">{log}</div>
                ))}
                {networkLogs.length === 0 && <div style={{ opacity: 0.5 }}>No network activity recorded.</div>}
             </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>
                <div className="stat-card" style={{ height: 'fit-content' }}>
                   <h3 style={{ marginBottom: '1.5rem' }}>Add New Meal</h3>
                   <div className="input-group">
                      <label>Food Name</label>
                      <input type="text" placeholder="e.g. Chicken Salad" value={newMeal.food} onChange={e => setNewMeal({...newMeal, food: e.target.value})} />
                   </div>
                   <div className="input-group">
                      <label>Calories (kcal)</label>
                      <input type="number" placeholder="200" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} />
                   </div>
                   <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleAddMeal()}>Log Meal</button>
                </div>

                <div className="meal-list">
                   {meals.map(m => (
                     <div key={m.id} className="meal-card">
                        <div className="meal-info">
                           <h3>{m.food}</h3>
                           <p>{m.category} • {m.date}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                           <span className="badge badge-green">{m.calories} kcal</span>
                           <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => deleteMeal(m.id)}>
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                   ))}
                   {meals.length === 0 && !isLoading && <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No meals logged for today.</div>}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '5rem' }}>
             <Clock size={48} color="var(--primary-green)" style={{ marginBottom: '1.5rem' }} />
             <h3>Coming Soon</h3>
             <p style={{ color: 'var(--text-muted)' }}>Historical diet analysis is currently under development.</p>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="fade-in">
             <div className="stats-grid">
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => fetchMeals()} data-bug-id="site038-bug01">
                   <AlertTriangle size={32} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                   <h3>Header Anomaly</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>응답 헤더가 불완전하게 전송되는 결함을 테스트합니다.</p>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => fetchMeals(true)} data-bug-id="site038-bug02">
                   <WifiOff size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                   <h3>Timeout Logic</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>비정상적인 타임아웃 계산 오류를 테스트합니다.</p>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleAddMeal(true)} data-bug-id="site038-bug03">
                   <RefreshCcw size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
                   <h3>Retry Backoff</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>지연 없는 즉시 재시도 반복 오류를 테스트합니다.</p>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={runStarvationTest} data-bug-id="site038-bug04">
                   <HeartPulse size={32} color="#ef4444" style={{ marginBottom: '1rem' }} />
                   <h3>Retry Starvation</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>특정 요청이 재시도 큐에서 누락되는 현상을 테스트합니다.</p>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
