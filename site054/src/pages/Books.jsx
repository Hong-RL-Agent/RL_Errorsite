import React, { useState, useEffect } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import { api, notifyBugDetected } from '../api/client';

export default function Books({
  onSelectBook,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  wishlists = [],
  onToggleWishlist
}) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('전체');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [hadNonEmptySearch, setHadNonEmptySearch] = useState(false);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        if (res && res.categories) {
          setCategories(res.categories);
        }
      } catch (e) {}
    }
    loadCats();
  }, []);

  const fetchBooks = async (queryToSearch) => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== '전체' ? selectedCategory : undefined,
        type: selectedType !== '전체' ? selectedType : undefined,
        available: availableOnly ? 'true' : undefined,
        sort: sortOption
      };

      if (queryToSearch !== undefined) {
        params.search = queryToSearch;
      }

      // Check bug SEC-450 trigger
      if (hadNonEmptySearch && queryToSearch === '') {
        notifyBugDetected({
          id: 'SEC-450',
          category: 'Search State',
          family: 'empty-query-transition',
          severity: 'medium',
          endpoint: '/api/books?search=',
          method: 'GET',
          description: '검색어를 완전히 삭제했으나 이전 검색 결과가 초기 전체 목록으로 복원되지 않는 검색 상태 유지 오류'
        });
      }

      const res = await api.getBooks(params);
      if (res && res.books) {
        setBooks(res.books);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localSearch && localSearch.trim() !== '') {
      setHadNonEmptySearch(true);
    }
    fetchBooks(localSearch);
  }, [selectedCategory, selectedType, availableOnly, sortOption]);

  const handleSearchSubmit = (val) => {
    setLocalSearch(val);
    if (val && val.trim() !== '') {
      setHadNonEmptySearch(true);
    }
    fetchBooks(val);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    // INTENTIONAL BACKEND BUG: site054-SEC-450 trigger
    fetchBooks('');
  };

  return (
    <div>
      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Filter & Search Toolbar */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        margin: '20px 0 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <SearchBar
          value={localSearch}
          onChange={setLocalSearch}
          onSearch={handleSearchSubmit}
          onClear={handleClearSearch}
        />

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <select
            className="search-box-input"
            style={{ width: '130px', padding: '8px 12px', fontSize: '0.85rem' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="전체">모든 자료유형</option>
            <option value="전자책">전자책 (E-Book)</option>
            <option value="종이책">종이책 (인쇄본)</option>
          </select>

          {/* Sort Filter */}
          <select
            className="search-box-input"
            style={{ width: '130px', padding: '8px 12px', fontSize: '0.85rem' }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="popular">인기순 (대여순)</option>
            <option value="rating">평점 높은순</option>
            <option value="newest">최신 입고순</option>
          </select>

          {/* Available Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <span>대여 가능만 보기</span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>
          {selectedCategory === '전체' ? '도서관 소장 자료 전체' : selectedCategory}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '10px' }}>
            (총 {books.length}권)
          </span>
        </h2>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          도서관 자료를 검색하는 중입니다...
        </div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📖</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>검색 조건에 일치하는 도서가 없습니다.</div>
          <div style={{ fontSize: '0.85rem' }}>검색어를 변경하거나 필터를 초기화해보세요.</div>
        </div>
      ) : (
        <div className="books-grid-layout">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              isWishlisted={wishlists.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
