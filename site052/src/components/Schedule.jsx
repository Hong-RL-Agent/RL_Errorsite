import React from 'react';

export default function Schedule({ bookings = [], onSelectBooking }) {
  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--navy-500)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        등록된 일정이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '20px' }}>
      <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '16px' }}>
        📅 주간 이용 일정 현황
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bookings.map(b => (
          <div 
            key={b.id} 
            onClick={() => onSelectBooking && onSelectBooking(b)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--indigo-600)', fontWeight: '700' }}>
                {b.date} ({b.startTime} ~ {b.endTime})
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                {b.roomName} <span style={{ fontSize: '0.85rem', color: 'var(--navy-500)', fontWeight: '400' }}>· {b.branch}</span>
              </div>
            </div>
            <span className={`status-badge ${b.status.replace(' ', '-')}`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
