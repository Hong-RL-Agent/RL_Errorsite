import React from 'react';
import { ChefHat, Heart, Calendar, Mail, BookOpen } from 'lucide-react';

export default function Profile({ user, navigate }) {
  if (!user) return null;

  return (
    <div className="page-wrapper" style={{ maxWidth: '780px' }}>
      <div style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--beige-border)', boxShadow: 'var(--shadow-sm)' }}>
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
          <div style={{ background: 'var(--warm-beige)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--beige-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-dark)' }}>{user.recipeCount}개</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>내가 등록한 레시피</div>
          </div>
          <div style={{ background: 'var(--warm-beige)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--beige-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-orange)' }}>{user.favoriteCount}개</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>저장한 즐겨찾기</div>
          </div>
          <div style={{ background: 'var(--warm-beige)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--beige-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>7일</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>주간 식단 완성도</div>
          </div>
        </div>
      </div>
    </div>
  );
}
