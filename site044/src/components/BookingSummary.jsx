import React from 'react';

const BookingSummary = ({ reservedCampsites }) => {
  const subtotal = reservedCampsites.reduce((sum, c) => sum + c.price, 0);
  const fee = reservedCampsites.length > 0 ? 5000 : 0;
  const total = subtotal + fee;

  return (
    <div className="booking-summary">
      <h3 className="summary-title">예약 내역 확인</h3>
      {reservedCampsites.length === 0 ? (
        <p style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
          선택된 캠핑장이 없습니다.
        </p>
      ) : (
        <>
          {reservedCampsites.map((c, i) => (
            <div key={i} className="summary-item">
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span>₩{c.price.toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-item" style={{ fontSize: '0.9rem', color: '#666' }}>
            <span>예약 수수료</span>
            <span>₩{fee.toLocaleString()}</span>
          </div>
          <div className="summary-item total-price">
            <span>합계 금액</span>
            <span>₩{total.toLocaleString()}</span>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '20px', padding: '15px' }}
            onClick={() => alert('결제 페이지로 이동합니다.')}
          >
            결제하기
          </button>
        </>
      )}
    </div>
  );
};

export default BookingSummary;
