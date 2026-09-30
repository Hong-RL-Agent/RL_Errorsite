import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, History, TrendingUp, Sparkles, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Search({ onSelectProduct, onAddToCart, onShowToast }) {
  const [query, setQuery] = useState('세라믹 머그');
  const [searchResults, setSearchResults] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
    performSearch('세라믹 머그');
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/search/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-361: Search bar async request
  const performSearch = async (searchTerm) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
        onShowToast({
          title: '상품 검색 실행',
          message: `키워드 "${searchTerm}"(으)로 ${data.total}개의 상품을 찾았습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query.trim());
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">스마트 상품 검색</h1>
          <p className="page-subtitle">원하는 상품명, 카테고리, 브랜드, 무드 키워드를 검색해보세요.</p>
        </div>
      </div>

      {/* SEC-361: Search Form */}
      <div className="card" style={{ padding: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <SearchIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '42px', height: '46px', fontSize: '15px' }}
              placeholder="찾으시는 라이프스타일 상품이나 키워드를 입력하세요..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '46px', padding: '0 24px', fontSize: '15px' }}>
            검색
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> 인기 검색어:
          </span>
          {['세라믹 머그', '린넨 셔츠', '포터블 무드등', '캔버스 토트백', '원목 오거나이저', '룸 스프레이'].map((k, i) => (
            <button
              key={i}
              type="button"
              className="badge badge-terracotta"
              style={{ border: 'none', cursor: 'pointer', padding: '4px 9px' }}
              onClick={() => {
                setQuery(k);
                performSearch(k);
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          검색 결과 ({searchResults.length}건)
        </h3>

        {searchResults.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <SearchIcon size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>일치하는 검색 결과가 없습니다. 다른 검색어를 입력해보세요.</p>
          </div>
        ) : (
          <div className="grid-layout grid-4">
            {searchResults.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
