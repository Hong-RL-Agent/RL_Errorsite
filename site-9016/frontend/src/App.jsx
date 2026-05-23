import React, { useState, useEffect } from 'react';

function App() {
  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState({ active_metadata_count: 0, internal_running_timers: 0, cpu_usage: '0%' });
  const [taskName, setTaskName] = useState('');

  const fetchAll = () => {
    fetch('/api/schedules').then(res => res.json()).then(setSchedules);
    fetch('/api/system-status').then(res => res.json()).then(setStatus);
  };

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 3000);
    return () => clearInterval(timer);
  }, []);

  const createSchedule = async () => {
    if (!taskName) return;
    await fetch('/api/create-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: taskName, interval: 5 })
    });
    setTaskName('');
    fetchAll();
  };

  const deleteSchedule = async (id) => {
    await fetch('/api/delete-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchAll();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif', display: 'flex' }}>
      {/* 사이드바 */}
      <nav style={{ width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '30px' }}>
        <h2 style={{ color: '#38bdf8', marginBottom: '40px' }}>JAWS Ops</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#94a3b8' }}>
          <div style={{ color: 'white' }}>📅 Backup Schedules</div>
          <div>📂 Storage Logs</div>
          <div>🔐 Security Vault</div>
        </div>
      </nav>

      {/* 메인 섹션 */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Backup & Maintenance</h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={statCard}>System Load: <strong style={{ color: '#ef4444' }}>{status.cpu_usage}</strong></div>
            <div style={statCard}>Internal Tasks: <strong>{status.internal_running_timers}</strong></div>
          </div>
        </header>

        {/* 새 스케줄 생성 */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>Create New Schedule</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              value={taskName} 
              onChange={e => setTaskName(e.target.value)}
              placeholder="Task name (e.g. DB Backup)" 
              style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            />
            <button onClick={createSchedule} style={{ padding: '0 25px', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Add Task
            </button>
          </div>
        </div>

        {/* 스케줄 리스트 */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9' }}>
              <tr>
                <th style={thStyle}>Task Name</th>
                <th style={thStyle}>Interval</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{s.name}</td>
                  <td style={tdStyle}>{s.interval}s</td>
                  <td style={tdStyle}><span style={{ color: '#10b981' }}>● Active</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => deleteSchedule(s.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No active schedules found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const statCard = { backgroundColor: 'white', padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' };
const thStyle = { textAlign: 'left', padding: '15px 20px', fontSize: '13px', color: '#64748b', fontWeight: '600' };
const tdStyle = { padding: '15px 20px', fontSize: '14px', color: '#334155' };

export default App;