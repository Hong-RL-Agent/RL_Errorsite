const { getDb } = require('../db/init');

const CURRENT_USER_ID = 1;

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
const userIdOf = (src) => toInt(src && src.userId, CURRENT_USER_ID);
const nowIso = () => new Date().toISOString();

function logActivity(userId, type, detail) {
  getDb().prepare('INSERT INTO activity_log (user_id,type,detail,created_at) VALUES (?,?,?,?)').run(userId, type, detail, nowIso());
}

module.exports = { CURRENT_USER_ID, HttpError, toInt, userIdOf, nowIso, logActivity };
