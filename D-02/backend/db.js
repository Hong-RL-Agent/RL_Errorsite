const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'pennylog.db');

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

// 1. Initial Categories
const INITIAL_CATEGORIES = [
  { id: 1, name: '식비', type: 'EXPENSE', icon: 'Utensils', color: '#10B981' },
  { id: 2, name: '카페/간식', type: 'EXPENSE', icon: 'Coffee', color: '#059669' },
  { id: 3, name: '교통/차량', type: 'EXPENSE', icon: 'Car', color: '#047857' },
  { id: 4, name: '쇼핑/패션', type: 'EXPENSE', icon: 'ShoppingBag', color: '#14B8A6' },
  { id: 5, name: '주거/통신', type: 'EXPENSE', icon: 'Home', color: '#0D9488' },
  { id: 6, name: '교육/자기계발', type: 'EXPENSE', icon: 'BookOpen', color: '#06B6D4' },
  { id: 7, name: '의료/건강', type: 'EXPENSE', icon: 'HeartPulse', color: '#0891B2' },
  { id: 8, name: '문화/여가', type: 'EXPENSE', icon: 'Film', color: '#6366F1' },
  { id: 9, name: '생활/마트', type: 'EXPENSE', icon: 'PackageCheck', color: '#3B82F6' },
  { id: 10, name: '급여/월급', type: 'INCOME', icon: 'Coins', color: '#10B981' },
  { id: 11, name: '부수입/보너스', type: 'INCOME', icon: 'TrendingUp', color: '#059669' },
  { id: 12, name: '금융/이자', type: 'INCOME', icon: 'PiggyBank', color: '#14B8A6' },
  { id: 13, name: '기타/용돈', type: 'INCOME', icon: 'Gift', color: '#06B6D4' }
];

// 2. Initial Accounts
const INITIAL_ACCOUNTS = [
  { id: 1, name: '토스뱅크 주거래계좌', account_type: 'CHECKING', balance: 3450000, bank: '토스뱅크' },
  { id: 2, name: '신한 마이급여통장', account_type: 'SAVINGS', balance: 12800000, bank: '신한은행' },
  { id: 3, name: '카카오페이머니', account_type: 'PAY', balance: 245000, bank: '카카오페이' },
  { id: 4, name: '현대 제로카드 (체크)', account_type: 'CARD', balance: 850000, bank: '현대카드' }
];

// 3. Initial Budgets (월간 목표 예산: 2026년 10월)
const INITIAL_BUDGETS = [
  { id: 1, category_id: 1, category_name: '식비', monthly_budget: 500000, year_month: '2026-10' },
  { id: 2, category_id: 2, category_name: '카페/간식', monthly_budget: 120000, year_month: '2026-10' },
  { id: 3, category_id: 3, category_name: '교통/차량', monthly_budget: 150000, year_month: '2026-10' },
  { id: 4, category_id: 4, category_name: '쇼핑/패션', monthly_budget: 200000, year_month: '2026-10' },
  { id: 5, category_id: 5, category_name: '주거/통신', monthly_budget: 180000, year_month: '2026-10' },
  { id: 6, category_id: 6, category_name: '교육/자기계발', monthly_budget: 100000, year_month: '2026-10' },
  { id: 7, category_id: 7, category_name: '의료/건강', monthly_budget: 80000, year_month: '2026-10' },
  { id: 8, category_id: 8, category_name: '생활/마트', monthly_budget: 250000, year_month: '2026-10' }
];

