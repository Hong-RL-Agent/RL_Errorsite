import React from 'react';
import { Heart, Star, MapPin, Calendar } from 'lucide-react';

export default function Wishlist({ wishlist = [], onSelectRestaurant, onToggleWishlist, onQuickBook, onNavigate }) {
  return (
    <div>
      <div className="section-head">
        <div>
          <h2>저장한 레스토랑 & 찜 목록 ({wishlist.length}곳)</h2>
          <p>가고 싶은 맛집을 모아보고 빠르게 예약 일정을 잡으세요.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 20, border: '1px solid #e7e5e4' }}>
          <Heart size={48} color="#a8a29e" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>저장한 레스토랑이 없습니다</h3>
          <p style={{ fontSize: 14, color: '#78716c', marginBottom: 20 }}>다양한 미식 레스토랑을 둘러보고 하트를 눌러보세요.</p>
          <button className="btn-terracotta" onClick={() => onNavigate('home')}>
            레스토랑 둘러보기
          </button>
        </div>
      ) : (
        <div className="restaurant-grid">
          {wishlist.map((rest) => (
            <div key={rest.id} className="restaurant-card">
              <div className="card-img-container" onClick={() => onSelectRestaurant(rest)}>
                <img src={rest.image} alt={rest.name} className="card-thumb" />
                <button
                  className="wish-heart-btn active"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(rest.id);
                  }}
                  title="저장 취소"
                >
                  <Heart size={18} fill="#ef4444" />
                </button>
              </div>

              <div className="card-body-content">
                <div className="card-category-text">{rest.category}</div>
                <h3 className="card-rest-name" onClick={() => onSelectRestaurant(rest)}>
                  {rest.name}
                </h3>
                <div className="card-location-row">
                  <MapPin size={13} />
                  <span>{rest.location}</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #e7e5e4' }}>
                  <button
                    className="btn-terracotta"
                    onClick={() => onQuickBook(rest, '19:00', '2026-10-01')}
                    style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  >
                    <Calendar size={15} />
                    실시간 예약하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
