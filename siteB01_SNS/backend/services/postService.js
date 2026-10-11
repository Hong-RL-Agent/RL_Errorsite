const { db } = require('../db/database');
const { ME_ID } = require('./constants');
const { HttpError } = require('./httpError');
const activity = require('./activityService');

const POST_SELECT = `
SELECT p.id, p.user_id, p.caption, p.image_url, p.created_at, p.updated_at,
  u.username, u.display_name, u.avatar_url,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
  EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = @me) AS liked_by_me,
  EXISTS(SELECT 1 FROM saves s WHERE s.post_id = p.id AND s.user_id = @me) AS saved_by_me
FROM posts p JOIN users u ON u.id = p.user_id`;

function shape(r) {
  return {
    id: r.id,
    user_id: r.user_id,
    caption: r.caption,
    image_url: r.image_url,
    created_at: r.created_at,
    updated_at: r.updated_at,
    like_count: r.like_count,
    comment_count: r.comment_count,
    liked_by_me: !!r.liked_by_me,
    saved_by_me: !!r.saved_by_me,
    is_mine: r.user_id === ME_ID,
    author: { id: r.user_id, username: r.username, display_name: r.display_name, avatar_url: r.avatar_url },
  };
}

function ensurePost(id) {
  const row = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, '게시물을 찾을 수 없습니다.');
  return row;
}

function getPost(id) {
  const row = db.prepare(`${POST_SELECT} WHERE p.id = @id`).get({ me: ME_ID, id });
  if (!row) throw new HttpError(404, '게시물을 찾을 수 없습니다.');
  return shape(row);
}

function listFeed({ page, limit, offset, sort, filter, q, userId }) {
  const where = [];
  const params = { me: ME_ID };
  if (q) {
    where.push('(p.caption LIKE @q OR u.username LIKE @q OR u.display_name LIKE @q)');
    params.q = `%${q}%`;
  }
  if (filter === 'following') where.push('p.user_id IN (SELECT following_id FROM follows WHERE follower_id = @me)');
  if (filter === 'mine') where.push('p.user_id = @me');
  if (userId) {
    where.push('p.user_id = @uid');
    params.uid = userId;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order =
    sort === 'popular' ? 'like_count DESC, p.id DESC'
      : sort === 'discussed' ? 'comment_count DESC, p.id DESC'
        : 'p.created_at DESC, p.id DESC';
  const total = db
    .prepare(`SELECT COUNT(*) AS n FROM posts p JOIN users u ON u.id = p.user_id ${whereSql}`)
    .get(params).n;
  const rows = db
    .prepare(`${POST_SELECT} ${whereSql} ORDER BY ${order} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });
  return { items: rows.map(shape), total, page, limit, has_more: offset + rows.length < total };
}

function listSaved() {
  const rows = db
    .prepare(`${POST_SELECT} JOIN saves sv ON sv.post_id = p.id AND sv.user_id = @me ORDER BY sv.created_at DESC, sv.id DESC`)
    .all({ me: ME_ID });
  return { items: rows.map(shape), total: rows.length };
}

function cleanCaption(value) {
  const caption = typeof value === 'string' ? value.trim() : '';
  if (!caption) throw new HttpError(400, '내용을 입력해 주세요.');
  if (caption.length > 500) throw new HttpError(400, '내용은 500자 이내로 입력해 주세요.');
  return caption;
}

function createPost({ caption, image_url: imageUrl }) {
  const text = cleanCaption(caption);
  const image = typeof imageUrl === 'string' && /^\/img\/custom-[1-8]$/.test(imageUrl) ? imageUrl : '/img/custom-1';
  const info = db
    .prepare('INSERT INTO posts (user_id, caption, image_url, created_at) VALUES (?, ?, ?, ?)')
    .run(ME_ID, text, image, new Date().toISOString());
  const id = Number(info.lastInsertRowid);
  activity.log('post_create', 'post', id, `게시물 #${id}을(를) 작성했습니다.`);
  return getPost(id);
}

function updatePost(id, { caption }) {
  const post = ensurePost(id);
  if (post.user_id !== ME_ID) throw new HttpError(403, '본인의 게시물만 수정할 수 있습니다.');
  const text = cleanCaption(caption);
  db.prepare('UPDATE posts SET caption = ?, updated_at = ? WHERE id = ?').run(text, new Date().toISOString(), id);
  activity.log('post_update', 'post', id, `게시물 #${id}을(를) 수정했습니다.`);
  return getPost(id);
}

function deletePost(id) {
  const post = ensurePost(id);
  if (post.user_id !== ME_ID) throw new HttpError(403, '본인의 게시물만 삭제할 수 있습니다.');
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  activity.log('post_delete', 'post', id, `게시물 #${id}을(를) 삭제했습니다.`);
  return { ok: true, id };
}

function setLike(id, on) {
  ensurePost(id);
  if (on) {
    const r = db.prepare('INSERT OR IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)').run(id, ME_ID, new Date().toISOString());
    if (r.changes) activity.log('like', 'post', id, `게시물 #${id}에 좋아요를 눌렀습니다.`);
  } else {
    const r = db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(id, ME_ID);
    if (r.changes) activity.log('unlike', 'post', id, `게시물 #${id}의 좋아요를 취소했습니다.`);
  }
  const like_count = db.prepare('SELECT COUNT(*) AS n FROM likes WHERE post_id = ?').get(id).n;
  return { liked: on, like_count };
}

function setSave(id, on) {
  ensurePost(id);
  if (on) {
    const r = db.prepare('INSERT OR IGNORE INTO saves (post_id, user_id, created_at) VALUES (?, ?, ?)').run(id, ME_ID, new Date().toISOString());
    if (r.changes) activity.log('save', 'post', id, `게시물 #${id}을(를) 저장했습니다.`);
  } else {
    const r = db.prepare('DELETE FROM saves WHERE post_id = ? AND user_id = ?').run(id, ME_ID);
    if (r.changes) activity.log('unsave', 'post', id, `게시물 #${id}의 저장을 취소했습니다.`);
  }
  return { saved: on };
}

module.exports = { getPost, listFeed, listSaved, createPost, updatePost, deletePost, setLike, setSave, ensurePost };
