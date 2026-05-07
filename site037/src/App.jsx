import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  LayoutDashboard, 
  CheckSquare, 
  Share2, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  LogIn, 
  User, 
  Search, 
  X, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldBan,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', role: 'user' });
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchChecklists();
    fetchSummary();
  }, []);

  const fetchChecklists = async () => {
    try {
      const res = await fetch(`${API_BASE}/checklists`);
      const data = await res.json();
      setChecklists(data.data);
    } catch (e) { console.error("Data fetch failed"); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { }
  };

  const handleLogin = async (useAdminRole = false) => {
    setActiveBug(null);
    const payload = useAdminRole 
      ? { ...loginData, role: 'admin' } 
      : loginData;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.login) {
        setUser({ username: data.username, role: data.role });
        setShowLogin(false);
        if (data.role === 'admin') setActiveBug({ bugId: data.bugId, type: 'privilege-escalation', message: '권한 상승 성공: 일반 요청에 role=admin을 포함하여 관리자 권한을 획득했습니다.' });
      }
    } catch (e) { alert("로그인 오류"); }
  };

  const handleBruteForce = async () => {
    setActiveBug({ bugId: 'site037-bug01', type: 'brute-force-vulnerability', message: '무차별 대입 취약점 확인 중... (반복 요청에도 차단되지 않음)' });
    for (let i = 0; i < 5; i++) {
       await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: 'wrong' })
       });
    }
    alert("5회 연속 로그인 시도 성공 (Rate Limit 없음)");
  };

  const fetchById = async () => {
    if (!searchId) return;
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/checklists/${searchId}`);
      const data = await res.json();
      if (data.id) {
        if (data.owner === 'otherUser') {
          setActiveBug({ bugId: data.bugId, type: 'insecure-direct-object-reference', message: 'IDOR 탐지: 타 사용자의 비공개 리스트에 접근 성공했습니다.' });
        }
        alert(`리스트 발견: ${data.title} (소유자: ${data.owner})`);
      } else {
        alert("리스트를 찾을 수 없습니다.");
      }
    } catch (e) { alert("조회 실패"); }
  };

  const createList = async (noAuth = false) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "배낭 여행" })
      });
      const data = await res.json();
      if (data.created) {
        if (!user && noAuth) {
          setActiveBug({ bugId: data.bugId, type: 'missing-auth', message: '인증 누락 탐지: 로그인 없이 새 리스트를 생성했습니다.' });
        }
        fetchChecklists();
        fetchSummary();
      }
    } catch (e) { alert("생성 실패"); }
  };

  const deleteList = async (id) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/checklists/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.deleted) {
        if (!user) {
          setActiveBug({ bugId: data.bugId, type: 'missing-auth', message: '인증 누락 탐지: 로그인 없이 리스트를 삭제했습니다.' });
        }
        fetchChecklists();
        fetchSummary();
      }
    } catch (e) { alert("삭제 실패"); }
  };

  const toggleItem = async (listId, itemId) => {
    try {
      await fetch(`${API_BASE}/items/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, itemId })
      });
      fetchChecklists();
      fetchSummary();
    } catch (e) { }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Plane size={32} />
          <span>PACK WISE</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </li>
            <li className={`nav-item ${activeTab === 'lists' ? 'active' : ''}`} onClick={() => setActiveTab('lists')}>
              <CheckSquare size={20} /> My Checklist
            </li>
            <li className={`nav-item ${activeTab === 'shared' ? 'active' : ''}`} onClick={() => setActiveTab('shared')}>
              <Share2 size={20} /> Shared Lists
            </li>
            <li className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <ShieldAlert size={20} /> Security Test
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto' }}>
           <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                 <div style={{ width: 40, height: 40, borderRadius: '50%', background: user ? 'var(--primary-blue)' : '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                    <User size={20} />
                 </div>
                 <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{user ? user.username : 'Guest User'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user ? `Role: ${user.role}` : 'Not Logged In'}</div>
                 </div>
              </div>
              {user ? (
                <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => setUser(null)}>Logout</button>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => setShowLogin(true)}>Login</button>
              )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
             {user?.role === 'admin' && <span className="badge badge-admin">ADMIN ACCESS</span>}
          </div>
          <button className="btn btn-primary" onClick={() => createList(true)}>
             <Plus size={20} /> New Journey
          </button>
        </header>

        {activeBug && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="banner banner-warning">
             <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <ShieldAlert size={24} color="#f97316" />
                <div>
                   <strong style={{ display: 'block', fontSize: '1rem' }}>보안 취약점 탐지: {activeBug.type}</strong>
                   <span style={{ fontSize: '0.85rem', color: '#7c2d12' }}>{activeBug.message}</span>
                </div>
                <span className="bug-tag">{activeBug.bugId}</span>
             </div>
             <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="summary-grid">
                <div className="summary-card">
                   <div className="label">Total Checklists</div>
                   <div className="value">{summary?.totalLists}</div>
                </div>
                <div className="summary-card">
                   <div className="label">Completed Items</div>
                   <div className="value">{summary?.completedItems}</div>
                </div>
                <div className="summary-card">
                   <div className="label">Total Progress</div>
                   <div className="value">{summary?.completionRate}%</div>
                </div>
             </div>

             <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#eff6ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 2rem', color: 'var(--primary-blue)' }}>
                   <Plane size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Welcome to PackWise!</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                   완벽한 여행을 위한 체크리스트를 만들고 관리하세요. 
                   보안 테스트 탭에서 취약점을 확인해볼 수 있습니다.
                </p>
             </div>
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="fade-in">
             <div className="checklist-grid">
                {checklists.filter(l => l.owner === 'user1' || l.owner === 'anonymous').map(list => (
                  <div key={list.id} className="checklist-card">
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <h3>{list.title}</h3>
                        <button className="btn-outline" style={{ padding: '0.5rem', border: 'none' }} onClick={() => deleteList(list.id)} data-bug-id="site037-bug04">
                           <Trash2 size={18} color="#ef4444" />
                        </button>
                     </div>
                     <div className="item-list">
                        {list.items.map(item => (
                          <div key={item.id} className={`item-row ${item.checked ? 'checked' : ''}`} onClick={() => toggleItem(list.id, item.id)}>
                             {item.checked ? <CheckCircle2 size={20} color="var(--primary-blue)" /> : <div style={{ width: 20, height: 20, borderRadius: '6px', border: '2px solid #cbd5e1' }} />}
                             <span>{item.text}</span>
                          </div>
                        ))}
                        {list.items.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>항목이 없습니다.</div>}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'shared' && (
          <div className="fade-in">
             <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                   <input type="text" placeholder="공유 리스트 ID를 입력하세요 (예: 999)" value={searchId} onChange={e => setSearchId(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={fetchById} data-bug-id="site037-bug03">
                   <Search size={20} /> 리스트 찾기
                </button>
             </div>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                * IDOR 취약점을 테스트하려면 타 사용자의 ID(999)를 입력해보세요.
             </p>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="fade-in">
             <div className="summary-grid">
                <div className="summary-card" style={{ cursor: 'pointer' }} onClick={handleBruteForce} data-bug-id="site037-bug01">
                   <Lock size={32} color="var(--accent-orange)" style={{ marginBottom: '1rem' }} />
                   <h3>Brute Force Test</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>반복적인 로그인 시도에 대한 차단 여부를 테스트합니다.</p>
                </div>
                <div className="summary-card" style={{ cursor: 'pointer' }} onClick={() => handleLogin(true)} data-bug-id="site037-bug02">
                   <ShieldCheck size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
                   <h3>Privilege Escalation</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>관리자 권한 파라미터(role=admin)를 포함하여 로그인을 시도합니다.</p>
                </div>
                <div className="summary-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('shared')}>
                   <ShieldBan size={32} color="#ef4444" style={{ marginBottom: '1rem' }} />
                   <h3>IDOR & Auth Bypass</h3>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>타인 데이터 접근 및 인증 없는 리스트 관리를 테스트합니다.</p>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="modal-overlay" onClick={() => setShowLogin(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Login to PackWise</h2>
                  <X style={{ cursor: 'pointer' }} onClick={() => setShowLogin(false)} />
               </div>
               <div className="input-group">
                  <label>Username</label>
                  <input type="text" placeholder="user1" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} />
               </div>
               <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
               </div>
               <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleLogin()}>
                  Sign In <ArrowRight size={18} />
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
