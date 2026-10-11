import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { api, logAction } from '../api';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import EventDetailPanel from '../components/EventDetailPanel';
import { DOW, addDays, groupByDate, labelDay, parse, weekDays } from '../utils/date';
import { viewSnapshots } from '../utils/viewSnapshots';

export default function WeekPage() {
  const { today, categories, dataVersion, openCreate } = useApp();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const date = sp.get('date') || today;
  const category = sp.get('category') || '';
  const days = useMemo(() => weekDays(date), [date]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const mountVersion = useRef(dataVersion).current;
  const key = `week:${days[0]}:${category}`;

  useEffect(() => {
    let alive = true;
    const prev = viewSnapshots.get(key);
    // INTENTIONAL_ERROR: B07-ERR04
    // CSV Error: 백포워드 캐시 상태 박제
    // Strategy: STATE_REVISIT
    // Description: 뒤로가기(POP)로 주간 일정 화면에 복귀하면 서버를 다시 조회하지 않고 이전 목록을 그대로 표시해 삭제된 일정이 남음.
    if (navType === 'POP' && dataVersion === mountVersion && prev) {
      setEvents(prev);
      setLoading(false);
      logAction('week_restored', key);
      return undefined;
    }
    setLoading(true);
    api.calendar('week', date, { category })
      .then((res) => {
        if (!alive) return;
        viewSnapshots.set(key, res.data);
        setEvents(res.data);
        setError('');
        setLoading(false);
        logAction('week_loaded', key);
      })
      .catch((e) => { if (alive) { setError(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, [key, date, category, navType, dataVersion, mountVersion]);

  useEffect(() => {
    const onShow = (e) => {
      if (!e.persisted) return;
      const prev = viewSnapshots.get(key);
      if (prev) setEvents(prev);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [key]);

  const byDate = useMemo(() => groupByDate(events, days[0], days[6]), [events, days]);
  const selected = events.find((e) => e.id === selectedId) || null;
  const go = (d) => setSp((p) => { const n = new URLSearchParams(p); n.set('date', d); return n; });
  const onCategory = (e) => setSp((p) => { const n = new URLSearchParams(p); if (e.target.value) n.set('category', e.target.value); else n.delete('category'); return n; });

  return (
    <div className="page-grid">
      <div className="main-col">
        <div className="toolbar">
          <button type="button" className="icon-btn" onClick={() => go(addDays(date, -7))} aria-label="이전 주">‹</button>
          <h1>{labelDay(days[0])} – {labelDay(days[6])}</h1>
          <button type="button" className="icon-btn" onClick={() => go(addDays(date, 7))} aria-label="다음 주">›</button>
          <button type="button" className="btn small" onClick={() => go(today)}>이번 주</button>
          <div className="top-spacer" />
          <select value={category} onChange={onCategory} aria-label="카테고리 필터">
            <option value="">전체 카테고리</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className={`week-grid${loading ? ' is-loading' : ''}`} data-bug-id="B07-ERR04">
          {days.map((d) => (
            <section key={d} className={`week-col${d === today ? ' today' : ''}`} data-date={d}>
              <header>
                <button type="button" className="link-btn" onClick={() => navigate(`/calendar/day?date=${d}`)}>{DOW[parse(d).getDay()]} {parse(d).getDate()}</button>
                <button type="button" className="day-add" onClick={() => openCreate(d)} aria-label={`${d} 일정 추가`}>+</button>
              </header>
              {(byDate[d] || []).map((ev) => (
                <EventCard key={`${d}-${ev.id}`} event={ev} variant="compact" selected={ev.id === selectedId} onClick={(e) => { setSelectedId(e.id); logAction('select_event', String(e.id)); }} />
              ))}
              {!(byDate[d] || []).length && <p className="muted tiny">일정 없음</p>}
            </section>
          ))}
        </div>
      </div>
      <div className="side-col">
        {selected ? (
          <EventDetailPanel event={selected} onClose={() => setSelectedId(null)} onOpenDetail={(id) => navigate(`/events/${id}`)} />
        ) : (
          <section className="card"><h2>일정 상세</h2><p className="muted">주간 일정을 선택하면 상세 정보가 여기에 표시돼요.</p></section>
        )}
      </div>
    </div>
  );
}
