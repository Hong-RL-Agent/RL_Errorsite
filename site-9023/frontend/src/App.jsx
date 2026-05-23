import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState('home'); // 'home' or 'inventory'
  const [data, setData] = useState({ stock: 0, pendingOrders: 0, available: 0 });

  const fetchStatus = () => {
    fetch('/api/status').then(res => res.json()).then(setData);
  };

  useEffect(() => { if (view === 'inventory') fetchStatus(); }, [view]);

  const handleRecover = () => {
    fetch('/api/recover', { method: 'POST' })
      .then(() => {
        alert("🚨 시스템 알림: 긴급 재고 복구 시퀀스가 실행되었습니다.");
        fetchStatus();
      });
  };

  // 스타일 정의
  const sidebarItem = { padding: '15px 20px', cursor: 'pointer', borderLeft: '4px solid transparent', transition: '0.3s' };
  const cardStyle = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };

  // --- 1. 랜딩 페이지 (Dashboard Home) ---
  if (view === 'home') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        {/* 사이드바 */}
        <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white' }}>
          <div style={{ padding: '30px 20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>
            🦈 JAWS Group
          </div>
          <div style={{ ...sidebarItem, backgroundColor: '#334155', borderLeft: '4px solid #3b82f6' }}>🏠 Dashboard</div>
          <div style={sidebarItem} onClick={() => setView('inventory')}>📦 Inventory</div>
          <div style={sidebarItem}>📊 Sales Report</div>
          <div style={sidebarItem}>👥 HR Management</div>
        </div>

        {/* 메인 컨텐츠 */}
        <div style={{ flex: 1, padding: '40px' }}>
          <h1 style={{ marginBottom: '30px', color: '#1e293b' }}>환영합니다, 관리자님</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={cardStyle}>
              <h3>물류 현황</h3>
              <p style={{ color: '#64748b' }}>현재 전국 48개 물류 센터 정상 가동 중</p>
              <button 
                onClick={() => setView('inventory')}
                style={{ marginTop: '15px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}
              >
                재고 관리 바로가기 →
              </button>
            </div>
            <div style={cardStyle}>
              <h3>금일 매출</h3>
              <p style={{ color: '#64748b' }}>전일 대비 12% 상승 기록</p>
            </div>
            <div style={cardStyle}>
              <h3>시스템 보안</h3>
              <p style={{ color: '#10b981' }}>● 보안 프로토콜 정상 작동 중</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. 재고 관리 상세 페이지 (Inventory) ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* 사이드바 (동일) */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white' }}>
        <div style={{ padding: '30px 20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>🦈 JAWS Group</div>
        <div style={sidebarItem} onClick={() => setView('home')}>🏠 Dashboard</div>
        <div style={{ ...sidebarItem, backgroundColor: '#334155', borderLeft: '4px solid #3b82f6' }}>📦 Inventory</div>
        <div style={sidebarItem}>📊 Sales Report</div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1e293b' }}>재고 통합 관리 센터</h1>
          <span style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            상태: 주의가 필요함
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>가용 재고 (Available)</p>
            <h2 style={{ fontSize: '36px', color: data.available < 0 ? '#ef4444' : '#0f172a' }}>{data.available} EA</h2>
          </div>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>창고 실재고 (Physical)</p>
            <h2 style={{ fontSize: '36px', color: '#0f172a' }}>{data.stock} EA</h2>
          </div>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>미출고 주문량 (Pending)</p>
            <h2 style={{ fontSize: '36px', color: '#f59e0b' }}>{data.pendingOrders} EA</h2>
          </div>
        </div>

        {/* 오류 복구 섹션 */}
        <div style={{ ...cardStyle, backgroundColor: '#fff' }}>
          <h3>인벤토리 상태 분석</h3>
          <p style={{ color: '#64748b', marginTop: '10px' }}>
            현재 대기 주문량이 실재고를 초과하였습니다. 시스템 자동 복구 프로토콜을 사용하십시오.
          </p>
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '5px solid #3b82f6' }}>
            <p style={{ fontSize: '14px', color: '#475569' }}>
              <strong>알고리즘 노트:</strong> <code>Available = Stock - PendingOrders</code>
            </p>
          </div>
          <button 
            onClick={handleRecover}
            style={{ 
              marginTop: '25px', padding: '12px 24px', backgroundColor: '#1e293b', color: 'white', 
              border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
            }}
          >
            🔧 긴급 재고 복구 알고리즘 실행
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;