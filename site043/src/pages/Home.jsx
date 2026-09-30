import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home({
  products = [],
  onSelectProduct,
  wishlist = [],
  onToggleWishlist,
  onNavigate,
  onAddToCart,
  onBuyNow
}) {
  const featured = products.slice(0, 8);

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-slider">
        <div className="hero-text">
          <div className="hero-pill">
            <Sparkles size={14} /> 2026 어텀/윈터 신규 홈 컬렉션
          </div>
          <h2 className="hero-title">
            머물수록 따뜻해지는 공간,<br />나만의 무드를 완성하세요
          </h2>
          <p className="hero-desc">
            자연을 닮은 원목 식탁부터 아늑한 부클레 체어, 세련된 아치형 조명까지. 프리미엄 인테리어 가구를 최대 35% 특별 혜택으로 만나보세요.
          </p>
          <button className="hero-btn" onClick={() => onNavigate('products')}>
            신규 컬렉션 쇼핑하기 <ArrowRight size={16} />
          </button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80"
          alt="Home interior"
          style={{ width: '42%', height: 320, objectFit: 'cover', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
        />
      </section>

      {/* Value Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 48 }}>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #e9e3da', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Truck size={24} color="#855b32" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1f1d1a' }}>전국 무료 안전 배송</div>
            <div style={{ fontSize: 12, color: '#6b645b' }}>대형 가구 전문 기사 직접 방문</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #e9e3da', display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShieldCheck size={24} color="#5b6b4e" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1f1d1a' }}>100% 정품 품질 보증</div>
            <div style={{ fontSize: 12, color: '#6b645b' }}>3년 무상 A/S 보증 케어</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '1px solid #e9e3da', display: 'flex', alignItems: 'center', gap: 14 }}>
          <RotateCcw size={24} color="#855b32" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1f1d1a' }}>공간 배치 3D 시뮬레이션</div>
            <div style={{ fontSize: 12, color: '#6b645b' }}>우리 집에 어울리는 가구 매칭</div>
          </div>
        </div>
      </div>

      {/* Popular Products */}
      <section>
        <div className="section-head">
          <div>
            <h2>🌟 인기 베스트 가구 & 인테리어</h2>
            <p>Roomly 회원들이 가장 많이 선택한 감각적인 스테디셀러</p>
          </div>
        </div>

        <div className="product-grid">
          {featured.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
              isWishlisted={wishlist.some((w) => w.productId === prod.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
