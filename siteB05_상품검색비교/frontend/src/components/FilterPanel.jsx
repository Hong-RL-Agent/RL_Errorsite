import React, { useEffect, useRef, useState } from 'react';
import { won } from '../api';

// 좌측 상세 조건 필터. 가격/브랜드/스펙 조건을 부모 상태(filters)와 동기화한다.
export default function FilterPanel({ defs, filters, onChange, onToggleBrand, onToggleSpec, onReset, showSpecs = true }) {
  const { min, max } = defs.priceRange;
  const [range, setRange] = useState([min, max]);
  const timer = useRef(null);

  useEffect(() => {
    setRange([filters.minPrice ?? min, filters.maxPrice ?? max]);
  }, [filters.minPrice, filters.maxPrice, min, max]);

  const commit = (lo, hi) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onChange({ minPrice: lo <= min ? null : lo, maxPrice: hi >= max ? null : hi });
    }, 350);
  };

  const slide = (idx, raw) => {
    const v = Number(raw);
    const next = idx === 0 ? [Math.min(v, range[1]), range[1]] : [range[0], Math.max(v, range[0])];
    setRange(next);
    commit(next[0], next[1]);
  };

  const step = Math.max(10000, Math.round((max - min) / 100 / 10000) * 10000);

  return (
    <aside className="filter-panel" data-bug-id="B05-ERR01">
      <div className="filter-head">
        <h2>상세 조건</h2>
        <button type="button" className="link-btn" onClick={onReset}>필터 초기화</button>
      </div>

      <section className="filter-group">
        <h3>가격 범위</h3>
        {max > min ? (
          <>
            <div className="price-readout"><span>{won(range[0])}</span><span>~</span><span>{won(range[1])}</span></div>
            <div className="dual-range">
              <input type="range" min={min} max={max} step={step} value={range[0]} onChange={(e) => slide(0, e.target.value)} aria-label="최소 가격" />
              <input type="range" min={min} max={max} step={step} value={range[1]} onChange={(e) => slide(1, e.target.value)} aria-label="최대 가격" />
            </div>
          </>
        ) : <p className="muted">가격 정보를 불러오는 중…</p>}
      </section>

      <section className="filter-group">
        <h3>브랜드 {filters.brands.length > 0 && <span className="count-pill">{filters.brands.length}</span>}</h3>
        <ul className="check-list scroll">
          {defs.brands.map((b) => (
            <li key={b.id}>
              <label>
                <input type="checkbox" checked={filters.brands.includes(b.id)} onChange={() => onToggleBrand(b.id)} />
                {b.name} <span className="muted">({b.productCount})</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {showSpecs && (
        <section className="filter-group">
          <h3>스펙 조건</h3>
          {defs.specs.length === 0 && <p className="muted">카테고리를 선택하면 상세 스펙 조건을 사용할 수 있어요.</p>}
          {defs.specs.map((s) => (
            <div className="spec-block" key={s.key}>
              <h4>{s.label}</h4>
              <ul className="check-list inline">
                {s.options.map((o) => (
                  <li key={o}>
                    <label className={(filters.specs[s.key] || []).includes(o) ? 'on' : ''}>
                      <input type="checkbox" checked={(filters.specs[s.key] || []).includes(o)} onChange={() => onToggleSpec(s.key, o)} />
                      {o}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </aside>
  );
}
