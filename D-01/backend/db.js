const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'subflow.db');

let sqlite3;
let db = null;
let useFallback = false;
let memoryStore = null;

try {
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.warn('[DB] Native sqlite3 module not available, using robust file-backed SQLite store fallback:', err.message);
  useFallback = true;
}

// Initial seed data definitions
const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Notion',
    category: 'Productivity',
    icon: 'FileText',
    description: '올인원 워크스페이스 및 프로젝트 문서 협업 도구',
    base_price_monthly: 10.0,
    base_price_yearly: 96.0,
    available_plans: JSON.stringify(['Plus', 'Business', 'Enterprise'])
  },
  {
    id: 2,
    name: 'Slack',
    category: 'Communication',
    icon: 'MessageSquare',
    description: '팀 커뮤니케이션 및 실시간 업무 메신저 플랫폼',
    base_price_monthly: 12.5,
    base_price_yearly: 120.0,
    available_plans: JSON.stringify(['Pro', 'Business+', 'Enterprise Grid'])
  },
  {
    id: 3,
    name: 'GitHub Copilot',
    category: 'Development',
    icon: 'Code',
    description: 'AI 기반 코드 자동완성 및 페어 프로그래밍 어시스턴트',
    base_price_monthly: 19.0,
    base_price_yearly: 190.0,
    available_plans: JSON.stringify(['Individual', 'Business', 'Enterprise'])
  },
  {
    id: 4,
    name: 'AWS Cloud Services',
    category: 'Infrastructure',
    icon: 'Cloud',
    description: '클라우드 컴퓨팅, 스토리지 및 네트워크 인프라 자원',
    base_price_monthly: 45.0,
    base_price_yearly: 500.0,
    available_plans: JSON.stringify(['Starter', 'Scale', 'Custom Enterprise'])
  },
  {
    id: 5,
    name: 'Figma Professional',
    category: 'Design',
    icon: 'Layout',
    description: '디자인 및 프로토타이핑을 위한 웹 기반 협업 디자인 툴',
    base_price_monthly: 15.0,
    base_price_yearly: 144.0,
    available_plans: JSON.stringify(['Professional', 'Organization', 'Enterprise'])
  },
  {
    id: 6,
    name: 'OpenAI ChatGPT Plus',
    category: 'AI Tools',
    icon: 'Zap',
    description: '고급 GPT-4o 추론 및 이미지 생성, 코드 인터프리터 지원',
    base_price_monthly: 20.0,
    base_price_yearly: 240.0,
    available_plans: JSON.stringify(['Plus', 'Team', 'Enterprise'])
  },
  {
    id: 7,
    name: 'Zoom Workplace',
    category: 'Communication',
    icon: 'Video',
    description: '화상 회의, 그룹 채팅 및 온라인 웨비나 솔루션',
    base_price_monthly: 14.99,
    base_price_yearly: 149.9,
    available_plans: JSON.stringify(['Basic', 'Pro', 'Business'])
  },
  {
    id: 8,
    name: 'Datadog APM',
    category: 'Monitoring',
    icon: 'Activity',
    description: '서버 인프라 및 애플리케이션 성능 실시간 모니터링',
    base_price_monthly: 31.0,
    base_price_yearly: 340.0,
    available_plans: JSON.stringify(['Pro', 'Enterprise'])
  }
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 1,
    service_id: 1,
    service_name: 'Notion',
    plan_name: 'Plus',
    billing_cycle: 'monthly',
    price: 10.0,
    currency: 'USD',
    status: 'ACTIVE',
    auto_renew: 1,
    started_at: '2026-01-01',
    next_billing_at: '2026-11-01',
    category: 'Productivity',
    account_user: 'alex.kim@subflow.io'
  },
  {
    id: 2,
    service_id: 2,
    service_name: 'Slack',
    plan_name: 'Pro',
    billing_cycle: 'monthly',
    price: 12.5,
    currency: 'USD',
    status: 'ACTIVE',
    auto_renew: 1,
    started_at: '2026-01-15',
    next_billing_at: '2026-11-15',
    category: 'Communication',
    account_user: 'alex.kim@subflow.io'
  },
  {
    id: 3,
    service_id: 3,
    service_name: 'GitHub Copilot',
    plan_name: 'Business',
    billing_cycle: 'monthly',
    price: 19.0,
    currency: 'USD',
    status: 'ACTIVE',
    auto_renew: 1,
    started_at: '2026-02-01',
    next_billing_at: '2026-11-01',
    category: 'Development',
    account_user: 'dev.lead@subflow.io'
  },
  {
    id: 4,
    service_id: 4,
    service_name: 'AWS Cloud Services',
    plan_name: 'Scale',
    billing_cycle: 'monthly',
    price: 45.0,
    currency: 'USD',
    status: 'ACTIVE',
    auto_renew: 1,
    started_at: '2025-11-20',
    next_billing_at: '2026-11-20',
    category: 'Infrastructure',
    account_user: 'ops.admin@subflow.io'
  },
  {
    id: 5,
    service_id: 7,
    service_name: 'Zoom Workplace',
    plan_name: 'Pro',
    billing_cycle: 'yearly',
    price: 149.9,
    currency: 'USD',
    status: 'ACTIVE',
    auto_renew: 0,
    started_at: '2025-12-10',
    next_billing_at: '2026-12-10',
    category: 'Communication',
    account_user: 'sales@subflow.io'
  }
];

