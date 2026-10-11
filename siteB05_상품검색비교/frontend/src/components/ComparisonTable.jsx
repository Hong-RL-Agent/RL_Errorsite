import React from 'react';
import { assetUrl, won } from '../api';

// 상품을 열, 스펙/가격/평점을 행으로 배치하는 비교 테이블
export default function ComparisonTable({ products, onRemove, onOpen }) {
  if (!products.length) return null;
  const specRows = products[0].specs.map((s) => ({ key: s.key, label: s.label }));
  const lowest = Math.min(...products.map((p) => p.price));
  const bestRating = Math.max(...products.map((p) => p.rating));

  return (
    <div className="table-wrap">
      <table className="comparison-table" data-testid="comparison-table">
        <thead>
          <tr>
            <th scope="col" className="row-head">상품</th>
            {products.map((p) => (
              <th scope="col" key={p.id} data-product-id={p.id}>
                <img src={assetUrl(p.thumbnailUrl)} alt="" />
                <button type="button" className="link-btn name" onClick={() => onOpen(p.id)}>{p.name}</button>
                <span className="muted">{p.brand.name}</span>
                <button type="button" className="remove-btn" onClick={() => onRemove(p.id)} aria-label={`${p.name} 비교에서 제거`}>제거</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">최저가</th>
            {products.map((p) => (<td key={p.id} className={p.price === lowest ? 'best' : ''}>{won(p.price)}</td>))}
          </tr>
          <tr>
            <th scope="row">평점</th>
            {products.map((p) => (<td key={p.id} className={p.rating === bestRating ? 'best' : ''}>★ {p.rating.toFixed(1)} <span className="muted">({p.reviewCount.toLocaleString('ko-KR')})</span></td>))}
          </tr>
          {specRows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              {products.map((p) => {
                const s = p.specs.find((x) => x.key === row.key);
                return <td key={p.id}>{s ? s.value : '-'}</td>;
              })}
            </tr>
          ))}
          <tr>
            <th scope="row">특징</th>
            {products.map((p) => (<td key={p.id} className="small">{p.summary}</td>))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
