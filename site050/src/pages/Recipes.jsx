import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import RecipeFilter from '../components/RecipeFilter';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function Recipes({ navigate, searchParams }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    search: searchParams?.search || '',
    category: searchParams?.category || 'all',
    difficulty: searchParams?.difficulty || 'all',
    sort: searchParams?.sort || 'popular'
  });

  useEffect(() => {
    fetchRecipes();
  }, [filters.category, filters.difficulty, filters.sort]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await api.getRecipes({
        search: filters.search,
        category: filters.category,
        difficulty: filters.difficulty,
        sort: filters.sort
      });
      setRecipes(res.recipes || []);
      setTotalCount(res.total || 0);
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
          레시피 탐색
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          다양한 카테고리의 맛있는 홈쿡 요리법을 둘러보고 나만의 식단에 추가해보세요.
        </p>
      </div>

      {/* Filter Component */}
      <RecipeFilter 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={fetchRecipes} 
      />

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          총 <strong>{totalCount}</strong>개의 레시피
        </span>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          레시피를 불러오는 중입니다...
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState 
          title="검색된 레시피가 없습니다" 
          message="다른 검색어를 입력하거나 필터 조건을 초기화해보세요."
          actionLabel="전체 레시피 보기"
          onAction={() => setFilters({ search: '', category: 'all', difficulty: 'all', sort: 'popular' })}
        />
      ) : (
        <div className="recipe-grid">
          {recipes.map(recipe => (
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
