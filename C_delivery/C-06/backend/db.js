const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tablerun.db');
const db = new sqlite3.Database(dbPath);

const initialStores = [
  {
    id: 1,
    name: '오늘의 식탁 (Today Table)',
    category: 'KOREAN_FUSION',
    min_order_amount: 15000,
    base_delivery_fee: 3500,
    estimated_time: '25~35분',
    rating: 4.8,
    review_count: 342,
    address: '서울시 마포구 독막로 45',
    phone: '02-334-1029',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  }
];

const initialMenus = [
  {
    id: 1,
    store_id: 1,
    name: '바삭 치킨 세트',
    price: 12000,
    current_server_price: 12000,
    description: '국내산 신선육으로 튀겨낸 겉바속촉 시그니처 순살 치킨과 수제 피클',
    category: 'CHICKEN',
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    store_id: 1,
    name: '매콤 크림 파스타',
    price: 15000,
    current_server_price: 17000, // Stale price trigger: cart saved as 15000, but server price is 17000
    description: '진한 투움바 크림 소스에 매콤한 페퍼론치노와 베이컨이 어우러진 특제 파스타',
    category: 'PASTA',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281682?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    store_id: 1,
    name: '치즈 감자튀김',
    price: 6000,
    current_server_price: 6000,
    description: '고소한 체다치즈 소스가 듬뿍 뿌려진 바삭한 케이준 시즈닝 감자튀김',
    category: 'SIDE',
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    store_id: 1,
    name: '수제 리코타 샐러드',
    price: 9500,
    current_server_price: 9500,
    description: '매일 아침 직접 만드는 수제 리코타 치즈와 신선한 유기농 채소, 발사믹 글레이즈',
    category: 'SALAD',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  }
];

const initialOptions = [
  { id: 1, menu_id: 1, name: '사이드 감자튀김', price: 2000 },
  { id: 2, menu_id: 1, name: '치즈 추가 (체다&모짜)', price: 2000 },
  { id: 3, menu_id: 1, name: '음료 추가 (콜라 500ml)', price: 1500 },
  { id: 4, menu_id: 2, name: '베이컨 2배 추가', price: 2000 },
  { id: 5, menu_id: 2, name: '바게트 빵 4조각', price: 2000 }
];

const initialCoupons = [
  { id: 1, code: 'WELCOME2000', name: '첫 주문 2,000원 할인 쿠폰', discount: 2000, min_order: 12000 },
  { id: 2, code: 'LUNCH3000', name: '점심 피크 3,000원 할인 쿠폰', discount: 3000, min_order: 15000 },
  { id: 3, code: 'DELIVERYFREE', name: '배달팁 전액 무료 쿠폰', discount: 3500, min_order: 10000 }
];

const initialAddresses = [
  {
    id: 1,
    recipient: '이주이',
    phone: '010-3849-2819',
    address: '서울시 마포구 서교동 395-10',
    address_detail: '401호',
    distance_meters: 1500,
    is_default: 1
  },
  {
    id: 2,
    recipient: '김도현',
    phone: '010-9921-4820',
    address: '서울시 영등포구 여의도동 24',
    address_detail: 'IFC타워 15층',
    distance_meters: 1500, // BUG-604 trigger: 1500 meters treated as 1500 km
    is_default: 0
  }
];

