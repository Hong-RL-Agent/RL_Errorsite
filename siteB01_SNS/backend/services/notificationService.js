const { db } = require('../db/database');
const { ME_ID } = require('./constants');
const { HttpError } = require('./httpError');

function shape(r) {
  return {
    id: r.id,
    type: r.type,
    post_id: r.post_id,
    message: r.message,
    is_read: !!r.is_read,
    created_at: r.created_at,
    actor: { id: r.actor_id, username: r.username, display_name: r.display_name, avatar_url: r.avatar_url },
  };
}

const unreadCount = () => db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0').get(ME_ID).n;

function list({ unreadOnly, page, limit, offset }) {
  const whereSql = `WHERE n.user_id = ? ${unreadOnly ? 'AND n.is_read = 0' : ''}`;
  const total = db.prepare(`SELECT COUNT(*) AS n FROM notifications n ${whereSql}`).get(ME_ID).n;
  const rows = db
    .prepare(
      `SELECT n.*, u.username, u.display_name, u.avatar_url
       FROM notifications n LEFT JOIN users u ON u.id = n.actor_id
       ${whereSql} ORDER BY n.created_at DESC, n.id DESC LIMIT ? OFFSET ?`
    )
    .all(ME_ID, limit, offset);
  return { items: rows.map(shape), total, unread_count: unreadCount(), page, limit, has_more: offset + rows.length < total };
}

function markRead(id) {
  const row = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(id, ME_ID);
  if (!row) throw new HttpError(404, '알림을 찾을 수 없습니다.');
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  return { ok: true, id, unread_count: unreadCount() };
}

function markAllRead() {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(ME_ID);
  return { ok: true, unread_count: 0 };
}

module.exports = { list, markRead, markAllRead };
