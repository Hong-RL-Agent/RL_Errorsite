'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9409;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

// INTENTIONAL BUG: site080-bug01
// CSV Error: DB 게시글 상태 오류
// Type: database-state
// Description: 모집 마감 게시글도 신청 가능 상태로 반환됨.
// isClosed: true인 게시글의 status를 'closed'로 변환하지 않고
// 그대로 'open'으로 응답하는 오류가 /api/posts 에서 발생함.
// data-bug-id="site080-bug01"
const mockPosts = [
  {
    id: 1,
    title: '강남역 5분 거리, 여성 룸메이트 구합니다',
    author: 'user_kim',
    region: '강남',
    district: '강남구 역삼동',
    rent: 550000,
    deposit: 1000000,
    roomType: '원룸 쉐어',
    gender: '여성',
    age: '20대',
    isClosed: false,   // 정상 오픈
    moveInDate: '2026-05-15',
    duration: '6개월 이상',
    lifestyle: { wake: '07:00', sleep: '23:00', smoking: false, pet: false, cook: true, clean: '주 1회' },
    description: '조용하고 청결한 분을 찾습니다. 주방 공유, 화장실 개인 사용.',
    tags: ['조용함', '청결', '직장인'],
    views: 142, applications: 3,
    createdAt: '2026-04-20'
  },
  {
    id: 2,
    title: '홍대 2인실 남성 룸메이트',
    author: 'user_park',
    region: '홍대',
    district: '마포구 서교동',
    rent: 480000,
    deposit: 500000,
    roomType: '2인실',
    gender: '남성',
    age: '20~30대',
    isClosed: true,    // 마감 — bug01: 여전히 open으로 반환됨
    moveInDate: '2026-05-01',
    duration: '1년',
    lifestyle: { wake: '08:00', sleep: '01:00', smoking: false, pet: true, cook: false, clean: '주 2회' },
    description: '강아지 있어요. 게임 좋아하는 분 환영. 야식 같이 드실 분!',
    tags: ['펫', '게임', '야식'],
    views: 89, applications: 7,
    createdAt: '2026-04-15'
  },
  {
    id: 3,
    title: '신촌 대학가, 대학생 환영 혼성 가능',
    author: 'user_lee',
    region: '신촌',
    district: '서대문구 창천동',
    rent: 420000,
    deposit: 300000,
    roomType: '원룸 쉐어',
    gender: '무관',
    age: '20대',
    isClosed: false,
    moveInDate: '2026-06-01',
    duration: '단기 3개월',
    lifestyle: { wake: '09:00', sleep: '24:00', smoking: false, pet: false, cook: true, clean: '각자' },
    description: '신촌 연대 정문 도보 3분. 학생 우선. 취사 가능.',
    tags: ['대학생', '단기', '취사'],
    views: 201, applications: 12,
    createdAt: '2026-04-25'
  },
  {
    id: 4,
    title: '이태원 글로벌 쉐어하우스 입주자 모집',
    author: 'user_choi',
    region: '이태원',
    district: '용산구 이태원동',
    rent: 620000,
    deposit: 2000000,
    roomType: '쉐어하우스',
    gender: '무관',
    age: '무관',
    isClosed: true,   // 마감 — bug01
    moveInDate: '2026-05-10',
    duration: '6개월',
    lifestyle: { wake: '무관', sleep: '무관', smoking: false, pet: false, cook: true, clean: '청소부 주 1회' },
    description: '외국인 포함 5명 거주. 영어 가능자 우대. 옥상 테라스 있음.',
    tags: ['국제적', '테라스', '영어'],
    views: 334, applications: 21,
    createdAt: '2026-04-10'
  },
  {
    id: 5,
    title: '건대 인근 조용한 여성 전용',
    author: 'user_jung',
    region: '건대',
    district: '광진구 화양동',
    rent: 390000,
    deposit: 500000,
    roomType: '원룸 쉐어',
    gender: '여성',
    age: '20대',
    isClosed: false,
    moveInDate: '2026-05-20',
    duration: '1년 이상',
    lifestyle: { wake: '07:30', sleep: '22:30', smoking: false, pet: false, cook: false, clean: '주 2회' },
    description: '도서관 같은 분위기 좋아하시는 분. 11시 이후 취침.',
    tags: ['조용함', '여성전용', '장기'],
    views: 97, applications: 2,
    createdAt: '2026-04-28'
  },
  {
    id: 6,
    title: '성수 감성 공유오피스 + 주거 콤보',
    author: 'user_bae',
    region: '성수',
    district: '성동구 성수동',
    rent: 750000,
    deposit: 3000000,
    roomType: '쉐어하우스',
    gender: '무관',
    age: '20~30대',
    isClosed: false,
    moveInDate: '2026-06-15',
    duration: '6개월 이상',
    lifestyle: { wake: '08:00', sleep: '24:00', smoking: false, pet: false, cook: true, clean: '관리자' },
    description: '1층 공유 오피스, 2~3층 주거. 스타트업/프리랜서 우선.',
    tags: ['스타트업', '오피스', '감성'],
    views: 512, applications: 18,
    createdAt: '2026-05-01'
  }
];

