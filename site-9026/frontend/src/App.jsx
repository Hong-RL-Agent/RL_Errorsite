import React, { useState, useEffect } from 'react';

function App() {
  const [profile, setProfile] = useState(null);
  const [loginName, setLoginName] = useState("");

  const handleLogin = () => {
    fetch(`/api/account/profile?name=${loginName}`)
      .then(res => res.json())
      .then(setProfile);
  };

  // 새로고침 시 이름 없이 호출하여 스레드 잔류 데이터 확인
  const checkSession = () => {
    fetch('/api/account/profile')
      .then(res => res.json())
      .then(setProfile);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', color: '#212529', fontFamily: 'Pretendard, sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0052cc' }}>JAWS <span style={{color: '#333'}}>FINANCE</span></h1>
        </header>

        {!profile ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>로그인</h2>
            <input 
              type="text" 
              placeholder="이름을 입력하세요" 
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            <button onClick={handleLogin} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#0052cc', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              시작하기
            </button>
            <p onClick={checkSession} style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#0052cc', cursor: 'pointer', textDecoration: 'underline' }}>
              세션 상태 바로 확인하기 (새로고침 시뮬레이션)
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#0052cc', color: '#fff', padding: '30px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,82,204,0.2)' }}>
              <p style={{ opacity: 0.8, fontSize: '14px' }}>반갑습니다, {profile.username}님</p>
              <h2 style={{ fontSize: '32px', margin: '10px 0' }}>{profile.balance}</h2>
              <p style={{ fontSize: '13px', opacity: 0.7 }}>{profile.accountNumber}</p>
            </div>

            <div style={{ background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>최근 접속 정보</h3>
              <p style={{ fontSize: '12px', color: '#666' }}>{profile.lastLogin}</p>
              <button 
                onClick={() => setProfile(null)}
                style={{ marginTop: '20px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', background: '#fff', cursor: 'pointer' }}
              >
                로그아웃
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#adb5bd' }}>
              * 주의: 본 시스템은 ThreadLocal 컨텍스트를 활용하여 세션을 관리합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;