export const DOW = ['일', '월', '화', '수', '목', '금', '토'];
export const pad2 = (n) => String(n).padStart(2, '0');
export const fmt = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); };
export const addMonths = (s, n) => {
  const [y, m, d] = s.split('-').map(Number);
  const last = new Date(y, m - 1 + n + 1, 0).getDate();
  return fmt(new Date(y, m - 1 + n, Math.min(d, last)));
};
export const startOfWeek = (s) => addDays(s, -parse(s).getDay());
export const weekDays = (s) => { const st = startOfWeek(s); return Array.from({ length: 7 }, (_, i) => addDays(st, i)); };

export function monthWeeks(s) {
  const first = `${s.slice(0, 7)}-01`;
  const start = startOfWeek(first);
  const lastDay = addDays(addMonths(first, 1), -1);
  const end = addDays(lastDay, 6 - parse(lastDay).getDay());
  const weeks = [];
  for (let d = start; d <= end; d = addDays(d, 7)) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)));
  return weeks;
}

export const labelDay = (s) => { const d = parse(s); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`; };
export const labelMonth = (s) => `${s.slice(0, 4)}년 ${Number(s.slice(5, 7))}월`;

// 일정이 걸친 날짜 목록 (범위로 제한)
export function datesOf(ev, from, to) {
  const out = [];
  for (let d = ev.startDate < from ? from : ev.startDate; d <= ev.endDate && d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function groupByDate(events, from, to) {
  const map = {};
  events.forEach((ev) => datesOf(ev, from, to).forEach((d) => { (map[d] = map[d] || []).push(ev); }));
  Object.values(map).forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.id - b.id));
  return map;
}

export const REPEAT_LABEL = { none: '반복 없음', daily: '매일', weekly: '매주', monthly: '매월', yearly: '매년' };
export const REMINDER_LABEL = { none: '알림 없음', '10m': '10분 전', '30m': '30분 전', '1h': '1시간 전', '1d': '하루 전' };
export const STATUS_LABEL = { scheduled: '예정', done: '완료', cancelled: '취소' };
