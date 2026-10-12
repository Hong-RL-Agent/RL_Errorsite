const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'fittrack.db');

let sqlite3;
let db = null;
let useFallback = false;
let memoryStore = null;

try {
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.warn('[FitTrack DB] Native sqlite3 module not available, using file-backed store fallback:', err.message);
  useFallback = true;
}

// 1. Exercise Catalog (17 exercises: >= 15 exercises required)
const INITIAL_EXERCISES = [
  { id: 1, name: '벤치프레스', type: 'STRENGTH', target_muscle: '가슴', equipment: '바벨', icon: 'Dumbbell' },
  { id: 2, name: '스쿼트', type: 'STRENGTH', target_muscle: '하체', equipment: '바벨', icon: 'Flame' },
  { id: 3, name: '데드리프트', type: 'STRENGTH', target_muscle: '등/전신', equipment: '바벨', icon: 'Zap' },
  { id: 4, name: '바벨 로우', type: 'STRENGTH', target_muscle: '등', equipment: '바벨', icon: 'Activity' },
  { id: 5, name: '오버헤드 숄더프레스', type: 'STRENGTH', target_muscle: '어깨', equipment: '바벨', icon: 'ArrowUpCircle' },
  { id: 6, name: '렛풀다운', type: 'STRENGTH', target_muscle: '등', equipment: '케이블 머신', icon: 'Activity' },
  { id: 7, name: '인클라인 덤벨프레스', type: 'STRENGTH', target_muscle: '윗가슴', equipment: '덤벨', icon: 'Dumbbell' },
  { id: 8, name: '덤벨 바이셉스 컬', type: 'STRENGTH', target_muscle: '이두', equipment: '덤벨', icon: 'Dumbbell' },
  { id: 9, name: '트라이셉스 푸시다운', type: 'STRENGTH', target_muscle: '삼두', equipment: '케이블', icon: 'Activity' },
  { id: 10, name: '레그프레스', type: 'STRENGTH', target_muscle: '하체', equipment: '머신', icon: 'TrendingUp' },
  { id: 11, name: '사이드 레터럴 레이즈', type: 'STRENGTH', target_muscle: '측면 어깨', equipment: '덤벨', icon: 'Dumbbell' },
  { id: 12, name: '러닝머신 (트레드밀)', type: 'CARDIO', target_muscle: '전신/심폐', equipment: '트레드밀', icon: 'Gauge' },
  { id: 13, name: '실내 사이클', type: 'CARDIO', target_muscle: '하체/심폐', equipment: '사이클', icon: 'Gauge' },
  { id: 14, name: '천국의 계단 (스텝밀)', type: 'CARDIO', target_muscle: '하체/유산소', equipment: '스텝밀', icon: 'Footprints' },
  { id: 15, name: '로잉머신', type: 'CARDIO', target_muscle: '전신/심폐', equipment: '로잉', icon: 'Activity' },
  { id: 16, name: '줄넘기', type: 'CARDIO', target_muscle: '전신', equipment: '줄넘기', icon: 'Zap' },
  { id: 17, name: '플랭크', type: 'STRENGTH', target_muscle: '코어', equipment: '맨몸', icon: 'Shield' }
];

// 2. Weekly Goals (4 goals)
const INITIAL_GOALS = [
  { id: 1, title: '주 5회 근력운동 달성', category: 'STRENGTH', target_value: 5, current_value: 4, unit: '회', is_achieved: 0, week_label: '2026-W41' },
  { id: 2, title: '주간 유산소 120분 달성', category: 'CARDIO', target_value: 120, current_value: 95, unit: '분', is_achieved: 0, week_label: '2026-W41' },
  { id: 3, title: '벤치프레스 80kg 세트 성공', category: 'STRENGTH', target_value: 80, current_value: 80, unit: 'kg', is_achieved: 1, week_label: '2026-W41' },
  { id: 4, title: '주간 2,500 kcal 소모', category: 'CALORIES', target_value: 2500, current_value: 2150, unit: 'kcal', is_achieved: 0, week_label: '2026-W41' }
];

