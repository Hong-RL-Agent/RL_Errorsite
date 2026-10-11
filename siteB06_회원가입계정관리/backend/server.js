const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { openDb, run, all, get, createSchema } = require("./db/init");
const { seed, hash } = require("./db/seed");

const PORT = 9720;
fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });

const db = openDb();
const app = express();
app.use(cors({ origin: "http://localhost:5321" }));
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function now() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

async function log(userId, message) {
  await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [uid("A"), userId || 1, message, now()]);
}

async function bootstrap() {
  await createSchema(db);
  const row = await get(db, "SELECT COUNT(*) AS count FROM users");
  if (!row || row.count === 0) await seed(db);
}

app.get("/api/health", (req, res) => res.json({ ok: true, siteId: "B-06", name: "AccountFlow", strategy: "SEQUENCE_REPLAY" }));

app.get("/api/users", asyncHandler(async (req, res) => {
  const q = req.query.q ? "WHERE name LIKE ? OR email LIKE ? OR accountId LIKE ?" : "";
  const params = req.query.q ? [`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`] : [];
  res.json({ items: await all(db, `SELECT id, accountId, email, name, joinedAt, status FROM users ${q} ORDER BY id ASC LIMIT 50`, params) });
}));

app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const user = await get(db, "SELECT id, accountId, email, name, joinedAt, status FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json({ user });
}));

app.get("/api/users/:id/profile", asyncHandler(async (req, res) => {
  const profile = await get(db, "SELECT p.*, u.email, u.name, u.status FROM profiles p JOIN users u ON u.id = p.userId WHERE p.userId = ?", [req.params.id]);
  if (!profile) return res.status(404).json({ error: "프로필을 찾을 수 없습니다." });
  res.json({ profile });
}));

app.patch("/api/users/:id/profile", asyncHandler(async (req, res) => {
  const current = await get(db, "SELECT * FROM profiles WHERE userId = ?", [req.params.id]);
  if (!current) return res.status(404).json({ error: "프로필을 찾을 수 없습니다." });
  const next = { ...current, ...req.body };
  await run(db, "UPDATE profiles SET nickname = ?, phone = ?, avatar = ?, bio = ? WHERE userId = ?", [next.nickname, next.phone, next.avatar, next.bio, req.params.id]);
  for (const field of ["nickname", "phone", "avatar", "bio"]) {
    if (req.body[field] !== undefined && req.body[field] !== current[field]) {
      await run(db, "INSERT INTO profile_changes VALUES (?, ?, ?, ?, ?, ?)", [uid("PC"), req.params.id, field, current[field] || "", req.body[field] || "", now()]);
    }
  }
  await log(req.params.id, "프로필 정보를 수정했습니다.");
  const profile = await get(db, "SELECT p.*, u.email, u.name, u.status FROM profiles p JOIN users u ON u.id = p.userId WHERE p.userId = ?", [req.params.id]);
  res.json({ profile });
}));

