import React from 'react';
import { Compass, Calendar, ShoppingBag, ArrowRight, Star, ShieldCheck, Flame } from 'lucide-react';
import ClassCard from '../components/ClassCard';
import ProductCard from '../components/ProductCard';

export default function Home({ onNavigate, classes = [], products = [], onBookClass, onAddToCart, onBuyNow, favorites = [], onToggleFavorite }) {
  return (
    <div className="page-container">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <Flame size={14} /> 프리미엄 웰니스 라이프의 시작
          </div>
          <h2 className="hero-title">
            몸과 마음의 밸런스,<br />FitFlow에서 완벽하게 설계하세요
          </h2>
          <p className="hero-subtitle">
            강남·여의도 최고 수준의 검증된 강사진과 함께하는 프라이빗 PT, 힐링 요가, 고강도 필라테스 & 스피닝 클래스.
          </p>
          <div className="hero-cta-group">
            <button className="btn-lime" onClick={() => onNavigate('classes')}>
              인기 클래스 예약하기
            </button>
            <button className="btn-glass" onClick={() => onNavigate('calendar')}>
              수업 일정 확인
            </button>
          </div>
        </div>
      </section>

      {/* Featured Masterclasses */}
      <section style={{ marginBottom: 40 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">🔥 이번 주 마감 임박 클래스</h2>
            <p className="section-subtitle">실시간 잔여 좌석이 얼마 남지 않은 인기 추천 수업입니다.</p>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            전체 보기 <ArrowRight size={16} />
          </button>
        </div>

        <div className="class-grid">
          {classes.slice(0, 3).map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={() => onNavigate('classes')}
              onBook={onBookClass}
              isFavorite={favorites.includes(cls.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* Fitness Store Specials */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">🛍️ FitFlow 에센셜 기어 & 뉴트리션</h2>
            <p className="section-subtitle">전문 트레이너들이 직접 테스트하고 추천하는 공식 웰니스 용품입니다.</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            스토어 전체보기 <ArrowRight size={16} />
          </button>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
