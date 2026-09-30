import React, { useState } from 'react';
import { Star, MapPin, Clock, Heart, Calendar, ArrowLeft, Utensils } from 'lucide-react';

export default function RestaurantDetail({
  restaurant,
  onBack,
  isWishlisted,
  onToggleWishlist,
  onOpenBooking
}) {
  const [selectedDate, setSelectedDate] = useState('2026-10-01');

  if (!restaurant) return null;

  const slots = restaurant.timeSlots?.[selectedDate] || { '18:00': 1, '19:00': 1, '20:00': 2 };

  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#78716c', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> 레스토랑 목록으로 돌아가기
      </button>

      {/* Main Detail Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 36, marginBottom: 44 }}>
        <div style={{ position: 'relative', height: 380, borderRadius: 20, overflow: 'hidden', background: '#f5f5f4' }}>
          <img src={restaurant.image} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', marginBottom: 6 }}>
            {restaurant.category}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', marginBottom: 8 }}>
            {restaurant.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 14 }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 800, color: '#1c1917' }}>{restaurant.rating}</span>
            <span style={{ color: '#78716c' }}>({restaurant.reviewCount}개의 방문자 후기)</span>
            <span style={{ color: '#d6d3d1' }}>·</span>
            <span style={{ color: '#78716c' }}>{restaurant.priceRange}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#57534e', marginBottom: 8 }}>
            <MapPin size={15} color="#c2410c" />
            <span>{restaurant.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#57534e', marginBottom: 20 }}>
            <Clock size={15} color="#c2410c" />
            <span>영업시간: {restaurant.businessHours} (정기휴무: {restaurant.closedDays?.join(', ') || '없음'})</span>
          </div>

          <p style={{ fontSize: 14, color: '#44403c', lineHeight: 1.7, marginBottom: 24 }}>
            {restaurant.description}
          </p>

          {/* Quick Date Select & Slots */}
          <div style={{ background: '#fff7ed', padding: 20, borderRadius: 16, border: '1px solid #ffedd5', marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#c2410c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} /> 예약 가능 시간대 선택 ({selectedDate})
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(slots).map(([time, remaining]) => (
                <button
                  key={time}
                  className="time-slot-chip"
                  onClick={() => onOpenBooking(restaurant, time, selectedDate)}
                >
                  {time} (잔여 {remaining}석)
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <button
              onClick={() => onToggleWishlist(restaurant.id)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                border: '1px solid #e7e5e4',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isWishlisted ? '#ef4444' : '#78716c'
              }}
            >
              <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>

            <button
              className="btn-terracotta"
              onClick={() => onOpenBooking(restaurant, '19:00', selectedDate)}
              style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15 }}
            >
              지금 예약하기
            </button>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1c1917', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Utensils size={20} color="#c2410c" /> 대표 메뉴 & 코스 안내
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {restaurant.menu?.map((m, idx) => (
            <div key={idx} style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #e7e5e4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <h4 style={{ fontWeight: 800, fontSize: 16, color: '#1c1917' }}>{m.name}</h4>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#c2410c' }}>{m.price.toLocaleString()}원</span>
              </div>
              <p style={{ fontSize: 13, color: '#78716c' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
