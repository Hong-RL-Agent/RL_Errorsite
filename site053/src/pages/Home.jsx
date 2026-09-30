import React, { useState, useEffect } from 'react';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';

export default function Home({
  setActivePage,
  onSelectProduct,
  onSelectCategory,
  onStartChat,
  likedProductIds = [],
  currentLocation = '서울 마포구 망원동',
  onSearch
}) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const trendingTags = [
    '아이패드',
    '다이슨 청소기',
    '캠핑 체어',
    '소니 헤드폰',
    '닌텐도 스위치',
    '이케아 가구',
    '스타벅스',
    '나이키 운동화',
    '원목 식탁'
  ];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        if (prodRes && prodRes.products) {
          setPopularProducts(prodRes.products.slice(0, 4));
          setRecentProducts(prodRes.products.slice(4, 16));
        }
        if (catRes && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHomeData();
  }, []);

  const handleTagClick = (tag) => {
    if (onSearch) onSearch(tag);
    setActivePage('products');
  };

  return (
    <div>
      {/* Category Nav Carousel */}
      <CategoryNav
        categories={categories}
        selectedCategory=""
        onSelectCategory={(catName) => {
          if (onSelectCategory) onSelectCategory(catName);
          setActivePage('products');
        }}
      />

      {/* Hero Showcase Commercial Banner */}
      <div className="hero-showcase">
        <div>
          <div className="hero-pill-badge">
            <span>✨</span>
            <span>{currentLocation.split(' ').slice(-1)[0]} 지역 인증 중고거래 포털</span>
          </div>
          <h1 className="hero-main-title">
            이웃과 함께하는<br />
            가장 안전한 <span>스마트 중고거래</span>
          </h1>
          <p className="hero-sub-title">
            가까운 거리에서 직접 확인하고 결제하는 안심 직거래부터 문 앞 비대면 거래까지 편하게 시작해보세요.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn-solid-primary" onClick={() => setActivePage('sell')}>
              <span>📦</span>
              <span>판매 상품 등록하기</span>
            </button>
            <button className="btn-solid-secondary" onClick={() => setActivePage('products')}>
              <span>인기 상품 둘러보기</span>
            </button>
          </div>

          <div className="hero-stats-badge-wrap">
            <div className="hero-stat-box">
              <span className="hero-stat-value">1,420+</span>
              <span className="hero-stat-desc">동네 활성 이웃</span>
            </div>
            <div className="hero-stat-box">
              <span className="hero-stat-value">99.1%</span>
              <span className="hero-stat-desc">직거래 만족도</span>
            </div>
            <div className="hero-stat-box">
              <span className="hero-stat-value">41.2℃</span>
              <span className="hero-stat-desc">평균 매너온도</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '5.5rem', filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.4))' }}>
            🛍️
          </div>
        </div>
      </div>

      {/* Trending Search Chips */}
      <div className="trending-bar">
        <span className="trending-title-label">🔥 실시간 인기 키워드:</span>
        {trendingTags.map((tag, idx) => (
          <button key={idx} className="trending-tag-chip" onClick={() => handleTagClick(tag)}>
            #{tag}
          </button>
        ))}
      </div>

      {/* Section 1: Popular Hot Listings */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-header-row">
          <div>
            <h2 className="section-main-heading">🔥 지금 가장 인기 있는 중고 매물</h2>
            <div className="section-sub-heading">동네 주민들이 가장 많이 찜하고 채팅 문의 중인 상품입니다.</div>
          </div>
          <button className="btn-view-all" onClick={() => setActivePage('products')}>
            더보기 →
          </button>
        </div>

        <div className="products-grid">
          {popularProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
              isLiked={likedProductIds.includes(p.id)}
            />
          ))}
        </div>
      </section>

      {/* Trust & Safe Guarantee Banner */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        marginBottom: '48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            🤝
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              100% 동네 안심 직거래
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              가까운 지하철역 출구나 주민센터 앞에서 만나 물건을 직접 확인하고 거래하세요.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            🚪
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              비대면 문 앞 거래 지원
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              서로 시간이 맞지 않을 땐 계좌 송금 후 문 앞 픽업으로 빠르고 편리하게!
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            🌡️
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              매너온도 안심 이웃 시스템
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              누적된 거래 후기와 매너 평가 데이터를 바탕으로 검증된 이웃과 소통하세요.
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Recently Listed Items */}
      <section style={{ marginBottom: '48px' }}>
        <div className="section-header-row">
          <div>
            <h2 className="section-main-heading">📦 우리 동네 실시간 신규 등록 매물</h2>
            <div className="section-sub-heading">방금 이웃이 등록한 따끈따끈한 중고 물품을 확인해보세요.</div>
          </div>
          <button className="btn-view-all" onClick={() => setActivePage('products')}>
            전체 매물 보기 →
          </button>
        </div>

        <div className="products-grid">
          {recentProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
              isLiked={likedProductIds.includes(p.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
