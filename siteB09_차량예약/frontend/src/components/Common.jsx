import React, { useEffect } from 'react';
import { TRIP_LABEL, VEHICLE_LABEL } from '../api';

export function StatusBadge({ kind = 'trip', value }) {
  const label = kind === 'trip' ? TRIP_LABEL[value] : VEHICLE_LABEL[value];
  return <span className={`badge ${kind}-${value}`} data-status={value}>{label || value}</span>;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function StepTracker({ current }) {
  const steps = ['보험 선택', '부가 옵션', '운전자 정보', '예약 확인'];
  return (
    <ol className="stepper" aria-label="예약 단계">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'now' : ''}>
          <span className="n">{i < current ? '✓' : i + 1}</span>{s}
        </li>
      ))}
    </ol>
  );
}

export function SpecRow({ label, value }) {
  return (<div className="spec-row"><dt>{label}</dt><dd>{value}</dd></div>);
}

export function PriceLines({ quote }) {
  if (!quote) return <p className="muted">금액을 계산하는 중…</p>;
  const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;
  return (
    <div className="price-lines">
      <div className="pl"><span>기본 대여료 ({quote.days}일{quote.durationDiscountPct ? ` · 장기할인 ${quote.durationDiscountPct}%` : ''})</span><b>{won(quote.rentalFee)}</b></div>
      <div className="pl sub"><span>{quote.seasonName} 요금 ×{quote.seasonMultiplier}</span></div>
      {quote.oneWayFee > 0 && <div className="pl"><span>편도 반납 수수료</span><b>{won(quote.oneWayFee)}</b></div>}
      <div className="pl"><span>기본 보험</span><b>포함</b></div>
      {quote.protection.map((p) => (<div className="pl" key={p.id} data-line="protection"><span>{p.name}</span><b>{won(p.amount)}</b></div>))}
      {quote.addons.map((a) => (<div className="pl" key={a.id} data-line="addon"><span>{a.name} ×{a.qty}</span><b>{won(a.amount)}</b></div>))}
      <div className="pl total"><span>총 예상 금액</span><b>{won(quote.total)}</b></div>
    </div>
  );
}
