import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ ui_logged_in_count: 0, actual_server_handles: 0, connection_load: '0%' });
  const [usernameInput, setUsernameInput] = useState('');

  const fetchStatus = () => {
    fetch('/api/auth-status').then(res => res.json()).then(setStatus);
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  const login = async () => {
    if (!usernameInput) return;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput })
    });
    const data = await res.json();
    setUser(data);
    fetchStatus();
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: user.sessionId })
    });
    setUser(null);
    fetchStatus();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* 상단 네비바 */}
      <header style={{ height: '70px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>🛡️ Auth-Gate Portal</h1>
        <div style={{ display: 'flex', gap: '30px', fontSize: '14px' }}>
          <div style={statBox}>Active Users: <strong style={{color:'#38bdf8'}}>{status.ui_logged_in_count}</strong></div>
          <div style={statBox}>Server Load: <strong style={{color:'#ef4444'}}>{status.connection_load}</strong></div>
        </div>
      </header>

      <main style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        {user ? (
          <div style={cardStyle}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>👤</div>
            <h2 style={{ marginBottom: '10px' }}>Welcome, {user.username}</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>보안 세션이 활성화되었습니다. 모든 게이트 접근 권한을 가집니다.</p>
            <button onClick={logout} style={logoutBtnStyle}>Secure Logout</button>
          </div>
        ) : (
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '30px' }}>System Login</h2>
            <input 
              value={usernameInput} 
              onChange={e => setUsernameInput(e.target.value)}
              placeholder="Admin ID" 
              style={inputStyle}
            />
            <button onClick={login} style={loginBtnStyle}>Authorize Access</button>
          </div>
        )}

        {/* 시스템 하단 경고창 (에이전트 훈련용 단서) */}
        <div style={{ marginTop: '50px', padding: '25px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <h4 style={{ color: '#38bdf8', marginBottom: '15px', fontSize: '14px' }}>[ SYSTEM DIAGNOSTICS ]</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>Authenticated Sessions (UI): <strong>{status.ui_logged_in_count}</strong></span>
            <span>Unclosed Socket Handles (Server): <strong style={{ color: status.actual_server_handles > status.ui_logged_in_count ? '#ef4444' : '#10b981' }}>{status.actual_server_handles}</strong></span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '15px' }}>
            ※ 경고: 실제 핸들 수가 인증된 세션 수보다 많을 경우 소켓 누수를 의심하십시오.
          </p>
        </div>
      </main>
    </div>
  );
}

const cardStyle = { backgroundColor: '#0f172a', padding: '50px', borderRadius: '24px', border: '1px solid #1e293b', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' };
const inputStyle = { width: '100%', maxWidth: '300px', padding: '15px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', marginBottom: '20px', outline: 'none' };
const loginBtnStyle = { display: 'block', margin: '0 auto', padding: '15px 40px', backgroundColor: '#38bdf8', color: '#020617', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const logoutBtnStyle = { padding: '12px 30px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const statBox = { backgroundColor: '#1e293b', padding: '8px 15px', borderRadius: '6px' };

export default App;