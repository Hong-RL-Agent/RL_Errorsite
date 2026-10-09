const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pulseform.db');
const db = new sqlite3.Database(dbPath);

const initialForm = {
  id: 'pulse-001',
  title: '2026 서비스 이용 경험 조사',
  description: '사용자 중심의 서비스 개선을 위한 심층 리서치 설문조사입니다. 귀하의 소중한 의견을 들려주세요.',
  status: 'ACTIVE',
  created_at: '2026-10-01 10:00:00'
};

const initialItems = [
  {
    id: 'q1',
    form_id: 'pulse-001',
    question_order: 1,
    title: 'Q1. 최근 6개월 내 본 서비스를 이용한 경험이 있습니까?',
    type: 'SINGLE_CHOICE',
    is_required: 1,
    description: '서비스 이용 여부에 따라 맞춤형 질문이 제공됩니다.'
  },
  {
    id: 'q2',
    form_id: 'pulse-001',
    question_order: 2,
    title: 'Q2. 어떤 경로를 통해 본 서비스를 처음 접하게 되었습니까?',
    type: 'SINGLE_CHOICE',
    is_required: 1,
    description: '서비스 유입 경로를 선택해주세요.'
  },
  {
    id: 'q3',
    form_id: 'pulse-001',
    question_order: 3,
    title: 'Q3. 본 서비스를 아직 이용하지 않은 주된 이유는 무엇입니까?',
    type: 'SINGLE_CHOICE',
    is_required: 1,
    description: '미이용 사유를 선택해주세요.'
  },
  {
    id: 'q4',
    form_id: 'pulse-001',
    question_order: 4,
    title: 'Q4. 서비스에서 개선되기를 희망하는 점을 자유롭게 입력해주세요.',
    type: 'TEXT',
    is_required: 0,
    description: '자유 의견을 남겨주시면 개발 및 기획에 적극 반영됩니다.'
  },
  {
    id: 'q5',
    form_id: 'pulse-001',
    question_order: 5,
    title: 'Q5. 본 서비스의 전반적인 품질 및 기능 만족도를 평가해주세요.',
    type: 'SCALE_MATRIX',
    is_required: 1,
    description: '1(매우 불만족)부터 5(매우 만족)까지 척도를 선택해주세요.'
  }
];

const initialOptions = [
  // Q1
  { id: 1, item_id: 'q1', label: '예 (이용 경험 있음)', value: 'YES', score: 5 },
  { id: 2, item_id: 'q1', label: '아니오 (이용 경험 없음)', value: 'NO', score: 1 },
  
  // Q2
  { id: 3, item_id: 'q2', label: '포털/웹 검색', value: 'SEARCH', score: 0 },
  { id: 4, item_id: 'q2', label: '지인 및 커뮤니티 추천', value: 'RECOMMEND', score: 0 },
  { id: 5, item_id: 'q2', label: 'SNS / 미디어 콘텐츠', value: 'SNS', score: 0 },
  { id: 6, item_id: 'q2', label: '온라인 광고', value: 'AD', score: 0 },
  
  // Q3
  { id: 7, item_id: 'q3', label: '서비스 필요성 부족', value: 'NO_NEED', score: 0 },
  { id: 8, item_id: 'q3', label: '타사 유사 서비스 이용 중', value: 'COMPETITOR', score: 0 },
  { id: 9, item_id: 'q3', label: '가격 및 비용 부담', value: 'PRICE', score: 0 },
  { id: 10, item_id: 'q3', label: '사용법이 복잡함', value: 'COMPLEX', score: 0 },

  // Q5 (Matrix/Scale)
  { id: 11, item_id: 'q5', label: '1 매우 불만족', value: 'VERY_DISSATISFIED', score: 1 },
  { id: 12, item_id: 'q5', label: '2 불만족', value: 'DISSATISFIED', score: 2 },
  { id: 13, item_id: 'q5', label: '3 보통', value: 'AVERAGE', score: 3 }, // Backend expects AVERAGE
  { id: 14, item_id: 'q5', label: '4 만족', value: 'SATISFIED', score: 4 },
  { id: 15, item_id: 'q5', label: '5 매우 만족', value: 'VERY_SATISFIED', score: 5 }
];

const initialBranchRules = [
  {
    id: 1,
    form_id: 'pulse-001',
    item_id: 'q1',
    target_value: 'NO',
    condition_operator: 'EQUALS',
    next_item_id: 'q3' // If NO, skip Q2 and go directly to Q3
  }
];

