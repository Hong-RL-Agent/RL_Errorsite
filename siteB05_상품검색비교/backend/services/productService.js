const { getDb } = require('../db/init');
const { CATEGORIES, RECOMMENDED_KEYWORDS } = require('../data/catalog');
const { HttpError, toInt, logActivity } = require('./common');

const SORTS = {
  price_asc: 'p.price ASC, p.id ASC',
  price_desc: 'p.price DESC, p.id ASC',
  popular: 'p.popularity DESC, p.id ASC',
  rating: 'p.rating DESC, p.review_count DESC, p.id ASC',
};

const BASE_SELECT = `
  SELECT p.*, b.name AS brand_name, c.slug AS category_slug, c.name AS category_name, c.icon AS category_icon
  FROM products p
  JOIN brands b ON b.id = p.brand_id
  JOIN categories c ON c.id = p.category_id`;

const placeholders = (arr) => arr.map(() => '?').join(',');

// ---- 쿼리 파라미터 파싱 ----
function parseListParams(q) {
  const specs = {};
  Object.keys(q).forEach((k) => {
    if (/^spec_[a-z_]+$/.test(k) && q[k]) {
      const vals = String(q[k]).split(',').map((v) => v.trim()).filter(Boolean);
      if (vals.length) specs[k.slice(5)] = vals;
    }
  });
  return {
    query: (q.query || '').trim(),
    category: q.category || '',
    brandIds: String(q.brand || '').split(',').map((v) => parseInt(v, 10)).filter((n) => !Number.isNaN(n)),
    minPrice: q.minPrice !== undefined && q.minPrice !== '' ? toInt(q.minPrice, null) : null,
    maxPrice: q.maxPrice !== undefined && q.maxPrice !== '' ? toInt(q.maxPrice, null) : null,
    sort: SORTS[q.sort] ? q.sort : 'popular',
    page: Math.max(1, toInt(q.page, 1)),
    limit: Math.min(48, Math.max(1, toInt(q.limit, 8))),
    specs,
  };
}

function buildWhere(p) {
  const where = [];
  const args = [];
  p.query.split(/\s+/).filter(Boolean).forEach((token) => {
    const like = `%${token}%`;
    where.push('(p.name LIKE ? OR b.name LIKE ? OR c.name LIKE ? OR p.summary LIKE ?)');
    args.push(like, like, like, like);
  });
  if (p.category) { where.push('c.slug = ?'); args.push(p.category); }
  if (p.brandIds.length) { where.push(`p.brand_id IN (${placeholders(p.brandIds)})`); args.push(...p.brandIds); }
  if (p.minPrice !== null) { where.push('p.price >= ?'); args.push(p.minPrice); }
  if (p.maxPrice !== null) { where.push('p.price <= ?'); args.push(p.maxPrice); }
  Object.entries(p.specs).forEach(([key, vals]) => {
    where.push(`EXISTS (SELECT 1 FROM product_specs s WHERE s.product_id = p.id AND s.spec_key = ? AND s.value_text IN (${placeholders(vals)}))`);
    args.push(key, ...vals);
  });
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', args };
}

// ---- 행 → 응답 객체 ----
function loadSpecs(ids) {
  if (!ids.length) return new Map();
  const rows = getDb()
    .prepare(`SELECT product_id, spec_key, label, value_text, value_num FROM product_specs WHERE product_id IN (${placeholders(ids)}) ORDER BY product_id, sort_order`)
    .all(...ids);
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.product_id)) map.set(r.product_id, []);
    map.get(r.product_id).push({ key: r.spec_key, label: r.label, value: r.value_text, numeric: r.value_num });
  });
  return map;
}

function loadThumbs(ids) {
  if (!ids.length) return new Map();
  const rows = getDb()
    .prepare(`SELECT id, product_id FROM product_images WHERE position = 1 AND product_id IN (${placeholders(ids)})`)
    .all(...ids);
  return new Map(rows.map((r) => [r.product_id, `/api/images/${r.id}.svg`]));
}

function toListItems(rows) {
  const ids = rows.map((r) => r.id);
  const specs = loadSpecs(ids);
  const thumbs = loadThumbs(ids);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    model: r.model,
    brand: { id: r.brand_id, name: r.brand_name },
    category: { slug: r.category_slug, name: r.category_name, icon: r.category_icon },
    price: r.price,
    rating: r.rating,
    reviewCount: r.review_count,
    popularity: r.popularity,
    thumbnailUrl: thumbs.get(r.id) || null,
    keySpecs: (specs.get(r.id) || []).slice(0, 3).map(({ key, label, value }) => ({ key, label, value })),
  }));
}

