const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'morrow_address.db');
const db = new sqlite3.Database(dbPath);

const initialAddresses = [
  {
    id: 101,
    user_id: 1,
    label: '집',
    recipient_name: '이주이',
    phone: '010-3849-2819',
    postal_code: '16543',
    address_line1: '경기도 수원시',
    address_line2: '권선구 테스트로 10',
    is_default: 1,
    created_at: '2026-10-08 08:00:00',
    updated_at: '2026-10-08 08:00:00'
  },
  {
    id: 102,
    user_id: 1,
    label: '회사',
    recipient_name: '이주이',
    phone: '010-3849-2819',
    postal_code: '16678',
    address_line1: '경기도 수원시',
    address_line2: '영통구 테스트로 20',
    is_default: 0,
    created_at: '2026-10-08 08:30:00',
    updated_at: '2026-10-08 08:30:00'
  }
];

function initDb() {
  db.serialize(() => {
    // Users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        tier TEXT DEFAULT 'VIP Platinum'
      )
    `);

    // Addresses
    db.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        address_line1 TEXT NOT NULL,
        address_line2 TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    // Order address snapshot cache (retains Address 102 even after deletion in addresses for BUG-5)
    db.run(`
      CREATE TABLE IF NOT EXISTS order_address_snapshots (
        id INTEGER PRIMARY KEY,
        address_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        address_line1 TEXT NOT NULL,
        address_line2 TEXT NOT NULL,
        is_default INTEGER DEFAULT 0
      )
    `);

    // Orders
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        status TEXT NOT NULL,
        shipping_address_id INTEGER,
        created_at TEXT
      )
    `);

    // System flags
    db.run(`
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM addresses', (err, row) => {
      if (!err && row.count === 0) {
        resetDb();
      }
    });
  });
}

function resetDb(callback) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.serialize(() => {
    db.run('DELETE FROM app_state');
    db.run('DELETE FROM orders');
    db.run('DELETE FROM order_address_snapshots');
    db.run('DELETE FROM addresses');
    db.run('DELETE FROM users');

    // Seed User
    db.run('INSERT INTO users (id, name, email, phone, tier) VALUES (1, "이주이", "juyi.lee@example.com", "010-3849-2819", "VIP Platinum")');

    // Seed Addresses
    const insertAddr = db.prepare(`
      INSERT INTO addresses (id, user_id, label, recipient_name, phone, postal_code, address_line1, address_line2, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    initialAddresses.forEach((a) => {
      insertAddr.run(a.id, a.user_id, a.label, a.recipient_name, a.phone, a.postal_code, a.address_line1, a.address_line2, a.is_default, a.created_at, a.updated_at);
    });
    insertAddr.finalize();

    // Seed Order Address Snapshots (Both 101 & 102)
    const insertSnap = db.prepare(`
      INSERT INTO order_address_snapshots (id, address_id, label, recipient_name, phone, postal_code, address_line1, address_line2, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialAddresses.forEach((a) => {
      insertSnap.run(a.id, a.id, a.label, a.recipient_name, a.phone, a.postal_code, a.address_line1, a.address_line2, a.is_default);
    });
    insertSnap.finalize();

    // Seed Initial Order
    db.run(
      'INSERT INTO orders (id, order_number, user_id, item_name, total_amount, status, shipping_address_id, created_at) VALUES (1, "ORD-20261008-7701", 1, "미니멀 코튼 셔츠 외 1건", 45000, "ORDER_PLACED", 101, ?)',
      [now]
    );

    // Initial app state
    db.run('INSERT INTO app_state (key, value) VALUES ("default_revisit_count", "0")');

    if (callback) callback();
  });
}

initDb();

module.exports = {
  db,
  resetDb
};
