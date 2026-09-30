import React from 'react';
import { User, Tag, ShoppingBag, Heart, Package, ShieldCheck, Award } from 'lucide-react';

export default function MyPage({ user, onNavigate }) {
  if (!user) return null;

  return (
    <div>
      {/* Profile Summary Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: 36,
          border: '1px solid #e9e3da',
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap'
        }}
      >
        <img
          src={user.avatar}
          alt={user.name}
          style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #855b32' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1f1d1a' }}>{user.name} 회원님</h2>
            <span style={{ background: '#fbf5ee', color: '#855b32', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 9999 }}>
              {user.grade}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#6b645b', marginBottom: 12 }}>
            {user.email} · {user.phone}
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: '#1f1d1a', fontWeight: 600 }}>
            <span>적립 포인트: <strong style={{ color: '#855b32' }}>{user.points.toLocaleString()} P</strong></span>
            <span>보유 쿠폰: <strong>4장</strong></span>
            <span>기본 배송지: 서초구 래미안 파크</span>
          </div>
        </div>
      </div>

      {/* Quick Menu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div
          onClick={() => onNavigate('orders')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e9e3da', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Package size={28} color="#855b32" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1f1d1a', marginBottom: 4 }}>주문 및 배송 조회</h4>
          <p style={{ fontSize: 13, color: '#6b645b' }}>배송 상태 실시간 트래킹 및 주문 내역 확인</p>
        </div>

        <div
          onClick={() => onNavigate('wishlist')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e9e3da', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Heart size={28} color="#ef4444" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1f1d1a', marginBottom: 4 }}>찜한 가구 컬렉션</h4>
          <p style={{ fontSize: 13, color: '#6b645b' }}>내가 관심 등록한 인테리어 소품 관리</p>
        </div>

        <div
          onClick={() => onNavigate('reviews')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e9e3da', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Award size={28} color="#5b6b4e" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1f1d1a', marginBottom: 4 }}>내가 작성한 상품 리뷰</h4>
          <p style={{ fontSize: 13, color: '#6b645b' }}>포토 후기 작성하고 5,000P 적립 받기</p>
        </div>
      </div>
    </div>
  );
}
