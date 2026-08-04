import React from 'react';

export default function TestimonialSection() {
  const testimonials = [
    { id: 1, text: "The way they capture light is truly magical. Every photo tells a story that words cannot express.", author: "Elena Vance" },
    { id: 2, text: "Professional, creative, and with an eye for detail that is rarely seen in the industry today.", author: "Gordon Freeman" }
  ];

  return (
    <section className="testimonial-section">
      <div className="container">
        <h2 style={{ fontSize: '32px', fontFamily: 'Playfair Display', marginBottom: '40px' }}>What Clients Say</h2>
        <div className="testimonial-grid">
          {testimonials.map(t => (
            <div key={t.id} className="testimonial-card">
              <p>"{t.text}"</p>
              <footer style={{ border: 'none', background: 'none', padding: '10px 0', fontSize: '14px', color: 'white' }}>- {t.author}</footer>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
