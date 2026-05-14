import React, { useState, useEffect } from 'react';
import CircularTimer from './CircularTimer';

const TimerCard = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    // Normal handler would be: setIsRunning(!isRunning);
    // But for bug03, the "Start" button specifically doesn't work.
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  return (
    <div className="card timer-card">
      <h3 className="section-title">집중 타이머</h3>
      
      <div className="timer-visual">
        <CircularTimer percentage={((25 * 60 - timeLeft) / (25 * 60)) * 100} />
        <div className="timer-display">{formatTime(timeLeft)}</div>
      </div>

      <div className="timer-controls">
        {/* INTENTIONAL GUI BUG: site042-bug03 */}
        {/* Type: timer-start-button-no-response */}
        {/* Description: 집중 시작 버튼에 running state 변경 handler를 연결하지 않아 클릭해도 타이머가 시작되지 않음. */}
        {!isRunning ? (
          <button 
            className="timer-btn start" 
            onClick={handleToggle}
            data-bug-id="site042-bug03"
          >
            집중 시작
          </button>
        ) : (
          <button 
            className="timer-btn stop" 
            onClick={() => setIsRunning(false)}
          >
            일시 정지
          </button>
        )}
        <button className="timer-btn reset" onClick={handleReset}>초기화</button>
      </div>
      
      <div style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
        현재 작업: <strong>디자인 시스템 명세서 작성</strong>
      </div>
    </div>
  );
};

export default TimerCard;