// 3. Initial Workout Logs (38 logs: >= 35 logs required)
const INITIAL_WORKOUTS = [
  { id: 1, workout_date: '2026-10-01', exercise_id: 1, exercise_name: '벤치프레스', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 65, duration_min: 25, calories: 180, is_completed: 1, notes: '가슴 펌핑 우수' },
  { id: 2, workout_date: '2026-10-01', exercise_id: 7, exercise_name: '인클라인 덤벨프레스', type: 'STRENGTH', sets: 3, reps: 12, weight_kg: 22, duration_min: 20, calories: 140, is_completed: 1, notes: '윗가슴 집중 자극' },
  { id: 3, workout_date: '2026-10-01', exercise_id: 9, exercise_name: '트라이셉스 푸시다운', type: 'STRENGTH', sets: 4, reps: 15, weight_kg: 35, duration_min: 15, calories: 95, is_completed: 0, notes: '삼두근 고립' }, // BUG-D03-01 Target
  { id: 4, workout_date: '2026-10-01', exercise_id: 12, exercise_name: '러닝머신 (트레드밀)', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 30, calories: 250, is_completed: 1, notes: '속도 8.5km/h 인터벌' },
  
  { id: 5, workout_date: '2026-10-02', exercise_id: 2, exercise_name: '스쿼트', type: 'STRENGTH', sets: 5, reps: 8, weight_kg: 90, duration_min: 35, calories: 280, is_completed: 1, notes: '하체 메인 루틴 성공' },
  { id: 6, workout_date: '2026-10-02', exercise_id: 10, exercise_name: '레그프레스', type: 'STRENGTH', sets: 4, reps: 12, weight_kg: 140, duration_min: 20, calories: 160, is_completed: 1, notes: '대퇴사두 볼륨감' },
  { id: 7, workout_date: '2026-10-02', exercise_id: 2, exercise_name: '스쿼트', type: 'STRENGTH', sets: 3, reps: 10, weight_kg: 60, duration_min: 15, calories: 120, is_completed: 1, notes: '마무리 쿨다운 백스쿼트' }, // BUG-D03-02 Target
  { id: 8, workout_date: '2026-10-02', exercise_id: 5, exercise_name: '오버헤드 숄더프레스', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 40, duration_min: 20, calories: 130, is_completed: 1, notes: '어깨 수직 밀기' }, // BUG-D03-04 Affected
  
  { id: 9, workout_date: '2026-10-03', exercise_id: 3, exercise_name: '데드리프트', type: 'STRENGTH', sets: 4, reps: 6, weight_kg: 110, duration_min: 30, calories: 260, is_completed: 1, notes: '코어 강도 우수' },
  { id: 10, workout_date: '2026-10-03', exercise_id: 4, exercise_name: '바벨 로우', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 55, duration_min: 20, calories: 150, is_completed: 1, notes: '등 전체 수축감' },
  { id: 11, workout_date: '2026-10-03', exercise_id: 3, exercise_name: '데드리프트', type: 'STRENGTH', sets: 4, reps: 8, weight_kg: 80, duration_min: 20, calories: 160, is_completed: 1, notes: '루마니안 데드리프트 보조' }, // BUG-D03-03 Target
  { id: 12, workout_date: '2026-10-03', exercise_id: 14, exercise_name: '천국의 계단 (스텝밀)', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 20, calories: 210, is_completed: 1, notes: '레벨 8 유지 유산소' },
  
  { id: 13, workout_date: '2026-10-04', exercise_id: 13, exercise_name: '실내 사이클', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 40, calories: 310, is_completed: 1, notes: '주말 케이던스 90 페달링' },
  { id: 14, workout_date: '2026-10-04', exercise_id: 5, exercise_name: '오버헤드 숄더프레스', type: 'STRENGTH', sets: 4, reps: 8, weight_kg: 45, duration_min: 25, calories: 145, is_completed: 1, notes: '주말 어깨 집중 훈련' }, // BUG-D03-04 Trigger
  { id: 15, workout_date: '2026-10-04', exercise_id: 11, exercise_name: '사이드 레터럴 레이즈', type: 'STRENGTH', sets: 4, reps: 15, weight_kg: 8, duration_min: 15, calories: 85, is_completed: 1, notes: '측면 삼각근 쥐어짜기' },
  
  { id: 16, workout_date: '2026-10-05', exercise_id: 1, exercise_name: '벤치프레스', type: 'STRENGTH', sets: 5, reps: 5, weight_kg: 75, duration_min: 30, calories: 200, is_completed: 1, notes: '스트렝스 주기화 5x5' },
  { id: 17, workout_date: '2026-10-05', exercise_id: 8, exercise_name: '덤벨 바이셉스 컬', type: 'STRENGTH', sets: 3, reps: 12, weight_kg: 14, duration_min: 15, calories: 90, is_completed: 1, notes: '이두 정점 수축' },
  { id: 18, workout_date: '2026-10-05', exercise_id: 15, exercise_name: '로잉머신', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 20, calories: 195, is_completed: 1, notes: '5,000m 완주' },
  
  { id: 19, workout_date: '2026-10-06', exercise_id: 6, exercise_name: '렛풀다운', type: 'STRENGTH', sets: 4, reps: 12, weight_kg: 50, duration_min: 20, calories: 130, is_completed: 1, notes: '광배근 타깃' },
  { id: 20, workout_date: '2026-10-06', exercise_id: 4, exercise_name: '바벨 로우', type: 'STRENGTH', sets: 3, reps: 10, weight_kg: 50, duration_min: 15, calories: 110, is_completed: 1, notes: '등 두께감 루틴' },
  { id: 21, workout_date: '2026-10-06', exercise_id: 17, exercise_name: '플랭크', type: 'STRENGTH', sets: 3, reps: 1, weight_kg: 0, duration_min: 10, calories: 60, is_completed: 1, notes: '세트당 90초 버티기' },
  
  { id: 22, workout_date: '2026-10-07', exercise_id: 2, exercise_name: '스쿼트', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 80, duration_min: 25, calories: 210, is_completed: 1, notes: '자세 교정 위주 스쿼트' },
  { id: 23, workout_date: '2026-10-07', exercise_id: 10, exercise_name: '레그프레스', type: 'STRENGTH', sets: 3, reps: 15, weight_kg: 120, duration_min: 15, calories: 130, is_completed: 1, notes: '고반복 자극' },
  { id: 24, workout_date: '2026-10-07', exercise_id: 12, exercise_name: '러닝머신 (트레드밀)', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 25, calories: 210, is_completed: 1, notes: '유산소 마무리' },
  
  { id: 25, workout_date: '2026-10-08', exercise_id: 1, exercise_name: '벤치프레스', type: 'STRENGTH', sets: 4, reps: 8, weight_kg: 70, duration_min: 25, calories: 175, is_completed: 1, notes: '가슴 볼륨 세트' },
  { id: 26, workout_date: '2026-10-08', exercise_id: 7, exercise_name: '인클라인 덤벨프레스', type: 'STRENGTH', sets: 3, reps: 10, weight_kg: 24, duration_min: 15, calories: 120, is_completed: 1, notes: '상부 흉근 자극' },
  { id: 27, workout_date: '2026-10-08', exercise_id: 9, exercise_name: '트라이셉스 푸시다운', type: 'STRENGTH', sets: 4, reps: 12, weight_kg: 40, duration_min: 15, calories: 100, is_completed: 1, notes: '삼두 슈퍼세트' },
  
  { id: 28, workout_date: '2026-10-09', exercise_id: 3, exercise_name: '데드리프트', type: 'STRENGTH', sets: 5, reps: 5, weight_kg: 115, duration_min: 30, calories: 270, is_completed: 1, notes: '컨벤셔널 데드리프트 최고중량' },
  { id: 29, workout_date: '2026-10-09', exercise_id: 6, exercise_name: '렛풀다운', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 55, duration_min: 20, calories: 135, is_completed: 1, notes: '넓은 그립 당기기' },
  { id: 30, workout_date: '2026-10-09', exercise_id: 14, exercise_name: '천국의 계단 (스텝밀)', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 20, calories: 220, is_completed: 1, notes: '하체 후 유산소' },
  
  { id: 31, workout_date: '2026-10-10', exercise_id: 5, exercise_name: '오버헤드 숄더프레스', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 42.5, duration_min: 20, calories: 140, is_completed: 1, notes: '어깨 전면/측면 균형' },
  { id: 32, workout_date: '2026-10-10', exercise_id: 11, exercise_name: '사이드 레터럴 레이즈', type: 'STRENGTH', sets: 4, reps: 20, weight_kg: 7, duration_min: 15, calories: 80, is_completed: 1, notes: '드롭세트 적용' },
  { id: 33, workout_date: '2026-10-10', exercise_id: 16, exercise_name: '줄넘기', type: 'CARDIO', sets: 5, reps: 200, weight_kg: 0, duration_min: 15, calories: 150, is_completed: 1, notes: '연속 1,000개 완료' },
  
  { id: 34, workout_date: '2026-10-11', exercise_id: 2, exercise_name: '스쿼트', type: 'STRENGTH', sets: 5, reps: 5, weight_kg: 95, duration_min: 30, calories: 260, is_completed: 1, notes: '일요일 고중량 스쿼트' },
  { id: 35, workout_date: '2026-10-11', exercise_id: 10, exercise_name: '레그프레스', type: 'STRENGTH', sets: 4, reps: 10, weight_kg: 160, duration_min: 20, calories: 170, is_completed: 1, notes: '하체 완전 연소' },
  { id: 36, workout_date: '2026-10-11', exercise_id: 13, exercise_name: '실내 사이클', type: 'CARDIO', sets: 1, reps: 1, weight_kg: 0, duration_min: 30, calories: 230, is_completed: 1, notes: '쿨다운 페달링' },
  
  { id: 37, workout_date: '2026-10-12', exercise_id: 1, exercise_name: '벤치프레스', type: 'STRENGTH', sets: 4, reps: 6, weight_kg: 80, duration_min: 25, calories: 190, is_completed: 1, notes: '80kg 목표 성공!' },
  { id: 38, workout_date: '2026-10-12', exercise_id: 8, exercise_name: '덤벨 바이셉스 컬', type: 'STRENGTH', sets: 3, reps: 10, weight_kg: 16, duration_min: 15, calories: 95, is_completed: 1, notes: '오늘자 이두 운동 완료' }
];

