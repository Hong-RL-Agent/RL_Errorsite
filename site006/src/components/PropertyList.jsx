import React from 'react';
import { MapPin, Maximize } from 'lucide-react';

export default function PropertyList({ properties }) {
  return (
    <div className="property-list-area">
      <div className="list-header">
        <h2>프리미엄 매물 목록</h2>
        <span style={{ color: 'var(--text-sub)' }}>총 {properties.length}개의 매물</span>
      </div>

      <div className="property-grid">
        {properties.map(prop => (
          <div key={prop.id} className="property-card">
            {/* INTENTIONAL GUI BUG: site006-bug02
               Type: component-rendering
               Description: 일부 매물 카드 이미지가 잘못된 조건부 렌더링으로 비어 보인다.
               Explanation: id가 102 또는 105인 매물은 렌더링 시 이미지를 null 처리하여 공백으로 렌더링되게 만듦. */}
            <div className="card-img-placeholder" data-bug-id="site006-bug02">
              {(prop.id === 102 || prop.id === 105) ? null : prop.image}
            </div>
            <div className="card-content">
              <div className="card-type">{prop.type}</div>
              <div className="card-title">{prop.title}</div>
              <div className="card-price">{prop.price}</div>
              <div className="card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Maximize size={14} />
                  {prop.area}
                </span>
                <span>방 {prop.rooms}개</span>
              </div>
              <div className="card-meta" style={{ borderTop: 'none', paddingTop: 0, marginTop: '-4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                  <MapPin size={14} color="var(--primary)" />
                  {prop.location}
                </span>
              </div>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            조건에 맞는 매물이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
