import React, { useState } from 'react';

function App() {
  const [activeMenu, setActiveMenu] = useState('campaign');
  const [status, setStatus] = useState('Idle');
  const [loading, setLoading] = useState(false);

  // 마케팅 캠페인 실행 함수
  const triggerBulkMail = async () => {
    setLoading(true);
    setStatus('Processing 50,000 users...');
    try {
      const res = await fetch('/api/send-bulk-emails');
      const data = await res.json();
      setStatus(`Success: ${data.message} (${data.duration})`);
    } catch (err) {
      setStatus('❌ Critical System Failure: Event Loop Blocked');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: '"Inter", sans-serif' }}>
      
      {/* 1. 사이드바 */}
      <aside style={{ width: '280px', backgroundColor: '#1e293b', color: 'white', padding: '30px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '40px' }}>AI Marketing</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={navStyle(activeMenu === 'dash')} onClick={() => setActiveMenu('dash')}>📊 대시보드</div>
          <div style={navStyle(activeMenu === 'user')} onClick={() => setActiveMenu('user')}>👥 고객 리스트</div>
          <div style={navStyle(activeMenu === 'campaign')} onClick={() => setActiveMenu('campaign')}>🚀 캠페인 전송</div>
          <div style={navStyle(activeMenu === 'settings')} onClick={() => setActiveMenu('settings')}>⚙️ 서비스 설정</div>
        </nav>
      </aside>

      {/* 2. 메인 컨텐츠 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단 바 */}
        <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <div style={{ fontWeight: '500', color: '#6b7280' }}>Campaigns / New Bulk Action</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px' }}>Admin_Haeun</span>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></div>
          </div>
        </header>

        {/* 대시보드 내용 */}
        <div style={{ padding: '40px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>전체 고객 캠페인 발송</h1>
            <p style={{ color: '#6b7280' }}>한 번의 클릭으로 모든 고객에게 마케팅 로그를 전송합니다.</p>
          </div>

          {/* 통계 카드 섹션 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={cardStyle}><h3>전체 고객</h3><p>54,200명</p></div>
            <div style={cardStyle}><h3>이전 성공률</h3><p>99.8%</p></div>
            <div style={cardStyle}><h3>서버 상태</h3><p style={{ color: '#10b981' }}>Healthy</p></div>
          </div>

          {/* 메인 액션 구역 */}
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>📩</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>대량 메일 전송 준비 완료</h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px' }}>알림: 대량 발송 시 서버 리소스가 일시적으로 증가할 수 있습니다.</p>
            
            <button 
              onClick={triggerBulkMail}
              disabled={loading}
              style={{ padding: '15px 40px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.2s' }}
            >
              {loading ? '서버 통신 중...' : '지금 바로 5만 건 발송하기'}
            </button>

            <div style={{ marginTop: '30px', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '14px', border: '1px solid #e5e7eb' }}>
              <strong>시스템 상태:</strong> {status}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const navStyle = (active) => ({
  padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
  backgroundColor: active ? '#334155' : 'transparent',
  color: active ? '#38bdf8' : '#94a3b8', fontWeight: active ? '600' : '400'
});

const cardStyle = {
  backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

export default App;