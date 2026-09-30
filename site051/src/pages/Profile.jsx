import React from 'react';
import { Compass, Heart, MapPin, Mail, Calendar } from 'lucide-react';

export default function Profile({ user, navigate }) {
  if (!user) return null;

  return (
    <div className="page-wrapper" style={{ maxWidth: '780px' }}>
      <div style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <img 
            src={user.avatar} 
            alt={user.name} 
            style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} 
          />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>{user.bio}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{ background: 'var(--sand)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sand-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-dark)' }}>{user.logCount}개</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>작성한 여행기</div>
          </div>
          <div style={{ background: 'var(--sand)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sand-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--coral)' }}>{user.likeCount}개</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>받은 좋아요 총합</div>
          </div>
          <div style={{ background: 'var(--sand)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sand-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>12개</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>방문한 도시 수</div>
          </div>
        </div>
      </div>
    </div>
  );
}
