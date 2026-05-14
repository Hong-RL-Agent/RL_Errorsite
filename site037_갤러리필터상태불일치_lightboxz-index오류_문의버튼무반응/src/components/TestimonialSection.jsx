const testimonials = [
  {
    id: 'review-001',
    name: '정윤아',
    role: 'Wedding client',
    quote: '사진을 보는 순간 예식장의 공기까지 돌아왔습니다. 과하지 않은 보정과 차분한 디렉팅이 정말 좋았어요.'
  },
  {
    id: 'review-002',
    name: 'Mina K.',
    role: 'Brand founder',
    quote: '제품 사진이 아니라 브랜드의 온도를 찍어준 느낌입니다. 룩북과 상세 페이지를 같은 톤으로 연결할 수 있었습니다.'
  },
  {
    id: 'review-003',
    name: '한도윤',
    role: 'Actor profile',
    quote: '표정이 굳을 때마다 조명과 포즈를 세밀하게 잡아줘서 프로필 사진 선택지가 확 넓어졌습니다.'
  }
];

function TestimonialSection() {
  return (
    <section className="section-shell testimonial-section" id="reviews">
      <div className="section-heading compact">
        <span className="eyebrow">Reviews</span>
        <h2>촬영 후 남은 것은 사진보다 선명한 경험</h2>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.id}>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default TestimonialSection;
