import React from 'react';
import { Clock } from 'lucide-react';

export default function TimeSlotList({ slots = [], selectedTime, onSelectTime }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1e293b', fontWeight: 700 }}>
        <Clock size={18} color="#1e40af" />
        <span>예약 시간대 선택</span>
      </div>

      <div className="timeslot-grid">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              className={`timeslot-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => slot.available && onSelectTime(slot.time)}
            >
              <div>{slot.time}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>
                {slot.available ? '예약 가능' : '마감'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