function getDetailedByIds(ids) {
  if (!ids.length) return [];
  const rows = getDb().prepare(`${BASE_SELECT} WHERE p.id IN (${placeholders(ids)})`).all(...ids);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  const items = toListItems(ordered);
  const specs = loadSpecs(ordered.map((r) => r.id));
  return items.map((it, i) => ({
    ...it,
    summary: ordered[i].summary,
    pros: JSON.parse(ordered[i].pros),
    cons: JSON.parse(ordered[i].cons),
    specs: specs.get(it.id) || [],
  }));
}

// ---- 공개 API ----
function listProducts(q, userId) {
  const p = parseListParams(q);
  const db = getDb();
  const { sql, args } = buildWhere(p);
  const total = db.prepare(`SELECT COUNT(*) AS n FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id ${sql}`).get(...args).n;
  const totalPages = Math.max(1, Math.ceil(total / p.limit));
  const rows = db.prepare(`${BASE_SELECT} ${sql} ORDER BY ${SORTS[p.sort]} LIMIT ? OFFSET ?`).all(...args, p.limit, (p.page - 1) * p.limit);
  const hasNext = p.page < totalPages;
  if (q.track === '1' && p.query && p.page === 1) {
    db.prepare('INSERT INTO search_history (user_id,keyword,result_count,created_at) VALUES (?,?,?,?)').run(userId, p.query, total, new Date().toISOString());
    logActivity(userId, 'search', `검색: ${p.query} (${total}건)`);
  }
  return {
    data: toListItems(rows),
    meta: {
      total, page: p.page, limit: p.limit, totalPages,
      hasNext, hasPrev: p.page > 1, hasMore: hasNext,
      nextPage: hasNext ? p.page + 1 : null,
      prevPage: p.page > 1 ? p.page - 1 : null,
      sort: p.sort,
    },
  };
}

function getProduct(id) {
  const db = getDb();
  const row = db.prepare(`${BASE_SELECT} WHERE p.id = ?`).get(id);
  if (!row) throw new HttpError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.');
  const [detail] = getDetailedByIds([id]);
  const offers = db.prepare('SELECT seller, price, shipping, in_stock FROM price_offers WHERE product_id = ? ORDER BY price ASC, id ASC').all(id)
    .map((o) => ({ seller: o.seller, price: o.price, shipping: o.shipping, inStock: !!o.in_stock }));
  const imageCount = db.prepare('SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?').get(id).n;
  return { ...detail, offers, imageCount };
}

function ensureProduct(id) {
  const row = getDb().prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!row) throw new HttpError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.');
}

function getImages(id) {
  ensureProduct(id);
  const rows = getDb().prepare('SELECT id, position, label FROM product_images WHERE product_id = ? ORDER BY position').all(id);
  return rows.map((r) => ({ id: r.id, position: r.position, label: r.label, url: `/api/images/${r.id}.svg` }));
}

function getSpecifications(id) {
  ensureProduct(id);
  return [...loadSpecs([id]).get(id) || []];
}

function getReviews(id, q) {
  ensureProduct(id);
  const db = getDb();
  const page = Math.max(1, toInt(q.page, 1));
  const limit = Math.min(30, Math.max(1, toInt(q.limit, 5)));
  const total = db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE product_id = ?').get(id).n;
  const avg = db.prepare('SELECT AVG(rating) AS a FROM reviews WHERE product_id = ?').get(id).a;
  const rows = db.prepare(`SELECT r.id, r.rating, r.title, r.body, r.created_at, u.name AS user_name
    FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.product_id = ? ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?`).all(id, limit, (page - 1) * limit);
  return {
    data: rows.map((r) => ({ id: r.id, rating: r.rating, title: r.title, body: r.body, author: r.user_name, createdAt: r.created_at })),
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), average: avg ? Math.round(avg * 10) / 10 : null },
  };
}

