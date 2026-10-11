const { getDb } = require('../db/init');
const { CATEGORIES, FUEL_LABEL } = require('../data/catalog');
const { DEMO_TODAY, addDay, isDateTime } = require('./clock');
const { calcQuote } = require('./quoteMath');
const { HttpError, toInt, loadPolicies } = require('./common');

const BLOCKING = "('pending','confirmed','picked_up')";
const CATEGORY_NAME = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.name]));
const IMAGE_LABELS = ['전면', '측면', '후면', '실내', '트렁크', '계기판'];

const VEHICLE_SELECT = `SELECT v.*, m.make, m.name AS model_name, m.category, m.seats, m.fuel, m.transmission, m.specs, m.image_count, m.color,
  d.name AS depot_name, d.city AS depot_city
  FROM vehicles v JOIN vehicle_models m ON m.id = v.model_id JOIN depots d ON d.id = v.depot_id`;

function toVehicle(r) {
  return {
    id: r.id, plate: r.plate, status: r.status, dailyRate: r.daily_rate, odometer: r.odometer,
    model: {
      id: r.model_id, make: r.make, name: r.model_name, category: r.category, categoryName: CATEGORY_NAME[r.category],
      seats: r.seats, fuel: r.fuel, fuelName: FUEL_LABEL[r.fuel], transmission: r.transmission, transmissionName: r.transmission === 'auto' ? '자동' : '수동',
    },
    depot: { id: r.depot_id, name: r.depot_name, city: r.depot_city },
    thumbnailUrl: `/api/media/models/${r.model_id}/1.svg`,
  };
}

function isBusy(vehicleId, startAt, endAt) {
  return !!getDb().prepare(`SELECT 1 FROM itineraries WHERE vehicle_id = ? AND status IN ${BLOCKING} AND start_at < ? AND end_at > ? LIMIT 1`).get(vehicleId, endAt, startAt);
}

function validateWindow(startAt, endAt) {
  if (!isDateTime(startAt) || !isDateTime(endAt)) throw new HttpError(400, 'INVALID_PERIOD', '대여 일시 형식(YYYY-MM-DDTHH:mm)이 올바르지 않습니다.');
  if (endAt <= startAt) throw new HttpError(400, 'INVALID_PERIOD', '반납 일시는 픽업 일시보다 늦어야 합니다.');
  if (startAt.slice(0, 10) < DEMO_TODAY) throw new HttpError(400, 'INVALID_PERIOD', '지난 날짜로는 예약할 수 없습니다.');
  const days = (Date.parse(`${endAt}:00Z`) - Date.parse(`${startAt}:00Z`)) / 86400000;
  if (days > 30) throw new HttpError(400, 'INVALID_PERIOD', '대여 기간은 최대 30일입니다.');
}

function listDepots(q) {
  const where = [];
  const args = [];
  if (q.city) { where.push('city = ?'); args.push(q.city); }
  const text = (q.q || '').trim();
  if (text) { where.push('(name LIKE ? OR city LIKE ? OR address LIKE ?)'); const l = `%${text}%`; args.push(l, l, l); }
  const rows = getDb().prepare(`SELECT * FROM depots ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id`).all(...args);
  return { data: rows.map((r) => ({ id: r.id, name: r.name, city: r.city, address: r.address, hours: r.hours })), meta: { total: rows.length } };
}

function listFleet(q) {
  const db = getDb();
  const where = [];
  const args = [];
  let cityName = q.city || null;
  if (q.pickupDepot) {
    const dep = db.prepare('SELECT * FROM depots WHERE id = ?').get(toInt(q.pickupDepot, 0));
    if (!dep) throw new HttpError(400, 'INVALID_DEPOT', '존재하지 않는 픽업 지점입니다.');
    cityName = dep.city;
  }
  if (cityName) { where.push('d.city = ?'); args.push(cityName); }
  if (q.category) { where.push('m.category = ?'); args.push(q.category); }
  if (q.seats) { where.push('m.seats >= ?'); args.push(toInt(q.seats, 1)); }
  if (q.fuel) { where.push('m.fuel = ?'); args.push(q.fuel); }
  const hasWindow = q.start && q.end;
  if (hasWindow) validateWindow(q.start, q.end);
  const order = { price_asc: 'v.daily_rate ASC, v.id', price_desc: 'v.daily_rate DESC, v.id', seats_desc: 'm.seats DESC, v.id' }[q.sort] || 'v.id';
  const rows = db.prepare(`${VEHICLE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order}`).all(...args);
  const policies = hasWindow ? loadPolicies() : null;
  const pickDep = q.pickupDepot ? db.prepare('SELECT * FROM depots WHERE id = ?').get(toInt(q.pickupDepot, 0)) : null;
  const retDep = q.returnDepot ? db.prepare('SELECT * FROM depots WHERE id = ?').get(toInt(q.returnDepot, 0)) : pickDep;
  let data = rows.map((r) => {
    const v = toVehicle(r);
    v.available = r.status !== 'maintenance' && (!hasWindow || !isBusy(r.id, q.start, q.end));
    if (hasWindow) {
      const est = calcQuote({
        dailyRate: r.daily_rate, category: r.category, startAt: q.start, endAt: q.end,
        pickupDepot: pickDep || { id: r.depot_id, city: r.depot_city }, returnDepot: retDep || pickDep || { id: r.depot_id, city: r.depot_city }, policies, extras: [],
      });
      v.estimate = { days: est.days, total: est.total };
    }
    return v;
  });
  if (q.onlyAvailable === '1') data = data.filter((v) => v.available);
  const limit = Math.min(200, toInt(q.limit, 60));
  const total = data.length;
  return { data: data.slice(0, limit), meta: { total, city: cityName, window: hasWindow ? { start: q.start, end: q.end } : null } };
}

