import React from 'react';

export default function RoomDetail({ room, onBack }) {
  if (!room) return null;

  return (
    <div className="detail-main">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button className="btn-secondary" onClick={onBack}>
          ← 목록으로 돌아가기
        </button>
        <span className="room-type-badge" style={{ position: 'static' }}>
          {room.type}
        </span>
      </div>

      <div className="detail-gallery">
        <img src={room.image} alt={room.name} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--indigo-600)', marginBottom: '4px' }}>
          {room.branch}
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '12px' }}>
          {room.name}
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--navy-600)', lineHeight: '1.6' }}>
          {room.description}
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: '600' }}>수용 인원</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '4px' }}>
            최대 {room.capacity}명
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: '600' }}>운영 시간</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '4px' }}>
            {room.openTime} ~ {room.closeTime}
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: '600' }}>사용자 평점</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy-900)', marginTop: '4px' }}>
            ⭐ {room.rating.toFixed(1)} / 5.0
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '12px' }}>
          제공 시설 및 장비
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {room.facilities.map((f, i) => (
            <span 
              key={i} 
              style={{
                background: 'var(--indigo-50)',
                color: 'var(--indigo-600)',
                fontWeight: '600',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem'
              }}
            >
              ✓ {f}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '12px' }}>
          공간 이용 규칙 및 유의사항
        </h3>
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          color: '#92400e',
          fontSize: '0.9rem',
          lineHeight: '1.6'
        }}>
          📌 {room.rules}
        </div>
      </div>
    </div>
  );
}
