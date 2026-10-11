const { DEMO_TODAY, addDays } = require('../services/dates');

const SEED = 20261014;
const BASE = Date.UTC(2026, 9, 14, 9, 0, 0);
const ts = (minAgo) => new Date(BASE - minAgo * 60000).toISOString();

const CATEGORIES = [
  [1, '업무', '#f2836b'], [2, '공부', '#a99be0'], [3, '개인', '#8fb89a'], [4, '모임', '#f0b35c'],
  [5, '병원', '#e57fa0'], [6, '여행', '#6fb3c8'], [7, '운동', '#7bc67e'], [8, '생일', '#f58ca8'],
  [9, '회의', '#8d9ae6'], [10, '쇼핑', '#d9a066'], [11, '가족', '#c58fd6'], [12, '기타', '#9aa3b2'],
];

const TITLES = {
  1: ['주간 업무 보고', '고객 미팅 준비', '기획안 검토', '코드 리뷰', '견적서 정리'],
  2: ['영어 회화 스터디', '자격증 인강', '독서 정리', '알고리즘 문제 풀이'],
  3: ['미용실 예약', '집 정리', '은행 업무', '자동차 점검'],
  4: ['동창 모임', '동호회 정모', '팀 회식', '이웃 모임'],
  5: ['건강검진', '피부과 진료', '안과 검진', '물리치료'],
  6: ['여행 짐 싸기', '항공권 확인', '숙소 체크인', '여행 일정 점검'],
  7: ['러닝 크루', '수영 강습', '필라테스', '클라이밍'],
  8: ['친구 생일 파티', '동료 생일 축하', '조카 생일'],
  9: ['스프린트 회의', '디자인 싱크', '1:1 면담', '전략 회의', '운영 점검 회의'],
  10: ['장보기', '선물 구매', '가전 구경'],
  11: ['가족 식사', '부모님 댁 방문', '가족 사진 촬영'],
  12: ['세탁물 수거', '택배 수령', '서류 제출'],
};
const PLACES = ['', '본사 3층 회의실', '강남역 카페', '온라인(화상)', '집', '시립도서관', '한강공원', '스튜디오 A', '병원 3층'];
const DESCS = ['준비물을 미리 확인하세요.', '참석자에게 일정 공유 완료.', '자료는 공유 드라이브에 있음.', '', '', '이동 시간을 넉넉히 잡을 것.'];
const NOTE_BODIES = ['준비할 자료: 지난 회의록, 체크리스트', '질문 목록을 미리 정리해 두기', '끝나고 후속 연락 보내기', '장소가 변경될 수 있으니 전날 재확인', '참석 인원 최종 확인 필요', '관련 링크를 메모해 둠'];
const TASK_TITLES = ['보고서 초안 작성', '장보기 목록 정리', '병원 예약 전화', '세금 서류 확인', '운동 계획 세우기', '메일함 정리', '책 반납', '발표 자료 점검', '청구서 결제', '여행 보험 알아보기'];
const REPEAT_RULES = ['daily', 'weekly', 'weekly', 'monthly'];
const REMINDERS = ['none', '10m', '30m', '1h', '1d'];
const SURN = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
const GIVEN = ['민준', '서연', '지호', '하은', '도윤', '수아', '예준', '지우', '시우', '채원'];

function mulberry32(a) {
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, '0');
const hm = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
const colorOf = (cid) => CATEGORIES[cid - 1][2];

