import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Zap, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ProductDetail({
  product,
  onBack,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow
}) {
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '기본');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discountRate = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b645b', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 24 }}
      >
        <ArrowLeft size={16} /> 목록으로 돌아가기
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 48, marginBottom: 56 }}>
        {/* Product Image */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 460, background: '#f6f3ee' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {product.status === 'discontinued' && (
            <span className="status-badge discontinued" style={{ top: 20, left: 20, fontSize: 13, padding: '6px 14px' }}>
              판매종료 (단종 상품)
            </span>
          )}
        </div>

        {/* Info & Purchase */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#855b32', textTransform: 'uppercase', marginBottom: 6 }}>
            {product.brand}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1f1d1a', marginBottom: 12, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 14, color: '#6b645b' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700, color: '#1f1d1a' }}>{product.rating}</span>
            <span>({product.reviewCount}개의 실제 구매 후기)</span>
          </div>

          <div style={{ padding: '20px 0', borderTop: '1px solid #e9e3da', borderBottom: '1px solid #e9e3da', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              {discountRate > 0 && <span style={{ fontSize: 24, fontWeight: 800, color: '#855b32' }}>{discountRate}%</span>}
              <span style={{ fontSize: 28, fontWeight: 800, color: '#1f1d1a' }}>
                {product.discountPrice.toLocaleString()}원
              </span>
              {discountRate > 0 && (
                <span style={{ fontSize: 16, color: '#9e968b', textDecoration: 'line-through' }}>
                  {product.price.toLocaleString()}원
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#5b6b4e', fontWeight: 600, marginTop: 6 }}>
              ✓ 신규 가입 10% 쿠폰 & 20,000원 즉시 할인 중복 적용 가능
            </p>
          </div>

          <p style={{ fontSize: 14, color: '#4a443c', lineHeight: 1.7, marginBottom: 24 }}>
            {product.description}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="form-group">
              <label className="form-label">색상 / 패브릭 옵션</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: selectedColor === c ? '2px solid #855b32' : '1px solid #e9e3da',
                      background: selectedColor === c ? '#fbf5ee' : '#ffffff',
                      color: selectedColor === c ? '#855b32' : '#1f1d1a',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>구매 수량</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e9e3da', borderRadius: 10 }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '6px 14px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                -
              </button>
              <span style={{ padding: '6px 12px', fontSize: 14, fontWeight: 700 }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '6px 14px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <button
              onClick={() => onToggleWishlist(product)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                border: '1px solid #e9e3da',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isWishlisted ? '#ef4444' : '#6b645b'
              }}
            >
              <Heart size={22} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>

            <button
              onClick={() => onAddToCart(product, quantity, selectedColor)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: '1px solid #855b32',
                background: '#ffffff',
                color: '#855b32',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <ShoppingBag size={18} />
              장바구니 담기
            </button>

            <button
              onClick={() => onBuyNow(product, quantity, selectedColor)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: '#855b32',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Zap size={18} />
              바로구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
