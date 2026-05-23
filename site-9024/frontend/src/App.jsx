import React, { useState, useEffect } from 'react';

function App() {
  const [logs, setLogs] = useState([]);
  const [trial, setTrial] = useState(false);
  const myOrg = "JAWS-LAB";

  const fetchLogs = () => {
    fetch(`/api/audit/logs?companyId=${myOrg}`).then(res => res.json()).then(setLogs);
  };

  useEffect(() => { fetchLogs(); }, [trial]);

  const toggleTrial = () => {
    fetch('/api/audit/toggle-trial', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setTrial(data.trialActive);
        alert("🛡️ 시스템 프로토콜: " + data.message);
      });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#ffffff', fontFamily: '"Geist", "Inter", sans-serif', padding: '0 0 100px 0' }}>
      
      {/* 1. Floating Glassmorphism Header */}
      <nav style={{ 
        position: 'sticky', top: '20px', zIndex: 100, width: '90%', maxWidth: '1200px', margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-1px' }}>JAWS <span style={{ color: '#38bdf8' }}>AUDIT</span></div>
        <div style={{ display: 'flex', gap: '30px', fontSize: '14px', color: '#94a3b8' }}>
          <span style={{ cursor: 'pointer', color: '#fff' }}>Dashboard</span>
          <span style={{ cursor: 'pointer' }}>Network</span>
          <span style={{ cursor: 'pointer' }}>Security</span>
        </div>
        <button onClick={toggleTrial} style={{ 
          padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: trial ? '#38bdf8' : '#fff', color: '#000', fontWeight: '700', fontSize: '13px', transition: '0.4s'
        }}>
          {trial ? 'Enterprise Enabled' : 'Unlock Enterprise'}
        </button>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        
        {/* 2. Bento Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: 'minmax(180px, auto)', gap: '20px' }}>
          
          {/* Card 1: System Status */}
          <div style={{ gridColumn: 'span 8', background: '#111', borderRadius: '32px', padding: '40px', border: '1px solid #222' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '10px', letterSpacing: '-2px' }}>Security Audit.</h1>
            <p style={{ color: '#888', fontSize: '18px' }}>워크스페이스 {myOrg}의 실시간 보안 트래픽을 모니터링합니다.</p>
          </div>

          {/* Card 2: Risk Level Widget */}
          <div style={{ gridColumn: 'span 4', background: trial ? 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)' : '#111', borderRadius: '32px', padding: '30px', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>현재 위험 수준</span>
            <h2 style={{ fontSize: '42px', margin: 0 }}>{trial ? 'CRITICAL' : 'LOW'}</h2>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>{trial ? '격리되지 않은 로그 스트림 감지됨' : '모든 시스템 정상 작동 중'}</p>
          </div>

          {/* Card 3: Audit Stream (The Main Table) */}
          <div style={{ gridColumn: 'span 12', background: '#111', borderRadius: '32px', padding: '10px', border: '1px solid #222' }}>
            <div style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px' }}>실시간 이벤트 스트림</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '20px', background: '#1a1a1a', borderRadius: '20px', border: '1px solid #222'
                  }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: log.companyId === myOrg ? '#10b981' : '#fb7185' }} />
                      <span style={{ fontWeight: '600' }}>{log.action}</span>
                      <span style={{ color: '#666', fontSize: '14px' }}>{log.user}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        fontSize: '12px', padding: '5px 12px', borderRadius: '10px', 
                        backgroundColor: log.companyId === myOrg ? '#334155' : 'rgba(251, 113, 133, 0.2)',
                        color: log.companyId === myOrg ? '#94a3b8' : '#fb7185'
                      }}>
                        {log.companyId}
                      </span>
                      <div style={{ fontSize: '12px', color: '#444', marginTop: '5px' }}>{log.ip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 3. Subtle Footer Logic Hint */}
        <footer style={{ marginTop: '50px', textAlign: 'center', color: '#444', fontSize: '13px' }}>
          * 9024_SECURITY_PROTOCOL_REV_4.7.4 | Trial Isolation Policy: {trial ? 'INACTIVE' : 'ACTIVE'}
        </footer>
      </main>
    </div>
  );
}

export default App;