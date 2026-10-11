import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtDT, won } from '../api';
import { StatusBadge } from '../components/Common';

export default function VoucherScreen() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.trip(id).then((r) => alive && setTrip(r.data)).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [id]);

  if (error) return <div className="screen"><div className="empty">{error}</div></div>;
  if (!trip) return <div className="screen"><p className="muted">바우처를 불러오는 중…</p></div>;

  return (
    <div className="screen narrow">
      <section className="voucher">
        <div className="voucher-head"><span>예약 바우처</span><StatusBadge value={trip.status} /></div>
        <h1>{trip.code}</h1>
        <dl className="specs">
          <div className="spec-row"><dt>차량</dt><dd>{trip.vehicle.name} · {trip.vehicle.plate}</dd></div>
          <div className="spec-row"><dt>픽업</dt><dd>{trip.pickupDepot.city} {trip.pickupDepot.name} · {fmtDT(trip.startAt)}</dd></div>
          <div className="spec-row"><dt>반납</dt><dd>{trip.returnDepot.city} {trip.returnDepot.name} · {fmtDT(trip.endAt)}</dd></div>
          <div className="spec-row"><dt>보험</dt><dd>{trip.protection ? trip.protection.name : '기본 보험'}</dd></div>
          <div className="spec-row"><dt>옵션</dt><dd>{trip.addons.length ? trip.addons.map((a) => `${a.name} ×${a.qty}`).join(', ') : '없음'}</dd></div>
          <div className="spec-row"><dt>운전자</dt><dd>{trip.renter.name}</dd></div>
          <div className="spec-row total"><dt>총 금액</dt><dd>{won(trip.total)}</dd></div>
        </dl>
        <div className="nav-row">
          <Link className="btn ghost" to="/">새 예약</Link>
          <Link className="btn primary" to={`/trips/${trip.id}`}>예약 상세 보기</Link>
        </div>
      </section>
    </div>
  );
}