let mockApplications = [
  { id: 1, postId: 1, applicant: 'user_A', message: '안녕하세요! 조용하게 지낼 수 있어요.', status: 'pending', createdAt: '2026-04-22' },
  { id: 2, postId: 3, applicant: 'user_B', message: '대학교 2학년입니다. 잘 부탁드려요!', status: 'accepted', createdAt: '2026-04-26' }
];
let appIdCounter = 3;

// Mock messages — 다른 사용자 스레드 포함 (bug03용)
// INTENTIONAL BUG: site080-bug03
// CSV Error: 개인 메시지 접근 제어 실패
// Type: security-idor
// Description: messageThreadId 변경으로 다른 사용자의 메시지 미리보기 조회 가능.
// /api/messages/:threadId 에서 현재 로그인 사용자가 해당 스레드의 참여자인지 검증하지 않음.
// data-bug-id="site080-bug03"
const mockMessages = {
  'thread_1_A': {
    threadId: 'thread_1_A',
    participants: ['user_kim', 'user_A'],
    postId: 1, postTitle: '강남역 5분 거리, 여성 룸메이트 구합니다',
    messages: [
      { id: 'm1', sender: 'user_A', text: '안녕하세요! 입주 가능 날짜 조율 부탁드려요.', ts: '2026-04-22T10:00:00Z' },
      { id: 'm2', sender: 'user_kim', text: '5월 15일 이후면 좋겠어요. 직접 보러 오실 수 있나요?', ts: '2026-04-22T10:05:00Z' }
    ]
  },
  'thread_3_B': {
    threadId: 'thread_3_B',
    participants: ['user_lee', 'user_B'],
    postId: 3, postTitle: '신촌 대학가, 대학생 환영 혼성 가능',
    messages: [
      { id: 'm3', sender: 'user_B', text: '6월 1일 입주 가능합니다!', ts: '2026-04-26T14:00:00Z' },
      { id: 'm4', sender: 'user_lee', text: '좋아요! 계약서 준비해드릴게요.', ts: '2026-04-26T14:10:00Z' }
    ]
  },
  'thread_4_X': {
    threadId: 'thread_4_X',
    participants: ['user_choi', 'user_X'],
    postId: 4, postTitle: '이태원 글로벌 쉐어하우스',
    messages: [
      { id: 'm5', sender: 'user_X', text: 'Hi! Is the room still available?', ts: '2026-04-11T09:00:00Z' },
      { id: 'm6', sender: 'user_choi', text: 'Sorry, it is closed now.', ts: '2026-04-11T09:30:00Z' }
    ]
  }
};

let mockMyPosts = [
  { id: 1, title: '강남역 5분 거리, 여성 룸메이트 구합니다', region: '강남', isClosed: false, applications: 3, createdAt: '2026-04-20' }
];

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════

// bug01: 마감 여부 상관없이 status를 'open'으로 반환하는 잘못된 함수
function getPostStatus_buggy(post) {
  // data-bug-id="site080-bug01"
  // isClosed 필드를 확인하지 않고 무조건 'open' 반환
  // 정상 로직: return post.isClosed ? 'closed' : 'open';
  return 'open';
}

// INTENTIONAL BUG: site080-bug02
// CSV Error: 네트워크 응답 지연 처리 실패
// Type: network-timeout
// Description: 신청 API 지연 시 명확한 실패 처리가 없음.
// POST /api/applications 에서 인위적으로 4000ms 지연을 삽입하지만
// 서버 측 타임아웃 처리나 클라이언트 안내 없이 그냥 대기만 함.
// 클라이언트는 응답을 무기한 기다리며, 재시도 로직도 없음.
// data-bug-id="site080-bug02"
function artificialDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ══════════════════════════════════════════
// API Routes
// ══════════════════════════════════════════

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site080', name: 'RoomMate Board', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/posts
app.get('/api/posts', (req, res) => {
  const { region, gender, roomType, q, sort } = req.query;

  let posts = mockPosts.map(p => ({
    ...p,
    // bug01: getPostStatus_buggy가 isClosed를 무시하고 'open' 반환
    status: getPostStatus_buggy(p)
  }));

  if (region && region !== 'all') posts = posts.filter(p => p.region === region);
  if (gender && gender !== 'all') posts = posts.filter(p => p.gender === gender || p.gender === '무관');
  if (roomType && roomType !== 'all') posts = posts.filter(p => p.roomType === roomType);
  if (q) {
    const query = q.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.district.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );
  }
  if (sort === 'recent') posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === 'views') posts.sort((a, b) => b.views - a.views);
  if (sort === 'rent_asc') posts.sort((a, b) => a.rent - b.rent);
  if (sort === 'rent_desc') posts.sort((a, b) => b.rent - a.rent);

  res.json({ success: true, data: posts, total: posts.length });
});

