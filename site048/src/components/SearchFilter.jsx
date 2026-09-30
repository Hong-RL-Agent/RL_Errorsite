import React from 'react';
import { Search, MapPin, RefreshCw } from 'lucide-react';

export default function SearchFilter({
  keyword,
  setKeyword,
  selectedCategory,
  setSelectedCategory,
  selectedRegion,
  setSelectedRegion,
  onSearch,
  onReset
}) {
  const categories = [
    { id: 'all', label: '전체 카테고리' },
    { id: '도예', label: '도예' },
    { id: '베이킹', label: '베이킹' },
    { id: '드로잉', label: '드로잉' },
    { id: '사진', label: '사진' },
    { id: '공예', label: '공예' },
    { id: '운동', label: '운동/요가' }
  ];

  const regions = [
    { id: 'all', label: '전체 지역' },
    { id: '서울 성동구', label: '성수/성동' },
    { id: '서울 마포구', label: '홍대/연남' },
    { id: '서울 강남구', label: '강남/신사' },
    { id: '서울 서초구', label: '서초/반포' },
    { id: '경기 파주', label: '경기/파주' }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      {/* Search Input Bar */}
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            id="input-class-search"
            type="text"
            placeholder="클래스명, 강사명, 장소 키워드 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 42 }}
          />
        </div>

        <button id="btn-submit-search" type="submit" className="btn btn-primary">
          검색하기
        </button>

        {onReset && (
          <button type="button" onClick={onReset} className="btn btn-outline" title="필터 초기화">
            <RefreshCw size={16} />
            <span>초기화</span>
          </button>
        )}
      </form>

      {/* Category Filter Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 12,
        borderTop: '1px solid var(--border-light)'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary-navy)', marginRight: 4 }}>카테고리:</span>
        {categories.map(cat => (
          <button
            key={cat.id}
            id={`filter-cat-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: selectedCategory === cat.id ? 'var(--soft-blue)' : '#f1f5f9',
              color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Region Filter Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 12,
        borderTop: '1px solid var(--border-light)'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary-navy)', marginRight: 4 }}>지역:</span>
        {regions.map(reg => (
          <button
            key={reg.id}
            id={`filter-reg-${reg.id}`}
            onClick={() => setSelectedRegion(reg.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: selectedRegion === reg.id ? 'var(--primary-navy)' : '#f1f5f9',
              color: selectedRegion === reg.id ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            <MapPin size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
            {reg.label}
          </button>
        ))}
      </div>
    </div>
  );
}
