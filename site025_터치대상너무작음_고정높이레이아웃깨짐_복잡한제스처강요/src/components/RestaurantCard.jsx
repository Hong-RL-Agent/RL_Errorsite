import React from 'react';
import { Star, Clock, Wallet } from 'lucide-react';

export default function RestaurantCard({ restaurant, onClick }) {
  return (
    <div className="restaurant-card" onClick={() => onClick(restaurant)}>
      <img src={restaurant.image} alt={restaurant.name} />
      <div className="restaurant-card-content">
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{restaurant.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
          <Star size={16} fill="#ffc107" color="#ffc107" />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>{restaurant.rating}</span>
          <span style={{ fontSize: '13px', color: '#999' }}>({restaurant.category})</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {restaurant.time}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wallet size={14} /> 최소주문 {restaurant.minOrder}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          배달비 {restaurant.fee}
        </div>
      </div>
    </div>
  );
}
