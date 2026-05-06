import React from 'react';

const CircularTimer = ({ percentage }) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  
  // INTENTIONAL GUI BUG: site042-bug02
  // Type: circular-timer-visual-break
  // Description: 원형 progress ring 계산에 잘못된 radius 값을 사용해 진행률 링이 원 밖으로 어긋남.
  const bugRadius = 115; // 실제 원(100)보다 큰 값을 사용해 링이 밖으로 삐져나오게 함
  const bugCircumference = 2 * Math.PI * bugRadius;
  const offset = bugCircumference - (percentage / 100) * bugCircumference;

  return (
    <svg className="timer-svg" viewBox="0 0 240 240" data-bug-id="site042-bug02">
      <circle
        className="timer-bg-circle"
        cx="120"
        cy="120"
        r={radius}
      />
      <circle
        className="timer-progress-circle"
        cx="120"
        cy="120"
        r={radius}
        style={{
          strokeDasharray: bugCircumference,
          strokeDashoffset: offset,
          stroke: percentage > 0 ? '#10b981' : 'transparent'
        }}
      />
    </svg>
  );
};

export default CircularTimer;
