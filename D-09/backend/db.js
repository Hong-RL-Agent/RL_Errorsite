const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'pawcare.db');
const db = new sqlite3.Database(DB_PATH);

// 8명 사용자
const INITIAL_USERS = [
  { id: 1, name: '이민지', email: 'minji.lee@pawcare.kr', phone: '010-3341-2891', avatar: '👩‍🦰' },
  { id: 2, name: '박준호', email: 'junho.park@pawcare.kr', phone: '010-8821-4192', avatar: '👨‍🦱' },
  { id: 3, name: '김서연', email: 'seoyeon.kim@pawcare.kr', phone: '010-7712-3019', avatar: '👩' },
  { id: 4, name: '정현우', email: 'hyunwoo.jung@pawcare.kr', phone: '010-5510-9281', avatar: '👨' },
  { id: 5, name: '최유나', email: 'yuna.choi@pawcare.kr', phone: '010-4491-1823', avatar: '👱‍♀️' },
  { id: 6, name: '강태민', email: 'taemin.kang@pawcare.kr', phone: '010-6623-8812', avatar: '🧑' },
  { id: 7, name: '오하은', email: 'haeun.oh@pawcare.kr', phone: '010-9128-4410', avatar: '👩‍🦱' },
  { id: 8, name: '윤도윤', email: 'doyoon.yoon@pawcare.kr', phone: '010-2391-7711', avatar: '🧔' }
];

// 8종 케어 서비스
const INITIAL_SERVICES = [
  {
    id: 1,
    category: 'GROOMING',
    name: '프리미엄 힐링 미용',
    description: '전문 미용사의 1:1 맞춤 위생 케어, 가위컷 스타일링 및 스트레스 완화 케어',
    duration_mins: 90,
    base_price: 65000,
    icon: '✂️',
    badge: '인기 1위'
  },
  {
    id: 2,
    category: 'HOTEL',
    name: '펫 호텔 디럭스 스위트',
    description: '개별 온돌 난방, 24시간 CCTV 모니터링, 전담 케어 매니저 상주 호텔링',
    duration_mins: 1440,
    base_price: 55000,
    icon: '🏨',
    badge: '호텔링'
  },
  {
    id: 3,
    category: 'DAYCARE',
    name: '댕댕이 유치원 올데이',
    description: '친구들과 사회화 놀이 프로그램, 노즈워크 활동 및 낮잠 루틴 케어',
    duration_mins: 480,
    base_price: 35000,
    icon: '🎒',
    badge: '사회화'
  },
  {
    id: 4,
    category: 'SPA',
    name: '아로마 스파 & 버블 목욕',
    description: '유기농 천연 에센셜 오일과 탄산 버블 스파로 피부 진정 및 피모 영양 공급',
    duration_mins: 60,
    base_price: 45000,
    icon: '🛁',
    badge: '피부진정'
  },
  {
    id: 5,
    category: 'TRAINING',
    name: '1:1 맞춤 행동교정 클리닉',
    description: '긍정강화 전문 훈련사의 짖음/분리불안/배변 훈련 솔루션 및 보호자 코칭',
    duration_mins: 60,
    base_price: 80000,
    icon: '🎓',
    badge: '전문훈련'
  },
  {
    id: 6,
    category: 'VET',
    name: '기초 생체신호 종합 건강검진',
    description: '청진, 혈압, 구강, 관절, 안구 및 귀 상태 정밀 촉진 종합 스크리닝',
    duration_mins: 40,
    base_price: 70000,
    icon: '🩺',
    badge: '수의사 연계'
  },
  {
    id: 7,
    category: 'DENTAL',
    name: '초음파 덴탈 스케일링 & 케어',
    description: '치석 제거, 구강 플라그 클리닝 및 잇몸 항균 코팅을 통한 구취 완화',
    duration_mins: 45,
    base_price: 50000,
    icon: '🦷',
    badge: '구강위생'
  },
  {
    id: 8,
    category: 'AGILITY',
    name: '실내 어질리티 피트니스',
    description: '허들, 터널, 위브폴 등 전문 장애물 트랙에서 즐기는 칼로리 소모 피트니스',
    duration_mins: 120,
    base_price: 25000,
    icon: '🎾',
    badge: '스트레스 해소'
  }
];

