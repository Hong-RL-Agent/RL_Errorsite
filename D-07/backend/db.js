const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'prefspace.db');
const db = new sqlite3.Database(DB_PATH);

// 초기 테스트 계정 목록
const INITIAL_USERS = [
  {
    id: 1,
    username: 'user_alex',
    name: '알렉스 김',
    email: 'alex@prefspace.io',
    bio: '클라우드 인프라 아키텍트 및 풀스택 개발자',
    avatar: '👨‍💻',
    created_at: '2024-03-01'
  },
  {
    id: 2,
    username: 'user_sarah',
    name: '사라 이',
    email: 'sarah@prefspace.io',
    bio: '글로벌 프로덕트 매니저 & UX 전략가',
    avatar: '👩‍💼',
    created_at: '2024-03-15'
  },
  {
    id: 3,
    username: 'user_david',
    name: '데이비드 박',
    email: 'david@prefspace.io',
    bio: '엔터프라이즈 데이터 엔지니어',
    avatar: '🧑‍💻',
    created_at: '2024-04-10'
  },
  {
    id: 4,
    username: 'user_elena',
    name: '엘레나 최',
    email: 'elena@prefspace.io',
    bio: '정보보안 및 프라이버시 컴플라이언스 오피서',
    avatar: '👩‍🔬',
    created_at: '2024-05-01'
  },
  {
    id: 5,
    username: 'user_james',
    name: '제임스 정',
    email: 'james@prefspace.io',
    bio: '분산 시스템 엔지니어 (뉴욕 / 서울)',
    avatar: '👨‍🎨',
    created_at: '2024-05-20'
  },
  {
    id: 6,
    username: 'user_normal',
    name: '일반 테스터',
    email: 'normal@prefspace.io',
    bio: '설정 영속성 정상 동작 검증 계정',
    avatar: '🧑‍💼',
    created_at: '2024-06-01'
  }
];

// 초기 환경설정 데이터 (모든 사용자 기본값 세팅)
const INITIAL_PREFERENCES = [
  {
    user_id: 1, // user_alex (BUG-D07-01: theme dark 변경 실패)
    theme: 'light',
    language: 'ko',
    email_marketing: 1,
    email_security: 1,
    email_billing: 1,
    push_desktop: 1,
    push_sound: 1,
    privacy_scope: 'PUBLIC',
    timezone: 'Asia/Seoul',
    updated_at: '2026-10-01 10:00:00'
  },
  {
    user_id: 2, // user_sarah (BUG-D07-02: language en 변경 실패)
    theme: 'light',
    language: 'ko',
    email_marketing: 1,
    email_security: 1,
    email_billing: 1,
    push_desktop: 1,
    push_sound: 1,
    privacy_scope: 'PUBLIC',
    timezone: 'Asia/Seoul',
    updated_at: '2026-10-01 10:00:00'
  },
  {
    user_id: 3, // user_david (BUG-D07-03: email_marketing OFF 변경 실패)
    theme: 'light',
    language: 'ko',
    email_marketing: 1,
    email_security: 1,
    email_billing: 1,
    push_desktop: 1,
    push_sound: 1,
    privacy_scope: 'PUBLIC',
    timezone: 'Asia/Seoul',
    updated_at: '2026-10-01 10:00:00'
  },
  {
    user_id: 4, // user_elena (BUG-D07-04: privacy_scope PRIVATE 변경 실패)
    theme: 'light',
    language: 'ko',
    email_marketing: 1,
    email_security: 1,
    email_billing: 1,
    push_desktop: 1,
    push_sound: 1,
    privacy_scope: 'PUBLIC',
    timezone: 'Asia/Seoul',
    updated_at: '2026-10-01 10:00:00'
  },
  {
    user_id: 5, // user_james (BUG-D07-05: timezone America/New_York 변경 실패)
    theme: 'light',
    language: 'ko',
    email_marketing: 1,
    email_security: 1,
    email_billing: 1,
    push_desktop: 1,
    push_sound: 1,
    privacy_scope: 'PUBLIC',
    timezone: 'Asia/Seoul',
    updated_at: '2026-10-01 10:00:00'
  },
  {
    user_id: 6, // user_normal (정상 검증 계정)
    theme: 'light',
    language: 'ko',
    email_marketing: 1,
    email_security: 1,
    email_billing: 1,
    push_desktop: 1,
    push_sound: 1,
    privacy_scope: 'PUBLIC',
    timezone: 'Asia/Seoul',
    updated_at: '2026-10-01 10:00:00'
  }
];

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. users 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          bio TEXT,
          avatar TEXT,
          created_at TEXT NOT NULL
        )
      `);

      // 2. user_preferences 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id INTEGER PRIMARY KEY,
          theme TEXT NOT NULL DEFAULT 'light',
          language TEXT NOT NULL DEFAULT 'ko',
          email_marketing INTEGER NOT NULL DEFAULT 1,
          email_security INTEGER NOT NULL DEFAULT 1,
          email_billing INTEGER NOT NULL DEFAULT 1,
          push_desktop INTEGER NOT NULL DEFAULT 1,
          push_sound INTEGER NOT NULL DEFAULT 1,
          privacy_scope TEXT NOT NULL DEFAULT 'PUBLIC',
          timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // 3. preference_logs 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS preference_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          setting_key TEXT NOT NULL,
          old_value TEXT,
          new_value TEXT,
          created_at TEXT NOT NULL
        )
      `);

      db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
        if (err) return reject(err);
        if (row && row.count === 0) {
          resetAllData().then(resolve).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
}

function resetAllData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM users');
      db.run('DELETE FROM user_preferences');
      db.run('DELETE FROM preference_logs');

      // 1. users 삽입
      const stmtUser = db.prepare('INSERT INTO users (id, username, name, email, bio, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
      INITIAL_USERS.forEach(u => {
        stmtUser.run(u.id, u.username, u.name, u.email, u.bio, u.avatar, u.created_at);
      });
      stmtUser.finalize();

      // 2. user_preferences 삽입
      const stmtPref = db.prepare(`
        INSERT INTO user_preferences (user_id, theme, language, email_marketing, email_security, email_billing, push_desktop, push_sound, privacy_scope, timezone, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_PREFERENCES.forEach(p => {
        stmtPref.run(p.user_id, p.theme, p.language, p.email_marketing, p.email_security, p.email_billing, p.push_desktop, p.push_sound, p.privacy_scope, p.timezone, p.updated_at);
      });
      stmtPref.finalize((err) => {
        if (err) reject(err);
        else resolve({ users: INITIAL_USERS.length, preferences: INITIAL_PREFERENCES.length });
      });
    });
  });
}

module.exports = {
  db,
  initDatabase,
  resetAllData,
  INITIAL_USERS,
  INITIAL_PREFERENCES
};
