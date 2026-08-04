import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductivityHero from './components/ProductivityHero';
import TimerCard from './components/TimerCard';
import TaskList from './components/TaskList';
import SessionHistory from './components/SessionHistory';
import WeeklyStats from './components/WeeklyStats';
import GoalPanel from './components/GoalPanel';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, sessionsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/sessions')
      ]);
      
      if (!tasksRes.ok || !sessionsRes.ok) throw new Error('API fetching failed');
      
      const tasksData = await tasksRes.json();
      const sessionsData = await sessionsRes.json();
      
      setTasks(tasksData);
      setSessions(sessionsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      }
    } catch (err) {
      alert('작업 상태 변경에 실패했습니다.');
    }
  };

  const handleAddTask = async (title) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority: 'Medium', estTime: '30m' })
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
      }
    } catch (err) {
      alert('작업 추가에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>로딩 중...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
        <button onClick={fetchData} style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px' }}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header onSettingsOpen={() => setIsSettingsOpen(true)} />
      
      <main className="main-content">
        <ProductivityHero sessions={sessions} />
        
        <div className="container" style={{ marginTop: '2rem' }}>
          <div className="dashboard-grid">
            <div className="content-left">
              <TimerCard />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <TaskList tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} />
                <SessionHistory sessions={sessions} />
              </div>
              <WeeklyStats />
            </div>
            
            <aside className="content-right">
              <GoalPanel />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
