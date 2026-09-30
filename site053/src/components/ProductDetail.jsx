import React, { useState } from 'react';
import SellerProfile from './SellerProfile';
import ReportModal from './ReportModal';
import { api } from '../api/client';

export default function ProductDetail({ product, seller, onBack, onStartChat, isLiked = false, onToggleLike, showToast }) {
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(product?.likes || 0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!product) return null;

  const handleLikeClick = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (nextLiked) {
        await api.likeProduct(product.id);
        if (showToast) showToast('관심 상품(찜)에 등록되었습니다! 🧡', 'success');
      } else {
        await api.unlikeProduct(product.id);
        if (showToast) showToast('관심 상품에서 해제되었습니다.', 'info');
      }
      if (onToggleLike) onToggleLike(product.id, nextLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'];

  return (
    <div>
      {/* Breadcrumbs */}
      <div style={{ marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-solid-secondary" onClick={onBack} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          ← 목록으로 돌아가기
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          홈 &gt; {product.category} &gt; <strong>{product.title.slice(0, 18)}...</strong>
        </span>
      </div>

      <div className="product-detail-grid">
        {/* Left Media & Description */}
        <div>
          <div className="gallery-stage">
            <img src={images[activeImageIdx] || images[0]} alt={product.title} />
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: `2.5px solid ${activeImageIdx === idx ? 'var(--primary)' : 'var(--border-light)'}`,
                    cursor: 'pointer',
                    transform: activeImageIdx === idx ? 'scale(1.05)' : 'scale(1)',
                    transition: 'var(--transition)'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          <div className="description-sheet">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: '800',
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                {product.category}
              </span>
              <span style={{
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                {product.tradeMethod}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '14px', lineHeight: '1.3' }}>
              {product.title}
            </h1>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span>📍 {product.location}</span>
              <span>·</span>
              <span>상태: <strong style={{ color: 'var(--text-main)' }}>{product.condition}</strong></span>
              <span>·</span>
              <span>조회 {product.views || 0}</span>
              <span>·</span>
              <span>찜 {likesCount}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '24px 0' }} />

            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '14px' }}>
              상품 상세 설명
            </div>

            {/* INTENTIONAL BACKEND BUG: site053-SEC-442 observation */}
            {/* If product.description had newlines collapsed on save, rendered as single space block */}
            <div className="description-text-body" style={{ minHeight: '130px' }}>
              {product.description}
            </div>

            <div style={{
              marginTop: '36px',
              padding: '20px 24px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: '#9a3412',
              display: 'flex',
              gap: '14px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '1.6rem' }}>💡</span>
              <div>
                <strong>안심 직거래 팁:</strong> 판매자와 1:1 채팅을 통해 거래 장소와 시간을 확정하고, 현장에서 물건 상태를 확인한 후 거래를 마무리하세요.
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Column */}
        <div>
          <SellerProfile seller={seller} />

          {/* Pricing & Call to Actions */}
          <div style={{
            background: 'white',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px' }}>
              판매 가격
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '22px' }}>
              {Number(product.price) === 0 ? '무료나눔 🧡' : `${Number(product.price).toLocaleString('ko-KR')}원`}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                className="btn-solid-secondary"
                style={{
                  flex: '0 0 62px',
                  fontSize: '1.4rem',
                  color: liked ? 'var(--primary)' : 'var(--text-muted)',
                  border: liked ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                  background: liked ? 'var(--primary-light)' : 'white'
                }}
                onClick={handleLikeClick}
                title="관심 상품 찜"
              >
                {liked ? '♥' : '♡'}
              </button>
              <button
                className="btn-solid-primary"
                style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}
                onClick={() => onStartChat && onStartChat(product)}
              >
                <span>💬</span>
                <span>채팅으로 거래하기</span>
              </button>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                padding: '8px 0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>🚨</span>
              <span>허위매물 또는 비매너 게시글 신고하기</span>
            </button>
          </div>

          {/* Map Location Preview */}
          <div style={{
            background: 'white',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📍</span>
              <span>거래 희망 장소</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '14px' }}>
              {product.location}
            </div>
            <div style={{
              height: '120px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px',
              color: '#1e40af',
              fontSize: '0.85rem',
              fontWeight: '800'
            }}>
              <span style={{ fontSize: '1.8rem' }}>📍</span>
              <span>{product.location.split(' ').slice(-1)[0]} 인근 안전 구역 직거래</span>
            </div>
          </div>
        </div>
      </div>

      {isReportOpen && (
        <ReportModal
          productId={product.id}
          onClose={() => setIsReportOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
