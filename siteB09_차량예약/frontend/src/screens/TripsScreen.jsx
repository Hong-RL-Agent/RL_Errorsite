import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useNavigationType } from 'react-router-dom';
import { api, fmtDT, logAction, TRIP_LABEL, won } from '../api';
import { routeMemory } from '../flows/routeMemory';
import { StatusBadge } from '../components/Common';

export function TripTabs() {
  return (
    <div className="tabs" role="tablist">
      <NavLink to="/trips" end>예약 목록</NavLink>
      <NavLink to="/trips/archive">내역 관리</NavLink>
    </div>
  );
}

const MEMORY_KEY = 'trips';

export default function TripsScreen() {
  const navigate = useNavigate();
  const navType = useNavigationType();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let alive = true;
    const remembered = routeMemory.get(MEMORY_KEY);
    // INTENTIONAL_ERROR: B09-ERR04
    // CSV Error: 백포워드 캐시 상태 박제
    // Strategy: STATE_REVISIT
    // Description: 뒤로가기(POP)로 예약 목록에 복귀하면 서버를 다시 조회하지 않고 이전 목록을 재사용해 취소 상태가 반영되지 않음.
    if (navType === 'POP' && remembered) {
      setTrips(remembered);
      setLoading(false);
      logAction('trips_restored', `n=${remembered.length}`);
      return undefined;
    }
    setLoading(true);
    api.trips()
      .then((r) => { if (alive) { routeMemory.set(MEMORY_KEY, r.data); setTrips(r.data); setError(''); setLoading(false); logAction('trips_loaded', `n=${r.data.length}`); } })
      .catch((e) => { if (alive) { setError(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, [navType]);

  useEffect(() => {
    const onShow = (e) => {
      if (!e.persisted) return;
      const remembered = routeMemory.get(MEMORY_KEY);
      if (remembered) setTrips(remembered);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const shown = filter ? trips.filter((t) => t.status === filter) : trips;

  return (
    <div className="screen narrow">
      <h1>내 예약</h1>
      <TripTabs />
      <div className="toolbar">
        <label className="field inline"><span>상태</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">전체</option>
            {Object.entries(TRIP_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </select>
        </label>
        <span className="muted">{shown.length}건</span>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      {loading && <p className="muted">예약을 불러오는 중…</p>}
      {!loading && shown.length === 0 && <div className="empty">표시할 예약이 없어요. <Link to="/">차량 찾기</Link></div>}
      <ol className="timeline" data-bug-id="B09-ERR04">
        {shown.map((t) => (
          <li key={t.id} className={`tl-item st-${t.status}`} data-trip-id={t.id}>
            <span className="tl-dot" />
            <button type="button" className="tl-card" onClick={() => navigate(`/trips/${t.id}`)}>
              <span className="tl-top"><b>{t.code}</b><StatusBadge value={t.status} /></span>
              <span className="tl-name">{t.vehicle.name} · {t.vehicle.categoryName}</span>
              <span className="muted">{fmtDT(t.startAt)} → {fmtDT(t.endAt)} · {t.pickupDepot.name}</span>
              <span className="tl-amt">{won(t.total)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
