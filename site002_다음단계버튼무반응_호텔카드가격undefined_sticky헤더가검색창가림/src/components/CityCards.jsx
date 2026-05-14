import React from 'react';

export default function CityCards({ cities, onSelectCity, selectedCity }) {
  return (
    <section>
      <h2 className="section-title">인기 여행지</h2>
      <div className="city-grid">
        {cities.map(city => (
          <div 
            key={city.id} 
            className="city-card"
            style={{ 
              boxShadow: selectedCity === city.id ? '0 0 0 3px var(--blue-500)' : '' 
            }}
            onClick={() => onSelectCity(selectedCity === city.id ? null : city.id)}
          >
            <div className="city-image" style={{ backgroundColor: city.imageColor }}>
              ✈️
            </div>
            <div className="city-info">
              <div className="city-name">{city.name}</div>
              <div className="city-country">{city.country}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