// GET /api/posts/:id
app.get('/api/posts/:id', (req, res) => {
  const post = mockPosts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
  res.json({ success: true, data: { ...post, status: getPostStatus_buggy(post) } });
});

// POST /api/applications — bug02: 인위적 지연
app.post('/api/applications', async (req, res) => {
  const { postId, message } = req.body;
  if (!postId || !message) return res.status(400).json({ success: false, message: '필수 필드 누락' });

  // data-bug-id="site080-bug02"
  // 4초 인위적 지연 — 서버 타임아웃 처리 없음, 클라이언트 timeout 안내 없음
  // 정상적으로는 Promise.race([실제 DB 저장, timeout(3000)])으로 처리해야 함
  await artificialDelay(4000);

  const newApp = {
    id: appIdCounter++,
    postId: parseInt(postId),
    applicant: 'user_current',
    message,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockApplications.push(newApp);
  res.status(201).json({ success: true, data: newApp });
});

// GET /api/applications
app.get('/api/applications', (req, res) => {
  res.json({ success: true, data: mockApplications, total: mockApplications.length });
});

// GET /api/messages/:threadId — bug03: 참여자 검증 없음
app.get('/api/messages/:threadId', (req, res) => {
  const { threadId } = req.params;
  const thread = mockMessages[threadId];

  // data-bug-id="site080-bug03"
  // 현재 사용자가 해당 스레드 참여자인지 검증하지 않음
  // 정상 로직:
  // const CURRENT_USER = 'user_kim';
  // if (!thread.participants.includes(CURRENT_USER)) {
  //   return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });
  // }
  if (!thread) return res.status(404).json({ success: false, message: '스레드를 찾을 수 없습니다.' });
  res.json({ success: true, data: thread });
});

// GET /api/messages (내 스레드 목록)
app.get('/api/messages', (req, res) => {
  // 현재 사용자(user_kim)의 스레드만 반환해야 하지만 간단히 thread_1_A만 반환
  const myThreads = Object.values(mockMessages)
    .filter(t => t.participants.includes('user_kim'))
    .map(t => ({
      threadId: t.threadId,
      postTitle: t.postTitle,
      lastMessage: t.messages[t.messages.length - 1],
      participants: t.participants
    }));
  res.json({ success: true, data: myThreads });
});

// GET /api/my-posts
app.get('/api/my-posts', (req, res) => {
  res.json({ success: true, data: mockMyPosts });
});

// POST /api/posts (게시글 작성)
app.post('/api/posts', (req, res) => {
  const { title, region, district, rent, deposit, roomType, gender, age, description, tags, moveInDate, duration } = req.body;
  if (!title || !region || !rent) return res.status(400).json({ success: false, message: '필수 필드 누락' });
  const newPost = {
    id: mockPosts.length + 1,
    title, author: 'user_kim',
    region, district: district || region,
    rent: parseInt(rent), deposit: parseInt(deposit || 0),
    roomType: roomType || '원룸 쉐어', gender: gender || '무관', age: age || '무관',
    isClosed: false,
    moveInDate: moveInDate || '', duration: duration || '협의',
    lifestyle: { wake: '협의', sleep: '협의', smoking: false, pet: false, cook: false, clean: '협의' },
    description: description || '',
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    views: 0, applications: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockPosts.push(newPost);
  mockMyPosts.push({ id: newPost.id, title: newPost.title, region: newPost.region, isClosed: false, applications: 0, createdAt: newPost.createdAt });
  res.status(201).json({ success: true, data: newPost });
});

// GET /api/regions
app.get('/api/regions', (req, res) => {
  const regions = [...new Set(mockPosts.map(p => p.region))];
  res.json({ success: true, data: regions });
});

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏠 RoomMate Board server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site080`);
  console.log(`   Bugs: bug01(db-state), bug02(network-timeout), bug03(security-idor)`);
});
