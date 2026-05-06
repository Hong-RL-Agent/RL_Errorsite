import React from 'react';
import { Star } from 'lucide-react';

const TherapistSection = ({ therapists, selectedTherapist, onSelect }) => {
  return (
    <div style={{ marginTop: '80px' }}>
      <h2 className="section-title">Professional Therapists</h2>
      <div className="therapist-list">
        {therapists.map(t => (
          <div 
            key={t.id} 
            className={`therapist-card ${selectedTherapist?.id === t.id ? 'selected' : ''}`}
            onClick={() => onSelect(t)}
          >
            <img src={t.image} alt={t.name} className="therapist-img" />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{t.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{t.specialty}</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', color: 'var(--secondary)', fontSize: '0.9rem' }}>
              <Star size={14} fill="var(--secondary)" /> {t.rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistSection;
