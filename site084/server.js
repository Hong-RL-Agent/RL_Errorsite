'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9413;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

const CURRENT_USER = 'user_green';

const mockSymptoms = [
  { id: 1, name: '잎이 노랗게 변함', emoji: '🟡', category: '잎색 변화', severity: 'medium' },
  { id: 2, name: '잎에 갈색 반점', emoji: '🟤', category: '잎색 변화', severity: 'high' },
  { id: 3, name: '잎이 축 처짐', emoji: '💧', category: '형태 이상', severity: 'medium' },
  { id: 4, name: '흰 가루 같은 게 생김', emoji: '⚪', category: '표면 이상', severity: 'high' },
  { id: 5, name: '뿌리가 검게 썩음', emoji: '⚫', category: '뿌리 이상', severity: 'critical' },
  { id: 6, name: '잎 가장자리가 마름', emoji: '🍂', category: '잎색 변화', severity: 'low' },
  { id: 7, name: '벌레가 보임', emoji: '🐛', category: '해충', severity: 'high' },
  { id: 8, name: '성장이 멈춤', emoji: '🛑', category: '성장 이상', severity: 'medium' }
];

// 증상-진단 매핑 (정상: symptomId 기반)
const diagnosisMap = {
  1: { disease: '질소 결핍', confidence: 85, cause: '영양분(질소) 부족으로 하엽부터 노화 발생', treatment: '질소 비료 시비, 엽면 살포 권장', severity: 'medium', preventions: ['정기적 시비', '흙 영양 점검'] },
  2: { disease: '세균성 반점병', confidence: 78, cause: '세균(Xanthomonas) 감염으로 발생', treatment: '구리계 살균제 살포, 이병 잎 제거', severity: 'high', preventions: ['통풍 개선', '물 주기 시 잎 회피'] },
  3: { disease: '과습 또는 뿌리 손상', confidence: 72, cause: '토양 과습으로 뿌리 산소 부족', treatment: '물 주기 감소, 배수 개선, 새 배양토로 교체', severity: 'medium', preventions: ['배수구 확인', '과습 주의'] },
  4: { disease: '흰가루병', confidence: 92, cause: '균류(Erysiphe) 감염. 건조하고 따뜻한 환경에서 발생', treatment: '살균제(황 계열) 살포, 이병엽 제거', severity: 'high', preventions: ['습도 조절', '과밀 재배 금지'] },
  5: { disease: '뿌리 썩음병(역병)', confidence: 88, cause: 'Phytophthora 균류. 과습 + 배수 불량 복합 원인', treatment: '이병 뿌리 제거, 메탈락실 계 농약, 배수층 개선', severity: 'critical', preventions: ['배수 철저히', '토양 소독'] },
  6: { disease: '수분 부족(탈수)', confidence: 80, cause: '건조한 환경 또는 물 부족으로 잎 가장자리부터 괴사', treatment: '충분한 관수, 습도 높이기(분무)', severity: 'low', preventions: ['규칙적 물 주기', '습도계 활용'] },
  7: { disease: '진딧물 또는 깍지벌레 감염', confidence: 90, cause: '흡즙 해충에 의한 즙액 손실', treatment: '님오일 살포, 물리적 제거, 응애 전용 약제', severity: 'high', preventions: ['주기적 잎 점검', '격리 재배'] },
  8: { disease: '광도 부족 또는 뿌리 포화', confidence: 68, cause: '빛 부족 혹은 화분 내 뿌리가 가득 찬 상태', treatment: '밝은 곳 이동, 분갈이 실시', severity: 'medium', preventions: ['6개월마다 분갈이', '채광 확보'] }
};

