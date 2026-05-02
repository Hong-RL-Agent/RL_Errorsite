'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9408;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

const mockDecks = [
  {
    id: 1, title: '영어 단어 TOEIC 기초', description: '토익 빈출 단어 500선', tag: '영어',
    cardCount: 3, isPrivate: false, owner: 'user01', color: '#6C63FF', emoji: '🇬🇧',
    createdAt: '2026-04-01'
  },
  {
    id: 2, title: '한국사 근현대사', description: '수능 대비 근현대 핵심 사건 정리', tag: '역사',
    cardCount: 3, isPrivate: false, owner: 'user01', color: '#FF6584', emoji: '📜',
    createdAt: '2026-04-05'
  },
  {
    id: 3, title: '알고리즘 면접 준비', description: '코딩 인터뷰 자주 나오는 개념', tag: 'CS',
    cardCount: 3, isPrivate: false, owner: 'user02', color: '#43B89C', emoji: '💻',
    createdAt: '2026-04-10'
  },
  // INTENTIONAL BUG: site079-bug03
  // CSV Error: 비공개 덱 접근 제어 실패
  // Type: security-access-control
  // Description: private deck도 deckId만 알면 조회 가능.
  // isPrivate: true 임에도 /api/decks/:id 및 /api/cards/:deckId 에서 소유자 검증 없이 응답함.
  {
    id: 4, title: '[비공개] 개인 일본어 학습', description: '개인 학습용 히라가나/가타카나', tag: '일본어',
    cardCount: 3, isPrivate: true, owner: 'user99', color: '#F7B731', emoji: '🇯🇵',
    createdAt: '2026-04-15'
  },
  {
    id: 5, title: '수학 미적분 공식', description: '수능/대학 미적분 핵심 공식 모음', tag: '수학',
    cardCount: 3, isPrivate: false, owner: 'user01', color: '#4ECDC4', emoji: '📐',
    createdAt: '2026-04-18'
  },
  {
    id: 6, title: '세계 지리 수도', description: '국가별 수도 암기 카드', tag: '지리',
    cardCount: 3, isPrivate: false, owner: 'user02', color: '#A55EEA', emoji: '🌍',
    createdAt: '2026-04-20'
  }
];

const mockCards = {
  1: [
    { id: 101, front: 'Abundant', back: '풍부한, 넘치는', example: 'The region is abundant in natural resources.', hint: 'ab-' },
    { id: 102, front: 'Acquire', back: '습득하다, 얻다', example: 'She acquired new skills at the workshop.', hint: 'acq-' },
    { id: 103, front: 'Adhere', back: '고수하다, 달라붙다', example: 'Please adhere to the company policy.', hint: 'adh-' }
  ],
  2: [
    { id: 201, front: '3·1 운동', back: '1919년 일제에 맞선 전국적 독립 만세 운동', example: '기미독립선언서가 발표된 해', hint: '19-' },
    { id: 202, front: '광복절', back: '1945년 8월 15일, 일본으로부터 광복된 날', example: '매년 공휴일로 지정', hint: '광-' },
    { id: 203, front: '6·25 전쟁', back: '1950년 북한의 남침으로 시작된 한국 전쟁', example: '1953년 휴전 협정 체결', hint: '6-' }
  ],
  3: [
    { id: 301, front: 'Big-O 표기법', back: '알고리즘의 시간/공간 복잡도를 나타내는 표기법', example: 'O(n log n) — 합병 정렬', hint: 'O(' },
    { id: 302, front: '이진 탐색', back: '정렬된 배열에서 중간값을 비교해 탐색 범위를 반씩 줄이는 알고리즘', example: '시간복잡도: O(log n)', hint: '이-' },
    { id: 303, front: '동적 프로그래밍', back: '부분 문제의 결과를 저장해 중복 계산을 방지하는 기법', example: '피보나치, 배낭 문제', hint: 'DP' }
  ],
  4: [
    { id: 401, front: 'あ행', back: 'あ(a) い(i) う(u) え(e) お(o)', example: 'あいうえお', hint: 'あ' },
    { id: 402, front: 'か행', back: 'か(ka) き(ki) く(ku) け(ke) こ(ko)', example: 'かきくけこ', hint: 'か' },
    { id: 403, front: 'さ행', back: 'さ(sa) し(shi) す(su) せ(se) そ(so)', example: 'さしすせそ', hint: 'さ' }
  ],
  5: [
    { id: 501, front: '미분의 정의', back: "f'(x) = lim(h→0) [f(x+h)-f(x)] / h", example: "f(x)=x² → f'(x)=2x", hint: 'lim' },
    { id: 502, front: '적분의 기본정리', back: '∫f(x)dx = F(x)+C (F\'(x)=f(x))', example: '∫2x dx = x² + C', hint: '∫' },
    { id: 503, front: '연쇄법칙', back: "[f(g(x))]' = f'(g(x)) · g'(x)", example: 'sin(x²) 미분', hint: '합성' }
  ],
  6: [
    { id: 601, front: '프랑스 수도', back: '파리 (Paris)', example: '에펠탑이 있는 도시', hint: '프-' },
    { id: 602, front: '브라질 수도', back: '브라질리아 (Brasília)', example: '상파울루와 혼동 주의', hint: '브-' },
    { id: 603, front: '호주 수도', back: '캔버라 (Canberra)', example: '시드니와 혼동 주의', hint: '호-' }
  ]
};

