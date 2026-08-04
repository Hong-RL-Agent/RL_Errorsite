import React from 'react';

export default function MapPanel() {
  return (
    // INTENTIONAL GUI BUG: site006-bug03 타겟
    // CSS에서 45% 너비로 앱을 덮어버리게 설정되어 있음.
    <div className="map-panel" data-bug-id="site006-bug03">
      <div className="map-marker" style={{ top: '30%', left: '40%' }}>강남구</div>
      <div className="map-marker" style={{ top: '50%', left: '60%' }}>서초구</div>
      <div className="map-marker" style={{ top: '40%', left: '20%' }}>용산구</div>
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        지도 데이터 &copy; 2026 Prestige Homes
      </div>
    </div>
  );
}
