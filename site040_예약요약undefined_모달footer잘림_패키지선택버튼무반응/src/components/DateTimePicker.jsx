import React from 'react';

const DateTimePicker = ({ selectedDate, setSelectedDate, selectedTime, setSelectedTime }) => {
  const dates = ['5/4 (Mon)', '5/5 (Tue)', '5/6 (Wed)', '5/7 (Thu)', '5/8 (Fri)', '5/9 (Sat)', '5/10 (Sun)'];
  const times = ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  return (
    <div style={{ marginTop: '80px' }}>
      <h2 className="section-title">Schedule Your Visit</h2>
      <div className="picker-grid">
        {dates.map(date => (
          <div 
            key={date} 
            className={`slot ${selectedDate === date ? 'selected' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </div>
        ))}
      </div>
      <div className="time-grid">
        {times.map(time => (
          <div 
            key={time} 
            className={`slot ${selectedTime === time ? 'selected' : ''}`}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DateTimePicker;
