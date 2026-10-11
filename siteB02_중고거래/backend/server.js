const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { openDb, run, all, get, createSchema } = require("./db/init");
const { seed, categories } = require("./db/seed");

const PORT = 9716;
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = openDb();
const app = express();

app.use(cors({ origin: "http://localhost:5317" }));
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

async function logActivity(userId, message) {
  await run(db, "INSERT INTO activity VALUES (?, ?, ?, ?)", [uid("A"), userId || 1, message, now()]);
}

async function notify(userId, message) {
  await run(db, "INSERT INTO notifications VALUES (?, ?, ?, ?, ?)", [uid("N"), userId || 1, message, now(), 0]);
}

async function productWithFavorite(product, userId) {
  if (!product) return null;
  const favorite = await get(db, "SELECT id FROM favorites WHERE userId = ? AND productId = ? LIMIT 1", [userId || 1, product.id]);
  return { ...product, isFavorite: Boolean(favorite) };
}

async function bootstrap() {
  await createSchema(db);
  const row = await get(db, "SELECT COUNT(*) AS count FROM users");
  if (!row || row.count === 0) {
    await seed(db);
  }
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, siteId: "B-02", name: "ReMarket", strategy: "ACTION_REPLAY" });
});

app.get("/api/categories", (req, res) => {
  res.json({ items: categories });
});

app.get("/api/products", asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 60);
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  if (req.query.q) {
    conditions.push("(p.title LIKE ? OR p.description LIKE ? OR u.name LIKE ?)");
    params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`);
  }
  if (req.query.category) {
    conditions.push("p.category = ?");
    params.push(req.query.category);
  }
  if (req.query.region) {
    conditions.push("p.region = ?");
    params.push(req.query.region);
  }
  if (req.query.minPrice) {
    conditions.push("p.price >= ?");
    params.push(Number(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    conditions.push("p.price <= ?");
    params.push(Number(req.query.maxPrice));
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortMap = {
    priceAsc: "p.price ASC",
    priceDesc: "p.price DESC",
    popular: "p.favoriteCount DESC, p.createdAt DESC",
    latest: "p.createdAt DESC"
  };
  const order = sortMap[req.query.sort] || sortMap.latest;
  const total = await get(db, `SELECT COUNT(*) AS count FROM products p JOIN users u ON u.id = p.sellerId ${where}`, params);
  const items = await all(db, `SELECT p.*, u.name AS sellerName FROM products p JOIN users u ON u.id = p.sellerId ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, limit, offset]);
  res.json({ page, limit, total: total.count, items });
}));

app.get("/api/products/:id", asyncHandler(async (req, res) => {
  const product = await get(db, "SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  const seller = await get(db, "SELECT * FROM users WHERE id = ?", [product.sellerId]);
  res.json({ product: await productWithFavorite(product, Number(req.query.userId || 1)), seller });
}));

app.post("/api/products", asyncHandler(async (req, res) => {
  const id = uid("P");
  const body = req.body;
  await run(db, "INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    id,
    body.title,
    body.category,
    Number(body.price),
    body.region,
    Number(body.sellerId || 1),
    body.image,
    body.description || "상세 설명이 등록된 중고 상품입니다.",
    "판매중",
    0,
    now()
  ]);
  await logActivity(body.sellerId || 1, `${body.title} 상품을 등록했습니다.`);
  res.status(201).json({ id });
}));

app.patch("/api/products/:id", asyncHandler(async (req, res) => {
  const current = await get(db, "SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!current) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  const next = { ...current, ...req.body };
  await run(db, "UPDATE products SET title = ?, category = ?, price = ?, region = ?, image = ?, description = ?, status = ? WHERE id = ?", [
    next.title,
    next.category,
    Number(next.price),
    next.region,
    next.image,
    next.description,
    next.status,
    req.params.id
  ]);
  await logActivity(next.sellerId, `${next.title} 상품 정보를 수정했습니다.`);
  res.json({ ok: true });
}));

app.delete("/api/products/:id", asyncHandler(async (req, res) => {
  const product = await get(db, "SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  await run(db, "DELETE FROM products WHERE id = ?", [req.params.id]);
  await logActivity(product.sellerId, `${product.title} 상품을 삭제했습니다.`);
  res.json({ ok: true });
}));

app.get("/api/users", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM users ORDER BY id ASC") });
}));

