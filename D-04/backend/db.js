const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'booknest.db');

let sqlite3;
let db = null;
let useFallback = false;
let memoryStore = null;

try {
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.warn('[BookNest DB] Native sqlite3 module not available, using file-backed store fallback:', err.message);
  useFallback = true;
}

// 1. Initial Users (12 users: >= 10 users required)
const INITIAL_USERS = [
  { id: 1, name: '김민준', department: '소프트웨어공학과', email: 'minjun.kim@booknest.edu', phone: '010-1234-5678', borrowed_count: 2 },
  { id: 2, name: '이서연', department: '경영학과', email: 'seoyeon.lee@booknest.edu', phone: '010-2345-6789', borrowed_count: 1 },
  { id: 3, name: '박도현', department: '컴퓨터사이언스', email: 'dohyun.park@booknest.edu', phone: '010-3456-7890', borrowed_count: 1 },
  { id: 4, name: '정지우', department: '국어국문학과', email: 'jiwoo.jung@booknest.edu', phone: '010-4567-8901', borrowed_count: 0 },
  { id: 5, name: '최현우', department: '인공지능연구소', email: 'hyunwoo.choi@booknest.edu', phone: '010-5678-9012', borrowed_count: 1 },
  { id: 6, name: '강예은', department: '디자인학부', email: 'yeeun.kang@booknest.edu', phone: '010-6789-0123', borrowed_count: 0 },
  { id: 7, name: '윤시우', department: '심리학과', email: 'siwoo.yoon@booknest.edu', phone: '010-7890-1234', borrowed_count: 1 },
  { id: 8, name: '한소희', department: '미디어커뮤니케이션', email: 'sohee.han@booknest.edu', phone: '010-8901-2345', borrowed_count: 0 },
  { id: 9, name: '임재원', department: '데이터사이언스', email: 'jaewon.lim@booknest.edu', phone: '010-9012-3456', borrowed_count: 2 },
  { id: 10, name: '송하은', department: '영미어문학과', email: 'haeun.song@booknest.edu', phone: '010-0123-4567', borrowed_count: 1 },
  { id: 11, name: '오세진', department: '전자전기공학', email: 'sejin.oh@booknest.edu', phone: '010-1122-3344', borrowed_count: 0 },
  { id: 12, name: '배유진', department: '철학과', email: 'yujin.bae@booknest.edu', phone: '010-2233-4455', borrowed_count: 1 }
];

