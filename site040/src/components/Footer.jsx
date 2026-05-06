import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '80px 0 40px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '80px' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '25px', letterSpacing: '2px' }}>AZURE SPA</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '2', maxWidth: '300px' }}>
              고결한 휴식과 내면의 평화를 위한 프리미엄 호텔 스파 브랜드입니다. 
              당신의 소중한 시간을 가장 가치 있게 만들어 드립니다.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1rem' }}>RESERVATION</h4>
            <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '10px' }}>Booking Policy</li>
              <li style={{ marginBottom: '10px' }}>Cancellation</li>
              <li style={{ marginBottom: '10px' }}>Group Inquiry</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1rem' }}>MEMBERSHIP</h4>
            <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '10px' }}>Tier Benefits</li>
              <li style={{ marginBottom: '10px' }}>Join Azure</li>
              <li style={{ marginBottom: '10px' }}>Gift Vouchers</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1rem' }}>CONTACT</h4>
            <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '10px' }}>Seoul, Korea</li>
              <li style={{ marginBottom: '10px' }}>02-1234-5678</li>
              <li style={{ marginBottom: '10px' }}>spa@azurehotel.com</li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          © 2024 AZURE WELLNESS GROUP. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
