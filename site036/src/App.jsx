import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  PenTool, 
  History, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  X,
  RefreshCcw,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem('site036_sid') || '');
  const [quotes, setQuotes] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    fetchQuotes();
    if (sessionId) fetchSummary();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotes`);
      const data = await res.json();
      setQuotes(data.data);
      setCurrentQuote(data.data[0]);
    } catch (e) { }
  };

  const handleLogin = async () => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId 
        },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      
      if (data.login === 'success') {
        setUser({ username: loginData.username || "user1" });
        setSessionId(data.sessionId);
        localStorage.setItem('site036_sid', data.sessionId);
        setShowLogin(false);
        
        // BUG 01 TRIGGER: Credential Management Error
        setActiveBug({
          bugId: data.bugId,
          type: "credential-management-error",
          message: "인증 오류: 비밀번호 검증 없이 로그인이 승인되었습니다."
        });
        fetchSummary();
      }
    } catch (e) { }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'X-Session-ID': sessionId }
      });
      setUser(null); // Local logout
      alert("로그아웃 되었습니다. (UI 상태만 비로그인으로 변경됨)");
    } catch (e) { }
  };

  const fetchNotes = async () => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { 'X-Session-ID': sessionId }
      });
      const data = await res.json();
      if (res.status === 200) {
        setNotes(data.data);
        // BUG 03 TRIGGER: Insufficient Logout
        // If notes are fetched but user is null
        if (!user) {
          setActiveBug({
            bugId: data.bugId,
            type: "insufficient-logout",
            message: "보안 결함: 로그아웃 후에도 이전 세션으로 데이터 조회가 가능합니다."
          });
        }
      }
    } catch (e) { }
  };

  const fetchSession = async () => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/session`, {
        headers: { 'X-Session-ID': sessionId }
      });
      const data = await res.json();
      setSessionInfo(data);
      // BUG 02 TRIGGER: Session Fixation
      setActiveBug({
        bugId: data.bugId,
        type: "session-fixation-hijacking",
        message: "보안 취약점: 세션 ID가 고정되어 재사용되고 있습니다."
      });
    } catch (e) { }
  };

  const saveNote = async () => {
    if (!sessionId) return alert("로그인이 필요합니다.");
    try {
      await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId 
        },
        body: JSON.stringify({ quoteId: currentQuote.id, content: transcription })
      });
      alert("기록이 저장되었습니다.");
      setTranscription('');
      fetchSummary();
    } catch (e) { }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: { 'X-Session-ID': sessionId }
      });
      const data = await res.json();
      setSummary(data);
    } catch (e) { }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">필사: 筆寫</div>
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={20} /> Home
            </li>
            <li className={`nav-item ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')}>
              <BookOpen size={20} /> Quotes
            </li>
            <li className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => {setActiveTab('notes'); fetchNotes();}} data-bug-id="site036-bug03">
              <History size={20} /> My Notes
            </li>
            <li className={`nav-item ${activeTab === 'session' ? 'active' : ''}`} onClick={() => {setActiveTab('session'); fetchSession();}} data-bug-id="site036-bug02">
              <ShieldCheck size={20} /> Session Info
            </li>
          </ul>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Logged in as:</div>
          <div style={{ fontWeight: 700 }}>{user ? user.username : 'Guest'}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h2 style={{ color: 'var(--dark-green)' }}>{activeTab.toUpperCase()}</h2>
          <div className="auth-status">
            {user ? (
               <button className="btn btn-primary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LogOut size={16} /> Logout
               </button>
            ) : (
               <button className="btn btn-gold" onClick={() => setShowLogin(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-bug-id="site036-bug01">
                  <LogIn size={16} /> Login
               </button>
            )}
          </div>
        </header>

        {activeBug && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="banner banner-warning">
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ShieldAlert size={20} color="#d32f2f" />
                <div>
                   <strong>{activeBug.message}</strong>
                   <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Type: {activeBug.type}</div>
                </div>
                <span className="bug-tag">{activeBug.bugId}</span>
             </div>
             <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
          </motion.div>
        )}

        {activeTab === 'home' && (
          <div className="fade-in">
             {currentQuote && (
                <div className="quote-card">
                   <div className="quote-text">"{currentQuote.text}"</div>
                   <div className="quote-author">- {currentQuote.author}</div>
                </div>
             )}
             <div className="transcription-box">
                <textarea 
                  placeholder="위의 명언을 천천히 따라 적어보세요..."
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                   <button className="btn btn-primary" onClick={saveNote}>Save Reflection</button>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '2rem' }}>
                <div className="stat-card" style={{ flex: 1, background: 'white', padding: '1.5rem', border: '1px solid var(--border)' }}>
                   <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Total Notes</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{summary?.totalNotes || 0}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, background: 'white', padding: '1.5rem', border: '1px solid var(--border)' }}>
                   <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Today</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{summary?.todayNotes || 0}</div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="fade-in">
             {quotes.map(q => (
               <div key={q.id} className="quote-card" style={{ padding: '2rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => {setCurrentQuote(q); setActiveTab('home');}}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>"{q.text}"</div>
                  <div style={{ opacity: 0.6, marginTop: '0.5rem' }}>- {q.author}</div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="fade-in">
             {notes.map(note => (
                <div key={note.id} className="note-item">
                   <div className="note-header">
                      <span>{note.createdAt}</span>
                      <span className="badge-normal" style={{ padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{note.username}</span>
                   </div>
                   <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>"{note.quoteText}"</div>
                   <div>{note.content}</div>
                </div>
             ))}
             {notes.length === 0 && <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>No notes found. Try fetching or logging in.</div>}
          </div>
        )}

        {activeTab === 'session' && (
          <div className="fade-in">
             <div className="session-info">
                <h3>Session Status Dashboard</h3>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div>
                      <div className="session-key">Current Session ID</div>
                      <div className="session-value">{sessionId || 'None'}</div>
                   </div>
                   <div>
                      <div className="session-key">Status</div>
                      <div className="session-value" style={{ color: 'var(--dark-green)', fontWeight: 700 }}>
                         {user ? 'AUTHENTICATED' : 'ANONYMOUS'}
                      </div>
                   </div>
                   <button className="btn btn-gold" style={{ alignSelf: 'flex-start' }} onClick={fetchSession}>
                      <RefreshCcw size={16} style={{ marginRight: '0.5rem' }} /> Refresh Session Info
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showLogin && (
          <div className="modal-overlay" onClick={() => setShowLogin(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2>Login</h2>
                  <X style={{ cursor: 'pointer' }} onClick={() => setShowLogin(false)} />
               </div>
               <input type="text" placeholder="Username" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} />
               <input type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
               <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleLogin}>Log In</button>
               <div style={{ fontSize: '0.7rem', marginTop: '1rem', opacity: 0.6 }}>* Any password will work (Bug 01)</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
