import React, { useState, useEffect } from 'react';
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, Layers, AlertCircle } from 'lucide-react';
import ClassCard from '../components/ClassCard';

export default function Classes({ onBookClass, favorites = [], onToggleFavorite, showToast }) {
  const [classes, setClasses] = useState([]);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = [
    { id: 'all', label: '전체 클래스' },
    { id: 'yoga', label: '요가' },
    { id: 'pt', label: '1:1 PT' },
    { id: 'pilates', label: '필라테스' },
    { id: 'spinning', label: '스피닝' },
    { id: 'crossfit', label: '크로스핏' },
    { id: 'meditation', label: '명상/웰니스' }
  ];

  const fetchClasses = async (targetCategory, targetSort, targetPage) => {
    try {
      const res = await fetch(`/api/classes?category=${targetCategory}&sort=${targetSort}&page=${targetPage}&pageSize=6`);
      const data = await res.json();
      if (data.success) {
        setClasses(data.data.items);
        setTotalPages(data.data.totalPages);
        setTotalCount(data.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  useEffect(() => {
    fetchClasses(category, sort, page);
  }, [category, sort, page]);

  // SEC-393: Changing category retains current page instead of resetting to page 1
  const handleCategoryChange = (catId) => {
    setCategory(catId);
    // Intentional bug trigger: retaining previous page value (e.g. page=3) when changing category
    showToast(`카테고리가 [${catId}] 로 변경되었습니다. (페이지: ${page})`, 'site042-bug03', 'SEC-393');
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    showToast(`정렬 기준이 [${newSort}] 로 변경되었습니다.`, 'site042-bug03', 'SEC-393');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    showToast(`페이지 [${newPage}] 로 이동했습니다.`, 'site042-bug03', 'SEC-393');
  };

  return (
    <div className="page-container">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">클래스 탐색 & 예약</h2>
          <p className="section-subtitle">원하는 종목과 수준에 맞는 최고의 수업을 실시간으로 확인하세요. (총 {totalCount}개)</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '6px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <ArrowUpDown size={15} color="#64748b" />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: '#0f172a' }}
            >
              <option value="popular">인기순</option>
              <option value="rating">평점 높은순</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`tab-btn ${category === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Class List */}
      {classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>선택한 조건의 클래스가 없습니다</h3>
          <p style={{ fontSize: 13, color: '#64748b' }}>페이지 번호가 범위를 초과했거나 다른 카테고리를 선택해 보세요.</p>
          <button
            className="btn-lime"
            onClick={() => { setCategory('all'); setPage(1); }}
            style={{ marginTop: 16 }}
          >
            전체 목록 (1페이지)으로 복귀
          </button>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={() => {}}
              onBook={onBookClass}
              isFavorite={favorites.includes(cls.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination-wrap">
        <button
          className="page-btn"
          disabled={page <= 1}
          onClick={() => handlePageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft size={16} />
        </button>

        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className={`page-btn ${page === num ? 'active' : ''}`}
            onClick={() => handlePageChange(num)}
          >
            {num}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={page >= totalPages && totalPages > 0}
          onClick={() => handlePageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
