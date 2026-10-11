const { getDb } = require('../db/init');

const DEFAULT_DRIVER_ID = 1;

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};
const nowIso = () => new Date().toISOString();

function logActivity(driverId, action, detail) {
  getDb().prepare('INSERT INTO activity_log (driver_id,action,detail,created_at) VALUES (?,?,?,?)').run(driverId, action, detail, nowIso());
}

function loadPolicies() {
  return getDb().prepare('SELECT * FROM rate_policies ORDER BY id').all().map((r) => ({
    id: r.id, kind: r.kind, category: r.category, name: r.name, startDate: r.start_date, endDate: r.end_date, minDays: r.min_days, value: r.value,
  }));
}

module.exports = { DEFAULT_DRIVER_ID, HttpError, toInt, nowIso, logActivity, loadPolicies };
