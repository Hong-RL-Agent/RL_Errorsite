const { getDb } = require('../db/init');
const D = require('./dates');
const { HttpError, toInt, nowIso, logActivity } = require('./common');

const STATUSES = ['scheduled', 'done', 'cancelled'];
const REPEATS = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
const REMINDERS = ['none', '10m', '30m', '1h', '1d'];

const SELECT = `SELECT e.*, c.name AS category_name FROM events e JOIN categories c ON c.id = e.category_id`;

const toEvent = (r) => ({
  id: r.id, userId: r.user_id, title: r.title, description: r.description,
  startDate: r.start_date, endDate: r.end_date, startTime: r.start_time, endTime: r.end_time,
  location: r.location, categoryId: r.category_id, category: r.category_name, color: r.color,
  repeatRule: r.repeat_rule, reminder: r.reminder, status: r.status, deleted: !!r.deleted,
  recurringId: r.recurring_id, createdAt: r.created_at, updatedAt: r.updated_at,
});

// ---------- 검증 ----------
function checkCategory(id) {
  const c = getDb().prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!c) throw new HttpError(400, 'INVALID_CATEGORY', '존재하지 않는 카테고리입니다.');
  return c;
}

function validateEventFields(f) {
  if (typeof f.title !== 'string' || !f.title.trim()) throw new HttpError(400, 'INVALID_TITLE', '제목을 입력해 주세요.');
  if (f.title.trim().length > 100) throw new HttpError(400, 'INVALID_TITLE', '제목은 100자 이내여야 합니다.');
  if (!D.isDate(f.startDate)) throw new HttpError(400, 'INVALID_DATE', '시작일 형식이 올바르지 않습니다.');
  if (!D.isDate(f.endDate)) throw new HttpError(400, 'INVALID_DATE', '종료일 형식이 올바르지 않습니다.');
  if (f.endDate < f.startDate) throw new HttpError(400, 'INVALID_RANGE', '종료일은 시작일보다 빠를 수 없습니다.');
  if (!D.isTime(f.startTime) || !D.isTime(f.endTime)) throw new HttpError(400, 'INVALID_TIME', '시간 형식(HH:MM)이 올바르지 않습니다.');
  if (f.endDate === f.startDate && D.minutes(f.endTime) <= D.minutes(f.startTime)) throw new HttpError(400, 'INVALID_RANGE', '종료 시간은 시작 시간보다 늦어야 합니다.');
  if (typeof f.location === 'string' && f.location.length > 100) throw new HttpError(400, 'INVALID_LOCATION', '장소는 100자 이내여야 합니다.');
  if (!REPEATS.includes(f.repeatRule)) throw new HttpError(400, 'INVALID_REPEAT', '반복 규칙이 올바르지 않습니다.');
  if (!REMINDERS.includes(f.reminder)) throw new HttpError(400, 'INVALID_REMINDER', '알림 설정이 올바르지 않습니다.');
  if (!STATUSES.includes(f.status)) throw new HttpError(400, 'INVALID_STATUS', '상태 값이 올바르지 않습니다.');
}

function normalize(body, base = {}) {
  const pick = (k, alt) => (body[k] !== undefined ? body[k] : body[alt] !== undefined ? body[alt] : base[k]);
  return {
    title: body.title !== undefined ? String(body.title) : base.title,
    description: body.description !== undefined ? String(body.description) : base.description || '',
    startDate: body.startDate !== undefined ? body.startDate : base.startDate,
    endDate: body.endDate !== undefined ? body.endDate : (body.startDate !== undefined && base.endDate === undefined ? body.startDate : base.endDate),
    startTime: body.startTime !== undefined ? body.startTime : base.startTime || '09:00',
    endTime: body.endTime !== undefined ? body.endTime : base.endTime || '10:00',
    location: body.location !== undefined ? String(body.location) : base.location || '',
    categoryId: toInt(pick('categoryId'), base.categoryId || 12),
    repeatRule: body.repeatRule !== undefined ? body.repeatRule : base.repeatRule || 'none',
    reminder: body.reminder !== undefined ? body.reminder : base.reminder || 'none',
    status: body.status !== undefined ? body.status : base.status || 'scheduled',
  };
}

