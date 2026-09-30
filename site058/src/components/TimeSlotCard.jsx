import React from 'react';
import { Clock, Moon, Sun } from 'lucide-react';

export default function TimeSlotCard({ slots = [], selectedSlot, onSelectSlot }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
        <Clock size={18} color="#16a34a" />
        <span>수거 시간대 선택</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.time;
          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlot(slot.time)}
              style={{
                border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                background: isSelected ? '#ecfdf5' : '#ffffff',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: slot.isOvernight ? '#e0e7ff' : '#fef3c7', color: slot.isOvernight ? '#4338ca' : '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {slot.isOvernight ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  {slot.time}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {slot.isOvernight ? '비대면 문 앞 안심 수거' : '방문 기사 수거'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
