import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, BookOpen, Heart, ChefHat, Calendar, Flame } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { api } from '../api/client';

export default function Home({ navigate }) {
  const [recipes, setRecipes] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCat, setSelectedCat] = useState('전체');

  const categories = ['전체', '한식', '양식', '일식', '베이킹', '샐러드', '간단요리'];

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const res = await api.getRecipes();
      setRecipes(res.recipes || []);
    } catch {
      // ignore
    }
  };

  const handleSearch = () => {
    navigate(`/recipes?search=${encodeURIComponent(keyword)}&category=${selectedCat === '전체' ? 'all' : selectedCat}`);
  };

  const popularRecipes = recipes.slice(0, 3);
  const quickRecipes = recipes.filter(r => r.cookingTime <= 20).slice(0, 3);

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-sub-pill">
            <Sparkles size={15} />
            <span>나만의 맛있는 레시피 아카이브</span>
          </div>
          <h1 className="hero-title">오늘 뭐 먹지?<br />TableNote와 함께하는 즐거운 요리</h1>
          <p className="hero-desc">
            냉장고 속 재료로 만드는 10분 초간단 요리부터 주말 브런치 베이킹까지<br />
            나만의 레시피를 차곡차곡 기록하고 이번 주 식단을 계획해보세요.
          </p>

          <div className="hero-search-box">
            <input 
              type="text" 
              placeholder="레시피명 또는 재료를 검색해보세요 (예: 토마토, 바질, 된장찌개)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="hero-search-input"
            />
            <button className="hero-search-btn" onClick={handleSearch}>
              <Search size={18} />
              <span>검색</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <div className="category-pills-row">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => {
              setSelectedCat(cat);
              navigate(`/recipes?category=${cat === '전체' ? 'all' : cat}`);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Nav Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        margin: '36px 0 48px'
      }}>
        <div 
          style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--beige-border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => navigate('/recipes/new')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ChefHat size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>새 레시피 기록하기</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>나만의 황금 레시피와 조리 팁을 깔끔하게 저장하세요.</p>
        </div>

        <div 
          style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--beige-border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => navigate('/meal-planner')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--sage-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Calendar size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>주간 식단 캘린더</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>월요일부터 일요일까지 아침·점심·저녁 메뉴를 한눈에!</p>
        </div>

        <div 
          style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--beige-border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => navigate('/favorites')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-orange-light)', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Heart size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>즐겨찾는 레시피</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>자주 해먹는 최애 요리들을 모아 빠르게 찾아보세요.</p>
        </div>
      </div>

      {/* Popular Recipes Section */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            🔥 이번 주 인기 레시피
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>홈쿡러들이 가장 많이 따라 하고 저장한 인기 메뉴입니다.</p>
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/recipes')}>
          <span>전체보기</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="recipe-grid">
        {popularRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          />
        ))}
      </div>

      {/* Quick 20min Recipes Section */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '48px 0 24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            ⏱️ 바쁜 날엔 20분 초간단 요리
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>퇴근 후 또는 바쁜 아침 뚝딱 완성하는 간편 한 그릇 메뉴!</p>
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/recipes')}>
          <span>더 많은 요리 보기</span>
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="recipe-grid">
        {quickRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
