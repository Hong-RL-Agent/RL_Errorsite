import React from 'react';

export default function BookCard({ book, onSelectBook, isWishlisted = false, onToggleWishlist }) {
  if (!book) return null;

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <div className="book-card-item" onClick={() => onSelectBook && onSelectBook(book.id)}>
      <div className="book-cover-stage">
        <img src={book.cover} alt={book.title} loading="lazy" />
        <span className="badge-type-pill">{book.type}</span>
        <span className={`badge-available-pill ${!book.available ? 'unavailable' : ''}`}>
          {book.available ? '대여 가능' : '대여 중'}
        </span>
      </div>

      <div className="book-card-body">
        <div className="book-card-title" title={book.title}>{book.title}</div>
        <div className="book-card-author">{book.author} &middot; {book.publisher}</div>

        <div className="book-card-meta">
          <div className="rating-star-text">
            ★ {book.rating.toFixed(1)} ({book.reviewCount})
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleWishlist) onToggleWishlist(book.id);
            }}
            style={{ fontSize: '1.1rem', color: isWishlisted ? '#ef4444' : 'var(--text-light)' }}
            title="찜하기"
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  );
}
