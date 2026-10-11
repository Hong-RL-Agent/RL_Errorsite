import React from 'react';
import { won } from '../api';

export default function PriceBars({ products }) {
  const max = Math.max(...products.map((p) => p.price), 1);
  return (
    <div className="price-bars" role="img" aria-label="상품별 가격 비교 그래프">
      {products.map((p) => (
        <div className="bar-row" key={p.id}>
          <span className="bar-label">{p.name}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(p.price / max) * 100}%` }} /></div>
          <span className="bar-value">{won(p.price)}</span>
        </div>
      ))}
    </div>
  );
}
