import React from 'react';
import { Star } from 'lucide-react';

export default function MovieCarousel({ movies, selectedMovie, onSelect }) {
  return (
    <div className="movie-section">
      <div className="section-title">상영 중인 영화</div>
      <div className="movie-carousel">
        {movies.map(movie => (
          <div 
            key={movie.id} 
            className={`movie-card ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
            onClick={() => onSelect(movie)}
          >
            <div className="movie-poster">{movie.image}</div>
            <div className="movie-info">
              <div className="movie-title">{movie.title}</div>
              <div className="movie-meta">
                <span>{movie.genre}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                  <Star size={12} fill="currentColor" /> {movie.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
