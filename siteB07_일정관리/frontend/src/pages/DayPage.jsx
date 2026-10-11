import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import { addDays, labelDay } from '../utils/date';

export default function DayPage() {
  const { today, dataVersion, openCreate } = useApp();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const date = sp.get('date') || today;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.calendar('day', date)
      .then((r) => { if (alive) { setEvents(r.data); setError(''); setLoading(false); } })
      .catch((e) => { if (alive) { setError(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, [date, dataVersion]);

  const go = (d) => setSp({ date: d });

  return (
    <div className="single-col">
      <div className="toolbar">
        <button type="button" className="icon-btn" onClick={() => go(addDays(date, -1))} aria-label="전날">‹</button>
        <h1>{labelDay(date)}</h1>
        <button type="button" className="icon-btn" onClick={() => go(addDays(date, 1))} aria-label="다음날">›</button>
        <button type="button" className="btn small" onClick={() => go(today)}>오늘</button>
        <div className="top-spacer" />
        <button type="button" className="btn primary" onClick={() => openCreate(date)}>이 날 일정 추가</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <section className={`card${loading ? ' is-loading' : ''}`}>
        <h2>일정 {events.length}건</h2>
        {!loading && events.length === 0 && <p className="muted">이 날짜에는 일정이 없어요.</p>}
        <div className="stack">
          {events.map((ev) => (<EventCard key={ev.id} event={ev} variant="row" onClick={(e) => navigate(`/events/${e.id}`)} />))}
        </div>
      </section>
    </div>
  );
}
