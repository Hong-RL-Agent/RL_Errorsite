const { getDb, createSchema, dropSchema } = require('../db/init');
const { seedAll } = require('../db/seed');
const { DEMO_TODAY } = require('./clock');
const { HttpError, toInt, nowIso } = require('./common');

const toExtra = (r) => ({ id: r.id, code: r.code, kind: r.kind, name: r.name, description: r.description, price: r.price, unit: r.unit, recommended: !!r.recommended, included: !!r.included });

function health() {
  return { data: { status: 'ok', site: 'B-09', name: 'RoamDrive', today: DEMO_TODAY, time: nowIso() } };
}

function listExtras(kind) {
  const rows = getDb().prepare('SELECT * FROM extras WHERE kind = ? ORDER BY id').all(kind);
  return { data: rows.map(toExtra) };
}

function listRates(q) {
  const where = [];
  const args = [];
  if (q.kind) { where.push('kind = ?'); args.push(q.kind); }
  if (q.category) { where.push('category = ?'); args.push(q.category); }
  const rows = getDb().prepare(`SELECT * FROM rate_policies ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id`).all(...args);
  return {
    data: rows.map((r) => ({ id: r.id, kind: r.kind, category: r.category, name: r.name, startDate: r.start_date, endDate: r.end_date, minDays: r.min_days, value: r.value })),
    meta: { total: rows.length },
  };
}

function listDrivers(q) {
  const rows = getDb().prepare('SELECT id, name, email, phone, license_no, tier FROM drivers ORDER BY id LIMIT ?').all(Math.min(200, toInt(q.limit, 120)));
  return { data: rows.map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, licenseNo: r.license_no, tier: r.tier })), meta: { total: rows.length } };
}

function getDriver(id) {
  const r = getDb().prepare('SELECT id, name, email, phone, license_no, tier FROM drivers WHERE id = ?').get(id);
  if (!r) throw new HttpError(404, 'DRIVER_NOT_FOUND', '고객을 찾을 수 없습니다.');
  const n = getDb().prepare('SELECT COUNT(*) AS n FROM itineraries WHERE driver_id = ?').get(id).n;
  return { data: { id: r.id, name: r.name, email: r.email, phone: r.phone, licenseNo: r.license_no, tier: r.tier, itineraryCount: n } };
}

function resetAll() {
  const db = getDb();
  dropSchema(db);
  createSchema(db);
  seedAll(db);
  return { data: { reset: true, vehicles: db.prepare('SELECT COUNT(*) AS n FROM vehicles').get().n, itineraries: db.prepare('SELECT COUNT(*) AS n FROM itineraries').get().n, today: DEMO_TODAY } };
}

module.exports = { health, listExtras, listRates, listDrivers, getDriver, resetAll };
