import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function Favorites({ navigate }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
          즐겨찾기 레시피
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          자주 요리하고 싶은 나만의 북마크 레시피 모음입니다.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          즐겨찾기 목록을 불러오는 중입니다...
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState 
          title="즐겨찾기한 레시피가 없습니다"
          message="마음에 드는 레시피 상세 페이지에서 즐겨찾기 버튼을 눌러보세요!"
          actionLabel="레시피 둘러보기"
          onAction={() => navigate('/recipes')}
        />
      ) : (
        <div className="recipe-grid">
          {favorites.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