function initDb() {
  db.serialize(() => {
    // Stores
    db.run(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        min_order_amount INTEGER NOT NULL,
        base_delivery_fee INTEGER NOT NULL,
        estimated_time TEXT,
        rating REAL,
        review_count INTEGER,
        address TEXT,
        phone TEXT,
        image_url TEXT
      )
    `);

    // Menus
    db.run(`
      CREATE TABLE IF NOT EXISTS menus (
        id INTEGER PRIMARY KEY,
        store_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        current_server_price INTEGER NOT NULL,
        description TEXT,
        category TEXT,
        image_url TEXT,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      )
    `);

    // Menu Options
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_options (
        id INTEGER PRIMARY KEY,
        menu_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        FOREIGN KEY (menu_id) REFERENCES menus(id)
      )
    `);

    // Coupons
    db.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        discount INTEGER NOT NULL,
        min_order INTEGER DEFAULT 0
      )
    `);

    // Addresses
    db.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        address_detail TEXT,
        distance_meters INTEGER NOT NULL,
        is_default INTEGER DEFAULT 0
      )
    `);

    // Carts
    db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT
      )
    `);

    // Cart Items
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        menu_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        created_at TEXT,
        FOREIGN KEY (cart_id) REFERENCES carts(id),
        FOREIGN KEY (menu_id) REFERENCES menus(id)
      )
    `);

    // Cart Item Options
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_item_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_item_id INTEGER NOT NULL,
        option_id INTEGER NOT NULL,
        option_name TEXT NOT NULL,
        option_price INTEGER NOT NULL,
        FOREIGN KEY (cart_item_id) REFERENCES cart_items(id)
      )
    `);

    // Checkout Session
    db.run(`
      CREATE TABLE IF NOT EXISTS checkout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        address_id INTEGER DEFAULT 1,
        coupon_code TEXT,
        coupon_discount INTEGER DEFAULT 0,
        rider_tip INTEGER DEFAULT 0,
        delivery_fee INTEGER DEFAULT 3500,
        minimum_order_bypassed INTEGER DEFAULT 0,
        request_note TEXT,
        updated_at TEXT
      )
    `);

    // Orders
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        store_name TEXT NOT NULL,
        subtotal INTEGER NOT NULL,
        discount INTEGER NOT NULL,
        delivery_fee INTEGER NOT NULL,
        rider_tip INTEGER NOT NULL,
        final_amount INTEGER NOT NULL,
        address TEXT NOT NULL,
        request_note TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Order Items
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        options_text TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM stores', (err, row) => {
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
    db.run('DELETE FROM checkout_sessions');
    db.run('DELETE FROM cart_item_options');
    db.run('DELETE FROM cart_items');
    db.run('DELETE FROM carts');
    db.run('DELETE FROM addresses');
    db.run('DELETE FROM coupons');
    db.run('DELETE FROM menu_options');
    db.run('DELETE FROM menus');
    db.run('DELETE FROM stores');

    // Seed Stores
    const insertStore = db.prepare(`
      INSERT INTO stores (id, name, category, min_order_amount, base_delivery_fee, estimated_time, rating, review_count, address, phone, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialStores.forEach(s => {
      insertStore.run(s.id, s.name, s.category, s.min_order_amount, s.base_delivery_fee, s.estimated_time, s.rating, s.review_count, s.address, s.phone, s.image_url);
    });
    insertStore.finalize();

    // Seed Menus
    const insertMenu = db.prepare(`
      INSERT INTO menus (id, store_id, name, price, current_server_price, description, category, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialMenus.forEach(m => {
      insertMenu.run(m.id, m.store_id, m.name, m.price, m.current_server_price, m.description, m.category, m.image_url);
    });
    insertMenu.finalize();

    // Seed Options
    const insertOpt = db.prepare(`
      INSERT INTO menu_options (id, menu_id, name, price)
      VALUES (?, ?, ?, ?)
    `);
    initialOptions.forEach(o => {
      insertOpt.run(o.id, o.menu_id, o.name, o.price);
    });
    insertOpt.finalize();

    // Seed Coupons
    const insertCpn = db.prepare(`
      INSERT INTO coupons (id, code, name, discount, min_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    initialCoupons.forEach(c => {
      insertCpn.run(c.id, c.code, c.name, c.discount, c.min_order);
    });
    insertCpn.finalize();

    // Seed Addresses
    const insertAddr = db.prepare(`
      INSERT INTO addresses (id, recipient, phone, address, address_detail, distance_meters, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialAddresses.forEach(a => {
      insertAddr.run(a.id, a.recipient, a.phone, a.address, a.address_detail, a.distance_meters, a.is_default);
    });
    insertAddr.finalize();

    // Seed Cart 1 with 1x Menu 1 (바삭 치킨 세트, 12,000원)
    db.run(
      'INSERT INTO carts (id, user_id, store_id, status, created_at) VALUES (1, 1, 1, "ACTIVE", ?)',
      [now],
      function () {
        db.run(
          'INSERT INTO cart_items (id, cart_id, menu_id, quantity, unit_price, created_at) VALUES (1, 1, 1, 1, 12000, ?)',
          [now],
          () => {
            // Seed Checkout Session
            db.run(
              'INSERT INTO checkout_sessions (id, cart_id, address_id, coupon_code, coupon_discount, rider_tip, delivery_fee, minimum_order_bypassed, request_note, updated_at) VALUES (1, 1, 1, NULL, 0, 0, 3500, 0, "", ?)',
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
