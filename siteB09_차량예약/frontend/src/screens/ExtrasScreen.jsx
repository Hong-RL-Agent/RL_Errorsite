import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, won } from '../api';
import { useFlow } from '../flows/BookingFlow';
import { PriceLines, StepTracker } from '../components/Common';

export default function ExtrasScreen() {
  const flow = useFlow();
  const navigate = useNavigate();
  const [addons, setAddons] = useState([]);
  const [quote, setQuote] = useState(null);

  useEffect(() => { api.addons().then((r) => setAddons(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    if (!flow.vehicle || !flow.criteria.pickup) return undefined;
    let alive = true;
    api.quote(flow.toRequest()).then((r) => alive && setQuote(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [flow.addOns]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!flow.vehicle || !flow.criteria.pickup) return <Navigate to="/" replace />;

  const qtyOf = (id) => flow.addOns[id] || 0;
  const setQty = (id, qty) => flow.patch((s) => {
    const next = { ...s.addOns };
    if (qty <= 0) delete next[id]; else next[id] = Math.min(4, qty);
    return { addOns: next };
  });

  return (
    <div className="screen narrow">
      <StepTracker current={1} />
      <div className="book-grid">
        <section className="panel">
          <h1>부가 옵션</h1>
          <ul className="addon-list">
            {addons.map((a) => (
              <li key={a.id} className={qtyOf(a.id) ? 'on' : ''}>
                <span><b>{a.name}</b><em>{a.description}</em></span>
                <span className="amt">{won(a.price)}{a.unit === 'day' ? '/일' : ''}</span>
                <span className="qty">
                  <button type="button" onClick={() => setQty(a.id, qtyOf(a.id) - 1)} disabled={!qtyOf(a.id)} aria-label={`${a.name} 줄이기`}>−</button>
                  <b>{qtyOf(a.id)}</b>
                  <button type="button" onClick={() => setQty(a.id, qtyOf(a.id) + 1)} aria-label={`${a.name} 늘리기`}>＋</button>
                </span>
              </li>
            ))}
          </ul>
          <div className="nav-row">
            <button type="button" className="btn ghost" onClick={() => navigate('/book/protection')}>이전</button>
            <button type="button" className="btn primary" onClick={() => navigate('/book/driver')}>다음 단계</button>
          </div>
        </section>
        <aside className="panel summary"><h2>{flow.vehicle.name}</h2><PriceLines quote={quote} /></aside>
      </div>
    </div>
  );
}
