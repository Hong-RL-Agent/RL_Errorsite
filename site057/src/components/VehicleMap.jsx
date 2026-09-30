import React, { useState } from 'react';
import { MapPin, Navigation, Bike, Zap } from 'lucide-react';

export default function VehicleMap({ stations = [], selectedStationId, onSelectStation }) {
  // Predefined visual coordinates on our SVG grid
  const stationCoords = [
    { id: 'st-01', top: '35%', left: '22%' },
    { id: 'st-02', top: '48%', left: '38%' },
    { id: 'st-03', top: '28%', left: '55%' },
    { id: 'st-04', top: '65%', left: '68%' },
    { id: 'st-05', top: '20%', left: '15%' },
    { id: 'st-06', top: '75%', left: '25%' },
    { id: 'st-07', top: '40%', left: '80%' },
    { id: 'st-08', top: '80%', left: '50%' },
    { id: 'st-09', top: '25%', left: '72%' },
    { id: 'st-10', top: '55%', left: '10%' }
  ];

  return (
    <div className="map-canvas-card">
      <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.92)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-sm)' }}>
        <Navigation size={16} color="#65a30d" />
        <span>강남/서초 도심 라이브 모빌리티 존</span>
      </div>

      {stations.map((st, i) => {
        const coord = stationCoords[i] || { top: `${30 + i * 5}%`, left: `${20 + i * 7}%` };
        const isSelected = selectedStationId === st.id;

        return (
          <div
            key={st.id}
            className={`map-marker ${isSelected ? 'selected' : ''}`}
            style={{ top: coord.top, left: coord.left }}
            onClick={() => onSelectStation(st.id)}
            title={st.name}
          >
            <MapPin size={14} color={isSelected ? '#a3e635' : '#bef264'} />
            <span>{st.name.split(' ')[0]}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
              🚲{st.availableBikes} ⚡{st.availableScooters}
            </span>
          </div>
        );
      })}

      <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(15,23,42,0.85)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', gap: '12px', backdropFilter: 'blur(4px)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', background: '#84cc16', borderRadius: '50%' }}></span>
          전기자전거
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%' }}></span>
          전동킥보드
        </span>
      </div>
    </div>
  );
}
