import React, { useState } from 'react';

const WeeklyStats = () => {
  const [filter, setFilter] = useState('Weekly');
  
  const stats = [
    { day: 'Mon', value: 70 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 60 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 30 },
    { day: 'Sun', value: 20 },
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>주간 집중 통계</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
        >
          <option value="Weekly">이번 주</option>
          <option value="Monthly">이번 달</option>
        </select>
      </div>
      
      <div className="chart-container">
        {stats.map((s, i) => (
          <div key={i} className="chart-bar-wrapper">
            <div 
              className={`chart-bar ${s.day === 'Fri' ? 'active' : ''}`} 
              style={{ height: `${s.value}%` }}
            ></div>
            <div className="chart-day">{s.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyStats;