app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const user = await get(db, "SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json({ user });
}));

app.get("/api/users/:id/products", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM products WHERE sellerId = ? ORDER BY createdAt DESC", [req.params.id]) });
}));

app.get("/api/favorites", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  const items = await all(db, `SELECT f.id, f.userId, f.productId, f.createdAt, p.title AS productTitle, p.price, p.image, p.region
    FROM favorites f JOIN products p ON p.id = f.productId WHERE f.userId = ? ORDER BY f.createdAt DESC`, [userId]);
  res.json({ items });
}));

app.post("/api/favorites", asyncHandler(async (req, res) => {
  const { userId = 1, productId } = req.body;
  const exists = await get(db, "SELECT id FROM favorites WHERE userId = ? AND productId = ?", [userId, productId]);
  if (exists) return res.json({ id: exists.id, alreadyExists: true });
  const id = uid("F");
  await run(db, "INSERT INTO favorites VALUES (?, ?, ?, ?)", [id, userId, productId, now()]);
  await run(db, "UPDATE products SET favoriteCount = favoriteCount + 1 WHERE id = ?", [productId]);
  await logActivity(userId, `${productId} 상품을 찜했습니다.`);
  res.status(201).json({ id });
}));

app.delete("/api/favorites/:productId", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  const removed = await run(db, "DELETE FROM favorites WHERE userId = ? AND productId = ?", [userId, req.params.productId]);
  if (removed.changes > 0) {
    await run(db, "UPDATE products SET favoriteCount = MAX(favoriteCount - 1, 0) WHERE id = ?", [req.params.productId]);
  }
  await logActivity(userId, `${req.params.productId} 상품 찜을 취소했습니다.`);
  res.json({ ok: true });
}));

app.get("/api/reservations", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  const items = await all(db, `SELECT r.*, p.title AS productTitle, p.price, p.image
    FROM reservations r JOIN products p ON p.id = r.productId
    WHERE r.buyerId = ? OR r.sellerId = ? ORDER BY r.createdAt DESC`, [userId, userId]);
  res.json({ items });
}));

app.post("/api/reservations", asyncHandler(async (req, res) => {
  const body = req.body;
  const product = await get(db, "SELECT * FROM products WHERE id = ?", [body.productId]);
  if (!product) return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
  if (product.status !== "판매중") return res.status(409).json({ error: "판매중 상품만 예약할 수 있습니다." });
  const id = uid("R");
  await run(db, "INSERT INTO reservations VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    id,
    body.productId,
    Number(body.buyerId || 1),
    Number(body.sellerId || product.sellerId),
    body.meetAt || "협의 예정",
    body.memo || "",
    "예약중",
    now()
  ]);
  const txId = uid("T");
  await run(db, "INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    txId,
    id,
    body.productId,
    Number(body.buyerId || 1),
    Number(body.sellerId || product.sellerId),
    product.price,
    "예약중",
    null
  ]);
  await notify(product.sellerId, `${product.title} 예약 요청이 도착했습니다.`);
  await logActivity(body.buyerId || 1, `${product.title} 상품을 예약했습니다.`);
  res.status(201).json({ id, transactionId: txId });
}));

app.patch("/api/reservations/:id", asyncHandler(async (req, res) => {
  const reservation = await get(db, "SELECT * FROM reservations WHERE id = ?", [req.params.id]);
  if (!reservation) return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
  await run(db, "UPDATE reservations SET status = ?, meetAt = ?, memo = ? WHERE id = ?", [
    req.body.status || reservation.status,
    req.body.meetAt || reservation.meetAt,
    req.body.memo || reservation.memo,
    req.params.id
  ]);
  await logActivity(reservation.buyerId, `${reservation.productId} 예약 정보를 변경했습니다.`);
  res.json({ ok: true });
}));

