// 날짜 문자열(YYYY-MM-DD) 유틸 — DB 의존성 없음 (seed 에서도 사용)
const DEMO_TODAY = '2026-10-14';

const parts = (s) => s.split('-').map(Number);

function isDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = parts(s);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

function addDays(s, n) {
  const [y, m, d] = parts(s);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function addMonths(s, n) {
  const [y, m, d] = parts(s);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))).toISOString().slice(0, 10);
}

function weekday(s) {
  const [y, m, d] = parts(s);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function rangeFor(view, date) {
  if (view === 'day') return { from: date, to: date };
  if (view === 'week') { const from = addDays(date, -weekday(date)); return { from, to: addDays(from, 6) }; }
  const first = `${date.slice(0, 7)}-01`;
  const last = addDays(addMonths(first, 1), -1);
  return { from: addDays(first, -weekday(first)), to: addDays(last, 6 - weekday(last)) };
}

const minutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

module.exports = { DEMO_TODAY, isDate, isTime, addDays, addMonths, weekday, rangeFor, minutes };
