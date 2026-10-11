import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, buildProductQuery } from '../api';
import { useCompare } from '../context/CompareContext';
import ProductCard from '../components/ProductCard';

const PAGE_SIZE = 8;
const MAX_REQUESTS = 12;
const PRICE_CHIPS = [
  { label: '가격 전체', max: null },
  { label: '30만원 이하', max: 300000 },
  { label: '60만원 이하', max: 600000 },
  { label: '100만원 이하', max: 1000000 },
];

// 무한 스크롤 방식의 연속 탐색 화면
export default function BrowsePage({ navigate }) {
  const { isSelected, toggleProduct } = useCompare();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('monitor');
  const [maxPrice, setMaxPrice] = useState(null);
  const [feed, setFeed] = useState({ items: [], nextPage: 1, hasMore: true, loading: false, requests: 0, error: '' });
  const sentinelRef = useRef(null);
  const ticket = useRef(0);
  const feedRef = useRef(feed);
  feedRef.current = feed;

  useEffect(() => { api.categories().then((r) => setCategories(r.data)).catch(() => {}); }, []);

  const loadMore = useCallback(async (state, token) => {
    const params = { query: '', category, brands: [], minPrice: null, maxPrice, specs: {}, sort: 'popular' };
    try {
      const res = await api.listProducts(buildProductQuery(params, { limit: PAGE_SIZE, page: state.nextPage }));
      if (token !== ticket.current) return;
      setFeed((f) => ({
        items: [...f.items, ...res.data],
        nextPage: res.meta.nextPage || f.nextPage,
        hasMore: !!res.meta.hasMore && f.requests + 1 < MAX_REQUESTS,
        loading: false,
        requests: f.requests + 1,
        error: '',
      }));
    } catch (e) {
      if (token === ticket.current) setFeed((f) => ({ ...f, loading: false, hasMore: false, error: e.message }));
    }
  }, [category, maxPrice]);

  // 조건이 바뀌면 목록을 처음부터 다시 구성
  useEffect(() => {
    ticket.current += 1;
    const token = ticket.current;
    const fresh = { items: [], nextPage: 1, hasMore: true, loading: true, requests: 0, error: '' };
    setFeed(fresh);
    loadMore(fresh, token);
  }, [category, maxPrice, loadMore]);

  // 하단 영역이 보이면 다음 페이지 조회 (서버가 hasMore=false 를 주면 더 이상 요청하지 않음)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      const f = feedRef.current;
      if (!entries[0].isIntersecting) return;
      if (f.loading || !f.hasMore || f.requests >= MAX_REQUESTS || f.items.length === 0) return;
      feedRef.current = { ...f, loading: true };
      setFeed((cur) => ({ ...cur, loading: true }));
      loadMore(f, ticket.current);
    }, { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, feed.items.length, feed.hasMore]);

  const priceFiltered = maxPrice !== null;

  return (
    <div className="browse">
      <div className="results-head">
        <div>
          <h1>연속 탐색</h1>
          <p className="muted">스크롤하며 카테고리 상품을 이어서 확인해 보세요. 현재 {feed.items.length}개 표시 중</p>
        </div>
      </div>
      <div className="browse-controls">
        <div className="chip-group" aria-label="카테고리 선택">
          {categories.map((c) => (
            <button type="button" key={c.slug} className={`chip${category === c.slug ? ' on' : ''}`} onClick={() => setCategory(c.slug)}>{c.name}</button>
          ))}
        </div>
        <div className="chip-group" aria-label="가격 필터">
          {PRICE_CHIPS.map((c) => (
            <button type="button" key={c.label} className={`chip${maxPrice === c.max ? ' on' : ''}`} onClick={() => setMaxPrice(c.max)}>{c.label}</button>
          ))}
        </div>
      </div>

      <div className="product-grid wide">
        {feed.items.map((p) => (
          <ProductCard key={p.id} product={p} selected={isSelected(p.id)} onToggleCompare={toggleProduct} onOpen={(id) => navigate(`/product/${id}`)} />
        ))}
      </div>
      {feed.error && <p className="inline-error">{feed.error}</p>}

      <div className="feed-footer" ref={sentinelRef}>
        {feed.loading && <p className="muted">상품을 불러오는 중…</p>}
        {!feed.loading && feed.items.length > 0 && (
          // INTENTIONAL_ERROR: B05-ERR04
          // CSV Error: 무한 스크롤 중독 설계
          // Strategy: SEQUENCE_REPLAY
          // Description: 가격 필터가 적용된 목록은 서버가 hasMore=false 를 반환해도 종료 안내 없이 탐색 유도 영역을 유지함.
          (!feed.hasMore && !priceFiltered)
            ? <p className="feed-end" data-bug-id="B05-ERR04">모든 상품을 확인했습니다</p>
            : <p className="feed-more" data-bug-id="B05-ERR04">더 많은 상품을 확인하세요<span className="dots" aria-hidden="true"><i /><i /><i /></span></p>
        )}
      </div>
    </div>
  );
}
