import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function GoalProgress() {
  const [expanded, setExpanded] = useState(false);
  const progress = 65; // 65%

  return (
    <div className="panel">
      <div className="goal-progress">
        <div className="goal-header" onClick={() => setExpanded(!expanded)}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>체지방률 15% 달성</h3>
            <div style={{ color: 'var(--primary)', fontWeight: '600' }}>{progress}% 진행됨</div>
          </div>
          {expanded ? <ChevronUp size={24} color="var(--text-muted)" /> : <ChevronDown size={24} color="var(--text-muted)" />}
        </div>
        
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        {expanded && (
          <div className="goal-details">
            <p>현재 체지방률: 18%</p>
            <p>목표 체지방률: 15%</p>
            <p style={{ marginTop: '8px', color: 'var(--text-main)' }}>
              남은 기간: 3주
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
