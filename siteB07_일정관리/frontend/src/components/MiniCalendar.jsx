import React, { useEffect, useState } from 'react';
import { DOW, addMonths, labelMonth, monthWeeks, parse } from '../utils/date';

export default function MiniCalendar({ value, today, onPick }) {
  const [month, setMonth] = useState(`${value.slice(0, 7)}-01`);
  useEffect(() => { setMonth(`${value.slice(0, 7)}-01`); }, [value]);
  const weeks = monthWeeks(month);

  return (
    <div className="mini-cal">
      <div className="mini-head">
        <button type="button" className="icon-btn" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="이전 달">‹</button>
        <strong>{labelMonth(month)}</strong>
        <button type="button" className="icon-btn" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="다음 달">›</button>
      </div>
      <div className="mini-grid">
        {DOW.map((d) => (<span key={d} className="dow">{d}</span>))}
        {weeks.flat().map((day) => (
          <button
            type="button"
            key={day}
            className={`${day.startsWith(month.slice(0, 7)) ? '' : 'dim'}${day === today ? ' today' : ''}${day === value ? ' picked' : ''}`}
            onClick={() => onPick(day)}
            aria-label={day}
          >{parse(day).getDate()}</button>
        ))}
      </div>
    </div>
  );
}
