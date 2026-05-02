'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9412;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

const CURRENT_USER = 'user_james';

// INTENTIONAL BUG: site083-bug01
// CSV Error: DB 수면 시간 계산 오류
// Type: database-calculation
// Description: 자정 넘어간 수면 시간을 음수 또는 잘못된 값으로 계산함.
// 취침 시간이 "23:00", 기상 시간이 "07:00"인 경우 (다음날)
// 단순 문자열 시간 차이(endHour - startHour)로 계산하면 음수(-16)가 나옴.
// data-bug-id="site083-bug01"
function calcSleepDuration_buggy(bedtime, wakeTime) {
  // data-bug-id="site083-bug01"
  // 단순 시-분 차이만 계산 — 자정 초과 처리 없음
  // 정상 로직: 날짜를 고려한 분 단위 차이 계산
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  const diff = (wh * 60 + wm) - (bh * 60 + bm); // 음수 가능
  return parseFloat((diff / 60).toFixed(2)); // 자정 넘어가면 음수 반환
}

// 다른 유저 기록 포함 (bug03용)
// INTENTIONAL BUG: site083-bug03
// CSV Error: 개인 수면 기록 접근 제어 실패
// Type: security-idor
// Description: recordId 변경으로 다른 사용자의 수면 기록 조회 가능.
// GET /api/sleep-records/:id 에서 현재 사용자 소유 여부를 검증하지 않음.
// data-bug-id="site083-bug03"
let mockRecords = [
  {
    id: 1, userId: 'user_james',
    date: '2026-05-01', bedtime: '23:30', wakeTime: '07:00',
    quality: 4, notes: '숙면. 꿈 없음.',
    mood: '😊', tags: ['숙면', '개운']
  },
  {
    id: 2, userId: 'user_james',
    date: '2026-04-30', bedtime: '00:30', wakeTime: '08:00',
    quality: 3, notes: '조금 늦게 잠들었음.',
    mood: '😐', tags: ['늦잠']
  },
  {
    id: 3, userId: 'user_james',
    date: '2026-04-29', bedtime: '22:00', wakeTime: '06:00',
    quality: 5, notes: '최고의 수면!',
    mood: '🌟', tags: ['숙면', '얼리버드']
  },
  {
    id: 4, userId: 'user_james',
    date: '2026-04-28', bedtime: '01:00', wakeTime: '09:30',
    quality: 2, notes: '자꾸 깼음. 컨디션 나쁨.',
    mood: '😴', tags: ['불면', '피곤']
  },
  {
    id: 5, userId: 'user_james',
    date: '2026-04-27', bedtime: '23:00', wakeTime: '06:30',
    quality: 4, notes: '운동 후 깊은 잠.',
    mood: '💪', tags: ['운동', '숙면']
  },
  // 다른 사용자 기록 — bug03 IDOR 타겟
  {
    id: 6, userId: 'user_anna',
    date: '2026-05-01', bedtime: '21:00', wakeTime: '05:00',
    quality: 5, notes: '완벽한 수면. 매우 상쾌함.',
    mood: '🌙', tags: ['얼리버드', '최고']
  },
  {
    id: 7, userId: 'user_bob',
    date: '2026-05-01', bedtime: '02:00', wakeTime: '10:00',
    quality: 3, notes: '야행성 패턴.',
    mood: '🦉', tags: ['야행성']
  }
];
let recordIdCounter = 8;

const mockRoutines = [
  { id: 1, userId: 'user_james', name: '저녁 루틴', steps: ['저녁 8시 이후 카페인 금지', '취침 1시간 전 스마트폰 금지', '따뜻한 샤워 10분', '스트레칭 5분', '독서 20분'], saved: true, category: '취침 전' },
  { id: 2, userId: 'user_james', name: '기상 루틴', steps: ['기상 즉시 햇빛 쬐기', '냉수 한 컵', '가벼운 스트레칭 10분', '명상 5분'], saved: false, category: '기상 후' },
  { id: 3, name: '권장 루틴 A', steps: ['일정한 취침 시간 유지', '수면 전 카페인/알코올 제한', '침실 온도 18~20°C 유지', '귀마개/안대 활용'], saved: false, category: '환경 조성', recommended: true }
];

let mockGoals = {
  userId: 'user_james',
  targetHours: 8,
  bedtimeGoal: '23:00',
  wakeGoal: '07:00',
  qualityGoal: 4
};

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════

function calcCorrectDuration(bedtime, wakeTime) {
  // 정상 로직 (사용 안 함 — 참고용)
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let diff = (wh * 60 + wm) - (bh * 60 + bm);
  if (diff < 0) diff += 24 * 60; // 자정 초과 보정
  return parseFloat((diff / 60).toFixed(2));
}