function getVehicle(id) {
  const db = getDb();
  const r = db.prepare(`${VEHICLE_SELECT} WHERE v.id = ?`).get(id);
  if (!r) throw new HttpError(404, 'VEHICLE_NOT_FOUND', '차량을 찾을 수 없습니다.');
  const maint = db.prepare('SELECT kind, performed_at, note FROM maintenance_records WHERE vehicle_id = ? ORDER BY performed_at DESC LIMIT 3').all(id)
    .map((m) => ({ kind: m.kind, performedAt: m.performed_at, note: m.note }));
  const images = Array.from({ length: r.image_count }, (_, i) => ({ url: `/api/media/models/${r.model_id}/${i + 1}.svg`, label: IMAGE_LABELS[i % IMAGE_LABELS.length] }));
  return { data: { ...toVehicle(r), specs: JSON.parse(r.specs), images, maintenance: maint } };
}

function availability(id, q) {
  const db = getDb();
  const v = db.prepare('SELECT id, status FROM vehicles WHERE id = ?').get(id);
  if (!v) throw new HttpError(404, 'VEHICLE_NOT_FOUND', '차량을 찾을 수 없습니다.');
  const from = q.from || `${DEMO_TODAY}T00:00`;
  const to = q.to || `${addDay(DEMO_TODAY, 90)}T00:00`;
  if (!isDateTime(from) || !isDateTime(to)) throw new HttpError(400, 'INVALID_PERIOD', '조회 기간 형식이 올바르지 않습니다.');
  const busy = db.prepare(`SELECT id, start_at, end_at, status FROM itineraries WHERE vehicle_id = ? AND status IN ${BLOCKING} AND start_at < ? AND end_at > ? ORDER BY start_at`).all(id, to, from)
    .map((b) => ({ itineraryId: b.id, startAt: b.start_at, endAt: b.end_at, status: b.status }));
  return { data: { vehicleId: id, vehicleStatus: v.status, from, to, busy, available: v.status !== 'maintenance' && busy.length === 0 } };
}

function fleetStatus() {
  const db = getDb();
  const byStatus = db.prepare('SELECT status, COUNT(*) AS n FROM vehicles GROUP BY status').all();
  const byCity = db.prepare(`SELECT d.city, COUNT(v.id) AS total, SUM(v.status = 'available') AS available, SUM(v.status = 'rented') AS rented, SUM(v.status = 'maintenance') AS maintenance
    FROM vehicles v JOIN depots d ON d.id = v.depot_id GROUP BY d.city ORDER BY MIN(d.id)`).all();
  return {
    data: {
      total: byStatus.reduce((s, r) => s + r.n, 0),
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.n])),
      byCity: byCity.map((r) => ({ city: r.city, total: r.total, available: r.available, rented: r.rented, maintenance: r.maintenance })),
    },
  };
}

function mediaSvg(modelId, n) {
  const m = getDb().prepare('SELECT * FROM vehicle_models WHERE id = ?').get(modelId);
  if (!m || n < 1 || n > m.image_count) return null;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const shift = (n - 1) * 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="${m.color}"/></linearGradient></defs>
<rect width="640" height="360" fill="url(#g)"/><circle cx="${520 - shift}" cy="70" r="90" fill="#fff" fill-opacity="0.08"/>
<g transform="translate(${120 + (n % 2) * 20},170)"><rect x="0" y="30" width="400" height="70" rx="24" fill="#f8fafc"/><path d="M60 30 L110 -20 H290 L345 30 Z" fill="#e2e8f0"/><circle cx="90" cy="105" r="30" fill="#0f172a"/><circle cx="310" cy="105" r="30" fill="#0f172a"/><circle cx="90" cy="105" r="12" fill="#94a3b8"/><circle cx="310" cy="105" r="12" fill="#94a3b8"/></g>
<text x="30" y="50" font-size="28" font-family="sans-serif" fill="#fff">${esc(m.make)} ${esc(m.name)}</text><text x="30" y="82" font-size="18" font-family="sans-serif" fill="#fff" fill-opacity="0.8">${esc(CATEGORY_NAME[m.category])} · ${n}/${m.image_count}</text></svg>`;
}

module.exports = { listDepots, listFleet, getVehicle, availability, fleetStatus, mediaSvg, isBusy, validateWindow };
