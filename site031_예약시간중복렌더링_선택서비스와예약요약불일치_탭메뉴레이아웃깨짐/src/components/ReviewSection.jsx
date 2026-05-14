import React, { useMemo } from "react";

export default function ReviewSection({ reviews, sort, onSortChange }) {
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      return new Date(b.date) - new Date(a.date);
    });
  }, [reviews, sort]);

  return (
    <section className="review-section" id="reviews">
      <div className="section-heading">
        <span>Care stories</span>
        <h2>보호자 후기</h2>
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="newest">최신순</option>
          <option value="rating">평점순</option>
        </select>
      </div>
      <div className="review-grid">
        {sortedReviews.map((review) => (
          <article key={`${review.providerId}-${review.author}-${review.date}`} className="review-card">
            <strong>{review.author}</strong>
            <span>{review.petType} · ★ {review.rating}</span>
            <p>{review.content}</p>
            <time>{review.date}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
