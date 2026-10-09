import React from 'react';
import { Star, Clock, Bike, DollarSign, Phone, MapPin } from 'lucide-react';

export function StoreHero({ store }) {
  if (!store) return null;

  return (
    <div className="store-hero-card">
      <div className="store-hero-img-wrap">
        <img src={store.image_url} alt={store.name} className="store-hero-img" />
        <div className="store-hero-gradient" />
      </div>

      <div className="store-hero-content">
        <div className="store-title-row">
          <h1 className="store-main-title">{store.name}</h1>
          <div className="store-rating-badge">
            <Star size={15} fill="currentColor" />
            <span>{store.rating} ({store.review_count})</span>
          </div>
        </div>

        <div className="store-meta-grid">
          <div className="store-meta-item">
            <Clock size={15} color="var(--coral-primary)" />
            <span>배달시간: <strong>{store.estimated_time}</strong></span>
          </div>

          <div className="store-meta-item">
            <DollarSign size={15} color="var(--coral-primary)" />
            <span>최소주문: <strong>{store.min_order_amount?.toLocaleString()}원</strong></span>
          </div>

          <div className="store-meta-item">
            <Bike size={15} color="var(--coral-primary)" />
            <span>기본 배달팁: <strong>{store.base_delivery_fee?.toLocaleString()}원</strong></span>
          </div>

          <div className="store-meta-item">
            <Phone size={15} color="var(--coral-primary)" />
            <span>{store.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuList({ menus, onSelectMenu }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>대표 메뉴</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          오늘의 식탁 추천 인기 메뉴입니다.
        </p>
      </div>

      <div className="menu-grid">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="menu-card"
            data-role="menu-item"
            data-menu-id={menu.id}
            onClick={() => onSelectMenu(menu)}
          >
            <div className="menu-info-left">
              <div>
                <div className="menu-name" data-role="menu-name">{menu.name}</div>
                <div className="menu-desc">{menu.description}</div>
              </div>
              <div className="menu-price" data-role="menu-price">
                {menu.price?.toLocaleString()}원
              </div>
            </div>

            <div className="menu-img-wrap">
              <img src={menu.image_url} alt={menu.name} className="menu-img" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
