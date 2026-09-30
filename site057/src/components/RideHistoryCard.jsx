import React from 'react';
import { Calendar, Clock, MapPin, Navigation, CreditCard, ChevronRight } from 'lucide-react';

export default function RideHistoryCard({ historyItem, onSelectDetails }) {
  const isCompleted = historyItem.status === '이용 완료';
  const isUnpaddedDate = /^\d{4}-\d{1}-\d{1,2}$|^\d{4}-\d{2}-\d{1}$/.test(historyItem.date);

  return (
    <div
      style={{
        background: '#ffffff',
        border: isUnpaddedDate ? '1px solid #fecaca' : '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.5fr 1fr auto',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      {/* Date & Vehicle Name */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
          <Calendar size={15} color="#65a30d" />
          <span>{historyItem.date}</span>
          {isUnpaddedDate && (
            <span style={{ fontSize: '0.68rem', fontWeight: 900, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '4px' }} title="포맷팅 오류: YYYY-MM-DD 제로패딩 누락">
              site057-SEC-464
            </span>
          )}
        </div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
          {historyItem.vehicleName}
        </h4>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          {historyItem.rentalNumber}
        </div>
      </div>

      {/* Stations & Route */}
      <div style={{ fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', marginBottom: '4px' }}>
          <MapPin size={14} color="#65a30d" />
          <span>출발: {historyItem.startStation}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
          <Navigation size={14} color="#0284c7" />
          <span>도착: {historyItem.endStation}</span>
        </div>
      </div>

      {/* Stats (Duration, Distance, Amount) */}
      <div>
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          {historyItem.duration} • {historyItem.distance}
        </div>
        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
          {historyItem.amount.toLocaleString()}원
        </div>
      </div>

      {/* Action / Status Badge */}
      <div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: isCompleted ? '#dcfce7' : '#e0f2fe',
            color: isCompleted ? '#15803d' : '#0369a1'
          }}
        >
          {historyItem.status}
        </span>
      </div>
    </div>
  );
}
