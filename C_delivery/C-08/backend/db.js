const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'staymeet.db');
const db = new sqlite3.Database(dbPath);

const initialSpaces = [
  {
    id: 101,
    name: 'Aurora Meeting Room',
    type: 'MEETING',
    type_label: '회의실',
    price_per_hour: 10000,
    capacity: 8,
    description: '통창 자연광과 4K 스마트 빔프로젝터가 완비된 프리미엄 회의실',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 102,
    name: 'Harbor Room',
    type: 'MEETING',
    type_label: '회의실',
    price_per_hour: 15000,
    capacity: 12,
    description: '대형 화이트보드와 하이엔드 컨퍼런스 콜 장비가 갖춰진 중대형 미팅룸',
    image_url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 201,
    name: 'Maple Studio',
    type: 'STUDIO',
    type_label: '스튜디오',
    price_per_hour: 20000,
    capacity: 6,
    description: '포토/영상 촬영 및 라이브 방송이 가능한 프로페셔널 방음 스튜디오',
    image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 301,
    name: 'Lake View Suite',
    type: 'STAY',
    type_label: '숙소',
    price_per_hour: 80000,
    capacity: 4,
    description: '호수 전망의 감성 인테리어와 프라이빗 테라스가 있는 스테이 객실',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
  }
];

const initialReservations = [
  {
    id: 1001,
    user_id: 1,
    space_id: 101,
    space_name: 'Aurora Meeting Room',
    date: '2026-10-15',
    time_slot: '14:00-15:00',
    guest_count: 4,
    has_vip_seat: 0,
    base_amount: 10000,
    option_amount: 0,
    total_amount: 10000,
    parent_booking_id: null,
    status: 'CONFIRMED',
    created_at: '2026-10-08 09:00:00'
  },
  {
    id: 1002,
    user_id: 1,
    space_id: 101,
    space_name: 'Aurora Meeting Room (Room A)',
    date: '2026-10-16',
    time_slot: '10:00-11:00',
    guest_count: 2,
    has_vip_seat: 0,
    base_amount: 50000,
    option_amount: 0,
    total_amount: 50000,
    parent_booking_id: 9001,
    status: 'CONFIRMED',
    created_at: '2026-10-08 09:10:00'
  },
  {
    id: 1003,
    user_id: 1,
    space_id: 102,
    space_name: 'Harbor Room (Room B)',
    date: '2026-10-16',
    time_slot: '10:00-11:00',
    guest_count: 4,
    has_vip_seat: 0,
    base_amount: 70000,
    option_amount: 0,
    total_amount: 70000,
    parent_booking_id: 9001,
    status: 'CONFIRMED',
    created_at: '2026-10-08 09:10:00'
  }
];

function initDb() {
  db.serialize(() => {
    // Spaces
    db.run(`
      CREATE TABLE IF NOT EXISTS spaces (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        type_label TEXT NOT NULL,
        price_per_hour INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        description TEXT,
        image_url TEXT
      )
    `);

    // Reservations
    db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        space_id INTEGER NOT NULL,
        space_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        has_vip_seat INTEGER DEFAULT 0,
        base_amount INTEGER NOT NULL,
        option_amount INTEGER NOT NULL,
        total_amount INTEGER NOT NULL,
        parent_booking_id INTEGER,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Refunds
    db.run(`
      CREATE TABLE IF NOT EXISTS refunds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        refund_amount INTEGER NOT NULL,
        penalty_amount INTEGER NOT NULL,
        reason TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM spaces', (err, row) => {
      if (!err && row.count === 0) {
        resetDb();
      }
    });
  });
}

function resetDb(callback) {
  db.serialize(() => {
    db.run('DELETE FROM refunds');
    db.run('DELETE FROM reservations');
    db.run('DELETE FROM spaces');

    // Seed Spaces
    const insertSpace = db.prepare(`
      INSERT INTO spaces (id, name, type, type_label, price_per_hour, capacity, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialSpaces.forEach((s) => {
      insertSpace.run(s.id, s.name, s.type, s.type_label, s.price_per_hour, s.capacity, s.description, s.image_url);
    });
    insertSpace.finalize();

    // Seed Reservations
    const insertRes = db.prepare(`
      INSERT INTO reservations (id, user_id, space_id, space_name, date, time_slot, guest_count, has_vip_seat, base_amount, option_amount, total_amount, parent_booking_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialReservations.forEach((r) => {
      insertRes.run(r.id, r.user_id, r.space_id, r.space_name, r.date, r.time_slot, r.guest_count, r.has_vip_seat, r.base_amount, r.option_amount, r.total_amount, r.parent_booking_id, r.status, r.created_at);
    });
    insertRes.finalize();

    if (callback) callback();
  });
}

initDb();

module.exports = {
  db,
  resetDb
};
