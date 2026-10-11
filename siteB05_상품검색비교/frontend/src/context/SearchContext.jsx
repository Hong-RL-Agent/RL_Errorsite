import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { logAction } from '../api';

export const DEFAULT_FILTERS = {
  query: '',
  category: null,
  brands: [],
  minPrice: null,
  maxPrice: null,
  specs: {},
  sort: 'popular',
  page: 1,
};

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // 비교 화면으로 이동하기 직전의 검색 조건 (비교 화면의 "이전 검색 조건" 표시용)
  const [lastSearch, setLastSearch] = useState(null);

  useEffect(() => {
    window.__compareLabState = Object.assign(window.__compareLabState || {}, { filters, lastSearch });
  }, [filters, lastSearch]);

  const update = useCallback((patch) => setFilters((f) => ({ ...f, page: 1, ...patch })), []);
  const setPage = useCallback((page) => setFilters((f) => ({ ...f, page })), []);

  const setCategory = useCallback((slug) => {
    // 카테고리가 바뀌면 카테고리 전용 조건(브랜드/가격/스펙)은 의미가 없으므로 비운다
    setFilters((f) => ({ ...DEFAULT_FILTERS, query: f.query, sort: f.sort, category: slug || null }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((f) => ({ ...DEFAULT_FILTERS, category: f.category, sort: f.sort }));
  }, []);

  const toggleBrand = useCallback((id) => {
    setFilters((f) => ({ ...f, page: 1, brands: f.brands.includes(id) ? f.brands.filter((b) => b !== id) : [...f.brands, id] }));
  }, []);

  const toggleSpec = useCallback((key, value) => {
    setFilters((f) => {
      const cur = f.specs[key] || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      const specs = { ...f.specs };
      if (next.length) specs[key] = next; else delete specs[key];
      return { ...f, page: 1, specs };
    });
  }, []);

  const openCompare = useCallback(() => {
    setLastSearch(filters);
    logAction('open_compare', JSON.stringify({ category: filters.category, brands: filters.brands, minPrice: filters.minPrice, maxPrice: filters.maxPrice, specs: filters.specs }));
    // INTENTIONAL_ERROR: B05-ERR01
    // CSV Error: 다단계 기억 부담
    // Strategy: SEQUENCE_REPLAY
    // Description: 비교 화면 이동 시 검색 조건을 보존하지 않아 복귀 후 가격·브랜드·스펙 조건이 사라짐.
    setFilters((f) => ({ ...f, page: 1, brands: [], minPrice: null, maxPrice: null, specs: {} }));
  }, [filters]);

  const value = useMemo(() => ({
    filters, lastSearch, update, setPage, setCategory, resetFilters, toggleBrand, toggleSpec, openCompare,
  }), [filters, lastSearch, update, setPage, setCategory, resetFilters, toggleBrand, toggleSpec, openCompare]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export const useSearch = () => useContext(SearchContext);
