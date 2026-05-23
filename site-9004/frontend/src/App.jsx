import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/wallet')
      .then(res => {
        if (!res.ok) throw new Error('서버 연결 실패 (502/504)');
        return res.json();
      })
      .then(d => setData(d))
      .catch(err => setError('⚠️ 보안 노드 접속 불가: 백엔드 상태를 확인하세요.'));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0c', color: 'white', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f7931a' }}>₿ CryptoGuard</h1>
        <div style={{ padding: '8px 16px', border: '1px solid #333', borderRadius: '20px' }}>Node: Mainnet-9004</div>
      </header>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {error ? (
          <div style={{ padding: '30px', backgroundColor: '#2d1a1a', border: '1px solid #7f1d1d', borderRadius: '16px', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>{error}</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '10px' }}>[System Log] Backend Process Exited</p>
          </div>
        ) : (
          <div style={{ padding: '40px', backgroundColor: '#161618', borderRadius: '24px', border: '1px solid #262626' }}>
            <p style={{ color: '#9ca3af' }}>총 자산 가치</p>
            <h2 style={{ fontSize: '42px', margin: '10px 0' }}>{data ? data.balance : '로딩 중...'}</h2>
            <div style={{ color: '#10b981' }}>● {data ? data.status : 'Checking...'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;