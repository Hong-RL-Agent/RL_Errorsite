const { getDb } = require('../db/init');
const { isDate } = require('./dates');
const { HttpError, toInt, nowIso, logActivity } = require('./common');

const PRIORITIES = ['low', 'normal', 'high'];

const toTask = (r) => ({
  id: r.id, userId: r.user_id, title: r.title, done: !!r.done, dueDate: r.due_date, priority: r.priority,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

function listTasks(q) {
  const where = ['user_id = ?'];
  const args = [toInt(q.userId, 1)];
  if (q.status === 'open') where.push('done = 0');
  else if (q.status === 'done') where.push('done = 1');
  else if (q.status) throw new HttpError(400, 'INVALID_STATUS', 'status 는 open 또는 done 이어야 합니다.');
  const rows = getDb().prepare(`SELECT * FROM tasks WHERE ${where.join(' AND ')} ORDER BY done, due_date, id LIMIT ?`).all(...args, Math.min(300, toInt(q.limit, 100)));
  return { data: rows.map(toTask), meta: { total: rows.length } };
}

function checkFields(f) {
  if (typeof f.title !== 'string' || !f.title.trim()) throw new HttpError(400, 'INVALID_TITLE', '할 일 제목을 입력해 주세요.');
  if (f.title.trim().length > 100) throw new HttpError(400, 'INVALID_TITLE', '제목은 100자 이내여야 합니다.');
  if (f.dueDate && !isDate(f.dueDate)) throw new HttpError(400, 'INVALID_DATE', '마감일 형식이 올바르지 않습니다.');
  if (!PRIORITIES.includes(f.priority)) throw new HttpError(400, 'INVALID_PRIORITY', '우선순위 값이 올바르지 않습니다.');
}

function createTask(body, userId) {
  const f = { title: body.title, dueDate: body.dueDate || null, priority: body.priority || 'normal' };
  checkFields(f);
  const now = nowIso();
  const { lastInsertRowid } = getDb().prepare('INSERT INTO tasks (user_id,title,done,due_date,priority,created_at,updated_at) VALUES (?,?,0,?,?,?,?)')
    .run(userId, f.title.trim(), f.dueDate, f.priority, now, now);
  logActivity(userId, 'task_create', `할 일 추가: ${f.title.trim()}`);
  return { data: toTask(getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(lastInsertRowid)) };
}

function updateTask(id, body, userId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'TASK_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  const f = {
    title: body.title !== undefined ? body.title : row.title,
    dueDate: body.dueDate !== undefined ? body.dueDate || null : row.due_date,
    priority: body.priority !== undefined ? body.priority : row.priority,
  };
  checkFields(f);
  const done = body.done !== undefined ? (body.done ? 1 : 0) : row.done;
  db.prepare('UPDATE tasks SET title=?, due_date=?, priority=?, done=?, updated_at=? WHERE id=?').run(f.title.trim(), f.dueDate, f.priority, done, nowIso(), id);
  if (done && !row.done) logActivity(userId, 'task_done', `할 일 완료: ${f.title.trim()}`);
  else logActivity(userId, 'task_update', `할 일 수정: ${f.title.trim()}`);
  return { data: toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)) };
}

function deleteTask(id, userId) {
  const row = getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'TASK_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id);
  logActivity(userId, 'task_delete', `할 일 삭제: ${row.title}`);
  return { data: { id } };
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
