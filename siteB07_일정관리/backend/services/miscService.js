const { getDb, createSchema, dropSchema } = require('../db/init');
const { seedAll } = require('../db/seed');
const { DEMO_TODAY } = require('./dates');
const { HttpError, toInt, nowIso, logActivity } = require('./common');

const toNote = (r) => ({ id: r.id, eventId: r.event_id, userId: r.user_id, body: r.body, createdAt: r.created_at, updatedAt: r.updated_at });

function health() {
  return { data: { status: 'ok', site: 'B-07', name: 'DayNest', today: DEMO_TODAY, time: nowIso() } };
}

function listUsers(q) {
  const limit = Math.min(200, toInt(q.limit, 100));
  const rows = getDb().prepare('SELECT id, name, email, created_at FROM users ORDER BY id LIMIT ?').all(limit);
  return { data: rows.map((r) => ({ id: r.id, name: r.name, email: r.email, createdAt: r.created_at })), meta: { total: rows.length } };
}

function getUser(id) {
  const r = getDb().prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id);
  if (!r) throw new HttpError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  const n = getDb().prepare('SELECT COUNT(*) AS n FROM events WHERE user_id = ? AND deleted = 0').get(id).n;
  return { data: { id: r.id, name: r.name, email: r.email, createdAt: r.created_at, eventCount: n } };
}

function listCategories() {
  return { data: getDb().prepare('SELECT id, name, color FROM categories ORDER BY id').all() };
}

function requireEvent(eventId) {
  const e = getDb().prepare('SELECT id, user_id, title FROM events WHERE id = ?').get(eventId);
  if (!e) throw new HttpError(404, 'EVENT_NOT_FOUND', '일정을 찾을 수 없습니다.');
  return e;
}

function checkBody(body) {
  if (typeof body.body !== 'string' || !body.body.trim()) throw new HttpError(400, 'INVALID_NOTE', '메모 내용을 입력해 주세요.');
  if (body.body.length > 2000) throw new HttpError(400, 'INVALID_NOTE', '메모는 2000자 이내여야 합니다.');
}

function listNotes(eventId) {
  requireEvent(eventId);
  const rows = getDb().prepare('SELECT * FROM notes WHERE event_id = ? ORDER BY id').all(eventId);
  return { data: rows.map(toNote), meta: { total: rows.length } };
}

function createNote(eventId, body, userId) {
  const ev = requireEvent(eventId);
  checkBody(body);
  const now = nowIso();
  const { lastInsertRowid } = getDb().prepare('INSERT INTO notes (event_id,user_id,body,created_at,updated_at) VALUES (?,?,?,?,?)').run(eventId, userId, body.body.trim(), now, now);
  logActivity(userId, 'note_create', `메모 작성: ${ev.title}`);
  return { data: toNote(getDb().prepare('SELECT * FROM notes WHERE id = ?').get(lastInsertRowid)) };
}

function updateNote(id, body, userId) {
  const row = getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'NOTE_NOT_FOUND', '메모를 찾을 수 없습니다.');
  checkBody(body);
  getDb().prepare('UPDATE notes SET body = ?, updated_at = ? WHERE id = ?').run(body.body.trim(), nowIso(), id);
  logActivity(userId, 'note_update', `메모 수정: 일정 #${row.event_id}`);
  return { data: toNote(getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id)) };
}

function listNotifications(q) {
  const where = ['n.user_id = ?'];
  if (q.unread === '1') where.push('n.is_read = 0');
  const rows = getDb().prepare(`SELECT n.* FROM notifications n JOIN events e ON e.id = n.event_id WHERE ${where.join(' AND ')} AND e.deleted = 0 ORDER BY n.remind_at DESC, n.id DESC LIMIT ?`)
    .all(toInt(q.userId, 1), Math.min(100, toInt(q.limit, 30)));
  return { data: rows.map((r) => ({ id: r.id, eventId: r.event_id, message: r.message, remindAt: r.remind_at, read: !!r.is_read })) };
}

function markNotification(id, body, userId) {
  const row = getDb().prepare('SELECT * FROM notifications WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없습니다.');
  const read = body && body.read === false ? 0 : 1;
  getDb().prepare('UPDATE notifications SET is_read = ? WHERE id = ?').run(read, id);
  logActivity(userId, 'notification_read', `알림 ${read ? '읽음' : '읽지 않음'} 처리 #${id}`);
  return { data: { id, read: !!read } };
}

function listActivity(q) {
  const rows = getDb().prepare('SELECT id, type, detail, created_at FROM activity_log WHERE user_id = ? ORDER BY id DESC LIMIT ?')
    .all(toInt(q.userId, 1), Math.min(200, toInt(q.limit, 30)));
  return { data: rows.map((r) => ({ id: r.id, type: r.type, detail: r.detail, createdAt: r.created_at })) };
}

function resetAll() {
  const db = getDb();
  dropSchema(db);
  createSchema(db);
  seedAll(db);
  return { data: { reset: true, events: db.prepare('SELECT COUNT(*) AS n FROM events WHERE deleted = 0').get().n, today: DEMO_TODAY } };
}

module.exports = { health, listUsers, getUser, listCategories, listNotes, createNote, updateNote, listNotifications, markNotification, listActivity, resetAll };
