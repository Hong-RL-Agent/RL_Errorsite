import React from 'react';
import { Star, MapPin } from 'lucide-react';

export default function HotelCard({ hotel, onClick }) {
  // INTENTIONAL GUI BUG: site020-bug01
  // Type: missing-image-alt
  // Description: 추천 호텔의 의미 있는 이미지에 alt 속성을 제공하지 않음.
  const hasAlt = hotel.rating < 4.8; // High rating hotels intentionally miss alt
  
  return (
    <div className="hotel-card" onClick={() => onClick(hotel)}>
      <div data-bug-id={!hasAlt ? "site020-bug01" : ""}>
        <img 
          src={hotel.img} 
          alt={hasAlt ? hotel.name : ""} 
          className="hotel-img" 
        />
      </div>
      <div className="hotel-info">
        <div className="flex justify-between items-start">
          <div>
            <h3 style={{fontSize: '1.25rem', marginBottom: '0.25rem'}}>{hotel.name}</h3>
            <p className="flex items-center gap-1 text-muted" style={{fontSize: '0.875rem', marginBottom: '1rem'}}>
              <MapPin size={14} /> {hotel.location}
            </p>
          </div>
          <div className="hotel-rating">
            <Star size={16} fill="var(--secondary)" color="var(--secondary)" /> 
            {hotel.rating} <span className="text-muted" style={{fontWeight: 400, fontSize: '0.875rem'}}>({hotel.reviews})</span>
          </div>
        </div>
        
        <div className="hotel-amenities">
          {hotel.amenities.map(am => <span key={am} className="amenity-tag">{am}</span>)}
        </div>
        
        <div style={{marginTop: 'auto', textAlign: 'right'}}>
          <p className="text-muted" style={{fontSize: '0.75rem'}}>1박 기준, 세금 포함</p>
          <p style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)'}}>₩{hotel.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
