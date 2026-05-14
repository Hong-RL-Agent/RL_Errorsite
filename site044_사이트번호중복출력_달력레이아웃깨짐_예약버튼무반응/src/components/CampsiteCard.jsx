import React from 'react';

const CampsiteCard = ({ campsite, onSelect, onReserve }) => {
  const isSpecialCampsite = campsite.id === 1; // '솔숲 캠핑장' is the special one

  const handleReserveClick = (e) => {
    e.stopPropagation();
    // INTENTIONAL GUI BUG: site044-bug03
    // Type: campsite-reserve-button-no-response
    // Description: 특정 캠핑장의 예약 버튼에 예약 요약 state 변경 handler를 연결하지 않아 클릭해도 반영되지 않음.
    if (isSpecialCampsite) {
      // Nothing happens for Bug 03
      console.log('Reserve button clicked but no handler triggered for bug-id site044-bug03');
    } else {
      onReserve(campsite);
    }
  };

  return (
    <div className="campsite-card" onClick={() => onSelect(campsite)}>
      <img src={campsite.image} alt={campsite.name} className="campsite-img" />
      <div className="campsite-info">
        <h3>{campsite.name}</h3>
        <div className="campsite-region">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {campsite.region} · {campsite.type}
        </div>
        <div className="amenity-tags">
          {campsite.amenities.map((a, i) => (
            <span key={i} className="amenity-tag">{a}</span>
          ))}
        </div>
        <div className="campsite-price">
          ₩{campsite.price.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#666' }}>/ 1박</span>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: '100%' }}
          onClick={handleReserveClick}
          data-bug-id={isSpecialCampsite ? "site044-bug03" : undefined}
        >
          {campsite.available ? '예약하기' : '예약 마감'}
        </button>
      </div>
    </div>
  );
};

export default CampsiteCard;
