import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button style={{ position: 'absolute', top: '40px', right: '40px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={onClose}>
        <X size={32} />
      </button>
      
      <div className="flex items-center gap-40" onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}><ChevronLeft size={48} /></button>
        <div style={{ textAlign: 'center' }}>
          <img src={photo.url} alt={photo.title} style={{ maxHeight: '80vh', maxWidth: '80vw', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />
          <h2 style={{ marginTop: '20px', fontFamily: 'Playfair Display' }}>{photo.title}</h2>
          <p style={{ color: 'var(--silver)' }}>{photo.location} • {photo.year}</p>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}><ChevronRight size={48} /></button>
      </div>
    </div>
  );
}
