import React, { useState, useEffect } from 'react';
import SearchFilter from '../components/SearchFilter';
import ClassCard from '../components/ClassCard';
import EmptyState from '../components/EmptyState';
import { fetchApi } from '../api/client';

export default function Search({ initialParams, onSelectClass }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialParams?.keyword || '');
  const [selectedCategory, setSelectedCategory] = useState(initialParams?.category || 'all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const loadClasses = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (selectedCategory && selectedCategory !== 'all') queryParams.append('category', selectedCategory);
    if (selectedRegion && selectedRegion !== 'all') queryParams.append('region', selectedRegion);

    fetchApi(`/api/classes?${queryParams.toString()}`)
      .then(data => {
        // data can be array or object with classes
        const list = Array.isArray(data) ? data : (data.classes || []);
        setClasses(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadClasses();
  }, [selectedCategory, selectedRegion]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    loadClasses();
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('all');
    setSelectedRegion('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Search Filter Widget */}
      <SearchFilter
        keyword={keyword}
        setKeyword={setKeyword}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        onSearch={handleSearchSubmit}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)' }}>
          탐색 결과 <strong style={{ color: 'var(--soft-blue)' }}>{classes.length}</strong>개
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          클래스를 불러오는 중입니다...
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          title="검색 조건에 맞는 클래스가 없습니다"
          description="다른 카테고리나 검색어로 다시 찾아보세요."
          actionText="전체 클래스 보기"
          onAction={handleReset}
        />
      ) : (
        <div className="grid-cards">
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={onSelectClass}
            />
          ))}
        </div>
      )}
    </div>
  );
}
