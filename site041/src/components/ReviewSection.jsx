import React, { useState } from 'react';
import { Star } from 'lucide-react';

const ReviewSection = ({ reviews }) => {
  const [sort, setSort] = useState('Newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === 'Newest') return new Date(b.date) - new Date(a.date);
    if (sort === 'Highest Rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="reviews-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Customer Reviews</h2>
        <select 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
        >
          <option>Newest</option>
          <option>Highest Rating</option>
        </select>
      </div>
      
      {sortedReviews.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No reviews yet.</p>
      ) : (
        sortedReviews.map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <span style={{ fontWeight: '700' }}>{review.author}</span>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>{review.date}</span>
            </div>
            <div className="stars" style={{ marginBottom: '10px' }}>
              {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="#ffb400" />)}
            </div>
            <p style={{ fontSize: '0.95rem', color: '#444' }}>{review.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewSection;