const mockPlants = [
  { id: 1, name: '몬스테라', emoji: '🌿', type: '관엽', difficulty: '보통', light: '밝은 간접광', water: '주 1~2회', humidity: '높음', tips: '겨울에 물 주기 줄이기' },
  { id: 2, name: '선인장', emoji: '🌵', type: '다육', difficulty: '쉬움', light: '직사광선', water: '월 1~2회', humidity: '낮음', tips: '과습 절대 금지' },
  { id: 3, name: '스파티필럼', emoji: '🌺', type: '화초', difficulty: '보통', light: '저조도 가능', water: '주 1회', humidity: '높음', tips: '잎 분무 자주 하기' },
  { id: 4, name: '고무나무', emoji: '🍃', type: '관엽', difficulty: '쉬움', light: '밝은 간접광', water: '주 1회', humidity: '보통', tips: '잎 닦아주기' },
  { id: 5, name: '허브(로즈마리)', emoji: '🌱', type: '허브', difficulty: '보통', light: '직사광선 선호', water: '주 2~3회', humidity: '낮음', tips: '배수 철저히' },
  { id: 6, name: '난초', emoji: '🌸', type: '화초', difficulty: '어려움', light: '밝은 간접광', water: '주 1회 (저면관수)', humidity: '높음', tips: '뿌리 건조 확인 후 관수' }
];

const mockTips = [
  { id: 1, category: '물 주기', title: '손가락 테스트로 물 주기 판단', content: '손가락을 흙에 2cm 정도 넣어 건조하면 물 주기. 대부분 과습이 문제', plant: '전체' },
  { id: 2, category: '빛', title: '창문 방향별 광도 이해하기', content: '남향 > 동/서향 > 북향. 직사광을 못 견디는 식물은 레이스 커튼 활용', plant: '관엽' },
  { id: 3, category: '토양', title: '배수층 만들기', content: '화분 바닥에 자갈/마사토 2~3cm 깔면 과습 예방. 배수구 필수', plant: '전체' },
  { id: 4, category: '해충', title: '님오일로 해충 예방', content: '500배 희석 님오일 분무로 진딧물, 응애, 깍지벌레 예방. 주 1회 권장', plant: '전체' },
  { id: 5, category: '비료', title: '성장기 비료 주기', content: '봄~여름: 2주 1회 액비 시비. 가을~겨울: 비료 금지 또는 최소화', plant: '전체' },
  { id: 6, category: '분갈이', title: '뿌리 포화 신호 체크', content: '배수구에서 뿌리가 나오거나 물이 바로 빠지면 분갈이 타이밍. 봄이 적기', plant: '전체' }
];

// 상담 기록 — 다른 유저 포함 (bug03용)
// INTENTIONAL BUG: site084-bug03
// data-bug-id="site084-bug03"
let mockConsultations = [
  { id: 1, userId: 'user_green', plantName: '몬스테라', symptomId: 1, symptomName: '잎이 노랗게 변함', status: 'answered', createdAt: '2026-04-25', answer: '질소 비료를 2주 간격으로 시비하세요.' },
  { id: 2, userId: 'user_green', plantName: '선인장', symptomId: 4, symptomName: '흰 가루 같은 게 생김', status: 'pending', createdAt: '2026-05-01', answer: null },
  { id: 3, userId: 'user_bloom', plantName: '난초', symptomId: 5, symptomName: '뿌리가 검게 썩음', status: 'answered', createdAt: '2026-04-28', answer: '뿌리 썩음병입니다. 이병 뿌리 제거 후 새 배양토에 이식하세요.' },
  { id: 4, userId: 'user_leaf', plantName: '고무나무', symptomId: 7, symptomName: '벌레가 보임', status: 'pending', createdAt: '2026-04-30', answer: null }
];
let consultIdCounter = 5;

// ══════════════════════════════════════════
// Routes
// ══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site084', name: 'PlantClinic', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/symptoms
app.get('/api/symptoms', (req, res) => {
  const { category } = req.query;
  let symptoms = [...mockSymptoms];
  if (category && category !== 'all') symptoms = symptoms.filter(s => s.category === category);
  res.json({ success: true, data: symptoms });
});

