const { db } = require('../db/database');
const { ME_ID } = require('./constants');

const CATEGORIES = {
  post: ['post_create', 'post_update', 'post_delete'],
  like: ['like', 'unlike'],
  comment: ['comment_create', 'comment_delete'],
  follow: ['follow', 'unfollow'],
  save: ['save', 'unsave'],
};

function log(action, targetType, targetId, detail) {
  db.prepare(
    'INSERT INTO activity_logs (user_id, action, target_type, target_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(ME_ID, action, targetType, targetId, detail, new Date().toISOString());
}

function list({ category, page, limit, offset }) {
  const actions = CATEGORIES[category];
  const where = ['user_id = ?'];
  const args = [ME_ID];
  if (actions) {
    where.push(`action IN (${actions.map(() => '?').join(',')})`);
    args.push(...actions);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const total = db.prepare(`SELECT COUNT(*) AS n FROM activity_logs ${whereSql}`).get(...args).n;
  const items = db
    .prepare(`SELECT * FROM activity_logs ${whereSql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, limit, offset);
  return { items, total, page, limit, has_more: offset + items.length < total };
}

module.exports = { log, list };
