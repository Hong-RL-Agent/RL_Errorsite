const reviews = [
  {
    name: '미나',
    comment: '첫 방문부터 섬세한 케어가 인상적이었어요. 스타일도 자연스럽게 잘 나와서 만족했습니다.',
    stars: 5
  },
  {
    name: '정우',
    comment: '스타일리스트가 얼굴형과 취향을 정확히 파악해서 편안하게 예약했어요.',
    stars: 4
  },
  {
    name: '서연',
    comment: '예약 시스템이 깔끔하고 리뷰도 신뢰할 수 있어서 좋았습니다.',
    stars: 5
  }
];

export default function ReviewSection() {
  return (
    <section className="review-section">
      <div className="section-header">
        <h3>고객 리뷰</h3>
        <p>최근 예약 고객의 생생한 평가입니다.</p>
      </div>
      <div className="review-grid">
        {reviews.map((review) => (
          <article key={review.name} className="review-card">
            <div className="review-stars">{'★'.repeat(review.stars)}</div>
            <p>{review.comment}</p>
            <strong>{review.name}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
