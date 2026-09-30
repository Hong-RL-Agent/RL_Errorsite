import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import SortSelect from './SortSelect';

const CATEGORIES = ['전체', '한식', '양식', '일식', '베이킹', '샐러드', '간단요리'];
const DIFFICULTIES = ['전체 난이도', '쉬움', '보통', '어려움'];

export default function RecipeFilter({ filters, setFilters, onSearch }) {
  const handleCategoryClick = (cat) => {
    setFilters(prev => ({ ...prev, category: cat === '전체' ? 'all' : cat }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: 'all',
      difficulty: 'all',
      sort: 'popular'
    });
  };

  return (
    <div style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--beige-border)', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Search Bar & Sort Dropdown */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input 
            type="text" 
            className="recipe-search-input"
            placeholder="레시피명, 재료(토마토, 바질 등)로 검색..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
          value={filters.difficulty}
          onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value === '전체 난이도' ? 'all' : e.target.value }))}
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--cream-card)',
            fontSize: '0.92rem',
            outline: 'none'
          }}
        >
          {DIFFICULTIES.map(d => (
            <option key={d} value={d === '전체 난이도' ? 'all' : d}>{d}</option>
          ))}
        </select>

        <SortSelect 
          value={filters.sort} 
          onChange={(newSort) => setFilters(prev => ({ ...prev, sort: newSort }))} 
        />

        <button 
          className="btn-secondary"
          onClick={handleReset}
          title="초기화"
          style={{ padding: '12px 16px' }}
        >
          <RotateCcw size={16} />
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
