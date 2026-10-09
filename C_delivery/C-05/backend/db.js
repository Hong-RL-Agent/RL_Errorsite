const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'morrowmarket.db');
const db = new sqlite3.Database(dbPath);

const initialProducts = [
  {
    id: 1,
    name: '데일리 코튼 셔츠',
    price: 15000,
    description: '부드럽고 통기성이 뛰어난 100% 프리미엄 코튼 릴렉스드 셔츠',
    category: 'TOPS',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    is_active: 1
  },
  {
    id: 2,
    name: '라이트 니트',
    price: 20000,
    description: '간절기에 가볍게 착용하기 좋은 캐주얼 소프트 니트 (재고 한정: 3개)',
    category: 'KNITWEAR',
    stock: 3,
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
    is_active: 1
  },
  {
    id: 3,
    name: '캔버스 백',
    price: 18000,
    description: '데일리로 수납력이 넉넉한 오가닉 캔버스 토트백',
    category: 'BAGS',
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    is_active: 1
  },
  {
    id: 4,
    name: '베이직 슬림 팬츠',
    price: 35000,
    description: '편안한 핏감과 실루엣을 제공하는 에센셜 치노 팬츠',
    category: 'PANTS',
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    is_active: 1
  },
  {
    id: 5,
    name: '신선 보냉백',
    price: 3000,
    description: '새벽 특급 배송 전용 프리미엄 친환경 단열 보냉백',
    category: 'ACCESSORIES',
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    is_active: 1
  }
];

const initialCoupons = [
  {
    id: 1,
    code: 'SAVE10',
    name: '10,000원 장바구니 할인',
    type: 'FIXED',
    amount: 10000,
    min_order_amount: 10000,
    description: '모든 상품 주문 시 10,000원 즉시 할인'
  },
  {
    id: 2,
    code: 'SAVE5',
    name: '5,000원 심플 할인',
    type: 'FIXED',
    amount: 5000,
    min_order_amount: 5000,
    description: '모든 상품 주문 시 5,000원 즉시 할인'
  },
  {
    id: 3,
    code: 'WELCOME30',
    name: '신규 회원 30,000원 웰컴 쿠폰',
    type: 'FIXED',
    amount: 30000,
    min_order_amount: 0,
    description: '신규 가입 고객 전용 30,000원 파격 할인'
  },
  {
    id: 4,
    code: 'SPRING30',
    name: '시즌 30% 정기 할인 쿠폰',
    type: 'PERCENT',
    amount: 30,
    min_order_amount: 10000,
    description: '주문 금액의 30% 즉시 정률 할인'
  }
];

const initialShippingOptions = [
  {
    id: 1,
    name: '일반 배송 (Standard Delivery)',
    fee: 0,
    estimated_days: '2~3일 소요',
    description: '기본 무료 배송 혜택'
  },
  {
    id: 2,
    name: '새벽 특급 배송 (Dawn Express)',
    fee: 5000,
    estimated_days: '내일 아침 7시 도착 보장',
    description: '새벽 특급 배송 (+5,000원)'
  }
];

const initialAddresses = [
  {
    id: 1,
    user_id: 1,
    recipient: '이주이',
    phone: '010-3849-2819',
    address: '경기도 수원시 영통구 광교중앙로 170',
    address_detail: '102동 1504호',
    is_default: 1
  },
  {
    id: 2,
    user_id: 1,
    recipient: '김도현',
    phone: '010-9921-4820',
    address: '서울특별시 강남구 테헤란로 142',
    address_detail: '아크플레이스 8층',
    is_default: 0
  }
];

function initDb() {
  db.serialize(() => {
    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        category TEXT,
        stock INTEGER NOT NULL,
        image_url TEXT,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Coupons table
    db.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        min_order_amount INTEGER DEFAULT 0,
        description TEXT
      )
    `);

    // Shipping Options table
    db.run(`
      CREATE TABLE IF NOT EXISTS shipping_options (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        fee INTEGER NOT NULL,
        estimated_days TEXT,
        description TEXT
      )
    `);

    // Addresses table
    db.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recipient TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        address_detail TEXT,
        is_default INTEGER DEFAULT 0
      )
    `);

    // Carts table
    db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Cart Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        created_at TEXT,
        FOREIGN KEY (cart_id) REFERENCES carts(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Checkout State table
    db.run(`
      CREATE TABLE IF NOT EXISTS checkout_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        shipping_option_id INTEGER DEFAULT 1,
        shipping_address_id INTEGER DEFAULT 1,
        applied_coupon_codes TEXT DEFAULT '[]',
        accumulated_discount REAL DEFAULT 0,
        last_coupon_code TEXT,
        updated_at TEXT
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL NOT NULL,
        shipping_fee REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_option_name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Order Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (!err && row.count === 0) {
        resetDb();
      }
    });
  });
}

function resetDb(callback) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.serialize(() => {
    db.run('DELETE FROM order_items');
    db.run('DELETE FROM orders');
    db.run('DELETE FROM checkout_state');
    db.run('DELETE FROM cart_items');
    db.run('DELETE FROM carts');
    db.run('DELETE FROM addresses');
    db.run('DELETE FROM shipping_options');
    db.run('DELETE FROM coupons');
    db.run('DELETE FROM products');

    // Seed Products
    const insertProd = db.prepare(`
      INSERT INTO products (id, name, price, description, category, stock, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialProducts.forEach(p => {
      insertProd.run(p.id, p.name, p.price, p.description, p.category, p.stock, p.image_url, p.is_active);
    });
    insertProd.finalize();

    // Seed Coupons
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (id, code, name, type, amount, min_order_amount, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialCoupons.forEach(c => {
      insertCoupon.run(c.id, c.code, c.name, c.type, c.amount, c.min_order_amount, c.description);
    });
    insertCoupon.finalize();

    // Seed Shipping Options
    const insertShip = db.prepare(`
      INSERT INTO shipping_options (id, name, fee, estimated_days, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    initialShippingOptions.forEach(s => {
      insertShip.run(s.id, s.name, s.fee, s.estimated_days, s.description);
    });
    insertShip.finalize();

    // Seed Addresses
    const insertAddr = db.prepare(`
      INSERT INTO addresses (id, user_id, recipient, phone, address, address_detail, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialAddresses.forEach(a => {
      insertAddr.run(a.id, a.user_id, a.recipient, a.phone, a.address, a.address_detail, a.is_default);
    });
    insertAddr.finalize();

    // Seed Cart ID 1
    db.run(
      'INSERT INTO carts (id, user_id, status, created_at, updated_at) VALUES (1, 1, "ACTIVE", ?, ?)',
      [now, now],
      function () {
        // Seed Initial Cart Item: 1x 데일리 코튼 셔츠 (15,000원)
        db.run(
          'INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price, created_at) VALUES (1, 1, 1, 1, 15000, ?)',
          [now],
          () => {
            // Seed Checkout State
            db.run(
              'INSERT INTO checkout_state (id, cart_id, shipping_option_id, shipping_address_id, applied_coupon_codes, accumulated_discount, last_coupon_code, updated_at) VALUES (1, 1, 1, 1, "[]", 0, NULL, ?)',
              [now],
              () => {
                if (callback) callback();
              }
            );
          }
        );
      }
    );
  });
}

initDb();

module.exports = {
  db,
  resetDb
};
