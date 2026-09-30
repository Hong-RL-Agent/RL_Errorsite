import React from 'react';
import { Calendar, MapPin, Star, Ticket } from 'lucide-react';

export default function PerformanceCard({ performance, onSelect, onBook }) {
  return (
    <div className="performance-card">
      <div className="card-poster-wrapper">
        <img src={performance.poster} alt={performance.title} className="card-poster" />
        <span 
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#fff',
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '999px',
            backdropFilter: 'blur(4px)'
          }}
        >
          {performance.category}
        </span>
      </div>

      <div className="card-body">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" /> {performance.rating} ({performance.reviewCount})
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
              인기도 {performance.popularity}%
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px', lineHeight: 1.3 }}>
            {performance.title}
          </h3>

          <p style={{ fontSize: '0.84rem', color: 'var(--gray-600)', marginBottom: '14px', lineHeight: 1.5, minHeight: '38px' }}>
            {performance.description}
          </p>

          <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#7e22ce" /> {performance.venue}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#7e22ce" /> {performance.date}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--gray-400)', display: 'block' }}>티켓가</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-900)' }}>
              ₩{performance.price.toLocaleString()}
            </span>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onBook(performance)}
          >
            <Ticket size={14} /> 예매하기
          </button>
        </div>
      </div>
    </div>
  );
}