// 고정 ID 일정 (테스트 시나리오용)
const FIXED = [
  [1, '팀 주간 회의', 9, '2026-10-14', '10:00', '11:00', '본사 3층 회의실', '이번 주 진행 상황 공유'],
  [2, '치과 정기검진', 5, '2026-10-15', '14:00', '15:00', '미소치과', '스케일링 예약'],
  [3, '디자인 리뷰', 1, '2026-10-13', '15:00', '16:30', '스튜디오 A', '신규 화면 시안 검토'],
  [4, '요가 클래스', 7, '2026-10-14', '18:30', '19:30', '요가원', '매트 지참'],
  [5, '스터디 모임: 알고리즘', 2, '2026-10-16', '19:00', '21:00', '시립도서관', '그래프 문제 풀이'],
  [6, '제주도 여행 계획 점검', 6, '2026-10-17', '11:00', '12:00', '온라인(화상)', '항공/숙소 확인'],
  [7, '엄마 생일 저녁', 8, '2026-10-18', '18:00', '21:00', '한강 레스토랑', '케이크 픽업'],
  [8, '분기 보고서 제출', 1, '2026-10-20', '09:00', '10:00', '', '3분기 실적 보고'],
  [9, '독서 모임', 4, '2026-10-21', '19:30', '21:30', '강남역 카페', '이번 달 도서: 일의 감각'],
  [10, '프로젝트 킥오프 회의', 9, '2026-10-22', '13:00', '14:30', '본사 3층 회의실', ''],
  [11, '월간 회고', 3, '2026-10-23', '17:00', '18:00', '집', '한 달 돌아보기'],
  [12, '헬스장 PT', 7, '2026-10-19', '07:00', '08:00', '피트니스 센터', ''],
];

