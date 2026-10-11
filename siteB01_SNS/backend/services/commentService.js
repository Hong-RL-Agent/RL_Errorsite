const { db } = require('../db/database');
const { ME_ID } = require('./constants');
const { HttpError } = require('./httpError');
const activity = require('./activityService');
const { ensurePost } = require('./postService');

const COMMENT_SELECT = `
SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
  u.username, u.display_name, u.avatar_url
FROM comments c JOIN users u ON u.id = c.user_id`;

function shape(r) {
  return {
    id: r.id,
    post_id: r.post_id,
    content: r.content,
    created_at: r.created_at,
    is_mine: r.user_id === ME_ID,
    author: { id: r.user_id, username: r.username, display_name: r.display_name, avatar_url: r.avatar_url },
  };
}

const countFor = (postId) => db.prepare('SELECT COUNT(*) AS n FROM comments WHERE post_id = ?').get(postId).n;

function listComments(postId) {
  ensurePost(postId);
  const rows = db.prepare(`${COMMENT_SELECT} WHERE c.post_id = ? ORDER BY c.created_at ASC, c.id ASC`).all(postId);
  return { items: rows.map(shape) };
}

// 요청 1건당 댓글 1건만 생성한다.
function addComment(postId, content) {
  ensurePost(postId);
  const text = typeof content === 'string' ? content.trim() : '';
  if (!text) throw new HttpError(400, '댓글 내용을 입력해 주세요.');
  if (text.length > 300) throw new HttpError(400, '댓글은 300자 이내로 입력해 주세요.');
  const info = db
    .prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)')
    .run(postId, ME_ID, text, new Date().toISOString());
  activity.log('comment_create', 'post', postId, `게시물 #${postId}에 댓글을 작성했습니다.`);
  const row = db.prepare(`${COMMENT_SELECT} WHERE c.id = ?`).get(Number(info.lastInsertRowid));
  return { comment: shape(row), comment_count: countFor(postId) };
}

function deleteComment(id) {
  const row = db.prepare('SELECT id, post_id, user_id FROM comments WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, '댓글을 찾을 수 없습니다.');
  if (row.user_id !== ME_ID) throw new HttpError(403, '본인의 댓글만 삭제할 수 있습니다.');
  db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  activity.log('comment_delete', 'post', row.post_id, `게시물 #${row.post_id}의 댓글을 삭제했습니다.`);
  return { ok: true, post_id: row.post_id, comment_count: countFor(row.post_id) };
}

module.exports = { listComments, addComment, deleteComment };
