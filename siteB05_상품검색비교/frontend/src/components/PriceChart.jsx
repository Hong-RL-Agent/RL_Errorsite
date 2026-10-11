import React, { useMemo } from 'react';
import { won } from '../api';

export default function PriceChart({ points }) {
  const geo = useMemo(() => {
    if (!points.length) return null;
    const W = 560; const H = 220; const pad = { l: 64, r: 16, t: 16, b: 32 };
    const prices = points.map((p) => p.price);
    const lo = Math.min(...prices); const hi = Math.max(...prices);
    const span = hi - lo || 1;
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, points.length - 1);
    const y = (v) => pad.t + (1 - (v - lo) / span) * (H - pad.t - pad.b);
    return { W, H, pad, lo, hi, x, y, path: points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.price)}`).join(' ') };
  }, [points]);

  if (!geo) return <p className="muted">가격 변화 정보가 없습니다.</p>;
  const { W, H, pad, lo, hi, x, y, path } = geo;
  return (
    <svg className="price-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="가격 추이 차트">
      {[lo, (lo + hi) / 2, hi].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="grid" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="axis">{Math.round(v / 1000).toLocaleString('ko-KR')}천</text>
        </g>
      ))}
      <path d={path} className="line" />
      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(i)} cy={y(p.price)} r="4" className="dot"><title>{`${p.date} ${won(p.price)}`}</title></circle>
          <text x={x(i)} y={H - 10} textAnchor="middle" className="axis">{p.date.slice(5, 7)}월</text>
        </g>
      ))}
    </svg>
  );
}
