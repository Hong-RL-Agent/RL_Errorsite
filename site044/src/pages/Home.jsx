import React from 'react';
import { ArrowRight, Flame, Sparkles, Calendar, Clock, Users } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';

export default function Home({
  restaurants = [],
  activeCategory,
  setActiveCategory,
  onSelectRestaurant,
  wishlist = [],
  onToggleWishlist,
  onQuickBook,
  onNavigate
}) {
  const categories = [
    { id: 'all', label: '전체' },
    { id: '한식', label: '한식 파인다이닝' },
    { id: '이탈리안', label: '이탈리안' },
    { id: '프렌치', label: '프렌치' },
    { id: '오마카세', label: '스시 & 오마카세' },
    { id: '스테이크', label: '스테이크 & 와인' },
    { id: '웰빙', label: '유기농 & 웰빙' }
  ];

  return (
    <div>
      {/* Hero Reservation Banner */}
      <section className="hero-reservation-banner">
        <div className="hero-text-content">
          <div className="hero-tag-badge">
            <Sparkles size={14} /> 2026 미쉐린 & 핫플레이스 실시간 예약
          </div>
          <h2 className="hero-main-title">
            소중한 순간을 위한 특별한 테이블,<br />TableNow에서 실시간 예약하세요
          </h2>
          <p className="hero-sub-title">
            파인다이닝부터 트렌디한 비스트로까지, 전화 대기 없이 원하는 날짜와 시간대를 클릭 한 번으로 확정합니다.
          </p>
          <button className="btn-terracotta" onClick={() => onNavigate('reservations')}>
            나의 예약 내역 확인하기 <ArrowRight size={16} />
          </button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
          alt="Dining"
          style={{ width: '40%', height: 280, objectFit: 'cover', borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
        />
      </section>

      {/* Category Filter Chips */}
      <div className="category-filter-row">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`cat-filter-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Restaurant Cards Grid */}
      <div className="restaurant-grid">
        {restaurants.map((rest) => (
          <RestaurantCard
            key={rest.id}
            restaurant={rest}
            onSelect={onSelectRestaurant}
            isWishlisted={wishlist.includes(rest.id)}
            onToggleWishlist={onToggleWishlist}
            onQuickBook={onQuickBook}
          />
        ))}
      </div>
    </div>
  );
}
