// 서비스 기준일(오늘로 간주하는 고정 날짜). 월요일. seed 및 검증에서 공통 사용.
const BASE_DATE = '2026-11-02';
const SCHEDULE_DAYS = 14;

const pad = (n) => String(n).padStart(2, '0');

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 0 = 일요일 ... 6 = 토요일
function weekday(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

function isValidDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function isValidTime(t) {
  return typeof t === 'string' && /^([01]\d|2[0-3]):(00|30)$/.test(t);
}

function nowStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

// open 이상 close 미만, 30분 간격, 점심시간 제외
function buildTimes(open, close, lunchStart, lunchEnd) {
  const out = [];
  for (let m = toMin(open); m < toMin(close); m += 30) {
    const t = fromMin(m);
    if (lunchStart && t >= lunchStart && t < lunchEnd) continue;
    out.push(t);
  }
  return out;
}

module.exports = { BASE_DATE, SCHEDULE_DAYS, addDays, weekday, isValidDate, isValidTime, nowStamp, buildTimes };
