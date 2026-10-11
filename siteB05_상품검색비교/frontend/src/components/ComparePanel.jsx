import React from 'react';
import { assetUrl } from '../api';
import { MAX_COMPARE } from '../context/CompareContext';

// 하단 비교 바
export default function ComparePanel({ items, onRemove, onOpenCompare }) {
  if (!items.length) return null;
  const slots = Array.from({ length: MAX_COMPARE }, (_, i) => items[i] || null);
  return (
    <div className="compare-bar" role="region" aria-label="비교 바">
      <div className="compare-bar-inner">
        <strong>비교 상품 {items.length}/{MAX_COMPARE}</strong>
        <ul className="compare-slots">
          {slots.map((p, i) => (
            <li key={p ? p.id : `empty-${i}`} className={p ? 'filled' : 'empty'}>
              {p ? (
                <>
                  <img src={assetUrl(p.thumbnailUrl)} alt="" />
                  <span>{p.name}</span>
                  <button type="button" onClick={() => onRemove(p.id)} aria-label={`${p.name} 제거`}>×</button>
                </>
              ) : <span className="muted">상품을 추가하세요</span>}
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-accent" disabled={items.length < 2} onClick={onOpenCompare}>상품 비교</button>
      </div>
    </div>
  );
}
