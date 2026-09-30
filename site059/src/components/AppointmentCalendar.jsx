import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppointmentCalendar({ availableDates = [], selectedDate, onSelectDate }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#0f172a' }}>
        <CalendarIcon size={18} color="#0284c7" />
        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>진료 희망 날짜 선택</h4>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'thin'
      }}>
        {availableDates.map((item) => {
          const isSelected = selectedDate === item.date;
          const isSaturday = item.dayOfWeek === '토';

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => onSelectDate(item.date)}
              style={{
                flex: '0 0 auto',
                minWidth: '76px',
                padding: '12px 8px',
                background: isSelected ? '#0284c7' : '#f8fafc',
                color: isSelected ? '#ffffff' : '#0f172a',
                border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: isSelected ? '#ffffff' : (isSaturday ? '#0284c7' : '#64748b'),
                marginBottom: '4px'
              }}>
                {item.dayOfWeek}요일
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                {item.date.split('-')[2]}일
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '2px' }}>
                {item.date.split('-')[1]}월
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