// POST /api/diagnosis
// INTENTIONAL BUG: site084-bug01
// CSV Error: DB 진단 매핑 오류
// Type: database-relation
// Description: 선택한 symptomId가 아닌 첫 번째 증상 기준으로 진단 결과 반환.
// 요청된 symptomId를 무시하고 diagnosisMap[1](질소 결핍)을 항상 반환함.
// data-bug-id="site084-bug01"
app.post('/api/diagnosis', (req, res) => {
  const { symptomId, plantId } = req.body;

  if (!symptomId) {
    // INTENTIONAL BUG: site084-bug02
    // CSV Error: 네트워크 실패 응답 불명확
    // Type: network-error-handling
    // Description: 진단 실패 시 빈 객체만 반환해 원인 확인이 어려움.
    // data-bug-id="site084-bug02"
    // 정상: res.status(400).json({ success: false, message: 'symptomId는 필수 파라미터입니다.', code: 'MISSING_SYMPTOM_ID' })
    return res.status(400).json({}); // 빈 객체 — 클라이언트가 오류 원인 알 수 없음
  }

  const plant = plantId ? mockPlants.find(p => p.id === parseInt(plantId)) : null;

  // data-bug-id="site084-bug01"
  // symptomId를 키로 사용해야 하지만 항상 1번(질소 결핍)을 반환
  // 정상 코드: const diagnosis = diagnosisMap[parseInt(symptomId)];
  const diagnosis = diagnosisMap[1]; // bug01: 항상 첫 번째 결과

  if (!diagnosis) {
    return res.status(400).json({});  // bug02 적용
  }

  res.json({
    success: true,
    data: {
      symptomId: parseInt(symptomId), // 요청된 symptomId는 반영되지만
      symptomName: mockSymptoms.find(s => s.id === parseInt(symptomId))?.name,
      ...diagnosis,  // 진단 결과는 항상 symptomId=1 기준
      plant: plant ? { name: plant.name, emoji: plant.emoji } : null,
      diagnosedAt: new Date().toISOString()
    }
  });
});

// GET /api/plants
app.get('/api/plants', (req, res) => {
  const { type } = req.query;
  let plants = [...mockPlants];
  if (type && type !== 'all') plants = plants.filter(p => p.type === type);
  res.json({ success: true, data: plants });
});

// GET /api/plants/:id
app.get('/api/plants/:id', (req, res) => {
  const plant = mockPlants.find(p => p.id === parseInt(req.params.id));
  if (!plant) return res.status(404).json({ success: false, message: '식물을 찾을 수 없습니다.' });
  res.json({ success: true, data: plant });
});

// GET /api/tips
app.get('/api/tips', (req, res) => {
  const { category } = req.query;
  let tips = [...mockTips];
  if (category && category !== 'all') tips = tips.filter(t => t.category === category);
  res.json({ success: true, data: tips });
});

// POST /api/consultations
app.post('/api/consultations', (req, res) => {
  const { plantName, symptomId, message } = req.body;
  if (!plantName || !symptomId) return res.status(400).json({ success: false, message: '필수 필드 누락' });
  const symptom = mockSymptoms.find(s => s.id === parseInt(symptomId));
  const newConsult = {
    id: consultIdCounter++,
    userId: CURRENT_USER,
    plantName,
    symptomId: parseInt(symptomId),
    symptomName: symptom?.name || '',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
    answer: null
  };
  mockConsultations.unshift(newConsult);
  res.status(201).json({ success: true, data: newConsult });
});

// GET /api/consultations — 내 기록만
app.get('/api/consultations', (req, res) => {
  const myConsults = mockConsultations.filter(c => c.userId === CURRENT_USER);
  res.json({ success: true, data: myConsults });
});

// GET /api/consultations/:id — bug03: 소유자 검증 없음
app.get('/api/consultations/:id', (req, res) => {
  const consult = mockConsultations.find(c => c.id === parseInt(req.params.id));
  if (!consult) return res.status(404).json({ success: false, message: '상담 기록을 찾을 수 없습니다.' });

  // data-bug-id="site084-bug03"
  // consult.userId !== CURRENT_USER 검증 없음
  // 정상: if (consult.userId !== CURRENT_USER) return res.status(403)...
  res.json({ success: true, data: consult });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌿 PlantClinic server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site084`);
  console.log(`   Bugs: bug01(db-relation), bug02(network-error-handling), bug03(security-authorization)`);
});
