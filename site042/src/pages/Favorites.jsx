import React from 'react';
import { Heart, Compass } from 'lucide-react';
import ClassCard from '../components/ClassCard';

export default function Favorites({ favorites = [], classes = [], onBookClass, onToggleFavorite, onNavigate }) {
  const favoriteClasses = classes.filter(c => favorites.includes(c.id));

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">관심 클래스 & 찜 목록 ({favoriteClasses.length}개)</h2>
          <p className="section-subtitle">내가 관심 등록해 둔 클래스를 빠르게 확인하고 예약하세요.</p>
        </div>
      </div>

      {favoriteClasses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <Heart size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>찜한 클래스가 없습니다</h3>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>다양한 피트니스 & 웰니스 클래스를 둘러보세요.</p>
          <button className="btn-lime" onClick={() => onNavigate('classes')}>
            클래스 탐색하러 가기
          </button>
        </div>
      ) : (
        <div className="class-grid">
          {favoriteClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={() => {}}
              onBook={onBookClass}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
