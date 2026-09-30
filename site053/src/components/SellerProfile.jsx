import React from 'react';

export default function SellerProfile({ seller }) {
  if (!seller) return null;

  const mannerScore = seller.mannerScore || 36.5;
  const mannerPercent = Math.min(100, Math.max(10, ((mannerScore - 30) / (60 - 30)) * 100));

  const getMannerFace = (score) => {
    if (score >= 42) return '🔥';
    if (score >= 39) return '😄';
    if (score >= 36.5) return '🙂';
    return '😐';
  };

  const getMannerColor = (score) => {
    if (score >= 42) return '#ea580c';
    if (score >= 39) return '#ff5722';
    if (score >= 36.5) return '#10b981';
    return '#0ea5e9';
  };

  return (
    <div className="seller-manner-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <img
          className="seller-avatar-img"
          src={seller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt={seller.nickname}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>
            {seller.nickname}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {seller.location}
          </div>
        </div>
      </div>

      <div className="thermometer-wrap">
        <div className="thermometer-header">
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)' }}>
            매너온도
          </div>
          <div className="thermometer-score" style={{ color: getMannerColor(mannerScore) }}>
            {mannerScore}℃ {getMannerFace(mannerScore)}
          </div>
        </div>

        <div className="thermometer-track">
          <div
            className="thermometer-fill"
            style={{ width: `${mannerPercent}%` }}
          ></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>기준 36.5℃</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '900', color: 'var(--text-main)', fontSize: '1rem' }}>{seller.reviewCount || 12}건</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>거래 후기</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '900', color: 'var(--text-main)', fontSize: '1rem' }}>99.2%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>재거래 희망률</div>
        </div>
      </div>
    </div>
  );
}