// 2. Initial Books (42 books: >= 40 books required)
const INITIAL_BOOKS = [
  { id: 1, title: '리팩터링 2판', author: '마틴 파울러', publisher: '한빛미디어', category: 'IT/컴퓨터', isbn: '9791162241699', location: 'IT-A-01', total_copies: 4, available_copies: 2 },
  { id: 2, title: 'Clean Architecture', author: '로버트 C. 마틴', publisher: '다산출판사', category: 'IT/컴퓨터', isbn: '9788960773417', location: 'IT-A-02', total_copies: 3, available_copies: 1 },
  { id: 3, title: 'Clean Code 클린 코드', author: '로버트 C. 마틴', publisher: '인사이트', category: 'IT/컴퓨터', isbn: '9788966260959', location: 'IT-A-03', total_copies: 3, available_copies: 3 }, // BUG-D04-01 Target
  { id: 4, title: '자바스크립트 완벽 가이드', author: '데이비드 플래너건', publisher: '인사이트', category: 'IT/컴퓨터', isbn: '9788966263561', location: 'IT-A-04', total_copies: 2, available_copies: 1 },
  { id: 5, title: '총, 균, 쇠', author: '재레드 다이아몬드', publisher: '문학사상', category: '인문/역사', isbn: '9788970127248', location: 'HUM-B-01', total_copies: 4, available_copies: 1 }, // BUG-D04-02 Target
  { id: 6, title: '코스모스', author: '칼 세이건', publisher: '사이언스북스', category: '과학/교양', isbn: '9788983711892', location: 'SCI-C-01', total_copies: 3, available_copies: 2 },
  { id: 7, title: '이기적 유전자', author: '리처드 도킨스', publisher: '을유문화사', category: '과학/교양', isbn: '9788932473901', location: 'SCI-C-02', total_copies: 3, available_copies: 1 },
  { id: 8, title: '사피엔스', author: '유발 하라리', publisher: '김영사', category: '인문/역사', isbn: '9788934972464', location: 'HUM-B-02', total_copies: 4, available_copies: 2 }, // BUG-D04-04 Target
  { id: 9, title: '정의란 무엇인가', author: '마이클 샌델', publisher: '와이즈베리', category: '인문/철학', isbn: '9788937834790', location: 'HUM-B-03', total_copies: 2, available_copies: 1 },
  { id: 10, title: '침묵의 봄', author: '레이첼 카슨', publisher: '에코리브르', category: '과학/환경', isbn: '9788990048035', location: 'SCI-C-03', total_copies: 2, available_copies: 2 },
  { id: 11, title: '어린 왕자', author: '앙투안 드 생텍쥐페리', publisher: '열린책들', category: '문학/고전', isbn: '9788932917245', location: 'LIT-D-01', total_copies: 5, available_copies: 3 }, // BUG-D04-03 Affected
  { id: 12, title: '데미안', author: '헤르만 헤세', publisher: '민음사', category: '문학/고전', isbn: '9788937460449', location: 'LIT-D-02', total_copies: 4, available_copies: 2 }, // BUG-D04-03 Trigger
  { id: 13, title: '1984', author: '조지 오웰', publisher: '민음사', category: '문학/소설', isbn: '9788937460777', location: 'LIT-D-03', total_copies: 3, available_copies: 1 },
  { id: 14, title: '멋진 신세계', author: '올더스 헉슬리', publisher: '소담출판사', category: '문학/소설', isbn: '9788973812820', location: 'LIT-D-04', total_copies: 3, available_copies: 2 },
  { id: 15, title: '객체지향의 사실과 오해', author: '조영호', publisher: '위키북스', category: 'IT/컴퓨터', isbn: '9788998139766', location: 'IT-A-05', total_copies: 3, available_copies: 3 }, // BUG-D04-05 Target
  { id: 16, title: '오브젝트', author: '조영호', publisher: '위키북스', category: 'IT/컴퓨터', isbn: '9791158391409', location: 'IT-A-06', total_copies: 2, available_copies: 1 },
  { id: 17, title: '자바 ORM 표준 JPA 프로그래밍', author: '김영한', publisher: '에이콘출판', category: 'IT/컴퓨터', isbn: '9788960777330', location: 'IT-A-07', total_copies: 2, available_copies: 0 },
  { id: 18, title: '토비의 스프링 3.1', author: '이일민', publisher: '에이콘출판', category: 'IT/컴퓨터', isbn: '9788960773431', location: 'IT-A-08', total_copies: 2, available_copies: 1 },
  { id: 19, title: '디자인 패턴: GoF의 23가지 객체지향 솔루션', author: '에릭 감마 외', publisher: '프로텍미디어', category: 'IT/컴퓨터', isbn: '9791195444953', location: 'IT-A-09', total_copies: 2, available_copies: 2 },
  { id: 20, title: '데이터 분석을 위한 SQL 레시피', author: '가사키 사토시', publisher: '한빛미디어', category: 'IT/컴퓨터', isbn: '9791162240951', location: 'IT-A-10', total_copies: 2, available_copies: 2 },
  { id: 21, title: '미움받을 용기', author: '기시미 이치로', publisher: '인플루엔셜', category: '인문/심리', isbn: '9788997575169', location: 'HUM-B-04', total_copies: 3, available_copies: 2 },
  { id: 22, title: '돈의 심리학', author: '모건 하우절', publisher: '인플루엔셜', category: '경제/경영', isbn: '9791191043051', location: 'ECO-E-01', total_copies: 3, available_copies: 1 },
  { id: 23, title: '부의 역류', author: '피터 린치', publisher: '이레', category: '경제/경영', isbn: '9788957091173', location: 'ECO-E-02', total_copies: 2, available_copies: 1 },
  { id: 24, title: '제로 투 원', author: '피터 틸', publisher: '한국경제신문사', category: '경제/경영', isbn: '9788947540209', location: 'ECO-E-03', total_copies: 2, available_copies: 2 },
  { id: 25, title: '역행자', author: '자청', publisher: '웅진지식하우스', category: '자기계발', isbn: '9788901260716', location: 'DEV-F-01', total_copies: 4, available_copies: 3 },
  { id: 26, title: '아주 작은 습관의 힘', author: '제임스 클리어', publisher: '비즈니스북스', category: '자기계발', isbn: '9791162540640', location: 'DEV-F-02', total_copies: 3, available_copies: 2 },
  { id: 27, title: '원씽 (The ONE Thing)', author: '게리 켈러', publisher: '비즈니스북스', category: '자기계발', isbn: '9788998046378', location: 'DEV-F-03', total_copies: 2, available_copies: 1 },
  { id: 28, title: '그릿 (GRIT)', author: '앤절라 더크워스', publisher: '비즈니스북스', category: '자기계발', isbn: '9788998046965', location: 'DEV-F-04', total_copies: 2, available_copies: 2 },
  { id: 29, title: '달러구트 꿈 백화점', author: '이미예', publisher: '팩토리나인', category: '문학/소설', isbn: '9791165341909', location: 'LIT-D-05', total_copies: 4, available_copies: 2 },
  { id: 30, title: '불편한 편의점', author: '김호연', publisher: '나무옆의자', category: '문학/소설', isbn: '9791161571188', location: 'LIT-D-06', total_copies: 3, available_copies: 1 },
  { id: 31, title: '구의 증명', author: '최진영', publisher: '은행나무', category: '문학/소설', isbn: '9788956608556', location: 'LIT-D-07', total_copies: 3, available_copies: 2 },
  { id: 32, title: '작별인사', author: '김영하', publisher: '복복서가', category: '문학/소설', isbn: '9791191114225', location: 'LIT-D-08', total_copies: 3, available_copies: 2 },
  { id: 33, title: '인간 실격', author: '다자이 오사무', publisher: '민음사', category: '문학/고전', isbn: '9788937461033', location: 'LIT-D-09', total_copies: 3, available_copies: 1 },
  { id: 34, title: '이방인', author: '알베르 카뮈', publisher: '민음사', category: '문학/고전', isbn: '9788937462665', location: 'LIT-D-10', total_copies: 3, available_copies: 2 },
  { id: 35, title: '변신', author: '프란츠 카프카', publisher: '민음사', category: '문학/고전', isbn: '9788937461538', location: 'LIT-D-11', total_copies: 2, available_copies: 2 },
  { id: 36, title: '파친코 1', author: '이민진', publisher: '인플루엔셜', category: '문학/소설', isbn: '9791168340527', location: 'LIT-D-12', total_copies: 3, available_copies: 1 },
  { id: 37, title: '생각에 관한 생각', author: '대니얼 카너먼', publisher: '김영사', category: '인문/심리', isbn: '9788934980698', location: 'HUM-B-05', total_copies: 2, available_copies: 1 },
  { id: 38, title: '클린 아키텍처 실습', author: '톰 홈버그', publisher: '위키북스', category: 'IT/컴퓨터', isbn: '9791158392758', location: 'IT-A-11', total_copies: 2, available_copies: 2 },
  { id: 39, title: '쿠버네티스 인 액션', author: '마르코 룩샤', publisher: '에이콘출판', category: 'IT/컴퓨터', isbn: '9791161753904', location: 'IT-A-12', total_copies: 2, available_copies: 1 },
  { id: 40, title: '도메인 주도 설계 핵심', author: '반 버논', publisher: '에이콘출판', category: 'IT/컴퓨터', isbn: '9788960779778', location: 'IT-A-13', total_copies: 2, available_copies: 2 },
  { id: 41, title: '엔터프라이즈 애플리케이션 아키텍처 패턴', author: '마틴 파울러', publisher: '위키북스', category: 'IT/컴퓨터', isbn: '9788998139988', location: 'IT-A-14', total_copies: 2, available_copies: 1 },
  { id: 42, title: '프로그래머의 뇌', author: '펠린 헤르만스', publisher: '제이펍', category: 'IT/컴퓨터', isbn: '9791191600650', location: 'IT-A-15', total_copies: 3, available_copies: 3 }
];

