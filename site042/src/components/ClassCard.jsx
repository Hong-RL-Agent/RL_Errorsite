import React from 'react';
import { Star, Clock, MapPin, Users, Heart } from 'lucide-react';

export default function ClassCard({ cls, onSelect, onBook, isFavorite, onToggleFavorite }) {
  const categoryLabels = {
    yoga: '요가',
    pt: '1:1 PT',
    pilates: '필라테스',
    spinning: '스피닝',
    crossfit: '크로스핏',
    meditation: '명상/웰니스'
  };

  return (
    <div className="class-card">
      <div className="card-image-wrap" onClick={() => onSelect(cls)} style={{ cursor: 'pointer' }}>
        <img src={cls.image} alt={cls.title} className="card-image" />
        <span className="card-category-badge">
          {categoryLabels[cls.category] || cls.category}
        </span>
        <span className={`card-seats-badge ${cls.remainingSeats <= 1 ? 'urgent' : ''}`}>
          {cls.remainingSeats <= 0 ? '마감' : `잔여 ${cls.remainingSeats}석`}
        </span>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-instructor">{cls.instructor} 강사</div>
          <button
            onClick={() => onToggleFavorite(cls.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFavorite ? '#ef4444' : '#94a3b8' }}
          >
            <Heart size={18} fill={isFavorite ? '#ef4444' : 'none'} />
          </button>
        </div>

        <h3 className="card-title" onClick={() => onSelect(cls)} style={{ cursor: 'pointer' }}>
          {cls.title}
        </h3>
        <p className="card-description">{cls.description}</p>

        <div className="card-meta-row">
          <div className="meta-item">
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{cls.rating}</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>{cls.duration}</span>
          </div>
          <div className="meta-item">
            <MapPin size={14} />
            <span>{cls.location.split(' ')[0]}</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="card-price">
            {cls.price.toLocaleString()}<span>원 / 회</span>
          </div>
          <button
            className="btn-book"
            onClick={() => onBook(cls)}
            disabled={cls.remainingSeats <= 0}
          >
            {cls.remainingSeats <= 0 ? '마감됨' : '예약하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