// ---------- 조회 ----------
function queryEvents(q, forcedRange) {
  const where = [];
  const args = [];
  if (!(q.includeDeleted === '1')) where.push('e.deleted = 0');
  if (q.userId !== undefined && q.userId !== '') { where.push('e.user_id = ?'); args.push(toInt(q.userId, 1)); }
  const from = forcedRange ? forcedRange.from : q.from;
  const to = forcedRange ? forcedRange.to : q.to;
  if (from) { if (!D.isDate(from)) throw new HttpError(400, 'INVALID_DATE', 'from 날짜 형식이 올바르지 않습니다.'); where.push('e.end_date >= ?'); args.push(from); }
  if (to) { if (!D.isDate(to)) throw new HttpError(400, 'INVALID_DATE', 'to 날짜 형식이 올바르지 않습니다.'); where.push('e.start_date <= ?'); args.push(to); }
  if (from && to && from > to) throw new HttpError(400, 'INVALID_RANGE', '검색 시작일이 종료일보다 늦습니다.');
  if (q.category) { where.push('e.category_id = ?'); args.push(toInt(q.category, 0)); }
  if (q.status) {
    if (!STATUSES.includes(q.status)) throw new HttpError(400, 'INVALID_STATUS', '상태 값이 올바르지 않습니다.');
    where.push('e.status = ?'); args.push(q.status);
  }
  const text = (q.q || '').trim();
  text.split(/\s+/).filter(Boolean).forEach((tok) => {
    where.push('(e.title LIKE ? OR e.location LIKE ? OR e.description LIKE ?)');
    const like = `%${tok}%`; args.push(like, like, like);
  });
  const limit = Math.min(500, Math.max(1, toInt(q.limit, 200)));
  const rows = getDb().prepare(`${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY e.start_date, e.start_time, e.id LIMIT ?`).all(...args, limit);
  return rows.map(toEvent);
}

function listEvents(q) {
  const data = queryEvents({ userId: 1, ...q });
  return { data, meta: { total: data.length } };
}

function calendar(q) {
  const view = ['month', 'week', 'day'].includes(q.view) ? q.view : 'month';
  const date = q.date || D.DEMO_TODAY;
  if (!D.isDate(date)) throw new HttpError(400, 'INVALID_DATE', 'date 형식이 올바르지 않습니다.');
  const range = D.rangeFor(view, date);
  const data = queryEvents({ userId: 1, ...q, from: undefined, to: undefined, category: q.category, status: q.status }, range);
  return { data, meta: { view, date, rangeStart: range.from, rangeEnd: range.to, total: data.length } };
}

function statistics(q) {
  const db = getDb();
  const uid = toInt(q.userId, 1);
  const today = q.date && D.isDate(q.date) ? q.date : D.DEMO_TODAY;
  const wk = D.rangeFor('week', today);
  const mo = { from: `${today.slice(0, 7)}-01`, to: D.addDays(D.addMonths(`${today.slice(0, 7)}-01`, 1), -1) };
  const cnt = (from, to, extra = '') => db.prepare(`SELECT COUNT(*) AS n FROM events WHERE deleted = 0 AND user_id = ? AND end_date >= ? AND start_date <= ? ${extra}`).get(uid, from, to).n;
  const byCategory = db.prepare(`SELECT c.name, c.color, COUNT(e.id) AS n FROM categories c LEFT JOIN events e
    ON e.category_id = c.id AND e.deleted = 0 AND e.user_id = ? AND e.end_date >= ? AND e.start_date <= ? GROUP BY c.id HAVING n > 0 ORDER BY n DESC`).all(uid, mo.from, mo.to)
    .map((r) => ({ name: r.name, color: r.color, count: r.n }));
  return {
    data: {
      date: today,
      today: { total: cnt(today, today), done: cnt(today, today, "AND status = 'done'"), remaining: cnt(today, today, "AND status = 'scheduled'") },
      week: cnt(wk.from, wk.to),
      month: cnt(mo.from, mo.to),
      byCategory,
      openTasks: db.prepare('SELECT COUNT(*) AS n FROM tasks WHERE user_id = ? AND done = 0').get(uid).n,
      doneTasks: db.prepare('SELECT COUNT(*) AS n FROM tasks WHERE user_id = ? AND done = 1').get(uid).n,
      unreadNotifications: db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0').get(uid).n,
    },
  };
}

function getEvent(id) {
  const db = getDb();
  const row = db.prepare(`${SELECT} WHERE e.id = ?`).get(id);
  if (!row) throw new HttpError(404, 'EVENT_NOT_FOUND', '일정을 찾을 수 없습니다.');
  const history = db.prepare('SELECT field, before_value, after_value, created_at FROM event_revisions WHERE event_id = ? ORDER BY id DESC LIMIT 8').all(id)
    .map((r) => ({ field: r.field, before: r.before_value, after: r.after_value, createdAt: r.created_at }));
  const notesCount = db.prepare('SELECT COUNT(*) AS n FROM notes WHERE event_id = ?').get(id).n;
  return { data: { ...toEvent(row), history, notesCount } };
}

