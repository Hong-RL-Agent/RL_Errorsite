const { getDb } = require('../db/init');
const { dropSchema, createSchema } = require('../db/init');
const { seedAll } = require('../db/seed');
const { HttpError, toInt, logActivity } = require('./common');
const productService = require('./productService');

function listActivity(userId, limitRaw) {
  const limit = Math.min(200, Math.max(1, toInt(limitRaw, 30)));
  return getDb().prepare('SELECT id, type, detail, created_at FROM activity_log WHERE user_id = ? ORDER BY id DESC LIMIT ?').all(userId, limit)
    .map((r) => ({ id: r.id, type: r.type, detail: r.detail, createdAt: r.created_at }));
}

function recordActivity(userId, body) {
  const type = String(body.type || '').slice(0, 40);
  const detail = String(body.detail || '').slice(0, 200);
  if (!type) throw new HttpError(400, 'BAD_REQUEST', 'type 이 필요합니다.');
  logActivity(userId, type, detail);
  return { type, detail };
}

function listSearchHistory(userId, limitRaw) {
  const limit = Math.min(100, Math.max(1, toInt(limitRaw, 20)));
  return getDb().prepare('SELECT id, keyword, result_count, created_at FROM search_history WHERE user_id = ? ORDER BY id DESC LIMIT ?').all(userId, limit)
    .map((r) => ({ id: r.id, keyword: r.keyword, resultCount: r.result_count, createdAt: r.created_at }));
}

function recordSearch(userId, body) {
  const keyword = String(body.keyword || '').trim().slice(0, 60);
  if (!keyword) throw new HttpError(400, 'BAD_REQUEST', 'keyword 가 필요합니다.');
  const resultCount = productService.listProducts({ query: keyword, limit: 1 }, userId).meta.total;
  getDb().prepare('INSERT INTO search_history (user_id,keyword,result_count,created_at) VALUES (?,?,?,?)').run(userId, keyword, resultCount, new Date().toISOString());
  logActivity(userId, 'search', `검색: ${keyword} (${resultCount}건)`);
  return { keyword, resultCount };
}

function listRecentlyViewed(userId) {
  const rows = getDb().prepare(`SELECT product_id, MAX(id) AS last_id FROM view_history WHERE user_id = ? GROUP BY product_id ORDER BY last_id DESC LIMIT 10`).all(userId);
  return productService.getDetailedByIds(rows.map((r) => r.product_id)).map(({ specs, pros, cons, summary, ...item }) => item);
}

function recordView(userId, productId) {
  const pid = toInt(productId, null);
  const exists = pid !== null && getDb().prepare('SELECT id FROM products WHERE id = ?').get(pid);
  if (!exists) throw new HttpError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.');
  getDb().prepare('INSERT INTO view_history (user_id,product_id,viewed_at) VALUES (?,?,?)').run(userId, pid, new Date().toISOString());
  logActivity(userId, 'view', `상품 조회: #${pid}`);
  return { productId: pid };
}

// DQN 환경 초기화: 고정 seed 로 전체 데이터를 동일하게 재생성
function resetAll() {
  const db = getDb();
  dropSchema(db);
  createSchema(db);
  seedAll(db);
  return { reset: true, products: db.prepare('SELECT COUNT(*) AS n FROM products').get().n };
}

module.exports = { listActivity, recordActivity, listSearchHistory, recordSearch, listRecentlyViewed, recordView, resetAll };
