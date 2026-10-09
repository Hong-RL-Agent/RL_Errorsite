import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function SpaceTimeline({ spaces, reservations, onSelectSlot, onSelectSpace }) {
  const [selectedSpaceId, setSelectedSpaceId] = useState(101);
  const [selectedDate, setSelectedDate] = useState('2026-10-15');

  const currentSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];

  const timeSlots = [
    { start: '09:00', end: '10:00', label: '09:00 - 10:00' },
    { start: '10:00', end: '11:00', label: '10:00 - 11:00' },
    { start: '11:00', end: '12:00', label: '11:00 - 12:00' },
    { start: '13:00', end: '14:00', label: '13:00 - 14:00' },
    { start: '14:00', end: '15:00', label: '14:00 - 15:00' },
    { start: '15:00', end: '16:00', label: '15:00 - 16:00' }
  ];

  // Find reservations for selected space on selected date
  const spaceReservations = reservations.filter(r => {
    if (r.space_id !== selectedSpaceId) return false;
    if (r.status === 'CANCELLED') return false;
    // Check date match
    const rDate = r.start_at ? r.start_at.substring(0, 10) : '';
    return rDate === selectedDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 40, 34, 0.9), rgba(20, 30, 26, 0.9))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '6px' }}>
            <CalendarIcon size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              공간 일정 타임라인
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            이번 주 예약 일정
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            공간별 시간대 예약 상태를 확인하고 원하는 일정을 선택하여 예약할 수 있습니다.
          </p>
        </div>

        {/* Space Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-surface)',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          {spaces.map(space => (
            <button
              key={space.id}
              onClick={() => setSelectedSpaceId(space.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                fontSize: '0.85rem',
                color: selectedSpaceId === space.id ? '#0c1210' : 'var(--text-secondary)',
                background: selectedSpaceId === space.id ? 'var(--brand-primary)' : 'transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {space.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            예약 일자 선택:
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(132, 169, 140, 0.3)', border: '1px solid var(--brand-primary)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>예약 가능</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(231, 111, 81, 0.3)', border: '1px solid var(--brand-accent)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>예약 완료</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {timeSlots.map(slot => {
          const slotStartFull = `${selectedDate}T${slot.start}:00`;
          const slotEndFull = `${selectedDate}T${slot.end}:00`;

          // Find matching reservations
          const matchedReservations = spaceReservations.filter(r => {
            const rStart = r.start_at || '';
            return rStart.includes(slot.start);
          });

          const isOccupied = matchedReservations.length > 0;
          const hasCollision = matchedReservations.length > 1;

          return (
            <div
              key={slot.label}
              style={{
                background: 'var(--bg-card)',
                border: hasCollision ? '2px solid var(--brand-accent)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Slot Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--brand-primary)" />
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>
                    {slot.label}
                  </span>
                </div>
                {hasCollision ? (
                  <span className="badge badge-cancelled">
                    <AlertTriangle size={12} />
                    중복 예약 감지 ({matchedReservations.length}건)
                  </span>
                ) : isOccupied ? (
                  <span className="badge badge-confirmed">
                    <CheckCircle size={12} />
                    예약 확정
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--brand-primary)',
                    background: 'var(--brand-subtle)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    이용 가능
                  </span>
                )}
              </div>

              {/* Reserved Cards / Empty Slot */}
              {isOccupied ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {matchedReservations.map((res, idx) => (
                    <div
                      key={res.id || idx}
                      style={{
                        background: hasCollision 
                          ? 'rgba(231, 111, 81, 0.15)' 
                          : 'rgba(132, 169, 140, 0.1)',
                        border: hasCollision 
                          ? '1px dashed var(--brand-accent)' 
                          : '1px solid rgba(132, 169, 140, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          예약 {idx + 1}: {res.guest_name || '예약자'} ({res.guest_count || 1}명)
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          #{res.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{slot.label}</span>
                        <span style={{ fontWeight: '600' }}>{(res.total_price || currentSpace.price_per_hour).toLocaleString()}원</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-subtle)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}>
                  현재 등록된 예약이 없습니다.
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => onSelectSlot(currentSpace, selectedDate, slot.start, slot.end)}
                className="btn-secondary"
                style={{
                  width: '100%',
                  marginTop: 'auto',
                  fontSize: '0.85rem',
                  padding: '8px 12px'
                }}
              >
                <Plus size={15} />
                {isOccupied ? '추가 / 신규 예약 진행' : '이 시간대 예약하기'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
