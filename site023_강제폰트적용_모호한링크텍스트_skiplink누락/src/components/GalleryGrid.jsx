import React from 'react';
import PhotoCard from './PhotoCard';

export default function GalleryGrid({ photos, onPhotoClick, onCategoryChange, activeCategory }) {
  const categories = ["All", "Street", "Nature", "Portrait", "Architecture"];

  return (
    <section id="gallery" className="container">
      <div className="gallery-filters">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => onCategoryChange(cat)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeCategory === cat ? 'white' : 'var(--text-muted)', 
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'uppercase',
              fontWeight: 700,
              paddingBottom: '5px',
              borderBottom: activeCategory === cat ? '1px solid white' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {photos.map(photo => (
          <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>
    </section>
  );
}
