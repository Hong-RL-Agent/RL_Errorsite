import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Zap, Tag, ShieldCheck } from 'lucide-react';

export default function Products({ products = [], onAddToCart, onBuyNow, showToast }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: '전체 용품' },
    { id: 'gear', label: '스트렝스 & 기어' },
    { id: 'accessory', label: '밴드 & 소도구' },
    { id: 'supplement', label: '프로틴 & 뉴트리션' },
    { id: 'wellness', label: '릴렉스 & 웰니스' }
  ];

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">FitFlow 공식 피트니스 스토어</h2>
          <p className="section-subtitle">운동 효율을 극대화하는 프리미엄 홈트레이닝 & 웰니스 필수 아이템</p>
        </div>
      </div>

      {/* Categories */}
      <div className="category-tabs">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`tab-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </div>
  );
}
