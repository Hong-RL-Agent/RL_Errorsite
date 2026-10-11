const WEEK = ['월', '화', '수', '목', '금', '토', '일'];

const parts = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d, dow: new Date(y, m - 1, d).getDay() };
};

// 14일 진료 일정 캘린더 (월~일 그리드)
export function ScheduleCalendar({ days, selected, onSelect, current }) {
  if (!days || days.length === 0) return null;
  const first = parts(days[0].date);
  const lead = (first.dow + 6) % 7;
  const cells = [...Array(lead).fill(null), ...days];
  const title = `${first.y}년 ${first.m}월`;

  return (
    <div className="calendar" data-role="calendar">
      <div className="calendar-title">{title}</div>
      <div className="calendar-grid">
        {WEEK.map((w) => (
          <div key={w} className="calendar-week">
            {w}
          </div>
        ))}
        {cells.map((c, i) => {
          if (!c) return <div key={`b${i}`} />;
          const p = parts(c.date);
          const off = c.available === 0;
          const cls = ['calendar-day', c.date === selected ? 'selected' : '', off ? 'off' : '', c.date === current ? 'current' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button key={c.date} type="button" className={cls} disabled={off} onClick={() => onSelect(c.date)} data-date={c.date}>
              <span className="day-num">{p.d}</span>
              <span className="day-sub">{off ? (c.total === 0 ? '휴진' : '마감') : `${c.available}석`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SlotGrid({ slots, selected, onPick, currentTime }) {
  return (
    <div className="slot-grid" data-role="slot-grid">
      {slots.map((s) => {
        const isCurrent = currentTime === s.time;
        return (
          <button
            key={s.id}
            type="button"
            className={`slot ${selected === s.time ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
            disabled={!s.available}
            onClick={() => onPick(s.time)}
            data-time={s.time}
          >
            {s.time}
            <small>{isCurrent ? '현재 예약' : s.available ? '예약 가능' : '마감'}</small>
          </button>
        );
      })}
    </div>
  );
}
