import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState({ sensorOnline: true, logCount: 0, latestData: [] });

  const fetchData = () => {
    fetch('/api/factory-stats').then(res => res.json()).then(setData);
  };

  useEffect(() => {
    const timer = setInterval(fetchData, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSensor = () => fetch('/api/toggle-sensor', { method: 'POST' }).then(fetchData);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#e0e0e0', fontFamily: 'monospace', padding: '30px' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#00ff41', margin: 0 }}>🏭 JAWS Factory Sync v2.4</h1>
        <div style={{ textAlign: 'right' }}>
          <div>System Mode: <span style={{ color: '#00ff41' }}>PRODUCTION</span></div>
          <div style={{ fontSize: '12px', color: '#888' }}>Last Sync: {new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 센서 상태 카드 */}
        <div style={cardStyle}>
          <h3>Sensor Connection</h3>
          <div style={{ fontSize: '48px', margin: '20px 0', color: data.sensorOnline ? '#00ff41' : '#ff3131' }}>
            {data.sensorOnline ? '● ONLINE' : '○ OFFLINE'}
          </div>
          <button onClick={toggleSensor} style={buttonStyle(data.sensorOnline)}>
            {data.sensorOnline ? '센서 연결 끊기 (Simulate Failure)' : '센서 재가동'}
          </button>
        </div>

        {/* 데이터 수집 통계 */}
        <div style={cardStyle}>
          <h3>Data Collection Metrics</h3>
          <div style={{ marginTop: '20px' }}>
            <div style={statRow}><span>Buffer Usage:</span> <span>{data.logCount} / 50,000</span></div>
            <div style={statRow}><span>Storage Status:</span> <span style={{ color: data.logCount > 1000 ? '#ff3131' : '#00ff41' }}>
              {data.logCount > 1000 ? 'WARNING: LEAK DETECTED' : 'STABLE'}
            </span></div>
          </div>
          <div style={{ height: '10px', backgroundColor: '#333', borderRadius: '5px', marginTop: '20px', overflow: 'hidden' }}>
            <div style={{ width: `${(data.logCount / 50000) * 100}%`, height: '100%', backgroundColor: '#00ff41', transition: '0.3s' }}></div>
          </div>
        </div>
      </div>

      {/* 실시간 로그 터미널 */}
      <div style={{ marginTop: '30px', backgroundColor: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333', height: '250px', overflowY: 'hidden' }}>
        <h4 style={{ color: '#888', marginBottom: '10px' }}>[ LIVE DATA STREAM ]</h4>
        {data.latestData.map((log, i) => (
          <div key={i} style={{ fontSize: '12px', marginBottom: '4px', color: log.status === 'OK' ? '#00ff41' : '#ff3131' }}>
            [{log.t}] {log.val ? `Reading: ${log.val.toFixed(4)}` : log.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', border: '1px solid #333' };
const statRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px' };
const buttonStyle = (online) => ({
  width: '100%', padding: '12px', cursor: 'pointer', backgroundColor: online ? '#333' : '#00ff41',
  color: online ? '#ff3131' : '#000', border: `1px solid ${online ? '#ff3131' : '#00ff41'}`,
  fontWeight: 'bold', borderRadius: '6px'
});

export default App;