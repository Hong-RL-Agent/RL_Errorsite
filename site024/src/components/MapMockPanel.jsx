import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapMockPanel({ location }) {
  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>현재 배송 위치</h3>
      <div className="map-mock">
        <div style={{ textAlign: 'center' }}>
          <MapPin size={40} color="var(--primary)" fill="rgba(37, 99, 235, 0.2)" />
          <p style={{ marginTop: '10px', fontWeight: 600 }}>{location}</p>
        </div>
      </div>
      <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
        <span>최종 업데이트: 방금 전</span>
        <button style={{ color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>지도 크게보기</button>
      </div>
    </div>
  );
}