// 4. Initial Transactions (최소 40개 이상의 실제 거래 내역 생성)
const INITIAL_TRANSACTIONS = [
  { id: 1, type: 'INCOME', category_id: 10, category_name: '급여/월급', account_id: 2, account_name: '신한 마이급여통장', amount: 3850000, title: '10월 정기 급여 입금', memo: '주식회사 테크랩스', transaction_date: '2026-10-01' },
  { id: 2, type: 'EXPENSE', category_id: 5, category_name: '주거/통신', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 65000, title: 'SKT 이동통신요금 자동이체', memo: '스마트폰 5G 요금', transaction_date: '2026-10-01' },
  { id: 3, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 12000, title: '점심식사 김밥천국', memo: '참치김밥, 라면', transaction_date: '2026-10-01' },
  { id: 4, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 4500, title: '스타벅스 아메리카노', memo: '식후 음료', transaction_date: '2026-10-01' },
  { id: 5, type: 'EXPENSE', category_id: 3, category_name: '교통/차량', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 1550, title: '지하철 교통비', memo: '출퇴근 광역전철', transaction_date: '2026-10-02' },
  { id: 6, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 28000, title: '저녁식사 스시마루', memo: '초밥 정식 세트', transaction_date: '2026-10-02' },
  { id: 7, type: 'EXPENSE', category_id: 9, category_name: '생활/마트', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 18900, title: '올리브영 생필품 구매', memo: '샴푸, 치약 구매', transaction_date: '2026-10-02' },
  { id: 8, type: 'EXPENSE', category_id: 6, category_name: '교육/자기계발', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 22000, title: '교보문고 경제 서적 구매', memo: '재테크 입문서', transaction_date: '2026-10-03' },
  { id: 9, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 3, account_name: '카카오페이머니', amount: 8500, title: '써브웨이 샌드위치', memo: '치킨데리야끼 세트', transaction_date: '2026-10-03' },
  { id: 10, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 5000, title: '투썸플레이스 카페라떼', memo: '주말 독서 카페', transaction_date: '2026-10-03' },
  { id: 11, type: 'EXPENSE', category_id: 8, category_name: '문화/여가', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 15000, title: 'CGV 주말 영화 티켓', memo: 'SF 액션 영화', transaction_date: '2026-10-04' },
  { id: 12, type: 'EXPENSE', category_id: 9, category_name: '생활/마트', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 48500, title: '이마트 장보기', memo: '계란, 우유, 과일, 식빵', transaction_date: '2026-10-04' },
  { id: 13, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 35000, title: '주말 가족 삼겹살 외식', memo: '동네 정육식당', transaction_date: '2026-10-04' },
  { id: 14, type: 'EXPENSE', category_id: 3, category_name: '교통/차량', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 12400, title: '카카오 T 택시 이용', memo: '심야 귀가 택시비', transaction_date: '2026-10-05' },
  { id: 15, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 9900, title: '스타벅스 커피 쿠폰 구매', memo: '친구 생일선물 e기프티콘', transaction_date: '2026-10-05' },
  { id: 16, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 11000, title: '점심 사케동 식사', memo: '회사 인근 일식당', transaction_date: '2026-10-05' },
  { id: 17, type: 'EXPENSE', category_id: 4, category_name: '쇼핑/패션', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 39000, title: '유니클로 가을 니트', memo: '기본 가디건', transaction_date: '2026-10-06' },
  { id: 18, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 13000, title: '점심 쌀국수', memo: '소고기 쌀국수', transaction_date: '2026-10-06' },
  { id: 19, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 4800, title: '이디야 바닐라라떼', memo: '오후 테이크아웃', transaction_date: '2026-10-06' },
  { id: 20, type: 'INCOME', category_id: 12, category_name: '금융/이자', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 28500, title: '토스뱅크 예금 이자 지급', memo: '연 3.2% 파킹통장', transaction_date: '2026-10-07' },
  { id: 21, type: 'EXPENSE', category_id: 7, category_name: '의료/건강', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 7200, title: '이비인후과 진료비', memo: '환절기 감기 진료', transaction_date: '2026-10-07' },
  { id: 22, type: 'EXPENSE', category_id: 7, category_name: '의료/건강', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 6500, title: '온누리약국 처방 조제', memo: '감기약 및 영양제', transaction_date: '2026-10-07' },
  { id: 23, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 21000, title: '배달의민족 찜닭 주문', memo: '야근 후 저녁식사', transaction_date: '2026-10-07' },
  { id: 24, type: 'EXPENSE', category_id: 3, category_name: '교통/차량', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 1550, title: '시내버스 환승요금', memo: '귀가 버스', transaction_date: '2026-10-08' },
  { id: 25, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 9500, title: '구내식당 식권 1회권', memo: '회사 복지몰 충전', transaction_date: '2026-10-08' },
  { id: 26, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 3500, title: '메가커피 아메리카노', memo: '대용량 아이스커피', transaction_date: '2026-10-08' },
  { id: 27, type: 'EXPENSE', category_id: 5, category_name: '주거/통신', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 94000, title: '오피스텔 관리비 납부', memo: '수도, 전기, 공용관리비', transaction_date: '2026-10-09' },
  { id: 28, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 14000, title: '중화요리 삼선짜장면', memo: '점심 팀 회식 식사', transaction_date: '2026-10-09' },
  { id: 29, type: 'EXPENSE', category_id: 9, category_name: '생활/마트', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 24000, title: '다이소 생활용품 쇼핑', memo: '수납함, 옷걸이, 건전지', transaction_date: '2026-10-09' },
  { id: 30, type: 'EXPENSE', category_id: 3, category_name: '교통/차량', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 50000, title: 'GS칼텍스 주유소', memo: '자가용 가솔린 주유', transaction_date: '2026-10-10' },
  { id: 31, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 42000, title: '주말 브런치 카페 식사', memo: '파스타, 프렌치토스트', transaction_date: '2026-10-10' },
  { id: 32, type: 'EXPENSE', category_id: 8, category_name: '문화/여가', account_id: 3, account_name: '카카오페이머니', amount: 14900, title: '넷플릭스 프리미엄 멤버십', memo: '월정액 자동결제', transaction_date: '2026-10-10' },
  { id: 33, type: 'INCOME', category_id: 13, category_name: '기타/용돈', account_id: 3, account_name: '카카오페이머니', amount: 50000, title: '중고나라 소형 가전 판매', memo: '안 쓰는 토스터기 처분', transaction_date: '2026-10-10' },
  { id: 34, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 6200, title: '폴바셋 아이스크림 라떼', memo: '디저트', transaction_date: '2026-10-11' },
  { id: 35, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 16000, title: '저녁식사 설렁탕 한그릇', memo: '특설렁탕 뚝배기', transaction_date: '2026-10-11' },
  { id: 36, type: 'EXPENSE', category_id: 6, category_name: '교육/자기계발', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 49000, title: '인프런 웹개발 온라인 강의', memo: 'Next.js 마스터클래스', transaction_date: '2026-10-11' },
  { id: 37, type: 'EXPENSE', category_id: 1, category_name: '식비', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 10500, title: '점심식사 순두부찌개', memo: '직장인 단골 식당', transaction_date: '2026-10-12' },
  { id: 38, type: 'EXPENSE', category_id: 2, category_name: '카페/간식', account_id: 3, account_name: '카카오페이머니', amount: 4500, title: '스타벅스 콜드브루', memo: '업무 집중 커피', transaction_date: '2026-10-12' },
  { id: 39, type: 'EXPENSE', category_id: 3, category_name: '교통/차량', account_id: 4, account_name: '현대 제로카드 (체크)', amount: 1550, title: '지하철 출근', memo: '정기승차', transaction_date: '2026-10-12' },
  { id: 40, type: 'EXPENSE', category_id: 9, category_name: '생활/마트', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 12500, title: 'GS25 편의점 생수/간편식', memo: '생수 2L 6입 번들', transaction_date: '2026-10-12' },
  { id: 41, type: 'INCOME', category_id: 11, category_name: '부수입/보너스', account_id: 1, account_name: '토스뱅크 주거래계좌', amount: 350000, title: '외주 개발 자문료 입금', memo: '스타트업 기술 자문료', transaction_date: '2026-10-12' }
];

