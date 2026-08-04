import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAddCompare, onProductClick }) {
  if (products.length === 0) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>검색 결과가 없습니다.</div>;
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddCompare={onAddCompare} 
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}