app.delete("/api/reservations/:id", asyncHandler(async (req, res) => {
  const reservation = await get(db, "SELECT * FROM reservations WHERE id = ?", [req.params.id]);
  if (!reservation) return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
  await run(db, "UPDATE reservations SET status = ? WHERE id = ?", ["취소됨", req.params.id]);
  await run(db, "UPDATE transactions SET status = ? WHERE reservationId = ?", ["취소됨", req.params.id]);
  await run(db, "UPDATE products SET status = ? WHERE id = ?", ["판매중", reservation.productId]);
  await logActivity(reservation.buyerId, `${reservation.productId} 예약을 취소했습니다.`);
  res.json({ ok: true });
}));

app.get("/api/transactions", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  const items = await all(db, `SELECT t.*, p.title AS productTitle, p.image
    FROM transactions t JOIN products p ON p.id = t.productId
    WHERE t.buyerId = ? OR t.sellerId = ? ORDER BY COALESCE(t.completedAt, p.createdAt) DESC`, [userId, userId]);
  res.json({ items });
}));

app.post("/api/transactions/:id/complete", asyncHandler(async (req, res) => {
  const tx = await get(db, "SELECT * FROM transactions WHERE id = ?", [req.params.id]);
  if (!tx) return res.status(404).json({ error: "거래를 찾을 수 없습니다." });
  await run(db, "UPDATE transactions SET status = ?, completedAt = ? WHERE id = ?", ["거래완료", now(), req.params.id]);
  await run(db, "UPDATE reservations SET status = ? WHERE id = ?", ["거래완료", tx.reservationId]);
  await run(db, "UPDATE products SET status = ? WHERE id = ?", ["거래완료", tx.productId]);
  await notify(tx.buyerId, `${tx.productId} 거래가 완료되었습니다.`);
  await logActivity(tx.sellerId, `${tx.productId} 거래를 완료 처리했습니다.`);
  res.json({ ok: true });
}));

app.get("/api/chats", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  const items = await all(db, `SELECT c.*, p.title AS productTitle, u.name AS sellerName
    FROM chats c JOIN products p ON p.id = c.productId JOIN users u ON u.id = c.sellerId
    WHERE c.buyerId = ? OR c.sellerId = ? ORDER BY c.updatedAt DESC`, [userId, userId]);
  res.json({ items });
}));

app.get("/api/chats/:id/messages", asyncHandler(async (req, res) => {
  res.json({ items: await all(db, "SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt ASC", [req.params.id]) });
}));

app.post("/api/chats/:id/messages", asyncHandler(async (req, res) => {
  const chat = await get(db, "SELECT * FROM chats WHERE id = ?", [req.params.id]);
  if (!chat) return res.status(404).json({ error: "채팅방을 찾을 수 없습니다." });
  const id = uid("M");
  await run(db, "INSERT INTO messages VALUES (?, ?, ?, ?, ?)", [id, req.params.id, Number(req.body.senderId || 1), req.body.body, now()]);
  await run(db, "UPDATE chats SET updatedAt = ? WHERE id = ?", [now(), req.params.id]);
  await logActivity(req.body.senderId || 1, `${chat.productId} 채팅 메시지를 보냈습니다.`);
  res.status(201).json({ id });
}));

app.get("/api/notifications", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  res.json({ items: await all(db, "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC", [userId]) });
}));

app.get("/api/activity", asyncHandler(async (req, res) => {
  const userId = Number(req.query.userId || 1);
  res.json({ items: await all(db, "SELECT * FROM activity WHERE userId = ? ORDER BY createdAt DESC", [userId]) });
}));

app.post("/api/test/reset", asyncHandler(async (req, res) => {
  await seed(db);
  res.json({ ok: true, restored: true, siteId: "B-02" });
}));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "서버 요청 처리 중 오류가 발생했습니다." });
});

bootstrap().then(() => {
  app.listen(PORT, () => {
    console.log(`ReMarket B-02 API listening on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
