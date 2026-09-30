import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9918;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Databases
// ----------------------------------------------------
let users = [
  { username: 'customer', name: '김태희', role: 'customer', address: '서울 서초구 반포동' }
];

let programs = [
  { id: 'prog-1', title: '고강도 타바타 서킷 트레이닝', trainer: '제이슨 트레이너', price: 'PT 10회 60만원', category: 'Diet', rating: 4.9, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
  { id: 'prog-2', title: '체형 교정 기구 필라테스 클래스', trainer: '이민아 강사', price: 'PT 20회 110만원', category: 'Body', rating: 4.8, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80' },
  { id: 'prog-3', title: '3대 근비대 스트렝스 벌크업 프로그램', trainer: '마이클 코치', price: 'PT 12회 80만원', category: 'Strength', rating: 5.0, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80' }
];

let coupons = [
  { id: 'cp-1', code: 'FIT2026', discount: '15%', note: '2026 시즌 신년 맞이 바디프로필 할인 특전' }
];

let addresses = [
  { id: 'adr-1', username: 'customer', address: '서울 서초구 반포동 45-2번지' }
];

let uploadedFiles = [
  { id: 'file-1', name: '식단_칼로리_다이어트_명세.xlsx', description: '체지방량 감량용 단백질 위주 아침식단 명세' }
];

let trainerChats = [
  { id: 'msg-1', sender: 'trainer', text: '안녕하세요! 제이슨 트레이너입니다. 회원님의 인바디 측정 수치와 감량 목표를 남겨주시면 운동 루틴을 맞춤 설계해 드리겠습니다.' }
];

let notices = [
  { id: 'nt-1', title: '2026 신년 맞이 바디챌린지 상금 500만원 이벤트 공지', date: '2026.08.01' },
  { id: 'nt-2', title: '설 연휴 센터 단축 운영 시간표 안내', date: '2026.08.02' }
];

let reviews = [
  { id: 'rev-1', writer: '박민지 회원', text: '기구 필라테스 이민아 강사님 정말 꼼꼼하세요! 골반 비대칭이 심했는데 통증이 단번에 가라앉았습니다.' }
];

let reservations = [
  { id: 'res-1', programId: 'prog-1', date: '2026-08-15', time: '14:00', title: '고강도 타바타 서킷 트레이닝 1회차 상담 예약' }
];

// Helper to simulate system info disclosure error response
function triggerSystemDisclosure(bugId, errName, message, details) {
  return {
    status: 'error',
    error: {
      name: errName,
      message: message,
      bugId: bugId,
      stack: `Error: ${message}\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async runExpressRouteHandler (${__dirname}/server.js:452:12)\n    at Object.executeMockQuery (${__dirname}/node_modules/mock-db-driver/index.js:89:14)`,
      sqlMessage: `SQL syntax error; check the manual that corresponds to your MySQL server version for the right syntax to use near 'SELECT * FROM mock_db_fitness' at line 1`,
      internalPath: `${__dirname}/routes/api/${bugId}/config.json`,
      nodeVersion: process.version,
      expressError: 'Express Route Dispatch Handler Exception'
    }
  };
}

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NeonFit Backend API (site019)' });
});

// ----------------------------------------------------
// INTENTIONAL VULNERABLE ENDPOINTS (SYSTEM INFO DISCLOSURE)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG: site019-bug01
// CSV: SEC-190
// Type: System Information Disclosure
// Description: 필터 파라미터가 비정상 포맷일 때 내부 구현 정보가 상세 노출된다.
app.get('/api/programs', (req, res) => {
  const { filter, sort, page } = req.query;

  // Bug 01: Filter param system disclosure
  if (filter && filter.includes('error')) {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug01',
      'DatabaseFilterException',
      'Failed to parse program category query filter.',
      'filter parameter validation failed'
    ));
  }

  // Bug 06: Sort param system disclosure
  if (sort && sort.includes('error')) {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug06',
      'SQLException',
      'Column index sorting out of range.',
      'sort parameter order by failed'
    ));
  }

  // Bug 07: Page param system disclosure
  if (page && page.includes('error')) {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug07',
      'PaginationException',
      'Negative offset size calculated from page query index.',
      'page parameter calculation failed'
    ));
  }

  // Standard Logic
  let result = [...programs];
  if (filter) {
    result = result.filter(p => p.category.toLowerCase() === filter.toLowerCase());
  }
  res.json(result);
});

// INTENTIONAL BACKEND BUG: site019-bug02
// CSV: SEC-191
// Type: System Information Disclosure
// Description: 로그인 시 아이디가 누락되거나 이메일이 아닐 경우 스택 트레이스 에러가 반환된다.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || username === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug02',
      'AuthModuleException',
      'NullPointerException: username credentials are required.',
      'login processing failed'
    ));
  }

  const matched = users.find(u => u.username === username);
  if (matched) {
    res.json({ status: 'success', user: matched });
  } else {
    res.status(401).json({ status: 'fail', message: '인증 정보 불일치' });
  }
});

// INTENTIONAL BACKEND BUG: site019-bug03
// CSV: SEC-192
// Type: System Information Disclosure
// Description: 회원가입 시 예외 입력이 들어오면 가입 처리에 대한 노드 파일 경로 예외 정보가 발생한다.
app.post('/api/register', (req, res) => {
  const { username, name } = req.body;
  if (!username || username === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug03',
      'RegistrationModuleException',
      'FileIOError: Cannot write registration logs to system ledger path.',
      'register processing failed'
    ));
  }
  const newUser = { username, name, role: 'customer', address: '신규' };
  users.push(newUser);
  res.json({ status: 'success', user: newUser });
});

