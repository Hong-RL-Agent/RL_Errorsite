import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Sparkles, Truck, ShieldCheck, Clock } from 'lucide-react';

export default function Home({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  wishlistIds,
  onToggleWishlist,
  sortBy,
  onSortChange
}) {
  return (
    <div>
      {/* Category Pills Bar */}
      <div className="category-bar">
        <div className="category-bar-inner">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="main-wrapper">
        {/* Hero Promo Banner */}
        <div className="hero-banner">
          <div className="hero-text">
            <h2>매일 아침 식탁을 채우는<br />FreshCart 신선 당일배송</h2>
            <p>신선도 100% 보장 · 수도권 전 지역 새벽 7시 도착 보장</p>
            <div className="hero-badges">
              <div className="hero-chip">✨ 40,000원 이상 무료배송</div>
              <div className="hero-chip">🚚 냉장 직배송 시스템</div>
              <div className="hero-chip">🎁 신규가입 5,000원 쿠폰</div>
            </div>
          </div>
        </div>

        {/* Benefits bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}><Truck size={22} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>새벽 & 당일 배송</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>원하는 시간대 지정 배송</div>
            </div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}><ShieldCheck size={22} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>100% 신선 보장제</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>품질 불만족 시 무조건 환불</div>
            </div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}><Clock size={22} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>밤 11시 마감</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>오늘 밤 시키면 내일 아침 도착</div>
            </div>
          </div>
        </div>

        {/* Product Grid Section */}
        <div className="section-header">
          <div className="section-title">
            <Sparkles size={20} color="#10b981" />
            <span>오늘의 신선 추천 상품</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              (총 {products.length}개)
            </span>
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="popular">인기순</option>
            <option value="price_asc">낮은 가격순</option>
            <option value="price_desc">높은 가격순</option>
            <option value="rating">평점 높은순</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 600 }}>검색 또는 선택한 카테고리에 해당하는 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
