import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import ExperienceCard from '../components/ExperienceCard';
import EmptyState from '../components/EmptyState';
import { fetchApi } from '../api/client';

export default function Wishlist({ onSelectExperience, onNavigateExplore }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    setLoading(true);
    fetchApi('/api/wishlist')
      .then(data => {
        setWishlist(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleWishlistToggle = (expId, isAdded) => {
    if (!isAdded) {
      setWishlist(prev => prev.filter(e => e.id !== expId));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
          찜한 위시리스트
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          관심 있는 특별한 체험을 저장해두고 언제든지 일정을 확인하여 예약하세요.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          위시리스트를 불러오는 중입니다...
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart size={32} color="#ef4444" />}
          title="찜한 체험이 아직 없습니다"
          description="마음에 드는 원데이 클래스와 투어의 하트 아이콘을 눌러 위시리스트에 담아보세요."
          actionText="인기 체험 둘러보기"
          onAction={onNavigateExplore}
        />
      ) : (
        <div className="grid-cards">
          {wishlist.map(exp => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onSelect={onSelectExperience}
              onWishlistToggle={handleWishlistToggle}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
