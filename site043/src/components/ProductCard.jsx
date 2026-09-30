import React from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';

export default function ProductCard({
  product,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow
}) {
  const discountRate = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  return (
    <div className="product-card">
      <div className="card-img-wrap" onClick={() => onSelect(product)}>
        <img src={product.image} alt={product.name} className="card-img" />
        
        {product.status === 'discontinued' && (
          <span className="status-badge discontinued">판매종료</span>
        )}

        <button
          className={`card-wish-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          title="찜하기"
        >
          <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="card-info">
        <div className="card-brand">{product.brand}</div>
        <h3 className="card-name" onClick={() => onSelect(product)}>
          {product.name}
        </h3>

        <div className="card-price-row">
          {discountRate > 0 && <span className="discount-rate">{discountRate}%</span>}
          <span className="final-price">{product.discountPrice.toLocaleString()}원</span>
          {discountRate > 0 && <span className="orig-price">{product.price.toLocaleString()}원</span>}
        </div>

        <div className="card-rating-row">
          <Star size={13} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontWeight: 700, color: '#1f1d1a' }}>{product.rating}</span>
          <span>({product.reviewCount})</span>
          <span style={{ marginLeft: 'auto', color: '#6b645b' }}>무료배송</span>
        </div>
      </div>
    </div>
  );
}