// 16마리 반려동물 프로필
const INITIAL_PETS = [
  { id: 1, user_id: 1, name: '코코', species: '강아지', breed: '말티즈', age: 3, gender: '남아', weight: 3.2, care_notes: '귀 세정 시 부드럽게 닦아주세요.', allergies: '없음', avatar: '🐶' },
  { id: 2, user_id: 1, name: '보리', species: '강아지', breed: '포메라니안', age: 2, gender: '여아', weight: 3.8, care_notes: '발 만지는 것에 민감함.', allergies: '닭고기', avatar: '🐕' }, // BUG-D09-02 대상 (체중 변조 피해)
  { id: 3, user_id: 2, name: '두부', species: '강아지', breed: '비숑 프리제', age: 4, gender: '남아', weight: 5.5, care_notes: '목욕 후 빗질 꼼꼼히 부탁드립니다.', allergies: '소고기', avatar: '🐩' },
  { id: 4, user_id: 2, name: '초코', species: '강아지', breed: '푸들', age: 3, gender: '여아', weight: 5.2, care_notes: '낯선 소리에 잘 놀람.', allergies: '없음', avatar: '🐶' }, // BUG-D09-02 트리거 (체중 5.8 수정 시 2번 보리 변경)
  { id: 5, user_id: 3, name: '라떼', species: '강아지', breed: '골든 리트리버', age: 5, gender: '남아', weight: 28.5, care_notes: '성격이 온순하며 사람을 좋아함.', allergies: '없음', avatar: '🦮' },
  { id: 6, user_id: 3, name: '호두', species: '강아지', breed: '웰시코기', age: 2, gender: '여아', weight: 11.2, care_notes: '짧은 다리 관절 주의 필요.', allergies: '돼지고기', avatar: '🐕' },
  { id: 7, user_id: 4, name: '뭉치', species: '강아지', breed: '비숑 프리제', age: 1, gender: '남아', weight: 4.3, care_notes: '귀가 예민하여 귀 청소 시 천천히 진행 필요.', allergies: '유제품', avatar: '🐩' }, // BUG-D09-05 대상
  { id: 8, user_id: 4, name: '모찌', species: '고양이', breed: '페르시안', age: 3, gender: '여아', weight: 4.1, care_notes: '털 엉킴이 잦음, 얼굴 주변 빗질 선호.', allergies: '없음', avatar: '🐱' },
  { id: 9, user_id: 5, name: '별이', species: '고양이', breed: '코리안 숏헤어', age: 2, gender: '여아', weight: 3.9, care_notes: '호기심이 많고 츄르를 매우 좋아함.', allergies: '없음', avatar: '🐈' },
  { id: 10, user_id: 5, name: '달이', species: '강아지', breed: '시바견', age: 4, gender: '남아', weight: 9.8, care_notes: '기본적인 사회성 좋음, 꼬리 만짐 주의.', allergies: '연어', avatar: '🐕' },
  { id: 11, user_id: 6, name: '루루', species: '강아지', breed: '요크셔 테리어', age: 6, gender: '여아', weight: 2.7, care_notes: '노령견에 가까워 체온 유지에 신경써주세요.', allergies: '없음', avatar: '🐶' },
  { id: 12, user_id: 6, name: '레오', species: '강아지', breed: '프렌치 불독', age: 3, gender: '남아', weight: 12.0, care_notes: '단두종이라 호흡 상태 지속 모니터링 요망.', allergies: '소고기', avatar: '🐶' },
  { id: 13, user_id: 7, name: '콩이', species: '강아지', breed: '토이 푸들', age: 2, gender: '남아', weight: 2.9, care_notes: '분리불안 약간 있음, 장난감 애착.', allergies: '없음', avatar: '🐩' },
  { id: 14, user_id: 7, name: '쿠키', species: '고양이', breed: '러시안 블루', age: 4, gender: '남아', weight: 4.8, care_notes: '조용한 환경 선호, 스트레스에 취약.', allergies: '곡물', avatar: '🐱' },
  { id: 15, user_id: 8, name: '나비', species: '고양이', breed: '샴', age: 3, gender: '여아', weight: 3.5, care_notes: '활동량이 많고 높은 곳을 좋아함.', allergies: '없음', avatar: '🐈' },
  { id: 16, user_id: 8, name: '맥스', species: '강아지', breed: '보더콜리', age: 2, gender: '남아', weight: 16.5, care_notes: '에너지가 넘치며 어질리티 매우 능숙.', allergies: '없음', avatar: '🐕' }
];

