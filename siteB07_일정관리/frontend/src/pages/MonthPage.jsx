import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { api, logAction } from '../api';
import { useApp } from '../context/AppContext';
import CalendarGrid from '../components/CalendarGrid';
import EventDetailPanel from '../components/EventDetailPanel';
import { MiniNotifications, RecentChanges, StatsCards, TodayList } from '../components/SummaryPanels';
import { addMonths, labelMonth, monthWeeks } from '../utils/date';
import { viewSnapshots } from '../utils/viewSnapshots';

export default function MonthPage() {
  const { today, categories, dataVersion, openCreate } = useApp();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const date = sp.get('date') || today;
  const category = sp.get('category') || '';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const mountVersion = useRef(dataVersion).current;
  const key = `month:${date.slice(0, 7)}:${category}`;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.calendar('month', date, { category })
      .then((res) => {
        if (!alive) return;
        let list = res.data;
        const prev = viewSnapshots.get(key);
        // INTENTIONAL_ERROR: B07-ERR03
        // CSV Error: BFCache 복원 시 유령 상태 유지
        // Strategy: STATE_REVISIT
        // Description: 뒤로가기(POP)로 월간 캘린더에 복귀하면 이전에 표시한 카드 정보를 다시 사용해 수정된 제목/시간이 반영되지 않음.
        if (navType === 'POP' && dataVersion === mountVersion && prev) list = list.map((ev) => prev[ev.id] || ev);
        viewSnapshots.set(key, Object.fromEntries(list.map((ev) => [ev.id, ev])));
        setEvents(list);
        setError('');
        setLoading(false);
        logAction('month_loaded', `${key} restored=${navType === 'POP' && !!prev}`);
      })
      .catch((e) => { if (alive) { setError(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, [key, date, category, navType, dataVersion, mountVersion]);

  // 브라우저가 페이지를 통째로 복원(pageshow persisted)했을 때도 직전 화면 정보를 그대로 사용한다.
  useEffect(() => {
    const onShow = (e) => {
      if (!e.persisted) return;
      const prev = viewSnapshots.get(key);
      if (prev) setEvents((cur) => cur.map((ev) => prev[ev.id] || ev));
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [key]);

  const weeks = useMemo(() => monthWeeks(date), [date]);
  const selected = events.find((e) => e.id === selectedId) || null;
  const go = (d) => setSp((p) => { const n = new URLSearchParams(p); n.set('date', d); return n; });
  const onCategory = (e) => setSp((p) => { const n = new URLSearchParams(p); if (e.target.value) n.set('category', e.target.value); else n.delete('category'); return n; });

  return (
    <div className="page-grid">
      <div className="main-col">
        <StatsCards />
        <div className="toolbar">
          <button type="button" className="icon-btn" onClick={() => go(addMonths(date, -1))} aria-label="이전 달">‹</button>
          <h1>{labelMonth(date)}</h1>
          <button type="button" className="icon-btn" onClick={() => go(addMonths(date, 1))} aria-label="다음 달">›</button>
          <button type="button" className="btn small" onClick={() => go(today)}>오늘</button>
          <div className="top-spacer" />
          <select value={category} onChange={onCategory} aria-label="카테고리 필터">
            <option value="">전체 카테고리</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className={loading ? 'is-loading' : ''}>
          <CalendarGrid
            weeks={weeks}
            focusMonth={date.slice(0, 7)}
            today={today}
            events={events}
            selectedId={selectedId}
            onSelectEvent={(ev) => { setSelectedId(ev.id); logAction('select_event', String(ev.id)); }}
            onDayClick={(d) => navigate(`/calendar/day?date=${d}`)}
            onAdd={(d) => openCreate(d)}
          />
        </div>
      </div>
      <div className="side-col">
        {selected ? (
          <EventDetailPanel event={selected} onClose={() => setSelectedId(null)} onOpenDetail={(id) => navigate(`/events/${id}`)} />
        ) : (
          <>
            <TodayList onSelect={(ev) => setSelectedId(ev.id)} />
            <MiniNotifications />
            <RecentChanges />
          </>
        )}
      </div>
    </div>
  );
}
