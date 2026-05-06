import React, { useState } from 'react';

const GoalProgress = ({ title, current, target }) => {
  const [isOpen, setIsOpen] = useState(true);
  const percentage = (current / target) * 100;

  return (
    <div className="goal-progress-card">
      <div className="goal-header" onClick={() => setIsOpen(!isOpen)}>
        <h5>{title}</h5>
        <span style={{ fontSize: '0.7rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>
      {isOpen && (
        <div className="goal-body">
          <div className="goal-bar-bg">
            <div className="goal-bar-fill" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="goal-details" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{current}h / {target}h</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalPanel = () => {
  return (
    <div className="sticky-sidebar">
      <div className="card">
        <h3 className="section-title">오늘의 목표</h3>
        <GoalProgress title="업무 집중" current={4.5} target={6} />
        <GoalProgress title="개인 학습" current={1.2} target={2} />
        <GoalProgress title="독서" current={0.5} target={1} />
      </div>

      <div className="card">
        <h3 className="section-title">팀원 집중 상태</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { name: '김철수', status: 'Focusing', color: '#10b981' },
            { name: '이지은', status: 'In Meeting', color: '#f59e0b' },
            { name: '박민준', status: 'Break', color: '#94a3b8' }
          ].map((user, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.color }}></div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>{user.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalPanel;
