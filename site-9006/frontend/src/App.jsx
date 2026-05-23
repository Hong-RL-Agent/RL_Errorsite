import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('시스템 접속을 위해 로그인하세요.');

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setMsg(`✅ 접속 성공! 환영합니다, ${username}님. (보안 경고: 초기 비밀번호를 변경하세요)`);
    } else {
      setMsg(`❌ ${data.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#111827' }}>🔒 Admin Control Panel</h2>
        <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleLogin} style={buttonStyle}>Login</button>
        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: msg.includes('✅') ? '#059669' : '#6b7280' }}>{msg}</p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #d1d5db', borderRadius: '8px' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default App;