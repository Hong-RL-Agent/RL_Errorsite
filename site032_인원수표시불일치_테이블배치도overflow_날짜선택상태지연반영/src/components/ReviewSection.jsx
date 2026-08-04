import React, { useMemo } from "react";

export default function ReviewSection({ reviews, sort, onSortChange }) {
  const sorted = useMemo(() => [...reviews].sort((a, b) => sort === "rating" ? b.rating - a.rating : new Date(b.date) - new Date(a.date)), [reviews, sort]);
  return (
    <section className="review-section">
      <div className="section-heading"><span>Guest notes</span><h2>후기</h2><select value={sort} onChange={(event) => onSortChange(event.target.value)}><option value="newest">최신순</option><option value="rating">평점순</option></select></div>
      <div className="review-grid">{sorted.map((review) => <article key={`${review.author}-${review.date}`}><strong>{review.author}</strong><span>★ {review.rating}</span><p>{review.text}</p><time>{review.date}</time></article>)}</div>
    </section>
  );
}