// Progress: { userId_deckId: { deckId, studied, correct, wrong, lastStudied } }
// INTENTIONAL BUG: site079-bug01
// CSV Error: DB 진행률 저장 오류
// Type: database-persistence
// Description: 학습 완료 응답은 성공이지만 progress 값이 저장되지 않음.
// POST /api/progress 에서 in-memory DB에 실제로 write하지 않고 성공 응답만 반환함.
// data-bug-id="site079-bug01"
const progressDB = {
  'user01_1': { deckId: 1, studied: 3, correct: 2, wrong: 1, lastStudied: '2026-04-28' },
  'user01_2': { deckId: 2, studied: 1, correct: 1, wrong: 0, lastStudied: '2026-04-29' },
  'user01_3': { deckId: 3, studied: 0, correct: 0, wrong: 0, lastStudied: null }
};

let wrongNotes = [
  { id: 1, cardId: 101, deckId: 1, front: 'Abundant', back: '풍부한, 넘치는', wrongCount: 3, lastWrong: '2026-04-28', note: '형용사 주의' },
  { id: 2, cardId: 201, deckId: 2, front: '3·1 운동', back: '1919년 전국적 독립 만세 운동', wrongCount: 2, lastWrong: '2026-04-29', note: '연도 암기' }
];

let wrongNoteIdCounter = 3;

// Current session mock (단일 유저 시뮬레이션)
const CURRENT_USER = 'user01';

// ══════════════════════════════════════════
// Helper
// ══════════════════════════════════════════

// INTENTIONAL BUG: site079-bug02
// CSV Error: 네트워크 응답 순서 오류
// Type: network-race-condition
// Description: 빠른 카드 넘김 시 이전 카드 응답이 현재 카드 데이터를 덮어씀.
// /api/cards/:deckId/:cardIndex 에서 요청마다 랜덤 지연을 추가하여
// 이전 요청의 응답이 더 늦게 도착할 수 있도록 만듦.
// 클라이언트는 요청 순서를 보장하지 않아 오래된 응답이 최신 카드 슬롯을 덮어쓸 수 있음.
function randomDelay() {
  // data-bug-id="site079-bug02"
  // 0~800ms 사이 랜덤 지연 → 빠른 카드 전환 시 응답 순서가 역전됨
  return new Promise(resolve => setTimeout(resolve, Math.random() * 800));
}

// ══════════════════════════════════════════
// API Routes
// ══════════════════════════════════════════

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site079', name: 'StudyFlash', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/decks - 공개 덱만 반환 (비공개 목록 노출은 없음)
app.get('/api/decks', (req, res) => {
  const { tag, q } = req.query;
  let decks = mockDecks.filter(d => !d.isPrivate);

  if (tag && tag !== 'all') decks = decks.filter(d => d.tag === tag);
  if (q) {
    const query = q.toLowerCase();
    decks = decks.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.tag.toLowerCase().includes(query)
    );
  }

  // progress 정보 병합
  const result = decks.map(d => {
    const prog = progressDB[`${CURRENT_USER}_${d.id}`] || { studied: 0, correct: 0, wrong: 0, lastStudied: null };
    return { ...d, progress: prog };
  });

  res.json({ success: true, data: result, total: result.length });
});

