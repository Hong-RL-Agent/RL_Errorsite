import React from 'react';

const SessionHistory = ({ sessions }) => {
  return (
    <div className="card">
      <h3 className="section-title">집중 세션 히스토리</h3>
      <div className="history-list">
        {sessions.map(session => (
          <div key={session.id} className="history-item">
            <div>
              <div className="history-task-name">{session.taskName}</div>
              <div className="history-meta">
                시작 시간: {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="history-duration">{session.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;
