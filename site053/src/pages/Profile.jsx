import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';

export default function Profile({ onSelectProduct, setActivePage, likedProductIds = [] }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('sales'); // sales, likes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await api.getProfile();
        if (res && res.success) {
          setProfile(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const user = profile?.user || {
    nickname: '망원동당근이',
    location: '서울 마포구 망원동',
    mannerScore: 41.5,
    reviewCount: 38,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  };

  const myProducts = profile?.myProducts || [];
  const myLikes = profile?.myLikes || [];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
          마이페이지
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          내 판매 내역과 관심 상품, 매너온도 및 활동 지표를 관리하세요.
        </p>
      </div>

      {/* User Overview Dashboard Card */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={user.avatar}
            alt=""
            style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
          />
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-main)' }}>
              {user.nickname}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              📍 {user.location} · 거래 후기 <strong>{user.reviewCount}개</strong>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', background: 'var(--bg-subtle)', padding: '16px 24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>내 매너온도</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>
            {user.mannerScore.toFixed(1)}°C 🔥
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '24px' }}>
        <button
          className={`btn-solid-secondary ${activeTab === 'sales' ? 'btn-solid-primary' : ''}`}
          style={{ padding: '10px 22px', borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveTab('sales')}
        >
          📦 내 판매 상품 ({myProducts.length})
        </button>
        <button
          className={`btn-solid-secondary ${activeTab === 'likes' ? 'btn-solid-primary' : ''}`}
          style={{ padding: '10px 22px', borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveTab('likes')}
        >
          🧡 관심 찜 상품 ({myLikes.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sales' && (
        myProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>현재 판매 중인 상품이 없습니다.</div>
            <div>
              <button className="btn-solid-primary" onClick={() => setActivePage('sell')}>
                + 판매글 등록하기
              </button>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {myProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
                isLiked={likedProductIds.includes(p.id)}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'likes' && (
        myLikes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧡</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>찜한 관심 상품이 없습니다.</div>
          </div>
        ) : (
          <div className="products-grid">
            {myLikes.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
                isLiked={true}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
