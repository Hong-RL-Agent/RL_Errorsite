import React from 'react';
import { assetUrl, won } from '../api';

export default function ProductCard({ product, selected, onToggleCompare, onOpen }) {
  return (
    <article className={`product-card${selected ? ' is-selected' : ''}`}>
      <button type="button" className="card-thumb" onClick={() => onOpen(product.id)} aria-label={`${product.name} 상세 보기`}>
        <img src={assetUrl(product.thumbnailUrl)} alt={product.name} loading="lazy" />
      </button>
      <div className="card-body">
        <p className="card-brand">{product.brand.name} · {product.category.name}</p>
        <h3 className="card-name"><button type="button" onClick={() => onOpen(product.id)}>{product.name}</button></h3>
        <p className="card-price">{won(product.price)}</p>
        <p className="card-rating"><span className="star">★</span> {product.rating.toFixed(1)} <span className="muted">리뷰 {product.reviewCount.toLocaleString('ko-KR')}</span></p>
        <ul className="card-specs">
          {product.keySpecs.map((s) => (<li key={s.key}><span>{s.label}</span>{s.value}</li>))}
        </ul>
      </div>
      <label className="compare-check">
        <input type="checkbox" checked={selected} onChange={() => onToggleCompare(product)} />
        비교 담기
      </label>
    </article>
  );
}
