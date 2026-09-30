import React from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product, onSelect, onAddToCart }) {
  return (
    <div className="product-card" onClick={() => onSelect(product)} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrapper">
        <img src={product.thumbnail} alt={product.name} className="product-img" />
        {product.isBest && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            BEST
          </span>
        )}
        {product.discountRate > 0 && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#e11d48',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '3px 7px',
            borderRadius: '4px'
          }}>
            {product.discountRate}% OFF
          </span>
        )}
      </div>

      <div className="product-content">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
          {product.brand}
        </div>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '8px',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: '38px'
        }}>
          {product.name}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px', fontSize: '12px', color: '#f59e0b' }}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <strong style={{ color: 'var(--text-main)' }}>{product.rating}</strong>
          <span style={{ color: 'var(--text-light)' }}>({product.reviewCount})</span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {product.discountRate > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-light)', textDecoration: 'line-through', marginRight: '6px' }}>
                ₩{product.price.toLocaleString()}
              </span>
            )}
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
              ₩{(product.finalPrice || product.price).toLocaleString()}
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            style={{ padding: '6px 10px' }}
            title="장바구니 담기"
          >
            <ShoppingCart size={15} color="var(--primary)" />
          </button>
        </div>
      </div>
    </div>
  );
}