// GET /api/decks/:id
// INTENTIONAL BUG: site079-bug03 (continued)
// 비공개 덱도 deckId만 알면 소유자 검증 없이 전체 정보 반환
app.get('/api/decks/:id', (req, res) => {
  const deckId = parseInt(req.params.id);
  const deck = mockDecks.find(d => d.id === deckId);
  if (!deck) return res.status(404).json({ success: false, message: '덱을 찾을 수 없습니다.' });

  // data-bug-id="site079-bug03"
  // 정상적으로는 deck.isPrivate && deck.owner !== CURRENT_USER 이면 403 반환해야 함.
  // 하지만 소유자/권한 검증이 없으므로 비공개 덱도 그대로 응답됨.
  const prog = progressDB[`${CURRENT_USER}_${deckId}`] || { studied: 0, correct: 0, wrong: 0, lastStudied: null };
  res.json({ success: true, data: { ...deck, progress: prog } });
});

// GET /api/cards/:deckId - 덱의 카드 목록
app.get('/api/cards/:deckId', async (req, res) => {
  const deckId = parseInt(req.params.deckId);
  const cards = mockCards[deckId];
  if (!cards) return res.status(404).json({ success: false, message: '카드를 찾을 수 없습니다.' });
  res.json({ success: true, data: cards, total: cards.length });
});

// GET /api/cards/:deckId/:cardIndex - 카드 한 장 (race condition 재현)
app.get('/api/cards/:deckId/:cardIndex', async (req, res) => {
  const deckId = parseInt(req.params.deckId);
  const cardIndex = parseInt(req.params.cardIndex);
  const cards = mockCards[deckId];
  if (!cards) return res.status(404).json({ success: false, message: '카드를 찾을 수 없습니다.' });

  // bug02: 랜덤 지연으로 응답 순서 역전 유발
  await randomDelay();

  const card = cards[cardIndex];
  if (!card) return res.status(404).json({ success: false, message: '해당 카드가 없습니다.' });
  res.json({ success: true, data: card, index: cardIndex, total: cards.length });
});

// GET /api/progress/:deckId
app.get('/api/progress/:deckId', (req, res) => {
  const deckId = parseInt(req.params.deckId);
  const key = `${CURRENT_USER}_${deckId}`;
  const prog = progressDB[key] || { deckId, studied: 0, correct: 0, wrong: 0, lastStudied: null };
  res.json({ success: true, data: prog });
});

// POST /api/progress - 진행률 저장 (bug01: 저장 안 됨)
app.post('/api/progress', (req, res) => {
  const { deckId, studied, correct, wrong } = req.body;
  if (!deckId) return res.status(400).json({ success: false, message: 'deckId 필요' });

  // INTENTIONAL BUG: site079-bug01 (실제 저장 로직)
  // data-bug-id="site079-bug01"
  // 아래 주석 처리된 저장 로직이 실행되지 않음.
  // progressDB에 write하지 않고 성공 응답만 반환 → 재조회 시 이전 값 그대로 유지.
  // 정상 코드:
  // const key = `${CURRENT_USER}_${deckId}`;
  // progressDB[key] = { deckId, studied, correct, wrong, lastStudied: new Date().toISOString().split('T')[0] };

  // 버그: 저장 없이 성공 응답 반환
  res.json({ success: true, message: '진행률이 저장되었습니다.', data: { deckId, studied, correct, wrong } });
});

// GET /api/wrong-notes
app.get('/api/wrong-notes', (req, res) => {
  res.json({ success: true, data: wrongNotes, total: wrongNotes.length });
});

// POST /api/wrong-notes
app.post('/api/wrong-notes', (req, res) => {
  const { cardId, deckId, front, back, note } = req.body;
  if (!cardId || !front || !back) return res.status(400).json({ success: false, message: '필수 필드 누락' });

  const existing = wrongNotes.find(w => w.cardId === cardId);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastWrong = new Date().toISOString().split('T')[0];
    if (note) existing.note = note;
    return res.json({ success: true, data: existing, action: 'updated' });
  }

  const newNote = {
    id: wrongNoteIdCounter++, cardId, deckId, front, back,
    wrongCount: 1, lastWrong: new Date().toISOString().split('T')[0], note: note || ''
  };
  wrongNotes.push(newNote);
  res.status(201).json({ success: true, data: newNote, action: 'created' });
});

// DELETE /api/wrong-notes/:id
app.delete('/api/wrong-notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = wrongNotes.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: '오답 노트를 찾을 수 없습니다.' });
  wrongNotes.splice(idx, 1);
  res.json({ success: true, message: '삭제되었습니다.' });
});

// GET /api/tags
app.get('/api/tags', (req, res) => {
  const tags = [...new Set(mockDecks.filter(d => !d.isPrivate).map(d => d.tag))];
  res.json({ success: true, data: tags });
});

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📚 StudyFlash server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site079`);
  console.log(`   Bugs: bug01(db-persistence), bug02(network-race), bug03(access-control)`);
});
