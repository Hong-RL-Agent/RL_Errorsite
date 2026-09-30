import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Ticket } from 'lucide-react';

export default function Exhibitions({ showToast }) {
  const [exhibitions, setExhibitions] = useState([]);

  useEffect(() => {
    fetch('/api/exhibitions')
      .then(res => res.json())
      .then(data => setExhibitions(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>기획 전시 및 아트 갤러리</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>시각 예술, 인터랙티브 미디어아트, 사진전 관람 안내</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '26px' }}>
        {exhibitions.map(e => (
          <div key={e.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '220px', overflow: 'hidden' }}>
              <img src={e.poster} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-classic" style={{ marginBottom: '8px' }}>{e.gallery}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px' }}>{e.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--gray-600)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {e.description}
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>작가: <strong>{e.artist}</strong></div>
                  <div>전시기간: {e.period}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                  ₩{e.price.toLocaleString()}
                </span>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => showToast('전시 티켓', `[${e.title}] 현장 발권 및 모바일 사전 등록이 완료되었습니다.`, 'success')}
                >
                  <Ticket size={14} /> 관람 예매
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