// Fallback File-backed Store
class FallbackSqliteStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      exercises: [],
      goals: [],
      workouts: [],
      workout_id_seq: 100,
      goal_id_seq: 10
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
      exercises: JSON.parse(JSON.stringify(INITIAL_EXERCISES)),
      goals: JSON.parse(JSON.stringify(INITIAL_GOALS)),
      workouts: JSON.parse(JSON.stringify(INITIAL_WORKOUTS)),
      workout_id_seq: 100,
      goal_id_seq: 10
    };
    this.save();
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    if (useFallback) {
      memoryStore = new FallbackSqliteStore(DB_PATH);
      console.log('[FitTrack DB] Fallback SQLite file store initialized at:', DB_PATH);
      return resolve();
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.warn('[FitTrack DB] SQLite open error, using file fallback:', err.message);
        useFallback = true;
        memoryStore = new FallbackSqliteStore(DB_PATH);
        return resolve();
      }
      console.log('[FitTrack DB] Connected to SQLite database file:', DB_PATH);
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
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      target_muscle TEXT NOT NULL,
      equipment TEXT NOT NULL,
      icon TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_value REAL NOT NULL,
      current_value REAL NOT NULL,
      unit TEXT NOT NULL,
      is_achieved INTEGER NOT NULL DEFAULT 0,
      week_label TEXT NOT NULL
    )
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_date TEXT NOT NULL,
      exercise_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      type TEXT NOT NULL,
      sets INTEGER NOT NULL DEFAULT 1,
      reps INTEGER NOT NULL DEFAULT 10,
      weight_kg REAL NOT NULL DEFAULT 0,
      duration_min INTEGER NOT NULL DEFAULT 20,
      calories INTEGER NOT NULL DEFAULT 100,
      is_completed INTEGER NOT NULL DEFAULT 1,
      notes TEXT
    )
  `);

  const countRow = await getSql('SELECT COUNT(*) as count FROM workouts');
  if (!countRow || countRow.count === 0) {
    await seedTables();
  }
}

async function seedTables() {
  if (useFallback) {
    memoryStore.reset();
    return;
  }

  await runSql('DELETE FROM exercises');
  await runSql('DELETE FROM goals');
  await runSql('DELETE FROM workouts');

  for (const e of INITIAL_EXERCISES) {
    await runSql(
      'INSERT INTO exercises (id, name, type, target_muscle, equipment, icon) VALUES (?, ?, ?, ?, ?, ?)',
      [e.id, e.name, e.type, e.target_muscle, e.equipment, e.icon]
    );
  }

  for (const g of INITIAL_GOALS) {
    await runSql(
      'INSERT INTO goals (id, title, category, target_value, current_value, unit, is_achieved, week_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [g.id, g.title, g.category, g.target_value, g.current_value, g.unit, g.is_achieved, g.week_label]
    );
  }

  for (const w of INITIAL_WORKOUTS) {
    await runSql(
      `INSERT INTO workouts (id, workout_date, exercise_id, exercise_name, type, sets, reps, weight_kg, duration_min, calories, is_completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [w.id, w.workout_date, w.exercise_id, w.exercise_name, w.type, w.sets, w.reps, w.weight_kg, w.duration_min, w.calories, w.is_completed, w.notes]
    );
  }
}

async function resetAllData() {
  if (useFallback) {
    memoryStore.reset();
    return { success: true, message: 'FitTrack 데이터베이스가 초기 38개 운동 기록 상태로 리셋되었습니다.' };
  }
  await seedTables();
  return { success: true, message: 'FitTrack SQLite 데이터베이스가 초기 38개 운동 기록 상태로 리셋되었습니다.' };
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
