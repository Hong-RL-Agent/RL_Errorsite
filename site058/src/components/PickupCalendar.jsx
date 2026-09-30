import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PickupCalendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  const dateList = [];

  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];

    dateList.push({
      dateStr,
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
      dayName,
      isToday: i === 0
    });
  }

  return (
    <div style={{ marginTop: '14px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
        <Calendar size={18} color="#16a34a" />
        <span>희망 수거 일자 선택</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          background: '#f8fafc',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        {dateList.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 4px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                background: isSelected ? '#16a34a' : '#ffffff',
                color: isSelected ? '#ffffff' : '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.7 }}>
                {item.month}/{item.dayNumber} ({item.dayName})
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: '2px' }}>
                {item.dayNumber}
              </span>
              {item.isToday && (
                <span style={{ fontSize: '0.68rem', background: isSelected ? 'rgba(255,255,255,0.25)' : '#ecfdf5', color: isSelected ? '#fff' : '#16a34a', padding: '1px 4px', borderRadius: '4px', marginTop: '2px', fontWeight: 800 }}>
                  오늘
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
