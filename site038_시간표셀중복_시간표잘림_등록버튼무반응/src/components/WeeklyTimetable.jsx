import React, { useState } from 'react';

const WeeklyTimetable = ({ classes }) => {
  const [activeTab, setActiveTab] = useState('월요일');
  const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const times = ['10:00', '12:00', '14:00', '16:00', '18:00'];

  // Group classes by day
  const grouped = days.reduce((acc, day) => {
    acc[day] = classes.filter(c => c.day === day);
    return acc;
  }, {});

  // INTENTIONAL GUI BUG: site038-bug01
  // Type: timetable-cell-duplicate
  // Description: 시간표 그룹핑 과정에서 특정 수업(수학 심화 1반)을 월요일과 화요일 배열에 모두 넣어 중복 표시함.
  const buggedClass = classes.find(c => c.id === 1);
  if (buggedClass && grouped['화요일']) {
    // Manually add Monday class to Tuesday to create duplicate entry
    if (!grouped['화요일'].some(c => c.id === 1)) {
        grouped['화요일'].push({ ...buggedClass, day: '화요일 (중복오류)' });
    }
  }

  return (
    <div className="timetable-container" id="timetable">
      <h2 className="section-title">주간 시간표</h2>
      <div className="timetable-tabs">
        {days.map(day => (
          <button 
            key={day}
            className={`tab-btn ${activeTab === day ? 'active' : ''}`}
            onClick={() => setActiveTab(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="timetable-wrapper">
        <div className="timetable-grid" data-bug-id="site038-bug02">
          {days.map(day => (
            <div key={day} className="time-col" data-bug-id={day === '화요일' ? "site038-bug01" : undefined}>
              <div className="grid-header">{day}</div>
              {times.map(time => {
                const classAtTime = grouped[day]?.find(c => c.time.startsWith(time.split(':')[0]));
                return (
                  <div key={time} className="grid-cell">
                    {classAtTime ? (
                      <div className="class-slot">
                        <div className="slot-name">{classAtTime.name}</div>
                        <div className="slot-info">{classAtTime.teacher} 강사</div>
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e0', fontSize: '0.7rem' }}>{time}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-gray)', textAlign: 'center' }}>
        * 시간표 마지막 요일이 보이지 않는다면 브라우저 너비를 확인해주세요.
      </p>
    </div>
  );
};

export default WeeklyTimetable;
