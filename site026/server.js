import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9135;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
let groups = [
  { id: 1, title: '데미안 토론 모임', bookTitle: '데미안', participants: 5, status: 'open', createdAt: 1710000000000, description: '헤르만 헤세의 명작 데미안을 함께 읽고 자아 성찰에 대해 논의합니다.' },
  { id: 2, title: '1984 디스토피아 분석', bookTitle: '1984', participants: 8, status: 'open', createdAt: 1710100000000, description: '조지 오웰의 1984를 통해 현대 사회의 감시 체제를 비판적으로 조명합니다.' },
  { id: 3, title: '코스모스 과학 토론', bookTitle: '코스모스', participants: 3, status: 'closed', createdAt: 1710200000000, description: '칼 세이건의 코스모스를 읽으며 우주의 신비와 과학적 사고를 배웁니다.' },
  { id: 4, title: '사피엔스 역사 읽기', bookTitle: '사피엔스', participants: 12, status: 'open', createdAt: 1710300000000, description: '유발 하라리의 사피엔스를 통해 인류의 진화와 문명을 되짚어봅니다.' },
  { id: 5, title: '총 균 쇠 인류사', bookTitle: '총, 균, 쇠', participants: 4, status: 'open', createdAt: 1710400000000, description: '제레드 다이아몬드의 총 균 쇠를 읽고 환경 결정론에 대해 토론합니다.' }
];

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site026",
    status: "healthy",
    timestamp: Date.now()
  });
});

// 2. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  const total = groups.length;
  const open = groups.filter(g => g.status === 'open').length;
  const avg = groups.reduce((acc, g) => acc + g.participants, 0) / total;
  res.json({
    totalGroups: total,
    openGroups: open,
    closedGroups: total - open,
    avgParticipants: parseFloat(avg.toFixed(1))
  });
});

// 3. GET /api/groups
app.get('/api/groups', (req, res) => {
  const { minParticipants, status, search } = req.query;
  let filtered = [...groups];

  if (minParticipants) {
    const min = parseInt(minParticipants);
    // INTENTIONAL BACKEND BUG: site026-bug01
    // Type: invalid-filter-logic
    // Description: minParticipants 보다 큰 값을 필터링해야 하는데, 작거나 같은 값을 필터링하도록 잘못 구현함 (>= 대신 <= 사용).
    filtered = filtered.filter(g => g.participants <= min);
    return res.json({ data: filtered, bugId: "site026-bug01" });
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(g => g.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(g => 
      g.title.toLowerCase().includes(s) || 
      g.bookTitle.toLowerCase().includes(s)
    );
  }

  // INTENTIONAL BACKEND BUG: site026-bug02
  // Type: missing-field-response
  // Description: 특정 확률로 응답 데이터에서 bookTitle 필드를 누락시켜 프론트엔드 렌더링 결함을 유도함.
  if (Math.random() < 0.3) {
    const buggyData = filtered.map(g => {
      const { bookTitle, ...rest } = g;
      return rest;
    });
    return res.json({ data: buggyData, bugId: "site026-bug02" });
  }

  res.json({ data: filtered });
});

// 4. POST /api/groups
app.post('/api/groups', (req, res) => {
  const { title, bookTitle, participants, description } = req.body;
  
  // INTENTIONAL BACKEND BUG: site026-bug03
  // Type: invalid-default-value
  // Description: 새 모임 생성 시 기본 상태가 'open'이어야 하지만, 의도적으로 'closed'로 설정함.
  const status = req.body.status || 'closed'; 

  const newGroup = {
    id: groups.length + 1,
    title,
    bookTitle,
    participants: parseInt(participants) || 0,
    status,
    description: description || '',
    createdAt: Date.now(),
    bugId: "site026-bug03"
  };

  groups.push(newGroup);
  res.status(201).json(newGroup);
});

// 5. GET /api/groups/popular
app.get('/api/groups/popular', async (req, res) => {
  // INTENTIONAL BACKEND BUG: site026-bug04
  // Type: api-timeout
  // Description: 인기 모임 조회 시 의도적으로 2초의 지연 시간을 발생시켜 성능 저하 상황을 재현함.
  await new Promise(resolve => setTimeout(resolve, 2000));

  const sorted = [...groups].sort((a, b) => b.participants - a.participants).slice(0, 3);
  res.json({
    data: sorted,
    bugId: "site026-bug04",
    delayMs: 2000
  });
});

// 6. GET /api/groups/:id
app.get('/api/groups/:id', (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));
  if (!group) return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
  res.json(group);
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site026 server running on http://localhost:${PORT}`);
});
