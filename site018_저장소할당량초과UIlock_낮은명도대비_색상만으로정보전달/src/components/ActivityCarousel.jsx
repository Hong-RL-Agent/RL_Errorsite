import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ActivityCarousel({ activities }) {
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (direction) => {
    const container = document.getElementById('activity-carousel-track');
    if (container) {
      const scrollAmount = 300;
      const newPos = direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPos, behavior: 'smooth' });
      setScrollPos(newPos);
    }
  };

  if (!activities || activities.length === 0) return null;

  return (
    <div className="carousel-section">
      <h2 style={{marginBottom: '1rem'}}>추천 액티비티</h2>
      <div className="carousel-container relative">
        <button className="btn btn-outline" onClick={() => scroll('left')} style={{padding: '0.5rem', borderRadius: '50%'}}>
          <ChevronLeft size={20} />
        </button>
        
        <div id="activity-carousel-track" className="carousel-track">
          {activities.map(act => (
            <div key={act.id} className="activity-card">
              <img src={act.image} alt={act.name} />
              <div className="activity-card-body">
                <div style={{fontSize: '0.75rem', color: 'var(--primary-blue)', fontWeight: 600, marginBottom: '0.25rem'}}>{act.city}</div>
                <h4 style={{fontSize: '1rem', marginBottom: '0.5rem'}}>{act.name}</h4>
                <div className="flex justify-between items-center">
                  <span style={{fontWeight: 700}}>₩{act.price.toLocaleString()}</span>
                  <div className="flex gap-2">
                    {act.tags.map(t => <span key={t} style={{fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.125rem 0.5rem', borderRadius: '12px'}}>{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-outline" onClick={() => scroll('right')} style={{padding: '0.5rem', borderRadius: '50%'}}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
