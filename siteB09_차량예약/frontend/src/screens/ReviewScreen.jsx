import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, fmtDT, logAction } from '../api';
import { useFlow } from '../flows/BookingFlow';
import { useToast } from '../hooks/useToast';
import { PriceLines, StepTracker } from '../components/Common';

export default function ReviewScreen() {
  const flow = useFlow();
  const navigate = useNavigate();
  const toast = useToast();
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!flow.vehicle || !flow.criteria.pickup) return undefined;
    let alive = true;
    api.quote(flow.toRequest()).then((r) => alive && setQuote(r.data)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!flow.vehicle || !flow.criteria.pickup || !flow.renter.name) return <Navigate to="/" replace />;

  const confirm = async () => {
    setBusy(true); setError('');
    try {
      const res = await api.createTrip({ ...flow.toRequest(), driverId: 1, renter: flow.renter, confirm: true });
      logAction('booking_confirmed', String(res.data.id));
      toast('예약이 확정되었어요.');
      navigate(`/book/voucher/${res.data.id}`, { replace: true });
      flow.resetBooking();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="screen narrow">
      <StepTracker current={3} />
      <div className="book-grid">
        <section className="panel" aria-label="예약 확인">
          <h1>예약 확인</h1>
          <dl className="specs">
            <div className="spec-row"><dt>차량</dt><dd>{flow.vehicle.name} ({flow.vehicle.categoryName})</dd></div>
            <div className="spec-row"><dt>픽업</dt><dd>{flow.criteria.pickup.city} {flow.criteria.pickup.name} · {fmtDT(flow.startAt)}</dd></div>
            <div className="spec-row"><dt>반납</dt><dd>{flow.returnDepot.city} {flow.returnDepot.name} · {fmtDT(flow.endAt)}</dd></div>
            <div className="spec-row"><dt>운전자</dt><dd>{flow.renter.name} · {flow.renter.phone}</dd></div>
          </dl>
          {error && <p className="alert" role="alert">{error}</p>}
          <div className="nav-row">
            <button type="button" className="btn ghost" onClick={() => navigate('/book/driver')}>이전</button>
            <button type="button" className="btn accent big" disabled={busy || !quote} onClick={confirm}>예약 확정</button>
          </div>
        </section>
        <aside className="panel summary"><h2>최종 금액</h2><PriceLines quote={quote} /></aside>
      </div>
    </div>
  );
}
