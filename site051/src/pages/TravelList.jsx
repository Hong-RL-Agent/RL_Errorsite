import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import InfiniteTravelList from '../components/InfiniteTravelList';

const DESTINATIONS = ['전체', '제주', '부산', '강릉', '경주', '여수', '오사카', '도쿄', '후쿠오카', '다낭', '파리'];

export default function TravelList({ navigate, searchParams }) {
  const [filters, setFilters] = useState({
    search: searchParams?.search || '',
    destination: searchParams?.destination || 'all',
    tag: searchParams?.tag || 'all'
  });

  const handleDestinationClick = (dest) => {
    setFilters(prev => ({ ...prev, destination: dest === '전체' ? 'all' : dest }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      destination: 'all',
      tag: 'all'
    });
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
          여행 찾기
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          스크롤을 내리며 국내외 수많은 여행자들의 생생한 코스와 후기를 둘러보세요.
        </p>
      </div>

      {/* Filter Box */}
      <div style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--sand-border)', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input 
              type="text" 
              placeholder="여행지, 제목, 태그로 검색..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button 
            className="btn-secondary"
            onClick={handleReset}
            title="필터 초기화"
          >
            <RotateCcw size={16} />
            <span>초기화</span>
          </button>
        </div>

        {/* Destination Pills */}
        <div className="category-pills-row" style={{ marginBottom: 0 }}>
          {DESTINATIONS.map(dest => {
            const isActive = (filters.destination === 'all' && dest === '전체') || filters.destination === dest;
            return (
              <button
                key={dest}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => handleDestinationClick(dest)}
              >
                {dest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Infinite Travel List */}
      <InfiniteTravelList 
        filters={filters} 
        onCardClick={(id) => navigate(`/travel/${id}`)} 
      />
    </div>
  );
}
