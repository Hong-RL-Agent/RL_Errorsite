import React, { useState } from 'react';

export default function NewsletterCard() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${email}로 뉴스레터 구독이 신청되었습니다.`);
    setEmail('');
  };

  return (
    <div className="newsletter-card">
      <h3 style={{ margin: '0 0 10px 0' }}>The Daily Brief</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Get the most important stories of the day delivered to your inbox every morning.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Your email address" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" className="btn btn-primary">Join</button>
      </form>
    </div>
  );
}
