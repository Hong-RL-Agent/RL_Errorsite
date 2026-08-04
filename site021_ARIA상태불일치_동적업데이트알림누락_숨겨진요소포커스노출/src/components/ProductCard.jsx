import React from 'react';
import { Star, BarChart2 } from 'lucide-react';

export default function ProductCard({ product, onAddCompare, onClick }) {
  return (
    <div className="product-card" onClick={() => onClick(product)}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        <div className="flex items-center gap-10" style={{ marginBottom: '10px' }}>
          <Star size={16} fill="#ffc107" color="#ffc107" />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{product.rating}</span>
        </div>
        <div className="product-specs">{product.specs}</div>
        <div className="flex justify-between items-center" style={{ marginTop: '15px' }}>
          <div className="product-price">₩{product.price.toLocaleString()}</div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={(e) => {
              e.stopPropagation();
              onAddCompare(product);
            }}
          >
            <BarChart2 size={14} style={{ marginRight: '5px' }} /> 비교하기
          </button>
        </div>
      </div>
    </div>
  );
}
