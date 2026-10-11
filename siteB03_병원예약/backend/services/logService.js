const db = require('../db/connection');
const { nowStamp } = require('./dateUtil');
const { HttpError } = require('./errors');

function addLog({ patientId, appointmentId, action, detail }) {
  db.prepare('INSERT INTO activity_logs (patient_id,appointment_id,action,detail,created_at) VALUES (?,?,?,?,?)').run(
    patientId ?? null, appointmentId ?? null, action, detail ?? '', nowStamp(),
  );
}

function addNotification({ patientId, appointmentId, title, body }) {
  db.prepare('INSERT INTO notifications (patient_id,appointment_id,title,body,is_read,created_at) VALUES (?,?,?,?,0,?)').run(
    patientId, appointmentId ?? null, title, body ?? '', nowStamp(),
  );
}

function listNotifications({ patientId }) {
  const rows = patientId
    ? db.prepare('SELECT * FROM notifications WHERE patient_id=? ORDER BY created_at DESC, id DESC LIMIT 100').all(Number(patientId))
    : db.prepare('SELECT * FROM notifications ORDER BY created_at DESC, id DESC LIMIT 100').all();
  return rows;
}

function markRead(id) {
  const n = Number(id);
  const row = db.prepare('SELECT * FROM notifications WHERE id=?').get(n);
  if (!row) throw new HttpError(404, 'NOT_FOUND', '알림을 찾을 수 없습니다.');
  db.prepare('UPDATE notifications SET is_read=1 WHERE id=?').run(n);
  return { ...row, is_read: 1 };
}

function listActivity({ patientId, appointmentId, limit }) {
  const where = [];
  const params = [];
  if (patientId) { where.push('patient_id=?'); params.push(Number(patientId)); }
  if (appointmentId) { where.push('appointment_id=?'); params.push(Number(appointmentId)); }
  const lim = Math.min(Number(limit) || 100, 300);
  return db.prepare(
    `SELECT * FROM activity_logs ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC LIMIT ${lim}`,
  ).all(...params);
}

module.exports = { addLog, addNotification, listNotifications, markRead, listActivity };
