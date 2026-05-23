import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState({ ui_active_users: 0, resident_objects_in_memory: 0, heap_used: '0 MB' });
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const fetchHealth = () => {
    fetch('/api/server-health').then(res => res.json()).then(setHealth);
  };

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(fetchHealth, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleJoin = async () => {
    if (!nickname) return;
    await fetch('/api/chat/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });
    setIsJoined(true);
  };

  const handleLeave = async () => {
    await fetch('/api/chat/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });
    setIsJoined(false);
    setNickname('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f0ff', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
      <header style={{ maxWidth: '600px', margin: '0 auto 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}>💬 JAWS Chat Hub</h1>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
          Heap: <strong style={{color: '#7c3aed'}}>{health.heap_used}</strong>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {isJoined ? (
          <div style={chatBoxStyle}>
            <div style={{ height: '300px', backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '100px' }}>[ {nickname}님이 입장하셨습니다 ]</div>
            </div>
            <button onClick={handleLeave} style={leaveBtnStyle}>채팅방 나가기 (Leave)</button>
          </div>
        ) : (
          <div style={loginCardStyle}>
            <h3 style={{ marginBottom: '20px' }}>글로벌 로비 입장</h3>
            <input 
              placeholder="사용할 닉네임" 
              value={nickname} 
              onChange={e => setNickname(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleJoin} style={joinBtnStyle}>입장하기</button>
          </div>
        )}

        {/* 시스템 모니터 (에이전트 단서) */}
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>메모리 상주 객체 분석</h4>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>UI 상 활성 유저</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{health.ui_active_users}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>메모리 상주 유저 객체</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: health.resident_objects_in_memory > health.ui_active_users ? '#ef4444' : '#7c3aed' }}>
                {health.resident_objects_in_memory}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '15px' }}>
            * 실시간 진단: 유저가 나갔음에도 '상주 유저 객체' 수가 줄어들지 않는다면 객체 유기가 발생한 것입니다.
          </p>
        </div>
      </main>
    </div>
  );
}

const chatBoxStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const loginCardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '15px', outline: 'none' };
const joinBtnStyle = { width: '100%', padding: '15px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const leaveBtnStyle = { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer' };

export default App;