// ---------- 생성 ----------
const STEP = { daily: (d, k) => D.addDays(d, k), weekly: (d, k) => D.addDays(d, 7 * k), monthly: (d, k) => D.addMonths(d, k), yearly: (d, k) => D.addMonths(d, 12 * k) };

function insertEvent(userId, f, cat, recurringId, createdAt) {
  const { lastInsertRowid } = getDb().prepare(`INSERT INTO events (user_id,title,description,start_date,end_date,start_time,end_time,location,category_id,color,repeat_rule,reminder,status,deleted,recurring_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,?)`).run(userId, f.title.trim(), f.description, f.startDate, f.endDate, f.startTime, f.endTime, f.location.trim(), cat.id, cat.color, f.repeatRule, f.reminder, f.status, recurringId, createdAt, createdAt);
  return lastInsertRowid;
}

function createRecurring(body, userId) {
  const f = normalize({ ...body, status: 'scheduled' });
  validateEventFields(f);
  if (f.repeatRule === 'none') throw new HttpError(400, 'INVALID_REPEAT', '반복 규칙을 선택해 주세요.');
  const count = toInt(body.repeatCount ?? body.occurrences, 4);
  if (count < 1 || count > 26) throw new HttpError(400, 'INVALID_REPEAT', '반복 횟수는 1~26회 사이여야 합니다.');
  const cat = checkCategory(f.categoryId);
  const db = getDb();
  const now = nowIso();
  const span = Math.round((Date.parse(f.endDate) - Date.parse(f.startDate)) / 86400000);
  let ids = [];
  let rid;
  db.transaction(() => {
    rid = db.prepare(`INSERT INTO recurring_events (user_id,title,description,rule,occurrences,start_date,start_time,end_time,location,category_id,reminder,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(userId, f.title.trim(), f.description, f.repeatRule, count, f.startDate, f.startTime, f.endTime, f.location.trim(), cat.id, f.reminder, now, now).lastInsertRowid;
    for (let k = 0; k < count; k += 1) {
      const s = STEP[f.repeatRule](f.startDate, k);
      ids.push(insertEvent(userId, { ...f, startDate: s, endDate: D.addDays(s, span) }, cat, rid, now));
    }
  })();
  logActivity(userId, 'event_create', `반복 일정 생성: ${f.title.trim()} (${count}회)`);
  return { recurringId: rid, eventIds: ids };
}

function createEvent(body, userId) {
  const f = normalize(body);
  validateEventFields(f);
  const cat = checkCategory(f.categoryId);
  if (f.repeatRule !== 'none') {
    const { eventIds, recurringId } = createRecurring(body, userId);
    return { data: getEvent(eventIds[0]).data, meta: { recurringId, occurrences: eventIds.length } };
  }
  const id = insertEvent(userId, f, cat, null, nowIso());
  logActivity(userId, 'event_create', `일정 생성: ${f.title.trim()}`);
  return { data: getEvent(id).data };
}

// ---------- 수정/삭제 ----------
const TRACKED = [['title', 'title'], ['description', 'description'], ['startDate', 'startDate'], ['endDate', 'endDate'], ['startTime', 'startTime'], ['endTime', 'endTime'], ['location', 'location'], ['category', 'categoryId'], ['status', 'status']];

function updateEvent(id, body, userId) {
  const db = getDb();
  const row = db.prepare(`${SELECT} WHERE e.id = ?`).get(id);
  if (!row || row.deleted) throw new HttpError(row ? 410 : 404, row ? 'EVENT_DELETED' : 'EVENT_NOT_FOUND', row ? '삭제된 일정입니다.' : '일정을 찾을 수 없습니다.');
  const base = toEvent(row);
  const f = normalize(body, base);
  f.repeatRule = base.repeatRule; // 반복 규칙 변경은 /recurring-events 에서 처리
  validateEventFields(f);
  const cat = checkCategory(f.categoryId);
  const now = nowIso();
  db.transaction(() => {
    db.prepare(`UPDATE events SET title=?,description=?,start_date=?,end_date=?,start_time=?,end_time=?,location=?,category_id=?,color=?,reminder=?,status=?,updated_at=? WHERE id=?`)
      .run(f.title.trim(), f.description, f.startDate, f.endDate, f.startTime, f.endTime, f.location.trim(), cat.id, cat.color, f.reminder, f.status, now, id);
    const ins = db.prepare('INSERT INTO event_revisions (event_id,user_id,field,before_value,after_value,created_at) VALUES (?,?,?,?,?,?)');
    TRACKED.forEach(([field, key]) => {
      const before = base[key === 'categoryId' ? 'category' : key];
      const after = key === 'categoryId' ? cat.name : f[key];
      if (String(before) !== String(after)) ins.run(id, userId, field, String(before), String(after), now);
    });
    if (body.applyToSeries && base.recurringId) {
      db.prepare(`UPDATE events SET title=?,description=?,start_time=?,end_time=?,location=?,category_id=?,color=?,reminder=?,updated_at=?
        WHERE recurring_id=? AND deleted=0 AND id<>? AND start_date>=?`).run(f.title.trim(), f.description, f.startTime, f.endTime, f.location.trim(), cat.id, cat.color, f.reminder, now, base.recurringId, id, base.startDate);
    }
  })();
  logActivity(userId, 'event_update', `일정 수정: ${f.title.trim()}`);
  return getEvent(id);
}

function deleteEvent(id, q, userId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'EVENT_NOT_FOUND', '일정을 찾을 수 없습니다.');
  if (row.deleted) return { data: { id, deleted: true, removed: 0 } };
  const now = nowIso();
  let targets = [row];
  if (q.scope === 'series' && row.recurring_id) {
    targets = db.prepare('SELECT * FROM events WHERE recurring_id = ? AND deleted = 0 AND start_date >= ?').all(row.recurring_id, row.start_date);
  }
  db.transaction(() => {
    targets.forEach((t) => {
      db.prepare("UPDATE events SET deleted = 1, status = 'cancelled', updated_at = ? WHERE id = ?").run(now, t.id);
      db.prepare('INSERT INTO event_deletions (event_id,user_id,title,deleted_at) VALUES (?,?,?,?)').run(t.id, userId, t.title, now);
    });
  })();
  logActivity(userId, 'event_delete', `일정 삭제: ${row.title}`);
  return { data: { id, deleted: true, removed: targets.length } };
}

// ---------- 반복 일정 ----------
function listRecurring(q) {
  const rows = getDb().prepare('SELECT r.*, c.name AS category_name FROM recurring_events r JOIN categories c ON c.id = r.category_id WHERE r.user_id = ? ORDER BY r.id LIMIT ?')
    .all(toInt(q.userId, 1), Math.min(200, toInt(q.limit, 100)));
  return {
    data: rows.map((r) => ({
      id: r.id, title: r.title, description: r.description, rule: r.rule, occurrences: r.occurrences, startDate: r.start_date,
      startTime: r.start_time, endTime: r.end_time, location: r.location, categoryId: r.category_id, category: r.category_name, reminder: r.reminder,
    })),
  };
}

function updateRecurring(id, body, userId) {
  const db = getDb();
  const r = db.prepare('SELECT * FROM recurring_events WHERE id = ?').get(id);
  if (!r) throw new HttpError(404, 'RECURRING_NOT_FOUND', '반복 일정을 찾을 수 없습니다.');
  const f = normalize({ startDate: r.start_date, ...body }, {
    title: r.title, description: r.description, startDate: r.start_date, endDate: r.start_date, startTime: r.start_time, endTime: r.end_time,
    location: r.location, categoryId: r.category_id, repeatRule: r.rule, reminder: r.reminder,
  });
  f.endDate = f.startDate;
  validateEventFields(f);
  if (f.repeatRule === 'none') throw new HttpError(400, 'INVALID_REPEAT', '반복 규칙이 올바르지 않습니다.');
  const cat = checkCategory(f.categoryId);
  const now = nowIso();
  db.transaction(() => {
    db.prepare(`UPDATE recurring_events SET title=?,description=?,rule=?,start_time=?,end_time=?,location=?,category_id=?,reminder=?,updated_at=? WHERE id=?`)
      .run(f.title.trim(), f.description, f.repeatRule, f.startTime, f.endTime, f.location.trim(), cat.id, f.reminder, now, id);
    db.prepare(`UPDATE events SET title=?,description=?,repeat_rule=?,start_time=?,end_time=?,location=?,category_id=?,color=?,reminder=?,updated_at=? WHERE recurring_id=? AND deleted=0`)
      .run(f.title.trim(), f.description, f.repeatRule, f.startTime, f.endTime, f.location.trim(), cat.id, cat.color, f.reminder, now, id);
  })();
  logActivity(userId, 'event_update', `반복 일정 수정: ${f.title.trim()}`);
  return listRecurring({ userId: r.user_id }).data.find((x) => x.id === id);
}

module.exports = { listEvents, queryEvents, calendar, statistics, getEvent, createEvent, updateEvent, deleteEvent, createRecurring, listRecurring, updateRecurring };
