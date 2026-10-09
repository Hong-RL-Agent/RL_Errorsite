import React from 'react';
import { Users, Sparkles, MapPin, Tag, ArrowRight } from 'lucide-react';

export default function SpaceGrid({ spaces, onBookSpace }) {
  const getSpaceImage = (id) => {
    switch (id) {
      case 101:
        return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80';
      case 102:
        return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80';
      case 201:
        return 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80';
      case 301:
        return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80';
      default:
        return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Intro */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 45, 38, 0.95), rgba(18, 28, 24, 0.95))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--brand-primary)',
            background: 'var(--brand-subtle)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '12px'
          }}>
            <Sparkles size={14} /> 프리미엄 공간 & 숙소 큐레이션
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '10px' }}>
            필요한 모든 공간을 실시간으로 예약하세요
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            비즈니스 미팅, 크리에이티브 스튜디오, 프라이빗 숙소까지 StayMeet의 정밀 예약 시스템으로 한곳에서 관리합니다.
          </p>
        </div>
      </div>

      {/* Spaces Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '24px'
      }}>
        {spaces.map(space => {
          const isSuite = space.category === '숙소';
          return (
            <div
              key={space.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              {/* Space Thumbnail */}
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={getSpaceImage(space.id)}
                  alt={space.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(12, 18, 16, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {space.category}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(12, 18, 16, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Users size={13} color="var(--brand-primary)" />
                  최대 {space.capacity}인
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    공간 코드 #{space.id}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {space.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {space.description}
                  </p>
                </div>

                {/* Price */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>기본 요금: </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                      {space.price_per_hour.toLocaleString()}원
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {isSuite ? ' / 1박' : ' / 시간'}
                    </span>
                  </div>
                </div>

                {/* Book Action */}
                <button
                  onClick={() => onBookSpace(space)}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <span>일정 선택 및 예약</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
