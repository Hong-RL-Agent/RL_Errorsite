import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState({ rooms: [], system_integrity: "STABLE" });

  const fetchRooms = () => {
    fetch('/api/rooms').then(res => res.json()).then(setData);
  };

  useEffect(() => {
    fetchRooms();
    const timer = setInterval(fetchRooms, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (id, isAvailable) => {
    const endpoint = isAvailable ? '/api/reserve' : '/api/release';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchRooms();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafb', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
      <header style={{ maxWidth: '1000px', margin: '0 auto 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '800' }}>🏢 JAWS Shared Office</h1>
          <p style={{ color: '#64748b' }}>회의실 실시간 예약 및 자원 관리 시스템</p>
        </div>
        <div style={{ padding: '10px 20px', backgroundColor: data.system_integrity === 'STABLE' ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', border: `1px solid ${data.system_integrity === 'STABLE' ? '#10b981' : '#ef4444'}` }}>
          <span style={{ fontSize: '14px', color: data.system_integrity === 'STABLE' ? '#059669' : '#dc2626' }}>
            System Integrity: <strong>{data.system_integrity}</strong>
          </span>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
        {data.rooms.map(room => (
          <div key={room.id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{room.name}</h3>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: room.isAvailable ? '#f0fdf4' : '#fff1f2', color: room.isAvailable ? '#16a34a' : '#e11d48', marginBottom: '25px' }}>
              {room.isAvailable ? '이용 가능' : '사용 중'}
            </div>
            
            <button 
              onClick={() => handleAction(room.id, room.isAvailable)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: room.isAvailable ? '#0f172a' : '#f1f5f9', color: room.isAvailable ? 'white' : '#64748b' }}
            >
              {room.isAvailable ? '지금 예약하기' : '사용 종료 (반납)'}
            </button>

            {/* 디버그 레이어 (에이전트 힌트) */}
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0', fontSize: '11px', color: '#94a3b8' }}>
              <div>UI Status: {room.isAvailable ? 'Free' : 'Busy'}</div>
              <div>Internal Lock: <span style={{ color: room.internalLock ? '#ef4444' : '#10b981' }}>{room.internalLock ? 'LOCKED' : 'RELEASED'}</span></div>
            </div>
          </div>
        ))}
      </main>

      <footer style={{ maxWidth: '1000px', margin: '40px auto 0', padding: '20px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '13px' }}>
        <strong>🚨 관리자 참고:</strong> 사용 종료 후에도 'Internal Lock'이 해제되지 않으면 해당 리소스를 다시 예약할 수 없습니다. 이는 공유 리소스 유기 장애의 전형적인 증상입니다.
      </footer>
    </div>
  );
}

export default App;