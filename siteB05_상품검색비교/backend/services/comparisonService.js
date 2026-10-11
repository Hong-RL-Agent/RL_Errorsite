const { getDb } = require('../db/init');
const { HttpError, toInt, logActivity } = require('./common');
const productService = require('./productService');

const MAX_COMPARE = 4;

function productIdsOf(id) {
  return getDb().prepare('SELECT product_id FROM comparison_products WHERE comparison_id = ? ORDER BY position, product_id').all(id).map((r) => r.product_id);
}

function requireRow(id) {
  const row = getDb().prepare('SELECT * FROM comparisons WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'COMPARISON_NOT_FOUND', '비교 목록을 찾을 수 없습니다.');
  return row;
}

function serialize(row) {
  const ids = productIdsOf(row.id);
  return {
    id: row.id, name: row.name, saved: !!row.saved, userId: row.user_id, createdAt: row.created_at,
    productIds: ids, products: productService.getDetailedByIds(ids),
  };
}

function categoryOf(productId) {
  const r = getDb().prepare('SELECT category_id FROM products WHERE id = ?').get(productId);
  return r ? r.category_id : null;
}

function validateProductSet(ids) {
  if (ids.length > MAX_COMPARE) throw new HttpError(400, 'COMPARE_LIMIT', `최대 ${MAX_COMPARE}개 상품까지 비교할 수 있습니다.`);
  const cats = new Set();
  ids.forEach((pid) => {
    const c = categoryOf(pid);
    if (c === null) throw new HttpError(404, 'PRODUCT_NOT_FOUND', `상품(${pid})을 찾을 수 없습니다.`);
    cats.add(c);
  });
  if (cats.size > 1) throw new HttpError(409, 'CATEGORY_MISMATCH', '같은 카테고리의 상품만 비교할 수 있습니다.');
}

function replaceProducts(id, ids) {
  const db = getDb();
  const unique = [...new Set(ids)];
  validateProductSet(unique);
  db.transaction(() => {
    db.prepare('DELETE FROM comparison_products WHERE comparison_id = ?').run(id);
    const ins = db.prepare('INSERT INTO comparison_products (comparison_id,product_id,position) VALUES (?,?,?)');
    unique.forEach((pid, i) => ins.run(id, pid, i + 1));
  })();
}

function listComparisons(q, userId) {
  const db = getDb();
  const where = [];
  const args = [];
  if (q.saved === '1') where.push('c.saved = 1');
  if (q.scope === 'mine') { where.push('c.user_id = ?'); args.push(userId); }
  if (q.scope === 'community') { where.push('c.user_id <> ?'); args.push(userId); }
  const limit = Math.min(100, Math.max(1, toInt(q.limit, 20)));
  const rows = db.prepare(`SELECT c.* FROM comparisons c ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.created_at DESC, c.id DESC LIMIT ?`).all(...args, limit);
  return rows.map((r) => {
    const ids = productIdsOf(r.id);
    return {
      id: r.id, name: r.name, saved: !!r.saved, createdAt: r.created_at, productCount: ids.length, productIds: ids,
      products: productService.getDetailedByIds(ids).map((p) => ({ id: p.id, name: p.name, thumbnailUrl: p.thumbnailUrl, category: p.category })),
    };
  });
}

function createComparison(body, userId) {
  const db = getDb();
  const ids = Array.isArray(body.productIds) ? body.productIds.map((n) => toInt(n, null)).filter((n) => n !== null) : [];
  validateProductSet([...new Set(ids)]);
  const name = (body.name || '').toString().trim() || '새 비교';
  const { lastInsertRowid } = db.prepare('INSERT INTO comparisons (user_id,name,saved,created_at) VALUES (?,?,?,?)')
    .run(userId, name, body.saved ? 1 : 0, new Date().toISOString());
  replaceProducts(lastInsertRowid, ids);
  if (body.saved) logActivity(userId, 'compare_save', `비교 저장: ${name}`);
  return serialize(requireRow(lastInsertRowid));
}

function getComparison(id) {
  return serialize(requireRow(id));
}

function updateComparison(id, body, userId) {
  const db = getDb();
  const row = requireRow(id);
  if (body.productIds !== undefined) {
    if (!Array.isArray(body.productIds)) throw new HttpError(400, 'BAD_REQUEST', 'productIds 는 배열이어야 합니다.');
    replaceProducts(id, body.productIds.map((n) => toInt(n, null)).filter((n) => n !== null));
  }
  const name = body.name !== undefined ? String(body.name).trim() || row.name : row.name;
  const saved = body.saved !== undefined ? (body.saved ? 1 : 0) : row.saved;
  db.prepare('UPDATE comparisons SET name = ?, saved = ? WHERE id = ?').run(name, saved, id);
  if (saved && !row.saved) logActivity(userId, 'compare_save', `비교 저장: ${name}`);
  if (body.productIds !== undefined) logActivity(userId, 'compare_load', `비교 불러오기: ${name}`);
  return serialize(requireRow(id));
}

function deleteComparison(id, userId) {
  const row = requireRow(id);
  getDb().prepare('DELETE FROM comparisons WHERE id = ?').run(id);
  logActivity(userId, 'compare_delete', `비교 삭제: ${row.name}`);
  return { id };
}

function addProduct(id, productId, userId) {
  requireRow(id);
  const pid = toInt(productId, null);
  if (pid === null) throw new HttpError(400, 'BAD_REQUEST', 'productId 가 필요합니다.');
  if (categoryOf(pid) === null) throw new HttpError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.');
  const current = productIdsOf(id);
  if (current.includes(pid)) throw new HttpError(409, 'DUPLICATE_PRODUCT', '이미 비교 목록에 담긴 상품입니다.');
  validateProductSet([...current, pid]);
  getDb().prepare('INSERT INTO comparison_products (comparison_id,product_id,position) VALUES (?,?,?)').run(id, pid, current.length + 1);
  logActivity(userId, 'compare_add', `비교 담기: 상품 #${pid}`);
  return serialize(requireRow(id));
}

function removeProduct(id, productId, userId) {
  requireRow(id);
  const pid = toInt(productId, null);
  const info = getDb().prepare('DELETE FROM comparison_products WHERE comparison_id = ? AND product_id = ?').run(id, pid);
  if (!info.changes) throw new HttpError(404, 'PRODUCT_NOT_IN_COMPARISON', '비교 목록에 없는 상품입니다.');
  logActivity(userId, 'compare_remove', `비교 제거: 상품 #${pid}`);
  return serialize(requireRow(id));
}

function getStatistics(id) {
  requireRow(id);
  const products = productService.getDetailedByIds(productIdsOf(id));
  const prices = products.map((p) => p.price);
  const count = products.length;
  const cheapest = products.reduce((a, b) => (!a || b.price < a.price ? b : a), null);
  const best = products.reduce((a, b) => (!a || b.rating > a.rating ? b : a), null);
  return {
    comparisonId: id,
    count,
    productIds: products.map((p) => p.id),
    averagePrice: count ? Math.round(prices.reduce((s, n) => s + n, 0) / count) : 0,
    minPrice: count ? Math.min(...prices) : 0,
    maxPrice: count ? Math.max(...prices) : 0,
    averageRating: count ? Math.round((products.reduce((s, p) => s + p.rating, 0) / count) * 10) / 10 : 0,
    cheapest: cheapest ? { id: cheapest.id, name: cheapest.name } : null,
    highestRated: best ? { id: best.id, name: best.name } : null,
  };
}

module.exports = {
  listComparisons, createComparison, getComparison, updateComparison, deleteComparison, addProduct, removeProduct, getStatistics,
};
