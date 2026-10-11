const C = require('../data/catalog');

const SEED = 20260115;
const BASE_TIME = Date.UTC(2026, 0, 15, 9, 0, 0);
const PRODUCTS_PER_CATEGORY = 30;
const HISTORY_DATES = ['2025-06-15', '2025-07-15', '2025-08-15', '2025-09-15', '2025-10-15', '2025-11-15', '2025-12-15', '2026-01-15'];

function mulberry32(a) {
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ts = (minutesAgo) => new Date(BASE_TIME - minutesAgo * 60000).toISOString();

// 이미지 개수 규칙: id%5==0 → 8장, id%5==1 → 6장, 그 외 3장
function imageCountFor(productId) {
  if (productId % 5 === 0) return 8;
  if (productId % 5 === 1) return 6;
  return 3;
}

// 순수 데이터 생성 (DB 의존성 없음 → 고정 seed 로 항상 동일한 결과)
function generateData() {
  const rand = mulberry32(SEED);
  const int = (n) => Math.floor(rand() * n);
  const pick = (arr) => arr[int(arr.length)];
  const pickMany = (arr, n) => {
    const pool = arr.slice();
    const out = [];
    while (out.length < n && pool.length) out.push(pool.splice(int(pool.length), 1)[0]);
    return out;
  };

  const categories = C.CATEGORIES.map((c, i) => ({ id: i + 1, slug: c.slug, name: c.name, icon: c.icon, sortOrder: i + 1 }));
  const countries = ['KR', 'US', 'JP', 'DE', 'TW', 'CN'];
  const brands = C.BRANDS.map((name, i) => ({ id: i + 1, name, country: countries[i % countries.length] }));
  const users = [];
  for (let i = 1; i <= 100; i += 1) {
    users.push({
      id: i,
      name: i === 1 ? '체험 사용자' : `${C.SURNAMES[i % 10]}${C.GIVEN[(i * 3) % 10]}`,
      email: `user${i}@comparelab.test`,
      joinedAt: ts(60 * 24 * (i + 20)),
    });
  }

  const products = [];
  const specs = [];
  const offers = [];
  const history = [];
  const images = [];

  C.CATEGORIES.forEach((cat, ci) => {
    const catBrandIds = [0, 1, 2, 3, 4].map((j) => ((ci * 4 + j) % brands.length) + 1);
    for (let k = 0; k < PRODUCTS_PER_CATEGORY; k += 1) {
      const id = ci * PRODUCTS_PER_CATEGORY + k + 1;
      const brandId = catBrandIds[k % 5];
      const brandName = brands[brandId - 1].name;
      const series = cat.series[k % 6];
      const modelNo = 100 + ((k * 37 + ci * 11) % 900);
      const model = `${series} ${modelNo}`;
      const name = `${brandName} ${series} ${cat.noun} ${modelNo}`;

      const specRows = cat.specs.map((s, si) => {
        const value = s.options[int(s.options.length)];
        const num = parseFloat(value);
        return { productId: id, key: s.key, label: s.label, value, num: Number.isNaN(num) ? null : num, sortOrder: si + 1 };
      });
      specRows.forEach((s) => specs.push(s));

      const [pMin, pMax] = cat.price;
      const base = Math.round((pMin + (rand() ** 1.3) * (pMax - pMin)) / 1000) * 1000;
      const sellerOffsets = [0, 1, 2].map((o) => (o + id) % C.SELLERS.length);
      sellerOffsets.forEach((si, oi) => {
        const price = oi === 0 ? base : Math.round((base * (1 + oi * 0.03 + rand() * 0.04)) / 100) * 100;
        offers.push({ productId: id, seller: C.SELLERS[si], price, shipping: oi === 1 ? 3000 : 0, inStock: rand() > 0.12 ? 1 : 0 });
      });
      HISTORY_DATES.forEach((d, hi) => {
        const price = hi === HISTORY_DATES.length - 1 ? base : Math.round((base * (1 + (rand() - 0.5) * 0.2)) / 100) * 100;
        history.push({ productId: id, recordedOn: d, price });
      });

      const imgCount = imageCountFor(id);
      for (let p = 1; p <= imgCount; p += 1) {
        const [a, b] = C.COLOR_PAIRS[(id * 7 + p) % C.COLOR_PAIRS.length];
        images.push({ productId: id, position: p, label: C.IMAGE_LABELS[(p - 1) % C.IMAGE_LABELS.length], colorA: a, colorB: b });
      }

      products.push({
        id, categoryId: ci + 1, brandId, name, model,
        summary: `${brandName} ${series} 시리즈의 ${cat.name}. ${specRows[0].label} ${specRows[0].value}, ${specRows[1].label} ${specRows[1].value} 구성의 균형 잡힌 모델입니다.`,
        price: base,
        popularity: 1000 + int(98000),
        rating: Math.round((3.2 + rand() * 1.7) * 10) / 10,
        reviewCount: 20 + int(1980),
        pros: JSON.stringify(pickMany(C.PROS_POOL, 3)),
        cons: JSON.stringify(pickMany(C.CONS_POOL, 2)),
        createdAt: ts(60 * 24 * (id + 3)),
      });
    }
  });

  const reviews = [];
  for (let i = 0; i < 450; i += 1) {
    reviews.push({
      productId: ((i * 7 + 3) % products.length) + 1,
      userId: 2 + ((i * 13) % 99),
      rating: pick([5, 5, 4, 4, 4, 3, 3, 2]),
      title: pick(C.REVIEW_TITLES),
      body: pick(C.REVIEW_BODIES),
      createdAt: ts(60 * 24 * (i % 120) + i),
    });
  }

  // 저장한 비교 목록 (사용자 2~100 소유, 현재 체험 사용자(1)는 비어 있음)
  const comparisons = [];
  for (let i = 0; i < 120; i += 1) {
    const ci = i % 12;
    const n = 2 + (i % 3);
    const ids = [];
    for (let j = 0; ids.length < n; j += 1) {
      const pid = ci * PRODUCTS_PER_CATEGORY + ((i * 7 + j * 5) % PRODUCTS_PER_CATEGORY) + 1;
      if (!ids.includes(pid)) ids.push(pid);
    }
    comparisons.push({ userId: 2 + (i % 99), name: `${C.CATEGORIES[ci].name} 비교 ${i + 1}`, saved: 1, createdAt: ts(60 * 24 * (i % 90) + i), productIds: ids });
  }

  const searches = [];
  for (let i = 0; i < 200; i += 1) {
    searches.push({ userId: 2 + ((i * 3) % 99), keyword: C.POPULAR_SEED_KEYWORDS[(i * 7 + (i % 5)) % C.POPULAR_SEED_KEYWORDS.length], resultCount: 5 + int(60), createdAt: ts(30 * i + 5) });
  }
  const views = [];
  for (let i = 0; i < 180; i += 1) {
    views.push({ userId: 2 + ((i * 5) % 99), productId: ((i * 11 + 2) % products.length) + 1, viewedAt: ts(45 * i + 9) });
  }
  const activityTypes = ['search', 'compare_add', 'compare_save', 'view', 'compare_remove'];
  const activity = [];
  for (let i = 0; i < 120; i += 1) {
    const type = activityTypes[i % activityTypes.length];
    activity.push({ userId: 2 + ((i * 7) % 99), type, detail: `${type} #${i + 1}`, createdAt: ts(20 * i + 3) });
  }

  return { categories, brands, users, products, specs, offers, history, images, reviews, comparisons, searches, views, activity };
}

function seedAll(db) {
  const d = generateData();
  const run = db.transaction(() => {
    const ins = (sql, rows, map) => { const st = db.prepare(sql); rows.forEach((r) => st.run(...map(r))); };
    ins('INSERT INTO categories (id,slug,name,icon,sort_order) VALUES (?,?,?,?,?)', d.categories, (r) => [r.id, r.slug, r.name, r.icon, r.sortOrder]);
    ins('INSERT INTO brands (id,name,country) VALUES (?,?,?)', d.brands, (r) => [r.id, r.name, r.country]);
    ins('INSERT INTO users (id,name,email,joined_at) VALUES (?,?,?,?)', d.users, (r) => [r.id, r.name, r.email, r.joinedAt]);
    ins('INSERT INTO products (id,category_id,brand_id,name,model,summary,price,popularity,rating,review_count,pros,cons,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', d.products,
      (r) => [r.id, r.categoryId, r.brandId, r.name, r.model, r.summary, r.price, r.popularity, r.rating, r.reviewCount, r.pros, r.cons, r.createdAt]);
    ins('INSERT INTO product_specs (product_id,spec_key,label,value_text,value_num,sort_order) VALUES (?,?,?,?,?,?)', d.specs, (r) => [r.productId, r.key, r.label, r.value, r.num, r.sortOrder]);
    ins('INSERT INTO price_offers (product_id,seller,price,shipping,in_stock) VALUES (?,?,?,?,?)', d.offers, (r) => [r.productId, r.seller, r.price, r.shipping, r.inStock]);
    ins('INSERT INTO price_history (product_id,recorded_on,price) VALUES (?,?,?)', d.history, (r) => [r.productId, r.recordedOn, r.price]);
    ins('INSERT INTO product_images (product_id,position,label,color_a,color_b) VALUES (?,?,?,?,?)', d.images, (r) => [r.productId, r.position, r.label, r.colorA, r.colorB]);
    ins('INSERT INTO reviews (product_id,user_id,rating,title,body,created_at) VALUES (?,?,?,?,?,?)', d.reviews, (r) => [r.productId, r.userId, r.rating, r.title, r.body, r.createdAt]);
    const insCmp = db.prepare('INSERT INTO comparisons (user_id,name,saved,created_at) VALUES (?,?,?,?)');
    const insCp = db.prepare('INSERT INTO comparison_products (comparison_id,product_id,position) VALUES (?,?,?)');
    d.comparisons.forEach((c) => {
      const { lastInsertRowid } = insCmp.run(c.userId, c.name, c.saved, c.createdAt);
      c.productIds.forEach((pid, i) => insCp.run(lastInsertRowid, pid, i + 1));
    });
    ins('INSERT INTO search_history (user_id,keyword,result_count,created_at) VALUES (?,?,?,?)', d.searches, (r) => [r.userId, r.keyword, r.resultCount, r.createdAt]);
    ins('INSERT INTO view_history (user_id,product_id,viewed_at) VALUES (?,?,?)', d.views, (r) => [r.userId, r.productId, r.viewedAt]);
    ins('INSERT INTO activity_log (user_id,type,detail,created_at) VALUES (?,?,?,?)', d.activity, (r) => [r.userId, r.type, r.detail, r.createdAt]);
  });
  run();
}

module.exports = { generateData, seedAll, imageCountFor, PRODUCTS_PER_CATEGORY };
