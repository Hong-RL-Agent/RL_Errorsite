import { useState } from 'react';

export default function TestimonialCarousel({ testimonials, loading }) {
  const [index, setIndex] = useState(0);
  const current = testimonials[index] || testimonials[0];

  const next = () => {
    setIndex((value) => (testimonials.length ? (value + 1) % testimonials.length : 0));
  };

  const prev = () => {
    setIndex((value) => (testimonials.length ? (value - 1 + testimonials.length) % testimonials.length : 0));
  };

  return (
    <section className="section testimonial-section">
      <div className="section-heading">
        <span className="eyebrow">Customers</span>
        <h2>현업 팀이 말하는 운영 속도 변화</h2>
      </div>
      <div className="testimonial-card">
        {loading && <p>고객 후기를 불러오는 중입니다...</p>}
        {!loading && current && (
          <>
            <div className="testimonial-logo">{current.logo}</div>
            <blockquote>{current.quote}</blockquote>
            <p>{current.person}</p>
            <span>{current.company}</span>
          </>
        )}
      </div>
      <div className="carousel-controls">
        <button type="button" onClick={prev} aria-label="Previous testimonial">‹</button>
        <span>{testimonials.length ? index + 1 : 0} / {testimonials.length}</span>
        <button type="button" onClick={next} aria-label="Next testimonial">›</button>
      </div>
    </section>
  );
}