app.post("/api/auth/signup/start", asyncHandler(async (req, res) => {
  const { email, accountId, name, password } = req.body;
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return res.status(400).json({ error: "올바른 이메일이 필요합니다." });
  if (!password || password.length < 8) return res.status(400).json({ error: "비밀번호는 8자 이상이어야 합니다." });
  const exists = await get(db, "SELECT id FROM users WHERE email = ? OR accountId = ?", [email, accountId]);
  if (exists) return res.status(409).json({ error: "이미 사용 중인 이메일 또는 계정 ID입니다." });
  const id = uid("SG");
  await run(db, "INSERT INTO signup_progress VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, email, accountId, name, hash(password), "account", JSON.stringify(req.body), now(), now()]);
  res.status(201).json({ signupId: id });
}));

app.post("/api/auth/check-email", asyncHandler(async (req, res) => {
  const user = await get(db, "SELECT id FROM users WHERE email = ?", [req.body.email]);
  const pending = await get(db, "SELECT id FROM signup_progress WHERE email = ? AND step <> 'completed'", [req.body.email]);
  res.json({ available: !user && !pending });
}));

app.post("/api/auth/verification/send", asyncHandler(async (req, res) => {
  const progress = await get(db, "SELECT * FROM signup_progress WHERE id = ?", [req.body.signupId]);
  if (!progress) return res.status(404).json({ error: "가입 진행 정보를 찾을 수 없습니다." });
  const code = String(100000 + Math.floor(Math.random() * 900000));
  await run(db, "INSERT INTO verifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [uid("VF"), req.body.signupId, req.body.email, code, 0, new Date(Date.now() + 10 * 60 * 1000).toISOString(), "sent", now()]);
  res.json({ sent: true, code });
}));

app.post("/api/auth/verification/confirm", asyncHandler(async (req, res) => {
  const record = await get(db, "SELECT * FROM verifications WHERE signupId = ? AND email = ? ORDER BY createdAt DESC LIMIT 1", [req.body.signupId, req.body.email]);
  if (!record) return res.status(404).json({ error: "인증 기록이 없습니다." });
  if (record.status === "expired" || record.expiresAt < now()) return res.status(410).json({ error: "인증 코드가 만료되었습니다." });
  if (record.code !== req.body.code) {
    await run(db, "UPDATE verifications SET attempts = attempts + 1 WHERE id = ?", [record.id]);
    return res.status(400).json({ error: "인증 코드가 일치하지 않습니다." });
  }
  await run(db, "UPDATE verifications SET status = ? WHERE id = ?", ["confirmed", record.id]);
  await run(db, "UPDATE signup_progress SET step = ?, updatedAt = ? WHERE id = ?", ["verified", now(), req.body.signupId]);
  res.json({ confirmed: true });
}));

app.post("/api/auth/signup/complete", asyncHandler(async (req, res) => {
  const progress = await get(db, "SELECT * FROM signup_progress WHERE id = ?", [req.body.signupId]);
  if (!progress) return res.status(404).json({ error: "가입 진행 정보를 찾을 수 없습니다." });
  const verified = await get(db, "SELECT id FROM verifications WHERE signupId = ? AND status = 'confirmed'", [req.body.signupId]);
  if (!verified) return res.status(409).json({ error: "이메일 인증이 필요합니다." });
  const inserted = await run(db, "INSERT INTO users (accountId, email, passwordHash, name, joinedAt, status, sessionToken) VALUES (?, ?, ?, ?, ?, ?, ?)", [progress.accountId, progress.email, progress.passwordHash, progress.name, now(), "active", null]);
  const userId = inserted.lastID;
  await run(db, "INSERT INTO profiles VALUES (?, ?, ?, ?, ?)", [userId, req.body.nickname, req.body.phone, req.body.avatar, "새 계정 프로필입니다."]);
  await run(db, "INSERT INTO settings VALUES (?, ?, ?, ?, ?, ?)", [userId, 1, 1, 1, "ko-KR", "Asia/Seoul"]);
  await run(db, "UPDATE signup_progress SET step = ?, updatedAt = ? WHERE id = ?", ["completed", now(), req.body.signupId]);
  await log(userId, "회원가입을 완료했습니다.");
  res.status(201).json({ user: { id: userId, email: progress.email, name: progress.name } });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const user = await get(db, "SELECT * FROM users WHERE email = ? AND status = 'active'", [req.body.email]);
  if (!user || user.passwordHash !== hash(req.body.password)) return res.status(401).json({ error: "로그인 정보가 올바르지 않습니다." });
  const token = crypto.randomBytes(16).toString("hex");
  await run(db, "UPDATE users SET sessionToken = ? WHERE id = ?", [token, user.id]);
  await log(user.id, "로그인했습니다.");
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}));

app.post("/api/auth/logout", asyncHandler(async (req, res) => {
  await run(db, "UPDATE users SET sessionToken = NULL");
  res.json({ ok: true });
}));

app.get("/api/signup/progress/:id", asyncHandler(async (req, res) => {
  const progress = await get(db, "SELECT * FROM signup_progress WHERE id = ?", [req.params.id]);
  if (!progress) return res.status(404).json({ error: "가입 진행 정보를 찾을 수 없습니다." });
  res.json({ progress: { ...progress, payload: JSON.parse(progress.payload || "{}") } });
}));

app.patch("/api/signup/progress/:id", asyncHandler(async (req, res) => {
  await run(db, "UPDATE signup_progress SET step = COALESCE(?, step), payload = COALESCE(?, payload), updatedAt = ? WHERE id = ?", [req.body.step, req.body.payload ? JSON.stringify(req.body.payload) : null, now(), req.params.id]);
  res.json({ ok: true });
}));

app.get("/api/onboarding", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM onboarding ORDER BY sortOrder ASC") });
}));

