import React from 'react';

export default function SearchFilters({ difficulty, onDifficultyChange, time, onTimeChange }) {
  const difficulties = ['All', '쉬움', '중간', '어려움'];
  const times = ['All', '15분', '30분', '1시간'];

  return (
    <div style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '40px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: 'var(--wood)' }}>난이도</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {difficulties.map(d => (
            <button 
              key={d} 
              className={`filter-chip ${difficulty === d ? 'active' : ''}`}
              onClick={() => onDifficultyChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: 'var(--wood)' }}>조리 시간</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {times.map(t => (
            <button 
              key={t} 
              className={`filter-chip ${time === t ? 'active' : ''}`}
              onClick={() => onTimeChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
