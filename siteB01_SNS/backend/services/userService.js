const { db } = require('../db/database');
const { ME_ID } = require('./constants');
const { HttpError } = require('./httpError');
const activity = require('./activityService');

const USER_SELECT = `
SELECT u.id, u.username, u.display_name, u.bio, u.avatar_url, u.created_at,
  (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS post_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count,
  (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
  EXISTS(SELECT 1 FROM follows WHERE follower_id = @me AND following_id = u.id) AS is_following
FROM users u`;

function shape(r) {
  return { ...r, is_following: !!r.is_following, is_me: r.id === ME_ID };
}

function getUser(id) {
  const row = db.prepare(`${USER_SELECT} WHERE u.id = @id`).get({ me: ME_ID, id });
  if (!row) throw new HttpError(404, '사용자를 찾을 수 없습니다.');
  return shape(row);
}

function listUsers({ recommend, q, limit }) {
  const where = [];
  const params = { me: ME_ID, limit };
  if (recommend) where.push('u.id != @me AND NOT EXISTS(SELECT 1 FROM follows WHERE follower_id = @me AND following_id = u.id)');
  if (q) {
    where.push('(u.username LIKE @q OR u.display_name LIKE @q)');
    params.q = `%${q}%`;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db
    .prepare(`${USER_SELECT} ${whereSql} ORDER BY follower_count DESC, u.id ASC LIMIT @limit`)
    .all(params);
  return { items: rows.map(shape) };
}

function listFollowing(id) {
  getUser(id);
  const rows = db
    .prepare(`${USER_SELECT} WHERE u.id IN (SELECT following_id FROM follows WHERE follower_id = @uid) ORDER BY u.id ASC`)
    .all({ me: ME_ID, uid: id });
  return { items: rows.map(shape) };
}

function listStories() {
  const rows = db
    .prepare(
      `${USER_SELECT} WHERE u.id = @me OR u.id IN (SELECT following_id FROM follows WHERE follower_id = @me)
       ORDER BY (u.id = @me) DESC, u.id ASC LIMIT 14`
    )
    .all({ me: ME_ID });
  return { items: rows.map(shape) };
}

function follow(id) {
  const target = getUser(id);
  if (id === ME_ID) throw new HttpError(400, '자기 자신은 팔로우할 수 없습니다.');
  const r = db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)').run(ME_ID, id, new Date().toISOString());
  if (r.changes) activity.log('follow', 'user', id, `${target.display_name}님을 팔로우했습니다.`);
  return followResult(id, true);
}

function unfollow(id) {
  const target = getUser(id);
  const r = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(ME_ID, id);
  if (r.changes) activity.log('unfollow', 'user', id, `${target.display_name}님을 언팔로우했습니다.`);
  return followResult(id, false);
}

function followResult(id, isFollowing) {
  const follower_count = db.prepare('SELECT COUNT(*) AS n FROM follows WHERE following_id = ?').get(id).n;
  const my_following_count = db.prepare('SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?').get(ME_ID).n;
  return { user_id: id, is_following: isFollowing, follower_count, my_following_count };
}

module.exports = { getUser, listUsers, listFollowing, listStories, follow, unfollow };