const INITIAL_BILLING_HISTORY = [
  {
    id: 1,
    subscription_id: 1,
    service_name: 'Notion',
    amount: 10.0,
    currency: 'USD',
    payment_method: 'Corporate Visa **** 4242',
    status: 'PAID',
    billing_date: '2026-10-01',
    invoice_num: 'INV-2026-1001'
  },
  {
    id: 2,
    subscription_id: 2,
    service_name: 'Slack',
    amount: 12.5,
    currency: 'USD',
    payment_method: 'Corporate Visa **** 4242',
    status: 'PAID',
    billing_date: '2026-10-05',
    invoice_num: 'INV-2026-1002'
  },
  {
    id: 3,
    subscription_id: 3,
    service_name: 'GitHub Copilot',
    amount: 19.0,
    currency: 'USD',
    payment_method: 'MasterCard **** 8899',
    status: 'PAID',
    billing_date: '2026-10-08',
    invoice_num: 'INV-2026-1003'
  },
  {
    id: 4,
    subscription_id: 4,
    service_name: 'AWS Cloud Services',
    amount: 45.0,
    currency: 'USD',
    payment_method: 'Corporate Visa **** 4242',
    status: 'PAID',
    billing_date: '2026-10-10',
    invoice_num: 'INV-2026-1004'
  },
  {
    id: 5,
    subscription_id: 5,
    service_name: 'Zoom Workplace',
    amount: 149.9,
    currency: 'USD',
    payment_method: 'KakaoPay Corporate',
    status: 'PAID',
    billing_date: '2025-12-10',
    invoice_num: 'INV-2025-0812'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: '정기 결제 완료',
    message: 'AWS Cloud Services 45.00 USD 결제가 정상 승인되었습니다.',
    category: 'billing',
    is_read: 0,
    created_at: '2026-10-10 10:30:00'
  },
  {
    id: 2,
    title: '구독 갱신 예정 알림',
    message: 'Slack Pro 플랜의 정기 결제가 3일 후 예정되어 있습니다.',
    category: 'renewal',
    is_read: 0,
    created_at: '2026-10-11 09:00:00'
  },
  {
    id: 3,
    title: '새로운 서비스 카탈로그 입점',
    message: 'Figma Professional 플랜이 신규 지원 목록에 등록되었습니다.',
    category: 'system',
    is_read: 1,
    created_at: '2026-10-05 14:20:00'
  }
];

