import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = ['전체', '환경', '동물', '교육', '복지', '문화', '지역행사'];
const REGIONS = ['전체', '수원시 영통구', '수원시 팔달구', '수원시 권선구', '성남시 분당구', '용인시 수지구'];
const STATUSES = [
  { label: '전체 상태', value: 'all' },
  { label: '모집중', value: 'open' },
  { label: '마감', value: 'closed' }
];

export default function ActivityFilter({ filters, setFilters, onSearch }) {
  const handleCategoryClick = (cat) => {
    setFilters(prev => ({ ...prev, category: cat === '전체' ? 'all' : cat, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: 'all',
      region: 'all',
      status: 'all',
      page: 1
    });
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--cream-border)', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Search Input Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input 
            type="text" 
            placeholder="봉사활동명, 내용, 장소로 검색하세요..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()}
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

        <select 
          value={filters.region}
          onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value, page: 1 }))}
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: '0.92rem',
            outline: 'none',
            color: 'var(--text-main)'
          }}
        >
          {REGIONS.map(r => (
            <option key={r} value={r === '전체' ? 'all' : r}>{r === '전체' ? '전체 지역' : r}</option>
          ))}
        </select>

        <select 
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontSize: '0.92rem',
            outline: 'none',
            color: 'var(--text-main)'
          }}
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button 
          className="btn-secondary"
          onClick={handleReset}
          title="필터 초기화"
        >
          <RotateCcw size={16} />
          <span>초기화</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="category-pills-row" style={{ marginBottom: 0 }}>
        {CATEGORIES.map(cat => {
          const isActive = (filters.category === 'all' && cat === '전체') || filters.category === cat;
          return (
            <button
              key={cat}
              className={`category-pill ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
