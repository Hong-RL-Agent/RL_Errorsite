const { db, initSchema, dropAll } = require('../db/database');
const { seedDatabase } = require('../db/seed');

// 모든 테이블을 삭제한 뒤 고정 시드로 초기 데이터를 복원한다.
function resetAll() {
  let counts;
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      dropAll();
      initSchema();
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
  counts = seedDatabase(db);
  return { ok: true, reset_at: new Date().toISOString(), counts };
}

module.exports = { resetAll };