function getPriceHistory(id) {
  ensureProduct(id);
  const rows = getDb().prepare('SELECT recorded_on, price FROM price_history WHERE product_id = ? ORDER BY recorded_on').all(id);
  const prices = rows.map((r) => r.price);
  return {
    data: rows.map((r) => ({ date: r.recorded_on, price: r.price })),
    meta: { min: Math.min(...prices), max: Math.max(...prices), current: prices[prices.length - 1] },
  };
}

function getCategories() {
  return getDb().prepare(`SELECT c.id, c.slug, c.name, c.icon, COUNT(p.id) AS product_count
    FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.sort_order`).all()
    .map((r) => ({ id: r.id, slug: r.slug, name: r.name, icon: r.icon, productCount: r.product_count }));
}

function getBrands(categorySlug) {
  const db = getDb();
  const rows = categorySlug
    ? db.prepare(`SELECT b.id, b.name, COUNT(p.id) AS n FROM brands b JOIN products p ON p.brand_id=b.id JOIN categories c ON c.id=p.category_id
        WHERE c.slug = ? GROUP BY b.id ORDER BY b.name`).all(categorySlug)
    : db.prepare('SELECT b.id, b.name, COUNT(p.id) AS n FROM brands b LEFT JOIN products p ON p.brand_id=b.id GROUP BY b.id ORDER BY b.name').all();
  return rows.map((r) => ({ id: r.id, name: r.name, productCount: r.n }));
}

function getFilters(categorySlug) {
  const db = getDb();
  const where = categorySlug ? 'WHERE c.slug = ?' : '';
  const args = categorySlug ? [categorySlug] : [];
  const range = db.prepare(`SELECT MIN(p.price) AS lo, MAX(p.price) AS hi FROM products p JOIN categories c ON c.id=p.category_id ${where}`).get(...args);
  const def = CATEGORIES.find((c) => c.slug === categorySlug);
  return {
    category: categorySlug || null,
    categoryName: def ? def.name : null,
    priceRange: { min: Math.floor((range.lo || 0) / 10000) * 10000, max: Math.ceil((range.hi || 0) / 10000) * 10000 },
    brands: getBrands(categorySlug),
    specs: def ? def.specs.map((s) => ({ key: s.key, label: s.label, options: s.options })) : [],
  };
}

function getSuggestions(q) {
  const db = getDb();
  const text = (q || '').trim();
  const popular = db.prepare('SELECT keyword, COUNT(*) AS n FROM search_history GROUP BY keyword ORDER BY n DESC, keyword ASC LIMIT 8')
    .all().map((r) => ({ keyword: r.keyword, count: r.n }));
  let suggestions = [];
  if (text) {
    const like = `%${text}%`;
    const cats = db.prepare('SELECT slug, name FROM categories WHERE name LIKE ? ORDER BY sort_order LIMIT 3').all(like)
      .map((c) => ({ type: 'category', text: c.name, categorySlug: c.slug }));
    const prods = db.prepare('SELECT id, name FROM products WHERE name LIKE ? ORDER BY popularity DESC, id ASC LIMIT 6').all(like)
      .map((p) => ({ type: 'product', text: p.name, productId: p.id }));
    suggestions = [...cats, ...prods];
  }
  return { popular, recommended: RECOMMENDED_KEYWORDS, suggestions };
}

function getImageSvg(imageId) {
  const row = getDb().prepare(`SELECT i.*, p.name, c.icon, (SELECT COUNT(*) FROM product_images WHERE product_id = i.product_id) AS total
    FROM product_images i JOIN products p ON p.id=i.product_id JOIN categories c ON c.id=p.category_id WHERE i.id = ?`).get(imageId);
  if (!row) return null;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${row.color_a}"/><stop offset="1" stop-color="${row.color_b}"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><circle cx="520" cy="90" r="110" fill="#ffffff" fill-opacity="0.12"/><circle cx="90" cy="420" r="150" fill="#ffffff" fill-opacity="0.1"/><text x="320" y="270" font-size="150" text-anchor="middle">${row.icon}</text><text x="320" y="360" font-size="30" font-family="sans-serif" fill="#ffffff" text-anchor="middle">${esc(row.name)}</text><text x="320" y="410" font-size="24" font-family="sans-serif" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${esc(row.label)}</text></svg>`;
}

module.exports = {
  listProducts, getProduct, getImages, getSpecifications, getReviews, getPriceHistory,
  getCategories, getBrands, getFilters, getSuggestions, getDetailedByIds, getImageSvg,
};
