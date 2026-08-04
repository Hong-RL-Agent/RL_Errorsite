import React from 'react';

export default function BookingSummary() {
  return (
    <aside className="booking-summary">
      <h3 style={{marginBottom: '1rem', fontSize: '1.25rem'}}>최근 본 상품</h3>
      
      <div style={{marginBottom: '2rem'}}>
        <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop" alt="호텔 썸네일" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} />
          <div>
            <h4 style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>그랜드 럭셔리 호텔 앤 스파</h4>
            <p className="text-muted" style={{fontSize: '0.75rem'}}>10월 15일 - 10월 16일</p>
          </div>
        </div>
        <button className="btn btn-outline" style={{width: '100%', fontSize: '0.875rem'}} onClick={() => alert('준비중입니다.')}>다시 보기</button>
      </div>

      <h3 style={{marginBottom: '1rem', fontSize: '1.25rem'}}>추천 할인 혜택</h3>
      <div style={{background: 'var(--white)', padding: '1rem', borderRadius: '4px', border: '1px dashed var(--secondary)', textAlign: 'center'}}>
        <p style={{fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem'}}>얼리버드 특가 15% 할인</p>
        <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>체크인 30일 전 예약 시 적용</p>
      </div>
    </aside>
  );
}
