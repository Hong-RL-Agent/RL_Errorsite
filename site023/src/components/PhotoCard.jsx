import React from 'react';
import { Heart, MapPin } from 'lucide-react';

export default function PhotoCard({ photo, onClick }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <div className="photo-card" onClick={() => onClick(photo)}>
      <img src={photo.url} alt={photo.title} />
      <div className="photo-overlay">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0' }}>{photo.title}</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--silver)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {photo.location}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            style={{ background: 'none', border: 'none', color: liked ? '#ef4444' : 'white', cursor: 'pointer' }}
          >
            <Heart size={20} fill={liked ? '#ef4444' : 'none'} />
          </button>
        </div>
        <div style={{ marginTop: '15px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {photo.category} • {photo.year}
        </div>
      </div>
    </div>
  );
}
