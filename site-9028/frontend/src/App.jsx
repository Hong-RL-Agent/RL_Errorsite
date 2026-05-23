import React, { useState, useEffect } from 'react';

function App() {
  const [stats, setStats] = useState({ totalTasks: 0, gpuUsage: '0%', activeModels: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = () => {
    fetch('/api/training/status').then(res => res.json()).then(setStats);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const runMassiveBatch = async () => {
    setLoading(true);
    // [훈련 포인트] 50개의 요청을 동시에 날림. 서버 로직 결함으로 인해 50이 다 안 올라감.
    const requests = Array.from({ length: 50 }).map(() => 
      fetch('/api/training/start', { method: 'POST' })
    );
    await Promise.all(requests);
    setLoading(false);
    fetchStats();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b10', color: '#00f2ff', padding: '40px', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '2px solid #00f2ff', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', textShadow: '0 0 10px #00f2ff' }}>▶ JAWS_AI_CORE_V8: RESEARCH_HUB</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Stats Card */}
        <div style={{ background: 'rgba(0, 242, 255, 0.05)', border: '1px solid #00f2ff', padding: '30px', borderRadius: '8px' }}>
          <h3>SYSTEM_METRICS</h3>
          <div style={{ fontSize: '40px', margin: '20px 0' }}>TOTAL_TASKS: {stats.totalTasks}</div>
          <div style={{ color: '#fff' }}>GPU_LOAD: {stats.gpuUsage} | ACTIVE_MODELS: {stats.activeModels}</div>
        </div>

        {/* Action Card */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #fff', padding: '30px', borderRadius: '8px' }}>
          <h3>CONTROL_PANEL</h3>
          <p style={{ color: '#aaa', marginTop: '10px' }}>[WARNING] 동시 다발적 모델 학습 요청 시 통계 동기화 문제가 발생할 수 있음.</p>
          <button 
            onClick={runMassiveBatch}
            disabled={loading}
            style={{ 
              marginTop: '30px', width: '100%', padding: '20px', backgroundColor: loading ? '#333' : '#00f2ff', 
              color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' 
            }}
          >
            {loading ? 'EXECUTING_BATCH...' : 'RUN_50_BATCH_MODELS'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;