// INTENTIONAL BACKEND BUG: site019-bug04
// CSV: SEC-193
// Type: System Information Disclosure
// Description: 회원 주소 설정 시 비정상 특수문자가 감지되면 Express 에러 구문이 표출된다.
app.post('/api/profile/address', (req, res) => {
  const { address } = req.body;
  if (!address || address === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug04',
      'ExpressRouteHandlerException',
      'TypeError: Cannot read properties of undefined (reading "addressString")',
      'address processing failed'
    ));
  }
  addresses[0].address = address;
  res.json({ status: 'success', data: addresses[0] });
});

app.get('/api/profile/address', (req, res) => {
  res.json(addresses);
});

// INTENTIONAL BACKEND BUG: site019-bug05
// CSV: SEC-194
// Type: System Information Disclosure
// Description: 바디프로필 할인 쿠폰 기입 시 쿠폰 코드가 규격외일 경우 SQL 에러가 발생한다.
app.post('/api/coupons', (req, res) => {
  const { code } = req.body;
  if (!code || code === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug05',
      'SQLGrammarException',
      'Table coupons mapping relationship schema mismatch.',
      'coupons processing failed'
    ));
  }
  const newCoupon = { id: 'cp-' + Date.now(), code, discount: '10%', note: '추가 할인' };
  coupons.push(newCoupon);
  res.json({ status: 'success', data: newCoupon });
});

app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

// INTENTIONAL BACKEND BUG: site019-bug08
// CSV: SEC-197
// Type: System Information Disclosure
// Description: 식단 파일 업로드 등록 중 파일 확장자 검증 오류 시 내부 모듈 스택 로그가 반환된다.
app.post('/api/files/upload', (req, res) => {
  const { name, description } = req.body;
  if (!name || name === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug08',
      'FileUploadException',
      'Internal IO Exception: Temp upload folder is write-protected.',
      'files upload processing failed'
    ));
  }
  const newFile = { id: 'file-' + Date.now(), name, description };
  uploadedFiles.push(newFile);
  res.json({ status: 'success', data: newFile });
});

app.get('/api/files', (req, res) => {
  res.json(uploadedFiles);
});

// INTENTIONAL BACKEND BUG: site019-bug09
// CSV: SEC-198
// Type: System Information Disclosure
// Description: 트레이너 1:1 대화 상담 메시지 전송 시 본문 데이터가 누락되면 Node 모듈 예외가 리턴된다.
app.post('/api/chat', (req, res) => {
  const { text } = req.body;
  if (!text || text === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug09',
      'NodeRuntimeModuleException',
      'Runtime error inside message queue parser thread pool execution context.',
      'chat processing failed'
    ));
  }
  const newMsg = { id: 'msg-' + Date.now(), sender: 'customer', text };
  trainerChats.push(newMsg);
  res.json({ status: 'success', data: newMsg });
});

app.get('/api/chat', (req, res) => {
  res.json(trainerChats);
});

// INTENTIONAL BACKEND BUG: site019-bug10
// CSV: SEC-199
// Type: System Information Disclosure
// Description: 공지사항 알림 검색 옵션 중 키워드가 비정상적일 때 SQL 구문 분석 예외가 출력된다.
app.get('/api/notices', (req, res) => {
  const { keyword } = req.query;
  if (keyword === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug10',
      'SQLException',
      'Unknown database column keyword matching in notice lookup routine.',
      'notices query failed'
    ));
  }
  res.json(notices);
});

// INTENTIONAL BACKEND BUG: site019-bug11
// CSV: SEC-200
// Type: System Information Disclosure
// Description: 후기 별점 코멘트 등록 시 본문 텍스트가 누락되면 디렉토리 및 노드 정보가 응답에 출력된다.
app.post('/api/reviews', (req, res) => {
  const { text } = req.body;
  if (!text || text === 'error') {
    return res.status(500).json(triggerSystemDisclosure(
      'site019-bug11',
      'PathDisclosureException',
      `Directory parsing failed during configuration check at ${__dirname}/config/reviews`,
      'reviews registration failed'
    ));
  }
  const newRev = { id: 'rev-' + Date.now(), writer: '일반 회원', text };
  reviews.push(newRev);
  res.json({ status: 'success', data: newRev });
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

// ----------------------------------------------------
// Normal features
// ----------------------------------------------------
app.get('/api/profile', (req, res) => {
  res.json({
    username: 'customer',
    name: '김태희',
    role: 'customer'
  });
});

app.post('/api/reservations', (req, res) => {
  const { programId, date, time, title } = req.body;
  const newRes = { id: 'res-' + Date.now(), programId, date, time, title };
  reservations.push(newRes);
  res.json({ status: 'success', data: newRes });
});

app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.get('/api/calendar', (req, res) => {
  res.json(reservations.map(r => ({ date: r.date, text: r.title })));
});


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Dev server proxy fallback
  const httpModule = req.url.startsWith('https') ? import('https') : import('http');
  httpModule.then((http) => {
    const devServerUrl = `http://localhost:5173${req.url}`;
    const devReq = http.request(devServerUrl, (devRes) => {
      res.writeHead(devRes.statusCode, devRes.headers);
      devRes.pipe(res);
    });
    devReq.on('error', () => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Frontend bundle not found.');
      });
    });
    devReq.end();
  }).catch(() => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[NeonFit Server] Running at http://localhost:${PORT}`);
});