// 순수 데이터 생성 (고정 seed → 항상 동일)
function generateData() {
  const rand = mulberry32(SEED);
  const int = (n) => Math.floor(rand() * n);
  const pick = (a) => a[int(a.length)];

  const users = [];
  for (let i = 1; i <= 100; i += 1) {
    users.push({ id: i, name: i === 1 ? '데모 사용자' : `${SURN[i % 10]}${GIVEN[(i * 3) % 10]}`, email: `user${i}@daynest.test`, createdAt: ts(60 * 24 * (i + 30)) });
  }
  const ownerOf = (i) => (i % 10 < 7 ? 1 : 2 + (i % 99));

  const events = [];
  const recurring = [];
  const addEvent = (e) => { events.push({ id: events.length + 1, ...e }); return events.length; };

  FIXED.forEach(([, title, cid, date, st, et, loc, desc]) => {
    addEvent({
      userId: 1, title, description: desc, startDate: date, endDate: date, startTime: st, endTime: et, location: loc,
      categoryId: cid, color: colorOf(cid), repeatRule: 'none', reminder: '30m', status: 'scheduled', deleted: 0, recurringId: null,
      createdAt: ts(60 * 24 * 12), updatedAt: ts(60 * 24 * 12),
    });
  });

  // 반복 일정 100개 (각 2회 생성)
  for (let i = 0; i < 100; i += 1) {
    const cid = (i % 12) + 1;
    const pool = TITLES[cid];
    const title = `${pool[i % pool.length]}${i >= pool.length * 12 ? '' : ''}${Math.floor(i / 12) > 0 ? ` ${Math.floor(i / 12) + 1}` : ''}`;
    const rule = REPEAT_RULES[i % 4];
    const startDate = addDays('2026-09-22', (i * 3) % 48);
    const sMin = (7 + int(13)) * 60 + (rand() > 0.5 ? 30 : 0);
    const dur = 30 + int(4) * 30;
    const uid = ownerOf(i);
    const rid = i + 1;
    const step = rule === 'daily' ? 1 : rule === 'weekly' ? 7 : 30;
    recurring.push({
      id: rid, userId: uid, title, description: pick(DESCS), rule, occurrences: 2, startDate, startTime: hm(sMin), endTime: hm(sMin + dur),
      location: pick(PLACES), categoryId: cid, reminder: pick(REMINDERS), createdAt: ts(60 * 24 * 20 + i), updatedAt: ts(60 * 24 * 20 + i),
    });
    for (let k = 0; k < 2; k += 1) {
      const d = addDays(startDate, k * step);
      addEvent({
        userId: uid, title, description: recurring[i].description, startDate: d, endDate: d, startTime: hm(sMin), endTime: hm(sMin + dur),
        location: recurring[i].location, categoryId: cid, color: colorOf(cid), repeatRule: rule, reminder: recurring[i].reminder,
        status: addDays(d, 0) < DEMO_TODAY && rand() > 0.4 ? 'done' : 'scheduled', deleted: 0, recurringId: rid,
        createdAt: ts(60 * 24 * 20 + i), updatedAt: ts(60 * 24 * 20 + i),
      });
    }
  }

  // 일회성 일정 68개 → 활성 280개
  for (let i = 0; i < 68; i += 1) {
    const cid = (i % 12) + 1;
    const pool = TITLES[cid];
    const sMin = (7 + int(13)) * 60 + (rand() > 0.5 ? 30 : 0);
    const dur = 30 + int(4) * 30;
    const d = addDays('2026-09-20', (i * 5) % 55);
    addEvent({
      userId: ownerOf(i + 3), title: `${pool[(i + 1) % pool.length]}${i >= 24 ? ` ${Math.floor(i / 12)}` : ''}`, description: pick(DESCS), startDate: d, endDate: d,
      startTime: hm(sMin), endTime: hm(sMin + dur), location: pick(PLACES), categoryId: cid, color: colorOf(cid), repeatRule: 'none',
      reminder: pick(REMINDERS), status: d < DEMO_TODAY && rand() > 0.3 ? 'done' : 'scheduled', deleted: 0, recurringId: null,
      createdAt: ts(60 * 24 * 15 + i), updatedAt: ts(60 * 24 * 15 + i),
    });
  }
  const activeCount = events.length;

  // 삭제된 일정 80개
  const deletions = [];
  for (let i = 0; i < 80; i += 1) {
    const cid = ((i * 5) % 12) + 1;
    const pool = TITLES[cid];
    const d = addDays('2026-09-25', (i * 4) % 45);
    const uid = ownerOf(i + 1);
    const id = addEvent({
      userId: uid, title: `${pool[i % pool.length]} (취소됨 ${i + 1})`, description: '', startDate: d, endDate: d, startTime: '10:00', endTime: '11:00',
      location: '', categoryId: cid, color: colorOf(cid), repeatRule: 'none', reminder: 'none', status: 'cancelled', deleted: 1, recurringId: null,
      createdAt: ts(60 * 24 * 25 + i), updatedAt: ts(60 * 24 * 5 + i),
    });
    deletions.push({ eventId: id, userId: uid, title: events[id - 1].title, deletedAt: ts(60 * 24 * 5 + i) });
  }

  const tasks = [];
  for (let i = 0; i < 200; i += 1) {
    tasks.push({
      userId: i % 10 < 6 ? 1 : 2 + (i % 99), title: `${TASK_TITLES[i % TASK_TITLES.length]}${i >= 10 ? ` ${Math.floor(i / 10) + 1}` : ''}`,
      done: rand() < 0.35 ? 1 : 0, dueDate: addDays('2026-10-01', (i * 3) % 40), priority: pick(['low', 'normal', 'normal', 'high']),
      createdAt: ts(60 * 24 * 10 + i), updatedAt: ts(60 * 24 * 3 + i),
    });
  }

  const notes = [
    { eventId: 9, userId: 1, body: '이번 달 도서 3장까지 읽어 오기', createdAt: ts(60 * 24 * 4), updatedAt: ts(60 * 24 * 4) },
    { eventId: 9, userId: 1, body: '토론 주제: 일과 삶의 균형', createdAt: ts(60 * 24 * 3), updatedAt: ts(60 * 24 * 3) },
  ];
  for (let i = 0; i < 158; i += 1) {
    const ev = events[(i * 7 + 13) % activeCount];
    notes.push({ eventId: ev.id, userId: ev.userId, body: pick(NOTE_BODIES), createdAt: ts(60 * 24 * 6 + i), updatedAt: ts(60 * 24 * 6 + i) });
  }

  const revisions = [];
  const fields = ['title', 'startTime', 'location', 'description', 'category'];
  for (let i = 0; i < 150; i += 1) {
    const ev = events[(i * 11 + 12) % activeCount];
    revisions.push({ eventId: ev.id, userId: ev.userId, field: fields[i % 5], before: '(이전 값)', after: '(변경 값)', createdAt: ts(60 * 24 * 8 + i * 7) });
  }

  const notifications = [];
  for (let i = 0; i < 120; i += 1) {
    const ev = events[(i * 5 + 1) % activeCount];
    notifications.push({
      userId: ev.userId, eventId: ev.id, message: `‘${ev.title}’ 일정이 곧 시작됩니다.`,
      remindAt: `${ev.startDate}T${ev.startTime}:00`, isRead: i % 3 === 0 ? 1 : 0,
    });
  }

  const types = ['event_create', 'event_update', 'event_delete', 'task_create', 'task_done', 'note_create'];
  const activity = [];
  for (let i = 0; i < 150; i += 1) {
    const ev = events[(i * 3 + 2) % activeCount];
    activity.push({ userId: i % 10 < 6 ? 1 : 2 + (i % 99), type: types[i % types.length], detail: `${types[i % types.length]}: ${ev.title}`, createdAt: ts(40 * i + 11) });
  }

  return { users, categories: CATEGORIES, recurring, events, deletions, tasks, notes, revisions, notifications, activity };
}

