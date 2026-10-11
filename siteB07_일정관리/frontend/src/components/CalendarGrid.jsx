import React, { useMemo } from 'react';
import EventCard from './EventCard';
import { DOW, groupByDate, parse } from '../utils/date';

const MAX_CHIPS = 3;

// 월간 달력 그리드
export default function CalendarGrid({ weeks, focusMonth, today, events, selectedId, onSelectEvent, onDayClick, onAdd }) {
  const from = weeks[0][0];
  const to = weeks[weeks.length - 1][6];
  const byDate = useMemo(() => groupByDate(events, from, to), [events, from, to]);

  return (
    <div className="month-grid" data-bug-id="B07-ERR03" role="grid" aria-label="월간 캘린더">
      <div className="grid-head">
        {DOW.map((d, i) => (<div key={d} className={i === 0 ? 'sun' : i === 6 ? 'sat' : ''}>{d}</div>))}
      </div>
      {weeks.map((week) => (
        <div className="grid-week" key={week[0]}>
          {week.map((day) => {
            const list = byDate[day] || [];
            const inMonth = day.startsWith(focusMonth);
            return (
              <div key={day} className={`day-cell${inMonth ? '' : ' dim'}${day === today ? ' today' : ''}`} data-date={day}>
                <div className="day-top">
                  <button type="button" className="day-num" onClick={() => onDayClick(day)} aria-label={`${day} 일간 보기`}>{parse(day).getDate()}</button>
                  <button type="button" className="day-add" onClick={() => onAdd(day)} aria-label={`${day} 일정 추가`}>+</button>
                </div>
                {list.slice(0, MAX_CHIPS).map((ev) => (
                  <EventCard key={`${day}-${ev.id}`} event={ev} variant="chip" selected={ev.id === selectedId} onClick={onSelectEvent} />
                ))}
                {list.length > MAX_CHIPS && (
                  <button type="button" className="more-link" onClick={() => onDayClick(day)}>+{list.length - MAX_CHIPS}개 더보기</button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
