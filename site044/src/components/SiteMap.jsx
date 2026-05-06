import React from 'react';

const SiteMap = () => {
  const sites = [
    { id: 101, name: 'A-1', type: '오토' },
    { id: 102, name: 'A-2', type: '오토' },
    { id: 103, name: 'A-3', type: '오토' },
    { id: 104, name: 'B-1', type: '카라반' },
    { id: 105, name: 'B-2', type: '카라반' },
    { id: 106, name: 'B-3', type: '카라반' },
    { id: 107, name: 'C-1', type: '글램핑' },
    { id: 108, name: 'C-2', type: '글램핑' },
    { id: 109, name: 'C-3', type: '글램핑' },
  ];

  return (
    <div className="site-map-container" data-bug-id="site044-bug01">
      <h3 style={{ marginBottom: '10px' }}>단지 배치도</h3>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>원하시는 구역의 번호를 클릭하여 상세 위치를 확인하세요.</p>
      
      <div className="map-grid">
        {sites.map((site, index) => {
          // INTENTIONAL GUI BUG: site044-bug01
          // Type: campsite-number-duplicate
          // Description: 사이트 배치도 displayNumber 계산 오류로 서로 다른 구역이 같은 번호로 표시됨.
          let displayNumber = site.name;
          if (index === 1) { // Force index 1 (A-2) to show the same as index 0 (A-1)
             displayNumber = 'A-1';
          }

          return (
            <div key={site.id} className={`map-cell ${site.id === 104 ? 'reserved' : ''}`}>
              <span>{displayNumber}</span>
              <span className="cell-type">{site.type}</span>
            </div>
          );
        })}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-box" style={{ background: '#fff', border: '1px solid #2d4a22' }}></div>
          예약가능
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: '#f5f5f5', border: '1px solid #ccc' }}></div>
          예약완료
        </div>
      </div>
    </div>
  );
};

export default SiteMap;
