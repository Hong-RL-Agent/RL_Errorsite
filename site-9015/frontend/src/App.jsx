import React, { useState, useEffect } from 'react';

function App() {
  const [streamId, setStreamId] = useState(null);
  const [stats, setStats] = useState({ total_active_pipelines: 0, system_load: '0%' });
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetch('/api/stream-status').then(res => res.json()).then(setStats);
      if (streamId) {
        const newFeed = { id: Date.now(), text: `New Social Trend detected at ${new Date().toLocaleTimeString()}`, sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral' };
        setFeeds(prev => [newFeed, ...prev].slice(0, 5));
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [streamId]);

  const toggleStream = async () => {
    if (streamId) {
      await fetch('/api/stop-stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ streamId }) });
      setStreamId(null);
      setFeeds([]);
    } else {
      const res = await fetch('/api/start-stream', { method: 'POST' });
      const data = await res.json();
      setStreamId(data.streamId);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: '#38bdf8', fontSize: '24px' }}>🌊 JAWS Social Pulse</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Real-time Sentiment & Trend Analytics</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>SERVER RESOURCE STATUS</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: parseInt(stats.system_load) > 50 ? '#ef4444' : '#10b981' }}>
            System Load: {stats.system_load}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
        {/* 제어 패널 */}
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '20px' }}>Stream Control</h3>
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>ACTIVE PIPELINES</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total_active_pipelines}</div>
          </div>
          <button 
            onClick={toggleStream}
            style={{ 
              width: '100%', padding: '15px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
              backgroundColor: streamId ? '#ef4444' : '#38bdf8', color: 'white'
            }}
          >
            {streamId ? 'STOP ANALYZING' : 'START LIVE ANALYSIS'}
          </button>
        </div>

        {/* 실시간 피드 영역 */}
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '20px' }}>Live Trends Feed</h3>
          {streamId ? (
            feeds.map(f => (
              <div key={f.id} style={{ padding: '15px', borderBottom: '1px solid #334155', animation: 'fadeIn 0.5s' }}>
                <span style={{ fontSize: '12px', color: '#38bdf8' }}>[EVENT]</span> {f.text}
                <span style={{ marginLeft: '10px', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: f.sentiment === 'Positive' ? '#064e3b' : '#334155', color: f.sentiment === 'Positive' ? '#34d399' : '#94a3b8' }}>
                  {f.sentiment}
                </span>
              </div>
            ))
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', marginTop: '100px' }}>No active stream. Start analysis to see live data.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;