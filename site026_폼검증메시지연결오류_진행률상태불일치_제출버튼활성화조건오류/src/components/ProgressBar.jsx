import React from 'react';

export default function ProgressBar({ current, total }) {
  // INTENTIONAL GUI BUG: site026-bug02
  // Type: progress-state-mismatch
  // Description: 질문 이동 시 currentQuestion은 변경되지만 progressPercent를 갱신하지 않아 진행률이 틀림.
  
  // Buggy implementation: progress is stuck at previous step or doesn't update correctly
  const progressPercent = ((current) / total) * 100; // It should be (current + 1) / total

  return (
    <div className="progress-container" data-bug-id="site026-bug02">
      <div className="flex justify-between items-end" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>설문 진행 상황</h3>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>현재 {current + 1} / {total} 질문 진행 중</p>
        </div>
        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '18px' }}>{Math.round(progressPercent)}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>
    </div>
  );
}
