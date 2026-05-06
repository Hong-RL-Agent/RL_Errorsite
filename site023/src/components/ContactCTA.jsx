import React from 'react';

export default function ContactCTA() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('문의가 전송되었습니다. 곧 연락드리겠습니다.');
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 style={{ fontSize: '48px', fontFamily: 'Playfair Display', marginBottom: '20px' }}>Let's Work Together</h2>
        <p style={{ color: 'var(--silver)', marginBottom: '40px' }}>Looking for a unique perspective for your next project?</p>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email Address" required />
          <textarea placeholder="Tell me about your project" rows="5" required></textarea>
          <button type="submit" className="btn" style={{ background: 'white', color: 'black' }}>Send Inquiry</button>
        </form>
      </div>
    </section>
  );
}