function seedAll(db) {
  const d = generateData();
  db.transaction(() => {
    const run = (sql, rows, map) => { const st = db.prepare(sql); rows.forEach((r) => st.run(...map(r))); };
    run('INSERT INTO users (id,name,email,created_at) VALUES (?,?,?,?)', d.users, (r) => [r.id, r.name, r.email, r.createdAt]);
    run('INSERT INTO categories (id,name,color) VALUES (?,?,?)', d.categories, (r) => r);
    run('INSERT INTO recurring_events (id,user_id,title,description,rule,occurrences,start_date,start_time,end_time,location,category_id,reminder,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      d.recurring, (r) => [r.id, r.userId, r.title, r.description, r.rule, r.occurrences, r.startDate, r.startTime, r.endTime, r.location, r.categoryId, r.reminder, r.createdAt, r.updatedAt]);
    run('INSERT INTO events (id,user_id,title,description,start_date,end_date,start_time,end_time,location,category_id,color,repeat_rule,reminder,status,deleted,recurring_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      d.events, (r) => [r.id, r.userId, r.title, r.description, r.startDate, r.endDate, r.startTime, r.endTime, r.location, r.categoryId, r.color, r.repeatRule, r.reminder, r.status, r.deleted, r.recurringId, r.createdAt, r.updatedAt]);
    run('INSERT INTO event_deletions (event_id,user_id,title,deleted_at) VALUES (?,?,?,?)', d.deletions, (r) => [r.eventId, r.userId, r.title, r.deletedAt]);
    run('INSERT INTO tasks (user_id,title,done,due_date,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?)', d.tasks, (r) => [r.userId, r.title, r.done, r.dueDate, r.priority, r.createdAt, r.updatedAt]);
    run('INSERT INTO notes (event_id,user_id,body,created_at,updated_at) VALUES (?,?,?,?,?)', d.notes, (r) => [r.eventId, r.userId, r.body, r.createdAt, r.updatedAt]);
    run('INSERT INTO event_revisions (event_id,user_id,field,before_value,after_value,created_at) VALUES (?,?,?,?,?,?)', d.revisions, (r) => [r.eventId, r.userId, r.field, r.before, r.after, r.createdAt]);
    run('INSERT INTO notifications (user_id,event_id,message,remind_at,is_read) VALUES (?,?,?,?,?)', d.notifications, (r) => [r.userId, r.eventId, r.message, r.remindAt, r.isRead]);
    run('INSERT INTO activity_log (user_id,type,detail,created_at) VALUES (?,?,?,?)', d.activity, (r) => [r.userId, r.type, r.detail, r.createdAt]);
  })();
}

module.exports = { generateData, seedAll };