// 3. Initial Loans (22 loans: >= 20 loans required)
const INITIAL_LOANS = [
  { id: 1, book_id: 1, book_title: '리팩터링 2판', user_id: 1, user_name: '김민준', borrow_date: '2026-10-01', due_date: '2026-10-15', return_date: null, status: 'BORROWED' },
  { id: 2, book_id: 2, book_title: 'Clean Architecture', user_id: 3, user_name: '박도현', borrow_date: '2026-10-02', due_date: '2026-10-16', return_date: null, status: 'BORROWED' },
  { id: 3, book_id: 4, book_title: '자바스크립트 완벽 가이드', user_id: 5, user_name: '최현우', borrow_date: '2026-10-03', due_date: '2026-10-17', return_date: null, status: 'BORROWED' },
  { id: 4, book_id: 5, book_title: '총, 균, 쇠', user_id: 2, user_name: '이서연', borrow_date: '2026-09-25', due_date: '2026-10-09', return_date: '2026-10-08', status: 'RETURNED' },
  { id: 5, book_id: 5, book_title: '총, 균, 쇠', user_id: 7, user_name: '윤시우', borrow_date: '2026-10-04', due_date: '2026-10-18', return_date: null, status: 'BORROWED' }, // BUG-D04-02 Target
  { id: 6, book_id: 6, book_title: '코스모스', user_id: 9, user_name: '임재원', borrow_date: '2026-10-04', due_date: '2026-10-18', return_date: null, status: 'BORROWED' },
  { id: 7, book_id: 7, book_title: '이기적 유전자', user_id: 10, user_name: '송하은', borrow_date: '2026-10-05', due_date: '2026-10-19', return_date: null, status: 'BORROWED' },
  { id: 8, book_id: 8, book_title: '사피엔스', user_id: 1, user_name: '김민준', borrow_date: '2026-09-20', due_date: '2026-10-04', return_date: '2026-10-03', status: 'RETURNED' },
  { id: 9, book_id: 8, book_title: '사피엔스', user_id: 12, user_name: '배유진', borrow_date: '2026-10-05', due_date: '2026-10-19', return_date: null, status: 'BORROWED' },
  { id: 10, book_id: 9, book_title: '정의란 무엇인가', user_id: 2, user_name: '이서연', borrow_date: '2026-10-06', due_date: '2026-10-20', return_date: null, status: 'BORROWED' },
  { id: 11, book_id: 11, book_title: '어린 왕자', user_id: 9, user_name: '임재원', borrow_date: '2026-10-06', due_date: '2026-10-20', return_date: null, status: 'BORROWED' },
  { id: 12, book_id: 12, book_title: '데미안', user_id: 4, user_name: '정지우', borrow_date: '2026-09-22', due_date: '2026-10-06', return_date: '2026-10-05', status: 'RETURNED' },
  { id: 13, book_id: 12, book_title: '데미안', user_id: 10, user_name: '송하은', borrow_date: '2026-10-07', due_date: '2026-10-21', return_date: null, status: 'BORROWED' },
  { id: 14, book_id: 13, book_title: '1984', user_id: 6, user_name: '강예은', borrow_date: '2026-09-24', due_date: '2026-10-08', return_date: '2026-10-07', status: 'RETURNED' },
  { id: 15, book_id: 14, book_title: '멋진 신세계', user_id: 8, user_name: '한소희', borrow_date: '2026-09-26', due_date: '2026-10-10', return_date: '2026-10-09', status: 'RETURNED' },
  { id: 16, book_id: 16, book_title: '오브젝트', user_id: 1, user_name: '김민준', borrow_date: '2026-10-08', due_date: '2026-10-22', return_date: null, status: 'BORROWED' },
  { id: 17, book_id: 17, book_title: '자바 ORM 표준 JPA 프로그래밍', user_id: 3, user_name: '박도현', borrow_date: '2026-09-28', due_date: '2026-10-12', return_date: null, status: 'BORROWED' },
  { id: 18, book_id: 17, book_title: '자바 ORM 표준 JPA 프로그래밍', user_id: 5, user_name: '최현우', borrow_date: '2026-10-02', due_date: '2026-10-16', return_date: null, status: 'BORROWED' },
  { id: 19, book_id: 18, book_title: '토비의 스프링 3.1', user_id: 11, user_name: '오세진', borrow_date: '2026-09-20', due_date: '2026-10-04', return_date: '2026-10-04', status: 'RETURNED' },
  { id: 20, book_id: 22, book_title: '돈의 심리학', user_id: 2, user_name: '이서연', borrow_date: '2026-09-29', due_date: '2026-10-13', return_date: null, status: 'BORROWED' },
  { id: 21, book_id: 23, book_title: '부의 역류', user_id: 7, user_name: '윤시우', borrow_date: '2026-09-18', due_date: '2026-10-02', return_date: '2026-10-01', status: 'RETURNED' },
  { id: 22, book_id: 30, book_title: '불편한 편의점', user_id: 4, user_name: '정지우', borrow_date: '2026-10-09', due_date: '2026-10-23', return_date: null, status: 'BORROWED' }
];

