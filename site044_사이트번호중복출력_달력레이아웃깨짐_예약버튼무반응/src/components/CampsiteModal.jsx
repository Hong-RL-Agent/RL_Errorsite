import React from 'react';
import BookingCalendar from './BookingCalendar';
import SiteMap from './SiteMap';
import ReviewSection from './ReviewSection';

const CampsiteModal = ({ campsite, onClose }) => {
  if (!campsite) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
          <img src={campsite.image} alt={campsite.name} style={{ width: '300px', height: '200px', borderRadius: '15px', objectFit: 'cover' }} />
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2d4a22' }}>{campsite.name}</h2>
            <p style={{ color: '#666', marginBottom: '15px' }}>{campsite.region} · {campsite.type}</p>
            <div className="amenity-tags">
              {campsite.amenities.map((a, i) => (
                <span key={i} className="amenity-tag" style={{ fontSize: '0.9rem', padding: '5px 12px' }}>{a}</span>
              ))}
            </div>
            <p style={{ fontSize: '1.1rem' }}>
              자연과 함께하는 최적의 힐링 공간입니다. {campsite.name}에서 잊지 못할 추억을 만드세요.
            </p>
          </div>
        </div>

        <BookingCalendar />
        
        <SiteMap />

        <ReviewSection />
        
        <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
          <button className="btn-primary" style={{ flex: 1, padding: '15px' }} onClick={() => alert('예약 시스템으로 연결됩니다.')}>
            실시간 예약하기
          </button>
          <button style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px' }} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampsiteModal;
