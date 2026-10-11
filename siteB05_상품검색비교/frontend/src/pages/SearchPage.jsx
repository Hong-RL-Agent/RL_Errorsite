import React, { useEffect, useState } from 'react';
import { api, buildProductQuery } from '../api';
import { normalizeProductList } from '../api/normalize';
import { useSearch } from '../context/SearchContext';
import { useCompare } from '../context/CompareContext';
import { useFilterDefs } from '../hooks/useFilterDefs';
import FilterPanel from '../components/FilterPanel';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import RecentStrip from '../components/RecentStrip';

const SORTS = [
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
];

export default function SearchPage({ navigate }) {
  const { filters, update, setPage, resetFilters, toggleBrand, toggleSpec } = useSearch();
  const { isSelected, toggleProduct } = useCompare();
  const defs = useFilterDefs(filters.category);
  const [state, setState] = useState({ loading: true, error: '', items: [], total: 0, page: 1, limit: 8 });

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.listProducts(buildProductQuery(filters, { limit: 8 }), ctrl.signal)
      .then((raw) => setState({ loading: false, error: '', ...normalizeProductList(raw, filters) }))
      .catch((e) => { if (e.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error: e.message })); });
    return () => ctrl.abort();
  }, [filters]);

  const title = filters.query ? `‘${filters.query}’ 검색 결과` : filters.category ? defs.categoryName || '카테고리 상품' : '전체 상품';

  return (
    <div className="layout">
      <FilterPanel
        defs={defs}
        filters={filters}
        onChange={update}
        onToggleBrand={toggleBrand}
        onToggleSpec={toggleSpec}
        onReset={resetFilters}
      />
      <section className="results">
        <div className="results-head">
          <div>
            <h1>{title}</h1>
            <p className="muted" aria-live="polite">{state.loading ? '검색 중…' : `총 ${(state.total ?? 0).toLocaleString('ko-KR')}개의 상품`}</p>
          </div>
          <div className="sort-tabs" role="tablist" aria-label="정렬">
            {SORTS.map((s) => (
              <button type="button" key={s.value} role="tab" aria-selected={filters.sort === s.value} className={filters.sort === s.value ? 'on' : ''} onClick={() => update({ sort: s.value })}>{s.label}</button>
            ))}
          </div>
        </div>

        {state.error && <p className="inline-error">{state.error}</p>}
        {!state.loading && !state.error && state.items.length === 0 && (
          <div className="empty-box">
            <p>조건에 맞는 상품이 없어요.</p>
            <button type="button" className="btn" onClick={resetFilters}>필터 초기화</button>
          </div>
        )}

        <div className={`product-grid${state.loading ? ' is-loading' : ''}`}>
          {state.items.map((p) => (
            <ProductCard key={p.id} product={p} selected={isSelected(p.id)} onToggleCompare={toggleProduct} onOpen={(id) => navigate(`/product/${id}`)} />
          ))}
        </div>

        {state.items.length > 0 && (
          <Pagination
            page={state.page}
            totalPages={state.totalPages}
            nextPage={state.nextPage}
            prevPage={state.prevPage}
            onPage={(n) => { setPage(n); window.scrollTo({ top: 0 }); }}
          />
        )}
        <RecentStrip onOpen={(id) => navigate(`/product/${id}`)} refreshKey={state.page} />
      </section>
    </div>
  );
}
