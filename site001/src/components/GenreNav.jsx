import React from 'react'

export default function GenreNav({ genres, activeGenre, onGenreChange }) {
  return (
    <nav className="genre-nav" aria-label="장르 선택">
      <div className="genre-nav-inner">
        {genres.map(genre => (
          <button
            key={genre}
            className={`genre-btn${activeGenre === genre ? ' active' : ''}`}
            onClick={() => onGenreChange(genre)}
            id={`genre-btn-${genre}`}
          >
            {genre}
          </button>
        ))}
      </div>
    </nav>
  )
}
