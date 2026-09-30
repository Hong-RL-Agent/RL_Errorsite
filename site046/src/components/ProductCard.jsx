import React from 'react';
import { Heart, Plus, Star } from 'lucide-react';

export default function ProductCard({ product, onSelect, onAddToCart, isWishlisted, onToggleWishlist }) {
  const discountRate = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  return (
    <div className="product-card" onClick={() => onSelect(product)}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-tag">{product.badge}</span>}
        <button
          className={`wish-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          title={isWishlisted ? '찜 해제' : '찜하기'}
        >
          <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', fontSize: '12px', color: '#64748b' }}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontWeight: 700, color: '#1e293b' }}>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        {product.stock <= 5 && (
          <div className="stock-tag">남은수량 {product.stock}개 (품절임박)</div>
        )}

        <div className="product-prices">
          {discountRate > 0 && (
            <div className="original-price">{product.price.toLocaleString()}원</div>
          )}
          <div className="discount-row">
            {discountRate > 0 && <span className="discount-rate">{discountRate}%</span>}
            <span className="final-price">{product.discountPrice.toLocaleString()}원</span>
          </div>
        </div>

        <button
          className="card-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <Plus size={16} />
          <span>담기</span>
        </button>
      </div>
    </div>
  );
}
