import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
  return (
    <div 
      className="card"
      id={`review-card-${review.id}`}
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img 
            src={review.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
            alt={review.userName} 
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{review.userName}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < review.rating ? '#f59e0b' : '#e2e8f0'} 
                  color={i < review.rating ? '#f59e0b' : '#e2e8f0'} 
                />
              ))}
            </div>
          </div>
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      {review.experienceTitle && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sky-blue)' }}>
          [체험] {review.experienceTitle}
        </span>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
        {review.comment}
      </p>
    </div>
  );
}
