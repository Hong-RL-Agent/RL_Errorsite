const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { openDb, run, all, get, createSchema } = require("./db/init");
const { seed } = require("./db/seed");

const PORT = 9722;
fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
const db = openDb();
const app = express();
app.use(cors({ origin: "http://localhost:5323" }));
app.use(express.json());

const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
async function log(userId, message) { await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [uid("A"), userId || 1, message, now()]); }

async function bootstrap() {
  await createSchema(db);
  const row = await get(db, "SELECT COUNT(*) AS count FROM users");
  if (!row || row.count === 0) await seed(db);
}

function threadSelect(extra = "") {
  return `SELECT t.*, b.name AS boardName, u.name AS authorName,
    substr(t.body, 1, 120) AS excerpt,
    (SELECT COUNT(*) FROM replies r WHERE r.threadId = t.id AND r.deleted = 0) AS replyCount
    ${extra}
    FROM threads t JOIN boards b ON b.id = t.boardId JOIN users u ON u.id = t.userId`;
}

app.get("/api/health", (req, res) => res.json({ ok: true, siteId: "B-08", name: "ThreadGarden", use: "Validation" }));

app.get("/api/boards", asyncHandler(async (req, res) => {
  const items = await all(db, "SELECT b.*, (SELECT COUNT(*) FROM threads t WHERE t.boardId = b.id AND t.deleted = 0) AS threadCount FROM boards b ORDER BY b.id");
  res.json({ items });
}));

app.get("/api/boards/:id", asyncHandler(async (req, res) => {
  const board = await get(db, "SELECT * FROM boards WHERE id = ?", [req.params.id]);
  if (!board) return res.status(404).json({ error: "게시판을 찾을 수 없습니다." });
  res.json({ board });
}));

app.get("/api/threads", asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 50);
  const params = [];
  const conditions = ["t.deleted = 0"];
  if (req.query.boardId) { conditions.push("t.boardId = ?"); params.push(req.query.boardId); }
  if (req.query.q) { conditions.push("(t.title LIKE ? OR t.body LIKE ? OR t.tags LIKE ? OR u.name LIKE ?)"); params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`); }
  if (req.query.tag) { conditions.push("t.tags LIKE ?"); params.push(`%${req.query.tag}%`); }
  const where = `WHERE ${conditions.join(" AND ")}`;
  const order = req.query.sort === "popular" ? "t.recommendCount DESC, t.createdAt DESC" : "t.createdAt DESC";
  const total = await get(db, `SELECT COUNT(*) AS count FROM threads t JOIN users u ON u.id = t.userId ${where}`, params);
  const items = await all(db, `${threadSelect()} ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);
  res.json({ items, total: total.count, page, limit });
}));

app.get("/api/threads/:id", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  const extra = `, EXISTS(SELECT 1 FROM bookmarks bm WHERE bm.threadId = t.id AND bm.userId = ${userId}) AS bookmarked,
    EXISTS(SELECT 1 FROM recommendations rc WHERE rc.threadId = t.id AND rc.userId = ${userId}) AS recommended`;
  const thread = await get(db, `${threadSelect(extra)} WHERE t.id = ? AND t.deleted = 0`, [req.params.id]);
  if (!thread) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  res.json({ thread: { ...thread, bookmarked: Boolean(thread.bookmarked), recommended: Boolean(thread.recommended), solved: Boolean(thread.solved) } });
}));

app.post("/api/threads", asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.body) return res.status(400).json({ error: "제목과 본문이 필요합니다." });
  const id = uid("T");
  await run(db, "INSERT INTO threads VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, req.body.boardId, req.body.userId || 1, req.body.title, req.body.body, req.body.tags || "", 0, 0, 0, now(), now(), 0]);
  await log(req.body.userId || 1, `${req.body.title} 게시글을 작성했습니다.`);
  res.status(201).json({ id });
}));

app.patch("/api/threads/:id", asyncHandler(async (req, res) => {
  const current = await get(db, "SELECT * FROM threads WHERE id = ? AND deleted = 0", [req.params.id]);
  if (!current) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  const next = { ...current, ...req.body };
  await run(db, "UPDATE threads SET title = ?, body = ?, tags = ?, boardId = ?, updatedAt = ? WHERE id = ?", [next.title, next.body, next.tags, next.boardId, now(), req.params.id]);
  await log(current.userId, `${req.params.id} 게시글을 수정했습니다.`);
  res.json({ ok: true });
}));

app.delete("/api/threads/:id", asyncHandler(async (req, res) => {
  await run(db, "UPDATE threads SET deleted = 1, updatedAt = ? WHERE id = ?", [now(), req.params.id]);
  res.json({ ok: true });
}));

app.get("/api/threads/:id/replies", asyncHandler(async (req, res) => {
  const items = await all(db, "SELECT r.*, u.name AS authorName FROM replies r JOIN users u ON u.id = r.userId WHERE r.threadId = ? AND r.deleted = 0 ORDER BY COALESCE(r.parentId, r.id), r.createdAt ASC", [req.params.id]);
  res.json({ items });
}));

