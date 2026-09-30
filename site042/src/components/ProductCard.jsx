import React from 'react';
import { ShoppingBag, Star, Zap } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.title} className="product-image" />
      </div>

      <div className="product-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f59e0b' }}>
            <Star size={13} fill="#f59e0b" />
            <span style={{ fontWeight: 700 }}>{product.rating}</span>
          </div>
          <span className={`stock-tag ${product.stock <= 2 ? 'low' : ''}`}>
            재고 {product.stock}개
          </span>
        </div>

        <h4 className="product-title">{product.title}</h4>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>

        <div className="product-price-row">
          <span className="current-price">{product.currentPrice.toLocaleString()}원</span>
          {product.oldPrice && (
            <span className="old-price">{product.oldPrice.toLocaleString()}원</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button
            className="btn-cart"
            onClick={() => onAddToCart(product)}
            style={{ flex: 1 }}
          >
            <ShoppingBag size={15} />
            담기
          </button>
          <button
            className="btn-lime"
            onClick={() => onBuyNow(product)}
            style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Zap size={14} />
            바로구매
          </button>
        </div>
      </div>
    </div>
  );
}