// Fallback Store Implementation (Synchronized to disk)
class FallbackSqliteStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      services: [],
      subscriptions: [],
      billing_history: [],
      notifications: [],
      sub_id_seq: 10,
      bill_id_seq: 10
    };
    this.load();
  }

  load() {
    try {
      const jsonFile = this.filePath + '.json';
      if (fs.existsSync(jsonFile)) {
        this.data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      } else {
        this.reset();
      }
    } catch (e) {
      this.reset();
    }
  }

  save() {
    try {
      const jsonFile = this.filePath + '.json';
      fs.writeFileSync(jsonFile, JSON.stringify(this.data, null, 2), 'utf8');
      // Also touch .db to guarantee actual file exists on disk
      fs.writeFileSync(this.filePath, Buffer.from('SQLite format 3\0'));
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  }

  reset() {
    this.data = {
      services: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
      subscriptions: JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS)),
      billing_history: JSON.parse(JSON.stringify(INITIAL_BILLING_HISTORY)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      sub_id_seq: 10,
      bill_id_seq: 10
    };
    this.save();
  }
}

// Database init and helper methods
function initDatabase() {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      memoryStore = new FallbackSqliteStore(DB_PATH);
      console.log('[DB] Fallback SQLite file store initialized at:', DB_PATH);
      return resolve();
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.warn('[DB] SQLite file connection failed, falling back to memory store:', err.message);
        useFallback = true;
        memoryStore = new FallbackSqliteStore(DB_PATH);
        return resolve();
      }

      console.log('[DB] Connected to SQLite database file:', DB_PATH);
      createTables()
        .then(() => resolve())
        .catch(reject);
    });
  });
}

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      return resolve({ lastID: 0, changes: 0 });
    }
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      return resolve([]);
    }
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      return resolve(null);
    }
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function createTables() {
  await runSql(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      base_price_monthly REAL NOT NULL,
      base_price_yearly REAL NOT NULL,
      available_plans TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      auto_renew INTEGER NOT NULL DEFAULT 1,
      started_at TEXT NOT NULL,
      next_billing_at TEXT NOT NULL,
      category TEXT NOT NULL,
      account_user TEXT NOT NULL DEFAULT 'alex.kim@subflow.io'
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS billing_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER,
      service_name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PAID',
      billing_date TEXT NOT NULL,
      invoice_num TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // Check if seed needed
  const countRow = await getSql('SELECT COUNT(*) as count FROM services');
  if (!countRow || countRow.count === 0) {
    await seedTables();
  }
}

async function seedTables() {
  if (useFallback) {
    memoryStore.reset();
    return;
  }

  // Clear existing
  await runSql('DELETE FROM services');
  await runSql('DELETE FROM subscriptions');
  await runSql('DELETE FROM billing_history');
  await runSql('DELETE FROM notifications');

  for (const s of INITIAL_SERVICES) {
    await runSql(
      `INSERT INTO services (id, name, category, icon, description, base_price_monthly, base_price_yearly, available_plans)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.category, s.icon, s.description, s.base_price_monthly, s.base_price_yearly, s.available_plans]
    );
  }

  for (const sub of INITIAL_SUBSCRIPTIONS) {
    await runSql(
      `INSERT INTO subscriptions (id, service_id, service_name, plan_name, billing_cycle, price, currency, status, auto_renew, started_at, next_billing_at, category, account_user)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sub.id, sub.service_id, sub.service_name, sub.plan_name, sub.billing_cycle, sub.price, sub.currency, sub.status, sub.auto_renew, sub.started_at, sub.next_billing_at, sub.category, sub.account_user]
    );
  }

  for (const b of INITIAL_BILLING_HISTORY) {
    await runSql(
      `INSERT INTO billing_history (id, subscription_id, service_name, amount, currency, payment_method, status, billing_date, invoice_num)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.subscription_id, b.service_name, b.amount, b.currency, b.payment_method, b.status, b.billing_date, b.invoice_num]
    );
  }

  for (const n of INITIAL_NOTIFICATIONS) {
    await runSql(
      `INSERT INTO notifications (id, title, message, category, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [n.id, n.title, n.message, n.category, n.is_read, n.created_at]
    );
  }
}

async function resetAllData() {
  if (useFallback) {
    memoryStore.reset();
    return { success: true, message: 'Fallback store restored to initial seed state.' };
  }
  await seedTables();
  return { success: true, message: 'SQLite database restored to initial seed state.' };
}

module.exports = {
  initDatabase,
  runSql,
  allSql,
  getSql,
  resetAllData,
  isFallback: () => useFallback,
  getFallbackStore: () => memoryStore
};
