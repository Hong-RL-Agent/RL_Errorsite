import React, { useState, useEffect } from 'react';

function App() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetch('/api/storage-usage')
      .then(res => res.json())
      .then(data => setUsage(data));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      {/* 사이드바 */}
      <aside style={{ width: '260px', backgroundColor: '#111827', color: 'white', padding: '30px' }}>
        <h2 style={{ color: '#6366f1', marginBottom: '40px', fontWeight: 'bold' }}>JAWS Cloud</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ color: '#6366f1' }}>🏠 Dashboard</div>
          <div style={{ color: '#9ca3af' }}>🌐 Instances</div>
          <div style={{ color: '#9ca3af' }}>💾 Storage</div>
          <div style={{ color: '#9ca3af' }}>💳 Billing</div>
        </nav>
      </aside>

      {/* 메인 영역 */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Storage Overview</h1>
          <button style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px' }}>Refresh Sync</button>
        </header>

        {usage && (
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* 상태 카드 */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontWeight: '600' }}>Cloud Storage Usage</span>
                <span style={{ color: usage.status === 'QUOTA_EXCEEDED' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                  {usage.status}
                </span>
              </div>
              
              {/* 게이지 바 */}
              <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ 
                  width: usage.status === 'QUOTA_EXCEEDED' ? '100%' : '25%', 
                  height: '100%', 
                  backgroundColor: usage.status === 'QUOTA_EXCEEDED' ? '#ef4444' : '#6366f1' 
                }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                <span>Actual Used: {usage.used_gb} GB</span>
                <span>Limit: {usage.total_gb} GB</span>
              </div>

              {usage.status === 'QUOTA_EXCEEDED' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
                  <strong>{usage.message}</strong>
                  <p style={{ fontSize: '12px', marginTop: '5px' }}>시스템 계산량: {usage.calculated_mb} MB / 제한: {usage.limit_mb} MB</p>
                </div>
              )}
            </div>

            {/* 서버 로그 힌트 */}
            <div style={{ backgroundColor: '#1f2937', color: '#10b981', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}>
              <div>[SYSTEM] Scanning block storage volumes...</div>
              <div>[DEBUG] Converting units for metadata sync...</div>
              <div>[WARN] Quota calculation mismatch detected in internal module.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;