// 초기 32건 예약 목록
function generateInitialReservations() {
  const times = ['10:00', '11:30', '14:00', '15:30', '17:00'];
  return [
    { id: 1, booking_code: 'PAW-2026-001', user_id: 1, pet_id: 1, service_id: 1, booking_date: '2026-10-15', time_slot: '10:00', status: 'CONFIRMED', total_price: 65000, special_request: '얼굴 곰돌이컷 부탁드립니다', pickup_service: 0 },
    { id: 2, booking_code: 'PAW-2026-002', user_id: 1, pet_id: 2, service_id: 4, booking_date: '2026-10-15', time_slot: '14:00', status: 'CONFIRMED', total_price: 45000, special_request: '스파 후 빗질 꼼꼼히', pickup_service: 1 },
    { id: 3, booking_code: 'PAW-2026-003', user_id: 2, pet_id: 3, service_id: 3, booking_date: '2026-10-16', time_slot: '10:00', status: 'CONFIRMED', total_price: 35000, special_request: '오후 6시 픽업 예정입니다', pickup_service: 0 },
    { id: 4, booking_code: 'PAW-2026-004', user_id: 2, pet_id: 4, service_id: 1, booking_date: '2026-10-16', time_slot: '15:30', status: 'CONFIRMED', total_price: 65000, special_request: '스포팅 컷 요청', pickup_service: 0 },
    { id: 5, booking_code: 'PAW-2026-005', user_id: 3, pet_id: 5, service_id: 2, booking_date: '2026-10-17', time_slot: '11:30', status: 'CONFIRMED', total_price: 75000, special_request: '대형견 전용 스위트룸 배정', pickup_service: 1 },
    { id: 6, booking_code: 'PAW-2026-006', user_id: 3, pet_id: 6, service_id: 8, booking_date: '2026-10-17', time_slot: '14:00', status: 'CONFIRMED', total_price: 25000, special_request: '관절 무리 가지 않게 완만한 트랙 이용', pickup_service: 0 },
    { id: 7, booking_code: 'PAW-2026-007', user_id: 4, pet_id: 7, service_id: 5, booking_date: '2026-10-14', time_slot: '10:00', status: 'COMPLETED', total_price: 80000, special_request: '짖음 완화 교육', pickup_service: 0 },
    { id: 8, booking_code: 'PAW-2026-008', user_id: 4, pet_id: 8, service_id: 6, booking_date: '2026-10-14', time_slot: '14:00', status: 'COMPLETED', total_price: 70000, special_request: '기초 건강검진 문진표 작성 완료', pickup_service: 0 },
    { id: 9, booking_code: 'PAW-2026-009', user_id: 5, pet_id: 9, service_id: 7, booking_date: '2026-10-13', time_slot: '11:30', status: 'COMPLETED', total_price: 50000, special_request: '치석 제거 및 잇몸 마사지', pickup_service: 0 },
    { id: 10, booking_code: 'PAW-2026-010', user_id: 5, pet_id: 10, service_id: 1, booking_date: '2026-10-13', time_slot: '17:00', status: 'CANCELLED', total_price: 65000, special_request: '보호자 일정으로 사전 취소', pickup_service: 0 },
    
    // 예약 11, 12, 16 (핵심 버그 연동)
    { id: 11, booking_code: 'PAW-2026-011', user_id: 4, pet_id: 7, service_id: 4, booking_date: '2026-10-18', time_slot: '11:30', status: 'CONFIRMED', total_price: 45000, special_request: '스파 버블 농도 약하게 부탁', pickup_service: 0 }, // BUG-D09-04 왜곡 피해 대상
    { id: 12, booking_code: 'PAW-2026-012', user_id: 4, pet_id: 8, service_id: 4, booking_date: '2026-10-19', time_slot: '14:00', status: 'CONFIRMED', total_price: 45000, special_request: '고양이 전용 스파 룸', pickup_service: 0 }, // BUG-D09-01 취소 누락 대상
    { id: 13, booking_code: 'PAW-2026-013', user_id: 6, pet_id: 11, service_id: 6, booking_date: '2026-10-20', time_slot: '10:00', status: 'CONFIRMED', total_price: 70000, special_request: '심장 소리 정밀 청진 희망', pickup_service: 0 },
    { id: 14, booking_code: 'PAW-2026-014', user_id: 6, pet_id: 12, service_id: 3, booking_date: '2026-10-20', time_slot: '15:30', status: 'CONFIRMED', total_price: 35000, special_request: '단두종 호흡 체크 필수', pickup_service: 0 },
    { id: 15, booking_code: 'PAW-2026-015', user_id: 7, pet_id: 13, service_id: 1, booking_date: '2026-10-21', time_slot: '11:30', status: 'CONFIRMED', total_price: 65000, special_request: '귀여운 귀마개 컷 스타일', pickup_service: 1 },
    { id: 16, booking_code: 'PAW-2026-016', user_id: 4, pet_id: 7, service_id: 4, booking_date: '2026-10-22', time_slot: '10:00', status: 'CONFIRMED', total_price: 45000, special_request: '아로마 테라피 추가', pickup_service: 0 }, // BUG-D09-04 날짜 변경 트리거 (11번 날짜가 변경됨)
    { id: 17, booking_code: 'PAW-2026-017', user_id: 7, pet_id: 14, service_id: 2, booking_date: '2026-10-22', time_slot: '14:00', status: 'CONFIRMED', total_price: 55000, special_request: '캣타워 스위트룸 배정', pickup_service: 0 },
    { id: 18, booking_code: 'PAW-2026-018', user_id: 8, pet_id: 15, service_id: 7, booking_date: '2026-10-23', time_slot: '15:30', status: 'CONFIRMED', total_price: 50000, special_request: '어린 나이라 마취 없이 클리닝', pickup_service: 0 },
    { id: 19, booking_code: 'PAW-2026-019', user_id: 8, pet_id: 16, service_id: 8, booking_date: '2026-10-23', time_slot: '17:00', status: 'CONFIRMED', total_price: 25000, special_request: '프리스비 트레이닝 코스', pickup_service: 0 },
    { id: 20, booking_code: 'PAW-2026-020', user_id: 1, pet_id: 1, service_id: 2, booking_date: '2026-10-24', time_slot: '10:00', status: 'CONFIRMED', total_price: 55000, special_request: '주말 1박 돌봄 요청', pickup_service: 1 },
    { id: 21, booking_code: 'PAW-2026-021', user_id: 2, pet_id: 3, service_id: 5, booking_date: '2026-10-25', time_slot: '11:30', status: 'CONFIRMED', total_price: 80000, special_request: '리드줄 당김 개선', pickup_service: 0 },
    { id: 22, booking_code: 'PAW-2026-022', user_id: 3, pet_id: 5, service_id: 4, booking_date: '2026-10-25', time_slot: '14:00', status: 'CONFIRMED', total_price: 55000, special_request: '대형견 전용 히노끼 탕 이용', pickup_service: 0 },
    { id: 23, booking_code: 'PAW-2026-023', user_id: 4, pet_id: 7, service_id: 3, booking_date: '2026-10-26', time_slot: '10:00', status: 'CONFIRMED', total_price: 35000, special_request: '오전 일찍 등원 희망', pickup_service: 0 },
    { id: 24, booking_code: 'PAW-2026-024', user_id: 5, pet_id: 10, service_id: 8, booking_date: '2026-10-26', time_slot: '15:30', status: 'CONFIRMED', total_price: 25000, special_request: '실내 달리기 코스', pickup_service: 0 },
    { id: 25, booking_code: 'PAW-2026-025', user_id: 6, pet_id: 11, service_id: 1, booking_date: '2026-10-27', time_slot: '11:30', status: 'CONFIRMED', total_price: 65000, special_request: '발톱 깎기 세심하게 주의', pickup_service: 0 },
    { id: 26, booking_code: 'PAW-2026-026', user_id: 7, pet_id: 13, service_id: 6, booking_date: '2026-10-27', time_slot: '14:00', status: 'CONFIRMED', total_price: 70000, special_request: '피부 트러블 검사 요청', pickup_service: 0 },
    { id: 27, booking_code: 'PAW-2026-027', user_id: 8, pet_id: 16, service_id: 5, booking_date: '2026-10-28', time_slot: '10:00', status: 'CONFIRMED', total_price: 80000, special_request: '고난도 어질리티 훈련', pickup_service: 0 },
    { id: 28, booking_code: 'PAW-2026-028', user_id: 1, pet_id: 2, service_id: 7, booking_date: '2026-10-28', time_slot: '17:00', status: 'CONFIRMED', total_price: 50000, special_request: '치주염 체크', pickup_service: 0 },
    { id: 29, booking_code: 'PAW-2026-029', user_id: 2, pet_id: 4, service_id: 2, booking_date: '2026-10-29', time_slot: '11:30', status: 'CONFIRMED', total_price: 55000, special_request: '출장 일정으로 1박 숙박', pickup_service: 1 },
    { id: 30, booking_code: 'PAW-2026-030', user_id: 3, pet_id: 6, service_id: 1, booking_date: '2026-10-29', time_slot: '14:00', status: 'CONFIRMED', total_price: 65000, special_request: '엉덩이 하트컷 미용 요청', pickup_service: 0 },
    { id: 31, booking_code: 'PAW-2026-031', user_id: 4, pet_id: 8, service_id: 2, booking_date: '2026-10-30', time_slot: '10:00', status: 'CONFIRMED', total_price: 55000, special_request: '조용한 고양이 전용 룸', pickup_service: 0 },
    { id: 32, booking_code: 'PAW-2026-032', user_id: 5, pet_id: 9, service_id: 6, booking_date: '2026-10-30', time_slot: '15:30', status: 'CONFIRMED', total_price: 70000, special_request: '예방접종 항체가 검사', pickup_service: 0 }
  ];
}

