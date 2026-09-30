import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BookingCalendar({ selectedDate, onSelectDate }) {
  // Generate selectable dates for next 14 days
  const today = new Date();
  const dateList = [];

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    const isSunday = d.getDay() === 0;

    dateList.push({
      dateStr,
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
      dayName,
      isSunday
    });
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#1e293b', fontWeight: 700 }}>
        <CalendarIcon size={18} color="#1e40af" />
        <span>예약 희망 일자 선택 (2주 이내)</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        {dateList.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => onSelectDate(item.dateStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 6px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #1e40af' : '1px solid #e2e8f0',
                background: isSelected ? '#1e40af' : '#ffffff',
                color: isSelected ? '#ffffff' : (item.isSunday ? '#dc2626' : '#1e293b'),
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '0.78rem', opacity: isSelected ? 0.9 : 0.7, fontWeight: 600 }}>
                {item.month}/{item.dayNumber} ({item.dayName})
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>
                {item.dayNumber}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
