import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import { useSearch } from '../context/SearchContext';
import { useCompare } from '../context/CompareContext';

export default function Header({ route, navigate }) {
  const { filters, update, setCategory } = useSearch();
  const { items } = useCompare();
  const [text, setText] = useState(filters.query);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hints, setHints] = useState({ popular: [], recommended: [], suggestions: [] });
  const debounced = useDebounce(text, 250);
  const boxRef = useRef(null);

  useEffect(() => { api.categories().then((r) => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => { setText(filters.query); }, [filters.query]);
  useEffect(() => {
    let alive = true;
    api.suggestions(debounced).then((r) => { if (alive) setHints(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, [debounced]);
  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const runSearch = (keyword) => {
    const q = keyword.trim();
    setText(q);
    setOpen(false);
    update({ query: q });
    navigate('/');
    if (q) api.recordSearch(q).catch(() => {});
  };

  const pickSuggestion = (s) => {
    if (s.type === 'product') navigate(`/product/${s.productId}`);
    else if (s.type === 'category') { setCategory(s.categorySlug); navigate('/'); setOpen(false); }
  };

  const onCategory = (slug) => { setCategory(slug); navigate('/'); };

  return (
    <header className="site-header">
      <div className="header-top">
        <a className="logo" href="#/" onClick={() => setCategory(null)}>
          <span className="logo-mark">C</span>ompare<b>Lab</b>
        </a>
        <div className="search-box" ref={boxRef}>
          <form onSubmit={(e) => { e.preventDefault(); runSearch(text); }}>
            <input
              type="search"
              value={text}
              placeholder="상품명, 브랜드, 카테고리를 검색해 보세요"
              onChange={(e) => { setText(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              aria-label="상품 통합 검색"
            />
            <button type="submit" className="btn btn-primary">검색</button>
          </form>
          {open && (
            <div className="suggest-pop">
              {text.trim() && hints.suggestions.length > 0 && (
                <ul>
                  {hints.suggestions.map((s) => (
                    <li key={`${s.type}-${s.text}`}>
                      <button type="button" onClick={() => pickSuggestion(s)}>
                        <span className="tag">{s.type === 'category' ? '카테고리' : '상품'}</span>{s.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!text.trim() && (
                <>
                  <p className="pop-title">인기 검색어</p>
                  <ol className="pop-list">
                    {hints.popular.map((k, i) => (
                      <li key={k.keyword}><button type="button" onClick={() => runSearch(k.keyword)}><em>{i + 1}</em>{k.keyword}</button></li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}
        </div>
        <nav className="top-links">
          <a href="#/browse" className={route.name === 'browse' ? 'on' : ''}>연속 탐색</a>
          <a href="#/library" className={route.name === 'library' ? 'on' : ''}>내 비교함</a>
          <a href="#/compare" className={route.name === 'compare' ? 'on' : ''}>비교 <span className="count-pill">{items.length}</span></a>
        </nav>
      </div>
      <div className="keyword-row">
        <span>추천 키워드</span>
        {hints.recommended.map((k) => (
          <button type="button" key={k} className="chip" onClick={() => runSearch(k)}>{k}</button>
        ))}
      </div>
      <nav className="category-nav" aria-label="상품 카테고리">
        <button type="button" className={!filters.category && route.name === 'search' ? 'on' : ''} onClick={() => onCategory(null)}>전체</button>
        {categories.map((c) => (
          <button type="button" key={c.slug} className={filters.category === c.slug && route.name === 'search' ? 'on' : ''} onClick={() => onCategory(c.slug)}>
            <span aria-hidden="true">{c.icon}</span> {c.name}
          </button>
        ))}
      </nav>
    </header>
  );
}
