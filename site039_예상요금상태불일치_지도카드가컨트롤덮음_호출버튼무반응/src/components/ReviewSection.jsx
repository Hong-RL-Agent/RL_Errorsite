import { Star } from 'lucide-react';

const filters = [
  { id: 'all', label: '전체' },
  { id: 'airport', label: '공항 이동' },
  { id: 'business', label: '비즈니스' },
  { id: 'family', label: '가족 이동' }
];

export default function ReviewSection({ reviews, activeFilter, onFilterChange }) {
  return (
    <section className="section reviews-section">
      <div className="section-heading">
        <span className="section-kicker">후기</span>
        <h2>실제 예약 고객의 이동 경험</h2>
      </div>

      <div className="filter-tabs" role="tablist" aria-label="후기 필터">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={activeFilter === filter.id ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter.id}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-card-top">
              <strong>{review.name}</strong>
              <span aria-label={`${review.rating}점`}>
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" aria-hidden="true" />
                ))}
              </span>
            </div>
            <p>{review.text}</p>
            <small>{review.route}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
