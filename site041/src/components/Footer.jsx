import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#f8f9fa', padding: '80px 0 40px', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '50px', marginBottom: '60px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '20px' }}>MOODBOX</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.8' }}>
              무드박스는 당신의 취향을 연구하고 발견합니다.<br />
              매달 선물처럼 도착하는 박스로 일상을 특별하게 채워보세요.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '20px' }}>SERVICE</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#666' }}>
              <li style={{ marginBottom: '10px' }}>Delivery Info</li>
              <li style={{ marginBottom: '10px' }}>Subscription Policy</li>
              <li style={{ marginBottom: '10px' }}>Gift Wrapping</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '20px' }}>SUPPORT</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#666' }}>
              <li style={{ marginBottom: '10px' }}>FAQ</li>
              <li style={{ marginBottom: '10px' }}>Contact Us</li>
              <li style={{ marginBottom: '10px' }}>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '20px' }}>FOLLOW US</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ddd' }}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ddd' }}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ddd' }}></div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '40px', fontSize: '0.8rem', color: '#aaa' }}>
          © 2024 MOODBOX Inc. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
