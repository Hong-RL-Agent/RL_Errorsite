import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import ExperienceCard from '../components/ExperienceCard';
import EmptyState from '../components/EmptyState';
import { fetchApi } from '../api/client';

export default function Explore({ initialParams, onSelectExperience }) {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialParams?.keyword || '');
  const [region, setRegion] = useState(initialParams?.region || 'all');
  const [category, setCategory] = useState(initialParams?.category || 'all');
  const [maxPrice, setMaxPrice] = useState(250000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState(initialParams?.sort || 'rating');

  const loadExperiences = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (region && region !== 'all') queryParams.append('region', region);
    if (category && category !== 'all') queryParams.append('category', category);
    if (maxPrice < 250000) queryParams.append('maxPrice', maxPrice);
    if (minRating > 0) queryParams.append('rating', minRating);
    if (sort) queryParams.append('sort', sort);

    fetchApi(`/api/experiences?${queryParams.toString()}`)
      .then(data => {
        setExperiences(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadExperiences();
  }, [region, category, maxPrice, minRating, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadExperiences();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setRegion('all');
    setCategory('all');
    setMaxPrice(250000);
    setMinRating(0);
    setSort('rating');
  };

  const regions = [
    { id: 'all', label: '전체 지역' },
    { id: '서울', label: '서울' },
    { id: '제주', label: '제주' },
    { id: '부산', label: '부산' },
    { id: '경기', label: '경기' },
    { id: '강원', label: '강원' },
    { id: '경북', label: '경북' }
  ];

  const categories = [
    { id: 'all', label: '전체 테마' },
    { id: 'class', label: '원데이 클래스' },
    { id: 'tour', label: '로컬 투어' },
    { id: 'activity', label: '액티비티/레저' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Search and Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 16 }}>
          체험 & 이벤트 탐색
        </h1>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              id="explore-search-input"
              type="text"
              placeholder="체험명, 지역명, 상세 내용 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 42 }}
            />
          </div>

          <button id="explore-btn-search" type="submit" className="btn btn-primary">
            <span>검색하기</span>
          </button>

          <button type="button" onClick={handleResetFilters} className="btn btn-outline" title="필터 초기화">
            <RefreshCw size={16} />
            <span>초기화</span>
          </button>
        </form>

        {/* Filter Badges / Selects */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border-light)'
        }}>
          {/* Region Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary-navy)', marginRight: 4 }}>지역:</span>
            {regions.map(r => (
              <button
                key={r.id}
                id={`filter-region-${r.id}`}
                onClick={() => setRegion(r.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: region === r.id ? 'var(--primary-navy)' : '#f1f5f9',
                  color: region === r.id ? '#ffffff' : 'var(--text-main)'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-color)' }} />

          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary-navy)', marginRight: 4 }}>카테고리:</span>
            {categories.map(c => (
              <button
                key={c.id}
                id={`filter-category-${c.id}`}
                onClick={() => setCategory(c.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: category === c.id ? 'var(--sky-blue)' : '#f1f5f9',
                  color: category === c.id ? '#ffffff' : 'var(--text-main)'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters (Price, Rating, Sort) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--border-light)'
        }}>
          {/* Price Range Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 240 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>최대 가격:</span>
            <input 
              id="filter-price-slider"
              type="range" 
              min="30000" 
              max="250000" 
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ accentColor: 'var(--sky-blue)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-navy)' }}>
              {maxPrice >= 250000 ? '전체' : `${maxPrice.toLocaleString()}원 이하`}
            </span>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>정렬:</span>
            <select
              id="filter-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
            >
              <option value="rating">평점 높은 순</option>
              <option value="reviews">리뷰 많은 순</option>
              <option value="price-low">가격 낮은 순</option>
              <option value="price-high">가격 높은 순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)' }}>
          검색 결과 <strong style={{ color: 'var(--sky-blue)' }}>{experiences.length}</strong>개
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          체험 목록을 불러오는 중입니다...
        </div>
      ) : experiences.length === 0 ? (
        <EmptyState
          title="조건에 맞는 체험이 없습니다"
          description="검색어나 필터 조건을 변경하여 다시 시도해보세요."
          actionText="전체 필터 초기화"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid-cards">
          {experiences.map(exp => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onSelect={onSelectExperience}
            />
          ))}
        </div>
      )}
    </div>
  );
}