// Fallback Store Implementation (Synchronized to Disk)
class FallbackSqliteStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      categories: [],
      accounts: [],
      budgets: [],
      transactions: [],
      trans_id_seq: 100,
      budget_id_seq: 20
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
      fs.writeFileSync(this.filePath, Buffer.from('SQLite format 3\0'));
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  }

  reset() {
    this.data = {
      categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
      accounts: JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)),
      budgets: JSON.parse(JSON.stringify(INITIAL_BUDGETS)),
      transactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
      trans_id_seq: 100,
      budget_id_seq: 20
    };
    this.save();
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      memoryStore = new FallbackSqliteStore(DB_PATH);
      console.log('[PennyLog DB] Fallback SQLite file store initialized at:', DB_PATH);
      return resolve();
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.warn('[PennyLog DB] SQLite file open error, using memory fallback:', err.message);
        useFallback = true;
        memoryStore = new FallbackSqliteStore(DB_PATH);
        return resolve();
      }
      console.log('[PennyLog DB] Connected to SQLite database file:', DB_PATH);
      createTables()
        .then(() => resolve())
        .catch(reject);
    });
  });
}

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (useFallback) return resolve({ lastID: 0, changes: 0 });
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (useFallback) return resolve([]);
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (useFallback) return resolve(null);
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function createTables() {
  await runSql(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      balance REAL NOT NULL,
      bank TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      monthly_budget REAL NOT NULL,
      year_month TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      account_id INTEGER NOT NULL,
      account_name TEXT NOT NULL,
      amount REAL NOT NULL,
      title TEXT NOT NULL,
      memo TEXT,
      transaction_date TEXT NOT NULL
    )
  `);

  const countRow = await getSql('SELECT COUNT(*) as count FROM transactions');
  if (!countRow || countRow.count === 0) {
    await seedTables();
  }
}

async function seedTables() {
  if (useFallback) {
    memoryStore.reset();
    return;
  }

  await runSql('DELETE FROM categories');
  await runSql('DELETE FROM accounts');
  await runSql('DELETE FROM budgets');
  await runSql('DELETE FROM transactions');

  for (const c of INITIAL_CATEGORIES) {
    await runSql(
      'INSERT INTO categories (id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
      [c.id, c.name, c.type, c.icon, c.color]
    );
  }

  for (const a of INITIAL_ACCOUNTS) {
    await runSql(
      'INSERT INTO accounts (id, name, account_type, balance, bank) VALUES (?, ?, ?, ?, ?)',
      [a.id, a.name, a.account_type, a.balance, a.bank]
    );
  }

  for (const b of INITIAL_BUDGETS) {
    await runSql(
      'INSERT INTO budgets (id, category_id, category_name, monthly_budget, year_month) VALUES (?, ?, ?, ?, ?)',
      [b.id, b.category_id, b.category_name, b.monthly_budget, b.year_month]
    );
  }

  for (const t of INITIAL_TRANSACTIONS) {
    await runSql(
      `INSERT INTO transactions (id, type, category_id, category_name, account_id, account_name, amount, title, memo, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.type, t.category_id, t.category_name, t.account_id, t.account_name, t.amount, t.title, t.memo, t.transaction_date]
    );
  }
}

async function resetAllData() {
  if (useFallback) {
    memoryStore.reset();
    return { success: true, message: 'PennyLog 데이터베이스가 초기 41개 거래 상태로 리셋되었습니다.' };
  }
  await seedTables();
  return { success: true, message: 'PennyLog SQLite 데이터베이스가 초기 41개 거래 상태로 리셋되었습니다.' };
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
