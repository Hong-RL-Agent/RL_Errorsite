import React from 'react';
import { Clock } from 'lucide-react';

export default function TimeSlotGrid({ slots = [], selectedTime, onSelectTime }) {
  const morningSlots = slots.filter(s => parseInt(s.time.split(':')[0], 10) < 13);
  const afternoonSlots = slots.filter(s => parseInt(s.time.split(':')[0], 10) >= 13);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#0f172a' }}>
        <Clock size={18} color="#0284c7" />
        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>진료 시간대 선택</h4>
      </div>

      {slots.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center', padding: '20px 0' }}>
          진료 날짜를 먼저 선택해 주세요.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Morning Slots */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              오전 진료
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {morningSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => onSelectTime(slot.time)}
                    style={{
                      padding: '10px 4px',
                      background: isSelected ? '#0284c7' : (slot.available ? '#f8fafc' : '#f1f5f9'),
                      color: isSelected ? '#ffffff' : (slot.available ? '#0f172a' : '#94a3b8'),
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      textDecoration: slot.available ? 'none' : 'line-through'
                    }}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              오후 진료
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {afternoonSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => onSelectTime(slot.time)}
                    style={{
                      padding: '10px 4px',
                      background: isSelected ? '#0284c7' : (slot.available ? '#f8fafc' : '#f1f5f9'),
                      color: isSelected ? '#ffffff' : (slot.available ? '#0f172a' : '#94a3b8'),
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      textDecoration: slot.available ? 'none' : 'line-through'
                    }}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