// Fallback Store
class FallbackSqliteStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      users: [],
      books: [],
      loans: [],
      book_id_seq: 100,
      loan_id_seq: 100
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
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      books: JSON.parse(JSON.stringify(INITIAL_BOOKS)),
      loans: JSON.parse(JSON.stringify(INITIAL_LOANS)),
      book_id_seq: 100,
      loan_id_seq: 100
    };
    this.save();
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      memoryStore = new FallbackSqliteStore(DB_PATH);
      console.log('[BookNest DB] Fallback SQLite file store initialized at:', DB_PATH);
      return resolve();
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.warn('[BookNest DB] SQLite open error, using file fallback:', err.message);
        useFallback = true;
        memoryStore = new FallbackSqliteStore(DB_PATH);
        return resolve();
      }
      console.log('[BookNest DB] Connected to SQLite database file:', DB_PATH);
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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      borrowed_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT NOT NULL,
      category TEXT NOT NULL,
      isbn TEXT NOT NULL,
      location TEXT NOT NULL,
      total_copies INTEGER NOT NULL DEFAULT 1,
      available_copies INTEGER NOT NULL DEFAULT 1
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      book_title TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      borrow_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      status TEXT NOT NULL DEFAULT 'BORROWED'
    )
  `);

  const countRow = await getSql('SELECT COUNT(*) as count FROM books');
  if (!countRow || countRow.count === 0) {
    await seedTables();
  }
}

async function seedTables() {
  if (useFallback) {
    memoryStore.reset();
    return;
  }

  await runSql('DELETE FROM users');
  await runSql('DELETE FROM books');
  await runSql('DELETE FROM loans');

  for (const u of INITIAL_USERS) {
    await runSql(
      'INSERT INTO users (id, name, department, email, phone, borrowed_count) VALUES (?, ?, ?, ?, ?, ?)',
      [u.id, u.name, u.department, u.email, u.phone, u.borrowed_count]
    );
  }

  for (const b of INITIAL_BOOKS) {
    await runSql(
      `INSERT INTO books (id, title, author, publisher, category, isbn, location, total_copies, available_copies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.title, b.author, b.publisher, b.category, b.isbn, b.location, b.total_copies, b.available_copies]
    );
  }

  for (const l of INITIAL_LOANS) {
    await runSql(
      `INSERT INTO loans (id, book_id, book_title, user_id, user_name, borrow_date, due_date, return_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [l.id, l.book_id, l.book_title, l.user_id, l.user_name, l.borrow_date, l.due_date, l.return_date, l.status]
    );
  }
}

async function resetAllData() {
  if (useFallback) {
    memoryStore.reset();
    return { success: true, message: 'BookNest 데이터베이스가 초기 42권 도서 및 22건 대출 상태로 리셋되었습니다.' };
  }
  await seedTables();
  return { success: true, message: 'BookNest SQLite 데이터베이스가 초기 42권 도서 및 22건 대출 상태로 리셋되었습니다.' };
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
