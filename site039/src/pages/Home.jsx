import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Compass, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home({ onNavigate, onSelectProduct, onAddToCart }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #242220 0%, #3a3633 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 40px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(188, 108, 37, 0.25)',
            border: '1px solid rgba(188, 108, 37, 0.5)',
            color: '#fde047',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            <Sparkles size={13} /> 2026 AUTUMN LIFESTYLE CURATION
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            취향과 온기가 머무는<br />나만의 일상 라이프스타일
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#d6d3d1', marginBottom: '24px', lineHeight: 1.6 }}>
            손끝에 닿는 자연스러운 린넨의 결부터 차분한 흙내음의 세라믹까지, 일상의 소소한 순간을 특별하게 채워줄 큐레이션을 제안합니다.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('products')}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #bc6c25 0%, #935638 100%)' }}
            >
              컬렉션 둘러보기 <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('reservations')}
              style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              쇼룸 & 클래스 예약
            </button>
          </div>
        </div>
      </div>

      {/* Feature Value Props */}
      <div className="grid-layout grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>무료 안심 배송</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>5만원 이상 구매 시 전 상품 무료 배송</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>100% 검수 핸드크래프트</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>작가 및 아틀리에 보증 정품 큐레이션</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>1:1 맞춤 홈스타일링</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>공간 무드에 맞춘 전문 컨설팅 예약</div>
          </div>
        </div>
      </div>

      {/* Featured Best Products */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              이달의 베스트 큐레이션
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>가장 많은 고객들이 선택한 스테디셀러 아이템</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('products')}
          >
            전체보기 <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-layout grid-4">
          {dashboardData?.featuredProducts?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
