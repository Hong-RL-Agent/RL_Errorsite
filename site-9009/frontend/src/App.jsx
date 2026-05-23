import React, { useState } from 'react';

function App() {
  const [info, setInfo] = useState(null);

  const checkLog = async () => {
    const res = await fetch('/api/system-log');
    const data = await res.json();
    setInfo(data);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#94a3b8', padding: '50px', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        🛡️ JAWS Security Log Monitor
      </h1>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={checkLog}
          style={{ padding: '12px 24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          현재 시스템 로그 전송 테스트
        </button>
      </div>

      {info && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}>
          <p style={{ color: '#22c55e' }}>{`> ${info.message}`}</p>
          <p style={{ color: '#f59e0b', marginTop: '10px' }}>{`[DEBUG] ${info.lib_info}`}</p>
          <p style={{ color: '#ef4444', marginTop: '10px' }}>{`[ALERT] ${info.status}`}</p>
          <hr style={{ borderColor: '#1e293b', margin: '20px 0' }} />
          <p style={{ fontSize: '12px' }}>* 내부 패키지 매니저는 반드시 package-lock.json의 integrity를 확인해야 합니다.</p>
        </div>
      )}
    </div>
  );
}

export default App;