import React from 'react'

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
]

export function BookCover({ title, author, colorIdx = 0, size = 'large' }) {
  return (
    <div className="book-cover" style={{ background: GRADIENTS[colorIdx % GRADIENTS.length] }}>
      <span className="book-cover-title">{title}</span>
      <span className="book-cover-author">{author}</span>
    </div>
  )
}

export function StarRating({ rating, reviews }) {
  const full = Math.floor(rating)
  const stars = Array.from({ length: 5 }, (_, i) => i < full ? '★' : '☆')
  return (
    <div className="stars">
      {stars.map((s, i) => (
        <span key={i} className={`star ${i < full ? 'filled' : 'empty'}`}>{s}</span>
      ))}
      <span className="rating-text">{rating} ({reviews?.toLocaleString()})</span>
    </div>
  )
}
