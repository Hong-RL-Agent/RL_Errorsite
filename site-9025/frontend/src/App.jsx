import React, { useState, useEffect } from 'react';

function App() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ activeUsers: 0, totalEmails: '', serverLoad: '' });

  useEffect(() => {
    fetch('/api/campaign/stats').then(res => res.json()).then(setStats);
  }, []);

  const handleBulkAction = () => {
    setLoading(true);
    fetch('/api/campaign/send-bulk', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setLoading(false);
      })
      .catch(() => {
        alert("⚠️ 서버 응답 시간이 초과되었습니다.");
        setLoading(false);
      });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', color: '#1d1d1f', padding: '40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>JAWS Suite <span style={{ color: '#0071e3' }}>Marketing</span></h1>
          <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '14px' }}>
            Admin: Haeun_Lab
          </div>
        </header>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          <div style={{ gridColumn: 'span 2', background: '#fff', borderRadius: '30px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '20px', letterSpacing: '-1px' }}>전체 캠페인 실행.</h2>
            <p style={{ color: '#86868b', fontSize: '18px', marginBottom: '30px' }}>선택된 12,540명의 고객에게 개인화된 마케팅 메시지를 즉시 전송합니다.</p>
            <button 
              onClick={handleBulkAction}
              disabled={loading}
              style={{ 
                padding: '16px 32px', borderRadius: '15px', border: 'none', background: loading ? '#ccc' : '#0071e3', 
                color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s'
              }}
            >
              {loading ? '서버 처리 중 (연산 부하 발생)...' : '지금 즉시 발송하기'}
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '30px', padding: '30px', border: '1px solid #e5e5e7' }}>
            <p style={{ color: '#86868b', fontSize: '14px' }}>서버 부하 상태</p>
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: loading ? '#ff3b30' : '#34c759' }}>
                {loading ? 'CRITICAL' : 'OPTIMAL'}
              </div>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#86868b' }}>
                {loading ? '메인 스레드 점유 중' : '안정적인 리소스 유지 중'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {['활성 사용자', '누적 발송량', '성공률'].map((title, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <p style={{ color: '#86868b', fontSize: '13px' }}>{title}</p>
              <h3 style={{ fontSize: '24px', marginTop: '10px' }}>
                {i === 0 ? stats.activeUsers : i === 1 ? stats.totalEmails : '99.9%'}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;