app.get("/api/accounts/:id/settings", asyncHandler(async (req, res) => {
  const settings = await get(db, "SELECT * FROM settings WHERE userId = ?", [req.params.id]);
  if (!settings) return res.status(404).json({ error: "설정을 찾을 수 없습니다." });
  res.json({ settings: { ...settings, emailNotifications: Boolean(settings.emailNotifications), productNews: Boolean(settings.productNews), publicProfile: Boolean(settings.publicProfile) } });
}));

app.patch("/api/accounts/:id/settings", asyncHandler(async (req, res) => {
  await run(db, "UPDATE settings SET emailNotifications = ?, productNews = ?, publicProfile = ?, locale = COALESCE(?, locale), timezone = COALESCE(?, timezone) WHERE userId = ?", [req.body.emailNotifications ? 1 : 0, req.body.productNews ? 1 : 0, req.body.publicProfile ? 1 : 0, req.body.locale, req.body.timezone, req.params.id]);
  await log(req.params.id, "계정 설정을 변경했습니다.");
  const settings = await get(db, "SELECT * FROM settings WHERE userId = ?", [req.params.id]);
  res.json({ settings: { ...settings, emailNotifications: Boolean(settings.emailNotifications), productNews: Boolean(settings.productNews), publicProfile: Boolean(settings.publicProfile) } });
}));

app.patch("/api/accounts/:id/password", asyncHandler(async (req, res) => {
  const user = await get(db, "SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user || user.passwordHash !== hash(req.body.currentPassword)) return res.status(401).json({ error: "현재 비밀번호가 일치하지 않습니다." });
  if (!req.body.nextPassword || req.body.nextPassword.length < 8) return res.status(400).json({ error: "새 비밀번호는 8자 이상이어야 합니다." });
  await run(db, "UPDATE users SET passwordHash = ? WHERE id = ?", [hash(req.body.nextPassword), req.params.id]);
  await log(req.params.id, "비밀번호를 변경했습니다.");
  res.json({ ok: true });
}));

app.delete("/api/accounts/:id", asyncHandler(async (req, res) => {
  await run(db, "UPDATE users SET status = ?, sessionToken = NULL WHERE id = ?", ["deleted", req.params.id]);
  await log(req.params.id, "계정 삭제를 요청했습니다.");
  res.json({ ok: true });
}));

app.get("/api/notifications", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  res.json({ items: await all(db, "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC", [userId]) });
}));

app.patch("/api/notifications/:id/read", asyncHandler(async (req, res) => {
  await run(db, "UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
}));

app.get("/api/activity", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  res.json({ items: await all(db, "SELECT * FROM activity WHERE userId = ? ORDER BY createdAt DESC", [userId]) });
}));

app.post("/api/test/reset", asyncHandler(async (req, res) => {
  await seed(db);
  res.json({ ok: true, restored: true, siteId: "B-06" });
}));

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: error.status ? error.message : "서버 요청 처리 중 오류가 발생했습니다." });
});

bootstrap().then(() => {
  app.listen(PORT, () => console.log(`AccountFlow B-06 API listening on http://localhost:${PORT}`));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
