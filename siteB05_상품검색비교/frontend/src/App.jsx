import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { SearchProvider, useSearch } from './context/SearchContext';
import { CompareProvider, clearStoredComparison, useCompare } from './context/CompareContext';
import { useHashRoute } from './hooks/useHashRoute';
import Header from './components/Header';
import ComparePanel from './components/ComparePanel';
import SearchPage from './pages/SearchPage';
import BrowsePage from './pages/BrowsePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ComparePage from './pages/ComparePage';
import LibraryPage from './pages/LibraryPage';

function Shell({ onReset }) {
  const [route, navigate] = useHashRoute();
  const { openCompare } = useSearch();
  const { items, notice, removeProduct } = useCompare();

  const goCompare = () => { openCompare(); navigate('/compare'); };

  useEffect(() => { window.__compareLabReset = onReset; }, [onReset]);

  let page = null;
  if (route.name === 'product') page = <ProductDetailPage id={route.id} navigate={navigate} />;
  else if (route.name === 'compare') page = <ComparePage navigate={navigate} />;
  else if (route.name === 'browse') page = <BrowsePage navigate={navigate} />;
  else if (route.name === 'library') page = <LibraryPage navigate={navigate} />;
  else page = <SearchPage navigate={navigate} />;

  return (
    <div className="app">
      <Header route={route} navigate={navigate} />
      <main className="main">{page}</main>
      {notice && <div className="toast" role="status">{notice}</div>}
      {route.name !== 'compare' && <ComparePanel items={items} onRemove={removeProduct} onOpenCompare={goCompare} />}
      <footer className="site-footer">
        <span>CompareLab · 가상의 테스트 데이터로 구성된 학습용 서비스입니다.</span>
        <button type="button" className="link-btn" onClick={onReset}>데이터 초기화</button>
      </footer>
    </div>
  );
}

export default function App() {
  const [epoch, setEpoch] = useState(0);

  // 서버 데이터와 프론트엔드 상태(검색 필터, 비교 캐시)를 함께 초기 상태로 되돌린다.
  const onReset = useCallback(async () => {
    await api.reset();
    clearStoredComparison();
    window.__compareLabState = {};
    window.__compareLabActions = [];
    window.location.hash = '#/';
    setEpoch((e) => e + 1);
  }, []);

  return (
    <SearchProvider key={epoch}>
      <CompareProvider key={`c${epoch}`}>
        <Shell onReset={onReset} />
      </CompareProvider>
    </SearchProvider>
  );
}