function initDb() {
  db.serialize(() => {
    // 1. forms
    db.run(`
      CREATE TABLE IF NOT EXISTS forms (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // 2. form_items
    db.run(`
      CREATE TABLE IF NOT EXISTS form_items (
        id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        question_order INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        is_required INTEGER DEFAULT 1,
        description TEXT
      )
    `);

    // 3. form_options
    db.run(`
      CREATE TABLE IF NOT EXISTS form_options (
        id INTEGER PRIMARY KEY,
        item_id TEXT NOT NULL,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        score INTEGER DEFAULT 0
      )
    `);

    // 4. branch_rules
    db.run(`
      CREATE TABLE IF NOT EXISTS branch_rules (
        id INTEGER PRIMARY KEY,
        form_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        target_value TEXT NOT NULL,
        condition_operator TEXT NOT NULL,
        next_item_id TEXT NOT NULL
      )
    `);

    // 5. response_sessions
    db.run(`
      CREATE TABLE IF NOT EXISTS response_sessions (
        session_id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        current_step INTEGER DEFAULT 1,
        status TEXT NOT NULL,
        answers_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 6. submission_records
    db.run(`
      CREATE TABLE IF NOT EXISTS submission_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        answers_json TEXT,
        submitted_at TEXT NOT NULL
      )
    `);

    // 7. question_statistics
    db.run(`
      CREATE TABLE IF NOT EXISTS question_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        option_value TEXT NOT NULL,
        count INTEGER NOT NULL
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM forms', (err, row) => {
      if (!err && (!row || row.count === 0)) {
        resetDb();
      }
    });
  });
}

function resetDb(callback) {
  db.serialize(() => {
    db.run('DELETE FROM question_statistics');
    db.run('DELETE FROM submission_records');
    db.run('DELETE FROM response_sessions');
    db.run('DELETE FROM branch_rules');
    db.run('DELETE FROM form_options');
    db.run('DELETE FROM form_items');
    db.run('DELETE FROM forms');

    // Seed Forms
    db.run(
      'INSERT INTO forms (id, title, description, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [initialForm.id, initialForm.title, initialForm.description, initialForm.status, initialForm.created_at]
    );

    // Seed Items
    const insertItem = db.prepare(`
      INSERT INTO form_items (id, form_id, question_order, title, type, is_required, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialItems.forEach(item => {
      insertItem.run(item.id, item.form_id, item.question_order, item.title, item.type, item.is_required, item.description);
    });
    insertItem.finalize();

    // Seed Options
    const insertOption = db.prepare(`
      INSERT INTO form_options (id, item_id, label, value, score)
      VALUES (?, ?, ?, ?, ?)
    `);
    initialOptions.forEach(opt => {
      insertOption.run(opt.id, opt.item_id, opt.label, opt.value, opt.score);
    });
    insertOption.finalize();

    // Seed Branch Rules
    const insertBranch = db.prepare(`
      INSERT INTO branch_rules (id, form_id, item_id, target_value, condition_operator, next_item_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    initialBranchRules.forEach(rule => {
      insertBranch.run(rule.id, rule.form_id, rule.item_id, rule.target_value, rule.condition_operator, rule.next_item_id);
    });
    insertBranch.finalize();

    // Seed 100 Initial Submissions
    const insertSub = db.prepare(`
      INSERT INTO submission_records (form_id, session_id, answers_json, submitted_at)
      VALUES (?, ?, ?, ?)
    `);
    for (let i = 1; i <= 100; i++) {
      const q1Val = i <= 61 ? 'YES' : 'NO';
      const q2Val = i <= 40 ? 'SEARCH' : i <= 70 ? 'RECOMMEND' : 'SNS';
      insertSub.run(
        'pulse-001',
        `seed-session-${i}`,
        JSON.stringify({ q1: q1Val, q2: q2Val, q5: 'AVERAGE' }),
        '2026-10-07 14:00:00'
      );
    }
    insertSub.finalize();

    // Seed Statistics (100 responses total)
    const initialStats = [
      // Q1 (61 YES, 39 NO = sum 100)
      { item_id: 'q1', option_value: 'YES', count: 61 },
      { item_id: 'q1', option_value: 'NO', count: 39 },

      // Q2 (40 SEARCH, 30 RECOMMEND, 30 SNS = sum 100)
      { item_id: 'q2', option_value: 'SEARCH', count: 40 },
      { item_id: 'q2', option_value: 'RECOMMEND', count: 30 },
      { item_id: 'q2', option_value: 'SNS', count: 30 },

      // Q3 (50 NO_NEED, 30 COMPETITOR, 20 PRICE = sum 100)
      { item_id: 'q3', option_value: 'NO_NEED', count: 50 },
      { item_id: 'q3', option_value: 'COMPETITOR', count: 30 },
      { item_id: 'q3', option_value: 'PRICE', count: 20 },

      // Q5 (10 VERY_DISSATISFIED, 15 DISSATISFIED, 50 AVERAGE, 20 SATISFIED, 5 VERY_SATISFIED = sum 100)
      { item_id: 'q5', option_value: 'VERY_DISSATISFIED', count: 10 },
      { item_id: 'q5', option_value: 'DISSATISFIED', count: 15 },
      { item_id: 'q5', option_value: 'AVERAGE', count: 50 },
      { item_id: 'q5', option_value: 'SATISFIED', count: 20 },
      { item_id: 'q5', option_value: 'VERY_SATISFIED', count: 5 }
    ];

    const insertStat = db.prepare(`
      INSERT INTO question_statistics (form_id, item_id, option_value, count)
      VALUES ('pulse-001', ?, ?, ?)
    `);
    initialStats.forEach(st => {
      insertStat.run(st.item_id, st.option_value, st.count);
    });
    insertStat.finalize();

    if (callback) callback();
  });
}

initDb();

module.exports = {
  db,
  resetDb
};
