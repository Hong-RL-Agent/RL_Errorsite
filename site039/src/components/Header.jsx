import React from 'react';
import { Search, ShoppingCart, Bell, Heart, User, Compass } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, cartCount = 0, onSearchClick }) {
  const pageTitles = {
    home: '데일리 라이프스타일 큐레이션',
    products: '라이프스타일 상품 컬렉션',
    'product-detail': '상품 상세 정보',
    search: '스마트 상품 검색',
    reservations: '홈스타일링 & 도예 클래스 예약',
    cart: '쇼핑백 (장바구니)',
    checkout: '주문서 작성 및 결제',
    orders: '주문 내역 & 배송 조회',
    reviews: '구매 고객 리뷰 & 상품 댓글',
    inquiries: '1:1 고객 문의 게시판',
    files: '무드보드 & 첨부 파일 관리',
    profile: '마이페이지 & 프로필 관리'
  };

  return (
    <header className="app-header">
      <div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
          {pageTitles[activeTab] || 'DailyPick Lifestyle'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('search')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Search size={15} color="var(--primary)" /> 검색하기
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('cart')}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ShoppingCart size={15} color="var(--primary)" /> 장바구니
          {cartCount > 0 && (
            <span style={{
              background: 'var(--primary)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '8px'
            }}>
              {cartCount}
            </span>
          )}
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setActiveTab('reservations')}
        >
          클래스 예약
        </button>
      </div>
    </header>
  );
}
