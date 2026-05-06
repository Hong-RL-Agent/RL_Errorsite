import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export default function RoutineList() {
  const [routines, setRoutines] = useState([]);
  const [filter, setFilter] = useState('전체');
  const categories = ['전체', '가슴', '등', '하체', '코어', '유산소'];

  useEffect(() => {
    fetch(`/api/routines?category=${filter}`)
      .then(res => res.json())
      .then(data => setRoutines(data.data));
  }, [filter]);

  const toggleCheck = (id) => {
    setRoutines(prev => 
      prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r)
    );
  };

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-title">오늘의 루틴</div>
      
      <div className="routine-filters">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="routine-items">
        {routines.map(routine => (
          <div key={routine.id} className="routine-item" style={{ opacity: routine.completed ? 0.6 : 1 }}>
            <div className="routine-info">
              <span className="routine-cat">{routine.category}</span>
              <span className="routine-name" style={{ textDecoration: routine.completed ? 'line-through' : 'none' }}>
                {routine.name}
              </span>
            </div>
            <button 
              className={`check-btn ${routine.completed ? 'completed' : ''}`}
              onClick={() => toggleCheck(routine.id)}
            >
              <Check size={16} />
            </button>
          </div>
        ))}
        
        {routines.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            해당 카테고리의 루틴이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
