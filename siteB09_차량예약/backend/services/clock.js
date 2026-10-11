// 기준일 및 날짜 유틸 (DB 의존성 없음)
const DEMO_TODAY = '2026-10-14';
const DT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const pad = (n) => String(n).padStart(2, '0');

function addDay(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function isDateTime(s) {
  if (typeof s !== 'string' || !DT_RE.test(s)) return false;
  const t = Date.parse(`${s}:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 16) === s;
}

module.exports = { DEMO_TODAY, pad, addDay, isDateTime };