app.post("/api/threads/:id/replies", asyncHandler(async (req, res) => {
  if (!req.body.body) return res.status(400).json({ error: "댓글 내용이 필요합니다." });
  const id = uid("R");
  await run(db, "INSERT INTO replies VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, req.params.id, req.body.parentId || null, req.body.userId || 1, req.body.body, now(), now(), 0]);
  await log(req.body.userId || 1, `${req.params.id}에 댓글을 작성했습니다.`);
  res.status(201).json({ id });
}));

app.patch("/api/replies/:id", asyncHandler(async (req, res) => {
  await run(db, "UPDATE replies SET body = ?, updatedAt = ? WHERE id = ?", [req.body.body, now(), req.params.id]);
  res.json({ ok: true });
}));

app.delete("/api/replies/:id", asyncHandler(async (req, res) => {
  await run(db, "UPDATE replies SET deleted = 1 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
}));

app.post("/api/threads/:id/recommend", asyncHandler(async (req, res) => {
  const exists = await get(db, "SELECT id FROM recommendations WHERE userId = ? AND threadId = ?", [req.body.userId || 1, req.params.id]);
  if (!exists) {
    await run(db, "INSERT INTO recommendations VALUES (?, ?, ?, ?)", [uid("RC"), req.body.userId || 1, req.params.id, now()]);
    await run(db, "UPDATE threads SET recommendCount = recommendCount + 1 WHERE id = ?", [req.params.id]);
  }
  res.json({ ok: true });
}));

app.delete("/api/threads/:id/recommend", asyncHandler(async (req, res) => {
  const removed = await run(db, "DELETE FROM recommendations WHERE userId = ? AND threadId = ?", [req.query.userId || 1, req.params.id]);
  if (removed.changes) await run(db, "UPDATE threads SET recommendCount = MAX(recommendCount - 1, 0) WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
}));

app.get("/api/bookmarks", asyncHandler(async (req, res) => {
  const items = await all(db, "SELECT bm.*, t.title FROM bookmarks bm JOIN threads t ON t.id = bm.threadId WHERE bm.userId = ? ORDER BY bm.createdAt DESC", [req.query.userId || 1]);
  res.json({ items });
}));

app.post("/api/bookmarks", asyncHandler(async (req, res) => {
  const exists = await get(db, "SELECT id FROM bookmarks WHERE userId = ? AND threadId = ?", [req.body.userId || 1, req.body.threadId]);
  if (!exists) {
    await run(db, "INSERT INTO bookmarks VALUES (?, ?, ?, ?)", [uid("BM"), req.body.userId || 1, req.body.threadId, now()]);
    await run(db, "UPDATE threads SET bookmarkCount = bookmarkCount + 1 WHERE id = ?", [req.body.threadId]);
  }
  res.status(201).json({ ok: true });
}));

app.delete("/api/bookmarks/:threadId", asyncHandler(async (req, res) => {
  const removed = await run(db, "DELETE FROM bookmarks WHERE userId = ? AND threadId = ?", [req.query.userId || 1, req.params.threadId]);
  if (removed.changes) await run(db, "UPDATE threads SET bookmarkCount = MAX(bookmarkCount - 1, 0) WHERE id = ?", [req.params.threadId]);
  res.json({ ok: true });
}));

app.get("/api/drafts", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM drafts WHERE userId = ? ORDER BY updatedAt DESC", [req.query.userId || 1]) });
}));

app.post("/api/drafts", asyncHandler(async (req, res) => {
  const id = uid("D");
  await run(db, "INSERT INTO drafts VALUES (?, ?, ?, ?, ?, ?, ?)", [id, req.body.userId || 1, req.body.boardId, req.body.title || "", req.body.body || "", req.body.tags || "", now()]);
  const draft = await get(db, "SELECT * FROM drafts WHERE id = ?", [id]);
  res.status(201).json({ draft });
}));

app.patch("/api/drafts/:id", asyncHandler(async (req, res) => {
  await run(db, "UPDATE drafts SET boardId = ?, title = ?, body = ?, tags = ?, updatedAt = ? WHERE id = ?", [req.body.boardId, req.body.title, req.body.body, req.body.tags, now(), req.params.id]);
  res.json({ ok: true });
}));

app.post("/api/threads/:id/resolve", asyncHandler(async (req, res) => {
  await run(db, "UPDATE threads SET solved = 1 WHERE id = ?", [req.params.id]);
  await run(db, "INSERT INTO resolve_logs VALUES (?, ?, ?, ?)", [uid("SV"), req.params.id, 1, now()]);
  res.json({ ok: true });
}));

app.get("/api/tags", asyncHandler(async (req, res) => {
  const rows = await all(db, "SELECT tags FROM threads WHERE deleted = 0");
  const counts = {};
  rows.flatMap((row) => row.tags.split(",")).forEach((tag) => { if (tag) counts[tag] = (counts[tag] || 0) + 1; });
  res.json({ items: Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count) });
}));

app.get("/api/users", asyncHandler(async (req, res) => res.json({ items: await all(db, "SELECT * FROM users ORDER BY id ASC") })));
app.get("/api/users/:id", asyncHandler(async (req, res) => res.json({ user: await get(db, "SELECT * FROM users WHERE id = ?", [req.params.id]) })));
app.get("/api/notifications", asyncHandler(async (req, res) => res.json({ items: await all(db, "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC", [req.query.userId || 1]) })));
app.patch("/api/notifications/:id/read", asyncHandler(async (req, res) => { await run(db, "UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id]); res.json({ ok: true }); }));
app.get("/api/activity", asyncHandler(async (req, res) => res.json({ items: await all(db, "SELECT * FROM activity WHERE userId = ? ORDER BY createdAt DESC", [req.query.userId || 1]) })));
app.post("/api/test/reset", asyncHandler(async (req, res) => { await seed(db); res.json({ ok: true, restored: true, siteId: "B-08" }); }));

app.use((error, req, res, next) => res.status(500).json({ error: "서버 요청 처리 중 오류가 발생했습니다." }));

bootstrap().then(() => app.listen(PORT, () => console.log(`ThreadGarden B-08 API listening on http://localhost:${PORT}`))).catch((error) => {
  console.error(error);
  process.exit(1);
});
