import React from 'react';
import { Star } from 'lucide-react';

export default function HotelList({ hotels, minRating, onRatingChange, onBook }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>추천 숙소</h2>
        <div className="hotel-filters">
          <select 
            value={minRating} 
            onChange={(e) => onRatingChange(Number(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}
          >
            <option value="0">모든 등급</option>
            <option value="4.5">4.5성급 이상</option>
            <option value="4.8">4.8성급 이상</option>
          </select>
        </div>
      </div>
      
      <div className="hotel-list">
        {hotels.length === 0 ? (
          <p style={{ color: 'var(--gray-500)' }}>조건에 맞는 숙소가 없습니다.</p>
        ) : (
          hotels.map(hotel => (
            <div key={hotel.id} className="hotel-card">
              <div className="hotel-img-placeholder">
                🏨
              </div>
              <div className="hotel-content">
                <div>
                  <div className="hotel-header">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-rating">
                      <Star size={16} fill="currentColor" />
                      {hotel.rating}
                    </div>
                  </div>
                  <div className="hotel-amenities">
                    {hotel.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
                
                <div className="hotel-footer">
                  {/* INTENTIONAL GUI BUG: site002-bug02
                     Type: component-rendering
                     Description: 일부 호텔 카드의 가격 영역에 undefined가 표시된다.
                     Explanation: id가 102 또는 104인 호텔의 경우 의도적으로 가격 대신 'undefined' 문자열을 렌더링함. */}
                  <div className="hotel-price" data-bug-id="site002-bug02">
                    {(hotel.id === 102 || hotel.id === 104) 
                      ? 'undefined' 
                      : `₩${hotel.price.toLocaleString()}`}
                  </div>
                  <button className="btn-book" onClick={() => onBook(hotel)}>
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
