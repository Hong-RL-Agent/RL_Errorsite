import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import './styles.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tasks', err);
        setLoading(false);
      });
  }, []);

  const handleToggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'done' ? 'in_progress' : 'done';
    
    // Optmistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));

    // Backend update
    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => {
      console.error('Failed to update task', err);
      // Revert optimistic update on failure
      setTasks(tasks.map(t => t.id === id ? { ...t, status: task.status } : t));
    });
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header onAddClick={() => setIsModalOpen(true)} />
        {loading ? (
          <div style={{ padding: '24px' }}>Loading tasks...</div>
        ) : (
          <KanbanBoard tasks={tasks} onToggleTask={handleToggleTask} />
        )}
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Task</h2>
            <p style={{ marginTop: '16px', color: '#6B7280' }}>Feature in development.</p>
            <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