// ══════════════════════════════════════════
// Routes
// ══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site083', name: 'SleepCoach', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/sleep-records
app.get('/api/sleep-records', (req, res) => {
  const { from, to, q } = req.query;
  let records = mockRecords.filter(r => r.userId === CURRENT_USER);

  if (from) records = records.filter(r => r.date >= from);
  if (to) records = records.filter(r => r.date <= to);
  if (q) {
    const query = q.toLowerCase();
    records = records.filter(r =>
      r.notes.toLowerCase().includes(query) ||
      r.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  // bug01: 수면 시간을 잘못 계산하여 응답에 포함
  const enriched = records.map(r => ({
    ...r,
    duration: calcSleepDuration_buggy(r.bedtime, r.wakeTime), // 자정 초과 시 음수
    durationCorrect: calcCorrectDuration(r.bedtime, r.wakeTime) // 참고용 정상값
  }));

  enriched.sort((a, b) => b.date.localeCompare(a.date));
  res.json({ success: true, data: enriched, total: enriched.length });
});

// GET /api/sleep-records/:id — bug03: 소유자 검증 없음
app.get('/api/sleep-records/:id', (req, res) => {
  const record = mockRecords.find(r => r.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' });

  // data-bug-id="site083-bug03"
  // 현재 사용자 소유 여부 검증 없음
  // 정상 코드: if (record.userId !== CURRENT_USER) return res.status(403)...
  res.json({
    success: true,
    data: {
      ...record,
      duration: calcSleepDuration_buggy(record.bedtime, record.wakeTime)
    }
  });
});

// POST /api/sleep-records
app.post('/api/sleep-records', (req, res) => {
  const { date, bedtime, wakeTime, quality, notes, mood, tags } = req.body;
  if (!date || !bedtime || !wakeTime) {
    return res.status(400).json({ success: false, message: '날짜, 취침/기상 시간은 필수입니다.' });
  }
  const newRecord = {
    id: recordIdCounter++,
    userId: CURRENT_USER,
    date, bedtime, wakeTime,
    quality: parseInt(quality) || 3,
    notes: notes || '',
    mood: mood || '😐',
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    duration: calcSleepDuration_buggy(bedtime, wakeTime) // bug01 적용
  };
  mockRecords.unshift(newRecord);
  res.status(201).json({ success: true, data: newRecord });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const myRecords = mockRecords.filter(r => r.userId === CURRENT_USER);
  const durations = myRecords.map(r => calcSleepDuration_buggy(r.bedtime, r.wakeTime));
  const validDurations = durations.filter(d => d > 0); // 음수(bug01) 제외 시도하지만 데이터 오염됨
  const avgDuration = validDurations.length > 0
    ? parseFloat((validDurations.reduce((s, d) => s + d, 0) / validDurations.length).toFixed(2))
    : 0;
  const avgQuality = myRecords.length > 0
    ? parseFloat((myRecords.reduce((s, r) => s + r.quality, 0) / myRecords.length).toFixed(1))
    : 0;

  // INTENTIONAL BUG: site083-bug02
  // CSV Error: 네트워크 스키마 불일치
  // Type: network-schema-mismatch
  // Description: 통계 API가 averageHours 대신 avgSleep을 반환함.
  // 클라이언트는 averageHours 키를 기대하지만 서버는 avgSleep 키로 응답.
  // data-bug-id="site083-bug02"
  res.json({
    success: true,
    data: {
      totalRecords: myRecords.length,
      avgSleep: avgDuration,    // bug02: 키가 avgSleep (클라이언트 기대값: averageHours)
      // averageHours: avgDuration,  ← 이게 정상 키
      avgQuality,
      bestRecord: myRecords.reduce((best, r) => r.quality > (best?.quality || 0) ? r : best, null),
      weeklyTotal: validDurations.slice(0, 7).reduce((s, d) => s + d, 0).toFixed(1),
      goalAchieved: avgDuration >= mockGoals.targetHours
    }
  });
});

// GET /api/routines
app.get('/api/routines', (req, res) => {
  res.json({ success: true, data: mockRoutines });
});

// POST /api/routines/save
app.post('/api/routines/save', (req, res) => {
  const { routineId } = req.body;
  const routine = mockRoutines.find(r => r.id === parseInt(routineId));
  if (!routine) return res.status(404).json({ success: false, message: '루틴을 찾을 수 없습니다.' });
  routine.saved = true;
  res.json({ success: true, data: routine });
});

// GET /api/goals
app.get('/api/goals', (req, res) => {
  res.json({ success: true, data: mockGoals });
});

// PUT /api/goals
app.put('/api/goals', (req, res) => {
  const { targetHours, bedtimeGoal, wakeGoal, qualityGoal } = req.body;
  if (targetHours) mockGoals.targetHours = parseFloat(targetHours);
  if (bedtimeGoal) mockGoals.bedtimeGoal = bedtimeGoal;
  if (wakeGoal) mockGoals.wakeGoal = wakeGoal;
  if (qualityGoal) mockGoals.qualityGoal = parseInt(qualityGoal);
  res.json({ success: true, data: mockGoals });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌙 SleepCoach server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site083`);
  console.log(`   Bugs: bug01(db-calculation), bug02(network-schema), bug03(security-idor)`);
});