// 데이터베이스 초기화 함수
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. 테이블 생성
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          avatar TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          duration_mins INTEGER,
          base_price INTEGER,
          icon TEXT,
          badge TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS pets (
          id INTEGER PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          breed TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT,
          weight REAL NOT NULL,
          care_notes TEXT,
          allergies TEXT,
          avatar TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
          id INTEGER PRIMARY KEY,
          booking_code TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          pet_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          booking_date TEXT NOT NULL,
          time_slot TEXT NOT NULL,
          status TEXT NOT NULL,
          total_price INTEGER NOT NULL,
          special_request TEXT,
          pickup_service INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // 2. 레코드 존재 여부 확인 후 시드
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) return reject(err);
        if (row && row.count > 0) {
          return resolve();
        }

        // 시드 실행
        resetAllData().then(resolve).catch(reject);
      });
    });
  });
}

// 모든 데이터 초기화 (멱등성 있는 완전 리셋)
function resetAllData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM reservations');
      db.run('DELETE FROM pets');
      db.run('DELETE FROM services');
      db.run('DELETE FROM users');
      db.run('DELETE FROM activity_logs');

      // Users 삽입
      const stmtUser = db.prepare('INSERT INTO users (id, name, email, phone, avatar) VALUES (?, ?, ?, ?, ?)');
      INITIAL_USERS.forEach(u => {
        stmtUser.run([u.id, u.name, u.email, u.phone, u.avatar]);
      });
      stmtUser.finalize();

      // Services 삽입
      const stmtService = db.prepare('INSERT INTO services (id, category, name, description, duration_mins, base_price, icon, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      INITIAL_SERVICES.forEach(s => {
        stmtService.run([s.id, s.category, s.name, s.description, s.duration_mins, s.base_price, s.icon, s.badge]);
      });
      stmtService.finalize();

      // Pets 삽입
      const stmtPet = db.prepare('INSERT INTO pets (id, user_id, name, species, breed, age, gender, weight, care_notes, allergies, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      INITIAL_PETS.forEach(p => {
        stmtPet.run([p.id, p.user_id, p.name, p.species, p.breed, p.age, p.gender, p.weight, p.care_notes, p.allergies, p.avatar]);
      });
      stmtPet.finalize();

      // Reservations 삽입
      const reservations = generateInitialReservations();
      const stmtRes = db.prepare('INSERT INTO reservations (id, booking_code, user_id, pet_id, service_id, booking_date, time_slot, status, total_price, special_request, pickup_service, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))');
      reservations.forEach(r => {
        stmtRes.run([r.id, r.booking_code, r.user_id, r.pet_id, r.service_id, r.booking_date, r.time_slot, r.status, r.total_price, r.special_request, r.pickup_service]);
      });
      stmtRes.finalize();

      // 초기 활동 로그
      db.run('INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now", "localtime"))',
        [1, 'SYSTEM_INIT', 'PawCare 시스템 초기 데이터 시드 적재 완료']
      );

      resolve();
    });
  });
}

module.exports = {
  db,
  initDatabase,
  resetAllData,
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_PETS
};
