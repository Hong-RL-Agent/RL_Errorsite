import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Settings2, 
  Database, 
  Search, 
  Plus, 
  RefreshCcw, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [catStats, setCatStats] = useState({});
  const [externalStatus, setExternalStatus] = useState(null);
  const [mqStatus, setMqStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeBug, setActiveBug] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'Food', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, sumRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/expenses`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/stats/category`)
      ]);
      const expData = await expRes.json();
      const sumData = await sumRes.json();
      const catData = await catRes.json();
      
      setExpenses(expData.data);
      setSummary(sumData);
      setCatStats(catData);
      addLog("Successfully synced dashboard data.");
    } catch (e) {
      addLog("Error: Failed to sync data with server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      const data = await res.json();
      addLog(`Expense added. Transaction ID: ${data.id}. Status: ${data.status}`);
      setShowAddModal(false);
      setNewExpense({ amount: '', category: 'Food', description: '' });
      fetchData();
    } catch (e) {
      addLog("Error: Failed to process transaction.");
    }
  };

  const runRecovery = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/system/recover`, { method: 'POST' });
      const data = await res.json();
      addLog(`System recovery procedure initiated... Status: ${data.status}`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("Error: Critical failure in recovery orchestration.");
    } finally {
      setLoading(false);
    }
  };

  const checkExternalStatus = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/external/status`);
      const data = await res.json();
      setExternalStatus(data);
      addLog(`External service audit complete. Payment Service: ${data.reported}`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("Error: Service audit failed.");
    } finally {
      setLoading(false);
    }
  };

  const retryMessages = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/messages/retry`, { method: 'POST' });
      const data = await res.json();
      addLog(`Message retry attempted. Success: ${data.retried}. Pending: ${data.failedQueueSize}`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("Error: Retry protocol aborted.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/messages`);
      const data = await res.json();
      setMqStatus(data);
      addLog(`Message synchronization verified. Actual: ${data.actual}`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("Error: Message integrity check failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Activity size={28} />
          <span>EXPENSE ANALYTICS</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={20} /> Overview
            </li>
            <li className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
              <Receipt size={20} /> Expenses
            </li>
            <li className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
              <PieChart size={20} /> Statistics
            </li>
            <li className={`nav-item ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => setActiveTab('recovery')}>
              <Settings2 size={20} /> Recovery Lab
            </li>
            <li className={`nav-item ${activeTab === 'mq' ? 'active' : ''}`} onClick={() => setActiveTab('mq')}>
              <Database size={20} /> Message Queue
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>SYNC STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>CONNECTED</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Welcome back, Analyst</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System overview for May 2026</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Add Expense
            </button>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0' }}></div>
          </div>
        </header>

        {activeBug && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bug-banner">
            <AlertTriangle size={24} />
            <div>
              <div style={{ fontWeight: 800 }}>INTENTIONAL LOGIC ANOMALY DETECTED</div>
              <div style={{ fontSize: '0.85rem' }}>Type: {activeBug.type} | ID: <span className="bug-id">{activeBug.bugId}</span></div>
            </div>
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <div className="fade-in">
            <div className="summary-grid">
              <div className="card">
                <h4>Total Monthly Expenditure</h4>
                <div className="value">₩{summary?.totalExpenses?.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.5rem', fontWeight: 600 }}>↑ 12% from last month</div>
              </div>
              <div className="card">
                <h4>Active Categories</h4>
                <div className="value">{summary?.categories}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Healthy diversification</div>
              </div>
              <div className="card">
                <h4>Transaction Volume</h4>
                <div className="value">{summary?.recentCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time updates active</div>
              </div>
              <div className="card">
                <h4>System Integrity</h4>
                <div className="value" style={{ color: 'var(--green)' }}>OPTIMAL</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>All services healthy</div>
              </div>
            </div>

            <div className="table-container">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Recent Transactions</h3>
                <Search size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={() => addLog("검색 기능을 실행했습니다. (기능 준비 중)")} />
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 5).map(e => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td>{e.description}</td>
                      <td><span className="badge badge-warn">{e.category}</span></td>
                      <td style={{ fontWeight: 700 }}>₩{e.amount.toLocaleString()}</td>
                      <td><CheckCircle2 size={16} color="var(--green)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="fade-in">
            <div className="table-container">
               <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>All Transactions</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <input type="date" className="btn btn-outline" style={{ padding: '0.4rem' }} onChange={() => addLog("날짜 필터가 변경되었습니다.")} />
                   <button className="btn btn-outline" onClick={() => { fetchData(); addLog("데이터를 새로고침했습니다."); }}><RefreshCcw size={16} /></button>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td>#{e.id}</td>
                      <td>{e.date}</td>
                      <td>{e.description}</td>
                      <td><span className="badge badge-warn">{e.category}</span></td>
                      <td style={{ fontWeight: 700 }}>₩{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="fade-in">
             <div className="lab-grid">
                <div className="panel">
                   <h3><PieChart size={20} /> Category Breakdown</h3>
                   <div style={{ marginTop: '2rem' }}>
                      {Object.entries(catStats).map(([cat, val]) => (
                        <div key={cat} style={{ marginBottom: '1.5rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                              <span style={{ fontWeight: 600 }}>{cat}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>₩{val.toLocaleString()}</span>
                           </div>
                           <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: 'var(--green)', width: `${(val / summary?.totalExpenses) * 100}%` }}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="panel">
                   <h3><History size={20} /> Expenditure Insights</h3>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Your spending on **Food** has increased by 15% this week. Consider setting a daily budget of ₩15,000 to stay within your monthly target.
                   </p>
                   <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-slate)', borderRadius: '12px' }}>
                      <h4 style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>SUGGESTED ACTION</h4>
                      <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => alert("예산 알림 기능 준비 중입니다. 곧 서비스될 예정입니다.")}>Create Budget Alert</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div className="fade-in">
            <div className="lab-grid">
               <div className="panel">
                  <h3><RefreshCcw size={20} /> Disaster Recovery</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Initiate a system-wide recovery orchestration. This process synchronizes Database, Cache, and Message Queue layers.
                  </p>
                  <button className="btn btn-primary" onClick={runRecovery} data-bug-id="site031-bug01">
                    Run Full Recovery
                  </button>
               </div>
               <div className="panel">
                  <h3><Activity size={20} /> External Audit</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Audit the status of external dependencies and payment gateways.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" onClick={checkExternalStatus} data-bug-id="site031-bug02">
                      Perform Audit
                    </button>
                    {externalStatus && (
                      <span className={`badge ${externalStatus.reported === 'up' ? 'badge-up' : 'badge-down'}`}>
                        REPORTED: {externalStatus.reported}
                      </span>
                    )}
                  </div>
               </div>
            </div>

            <div className="panel">
              <h3><FileText size={20} /> Operational Logs</h3>
              <div className="log-panel">
                {logs.length === 0 ? <div className="log-entry">Waiting for system events...</div> : 
                  logs.map((log, idx) => (
                    <div key={idx} className="log-entry">
                      <span className="log-time">{log.split('] ')[0].replace('[', '')}</span>
                      {log.split('] ')[1]}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mq' && (
          <div className="fade-in">
            <div className="lab-grid">
               <div className="panel">
                  <h3><Clock size={20} /> Message Reprocessing</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Scan the dead-letter queue and attempt to re-process failed expenditure transactions.
                  </p>
                  <button className="btn btn-primary" onClick={retryMessages} data-bug-id="site031-bug03">
                    Retry Failed Messages
                  </button>
               </div>
               <div className="panel">
                  <h3><Database size={20} /> Message Persistence Check</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Compare actual message store count against expected transaction ledger.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" onClick={fetchMessages} data-bug-id="site031-bug04">
                      Run Integrity Check
                    </button>
                    {mqStatus && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {mqStatus.actual} / {mqStatus.expected} Messages
                      </span>
                    )}
                  </div>
               </div>
            </div>

            <div className="card">
               <h4>Real-time Processing Status</h4>
               <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>245</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PROCESSED</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>12</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PENDING</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>3</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>FAILED</div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
                <h3>Add New Expense</h3>
                <form onSubmit={handleAddExpense}>
                   <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Amount (KRW)</label>
                      <input 
                        type="number" 
                        className="btn btn-outline" 
                        style={{ width: '100%', textAlign: 'left' }} 
                        required
                        value={newExpense.amount}
                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                      />
                   </div>
                   <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Category</label>
                      <select 
                        className="btn btn-outline" 
                        style={{ width: '100%' }}
                        value={newExpense.category}
                        onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                      >
                         <option>Food</option>
                         <option>Transport</option>
                         <option>Shopping</option>
                         <option>Utilities</option>
                      </select>
                   </div>
                   <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Description</label>
                      <input 
                        type="text" 
                        className="btn btn-outline" 
                        style={{ width: '100%', textAlign: 'left' }}
                        value={newExpense.description}
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                      />
                   </div>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Process</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
