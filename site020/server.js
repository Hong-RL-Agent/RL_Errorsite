import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9919;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Database State
// ----------------------------------------------------
let users = [
  { username: 'admin', name: '김지현 센터장', role: 'administrator' },
  { username: 'planner', name: '박서준 수석 플래너', role: 'planner' }
];

let tags = [
  { id: 't1', name: 'AI 테크' },
  { id: 't2', name: '글로벌 포럼' },
  { id: 't3', name: '네트워킹 파티' }
];

let invitations = [
  { id: 'inv1', email: 'partner@korea.com', eventTitle: '2026 글로벌 AI 서밋', status: 'Sent' },
  { id: 'inv2', email: 'guest@intel.com', eventTitle: '차세대 테크 서포터즈 발대식', status: 'Accepted' }
];

let reservations = [
  { id: 'res1', eventTitle: '2026 글로벌 AI 서밋', attendeeName: '홍길동', note: '앞좌석 배치 희망', status: 'Confirmed' },
  { id: 'res2', eventTitle: '차세대 테크 서포터즈 발대식', attendeeName: '김철수', note: '휠체어 접근 가능 여부 문의', status: 'Confirmed' }
];

let refunds = [
  { id: 'ref1', reservationId: 'res1', amount: 50000, reason: '일정 변경', status: 'Completed' }
];

let notifications = [
  { id: 'n1', channel: 'Email', message: 'AI 서밋 사전 등록 마감 3일 전 안내', timestamp: '2026-08-13T10:00:00Z' },
  { id: 'n2', channel: 'SMS', message: '박서준님이 캘린더 일정을 등록했습니다.', timestamp: '2026-08-13T10:30:00Z' }
];

let calendarEvents = [
  { id: 'cal1', title: '2026 글로벌 AI 서밋', date: '2026-08-20', location: '서울 그랜드볼룸' },
  { id: 'cal2', title: '차세대 테크 서포터즈 발대식', date: '2026-08-25', location: '온라인 Zoom' }
];

let reports = [
  { id: 'rep1', year: 2026, category: 'Tech', revenue: 15000000, attendees: 350 },
  { id: 'rep2', year: 2026, category: 'Networking', revenue: 8000000, attendees: 120 }
];

let csvImports = [
  { id: 'csv1', filename: 'attendees_list.csv', count: 120, status: 'Completed', timestamp: '2026-08-13T09:00:00Z' }
];

let queriesHistory = [
  { id: 'q1', queryText: 'SELECT * FROM attendees WHERE confirmed = 1', status: 'Success', timestamp: '2026-08-13T09:15:00Z' }
];

// Helper to check for format error criteria
const hasFormatError = (str) => {
  if (!str) return true;
  const malformedPatterns = ['%', '$', '#', '@', '*', '!', '--', 'drop', 'select', 'javascript:'];
  return malformedPatterns.some(p => str.toLowerCase().includes(p)) || str.length > 500;
};

// ----------------------------------------------------
// Essential APIs
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Nexus Events Backend', timestamp: new Date().toISOString() });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user) {
    res.json({ status: 'success', user });
  } else {
    res.status(401).json({ error: '인증 정보가 올바르지 않습니다.' });
  }
});

// POST /api/register
app.post('/api/register', (req, res) => {
  const { username, name, role } = req.body;
  if (!username || !name) {
    return res.status(400).json({ error: '아이디와 이름을 입력해주세요.' });
  }
  const newUser = { username, name, role: role || 'planner' };
  users.push(newUser);
  res.json({ status: 'success', user: newUser });
});

// GET /api/events
app.get('/api/events', (req, res) => {
  res.json([
    { id: 'evt1', title: '2026 글로벌 AI 서밋', date: '2026-08-20', category: 'Tech', price: '50,000원', attendees: 350, maxAttendees: 500, desc: '글로벌 AI 혁신 트렌드와 미래 기술 로드맵을 조망하는 대형 컨퍼런스', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60' },
    { id: 'evt2', title: '차세대 테크 서포터즈 발대식', date: '2026-08-25', category: 'Networking', price: '무료', attendees: 120, maxAttendees: 150, desc: '기술 생태계를 선도할 청년 인재 양성 및 발대식 네트워킹 이벤트', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60' },
    { id: 'evt3', title: '스타트업 IR 피칭 데이', date: '2026-09-02', category: 'Business', price: '10,000원', attendees: 80, maxAttendees: 100, desc: '혁신 기술 스타트업의 엔젤 투자 유치와 멘토링 데모데이 세션', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60' }
  ]);
});

// GET /api/events/search
app.get('/api/events/search', (req, res) => {
  const { q } = req.query;
  const allEvents = [
    { id: 'evt1', title: '2026 글로벌 AI 서밋', category: 'Tech' },
    { id: 'evt2', title: '차세대 테크 서포터즈 발대식', category: 'Networking' },
    { id: 'evt3', title: '스타트업 IR 피칭 데이', category: 'Business' }
  ];
  if (!q) return res.json(allEvents);
  res.json(allEvents.filter(e => e.title.includes(q) || e.category.includes(q)));
});

// INTENTIONAL BACKEND BUG
// site020-bug01: System Information Disclosure (태그 입력)
app.post('/api/tags', (req, res) => {
  const { name } = req.body;
  if (name && (hasFormatError(name) || name === 'FAIL_TEST')) {
    return res.status(500).json({
      error: "Database error: tag format verification failed.",
      stack: `Error: SQLITE_ERROR: near "%": syntax error
    at Database.run (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:89:12)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async TagModel.createTag (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:104:10)`,
      code: "SQLITE_ERROR",
      sql: `INSERT INTO tags (name, created_at) VALUES ('${name}', '2026-08-13') -- syntax error`
    });
  }
  const newTag = { id: 't' + (tags.length + 1), name: name || '임시 태그' };
  tags.push(newTag);
  res.json({ status: 'success', tag: newTag });
});

app.get('/api/tags', (req, res) => {
  res.json(tags);
});

// INTENTIONAL BACKEND BUG
// site020-bug02: System Information Disclosure (초대장 정보)
app.post('/api/invitations', (req, res) => {
  const { email, eventTitle } = req.body;
  if (!email || hasFormatError(email) || email.includes('fail')) {
    return res.status(500).json({
      error: "MailTemplateEngineException: Failed to parse invitation template.",
      stack: `TypeError: Cannot read properties of undefined (reading 'split')
    at MailTemplateCompiler.compile (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\node_modules\\mail-template\\index.js:56:22)
    at sendInvitationMail (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:145:43)
    at handlePostInvitation (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:155:9)`,
      filePath: "C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js",
      line: 145
    });
  }
  const newInv = { id: 'inv' + (invitations.length + 1), email, eventTitle, status: 'Sent' };
  invitations.push(newInv);
  res.json({ status: 'success', invitation: newInv });
});

app.get('/api/invitations', (req, res) => {
  res.json(invitations);
});

// POST /api/reservations
app.post('/api/reservations', (req, res) => {
  const { eventTitle, attendeeName } = req.body;
  const newRes = { id: 'res' + (reservations.length + 1), eventTitle, attendeeName, note: '', status: 'Confirmed' };
  reservations.push(newRes);
  res.json({ status: 'success', reservation: newRes });
});

// INTENTIONAL BACKEND BUG
// site020-bug03: System Information Disclosure (참가 메모)
app.post('/api/reservations/note', (req, res) => {
  const { id, note } = req.body;
  if (note && (hasFormatError(note) || note.includes('FAIL'))) {
    return res.status(500).json({
      error: "QueryExecutionError: failed to execute database transaction.",
      stack: `DatabaseError: sqlite3.DatabaseError: Statement too long or syntax error near 'SELECT'
    at QueryBuilder.execute (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\node_modules\\sqlite3\\lib\\sqlite3.js:14:11)
    at executeNoteTransaction (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:210:22)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`
    });
  }
  const resv = reservations.find(r => r.id === id);
  if (resv) {
    resv.note = note;
    return res.json({ status: 'success', reservation: resv });
  }
  res.status(404).json({ error: '예약 내역을 찾을 수 없습니다.' });
});

app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// INTENTIONAL BACKEND BUG
// site020-bug04: System Information Disclosure (환불 요청)
app.post('/api/refunds', (req, res) => {
  const { reservationId, amount, reason } = req.body;
  if (!reservationId || hasFormatError(reservationId) || isNaN(Number(amount)) || Number(amount) < 0) {
    return res.status(500).json({
      error: "TransactionException: Math precision overflow or invalid parameter type in refund calculation.",
      stack: `Error: TransactionException: Invalid decimal type definition
    at processRefundTransaction (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:265:35)
    at handleRefundRequest (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:280:18)
    at dispatch (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\node_modules\\express\\lib\\router\\route.js:137:13)`
    });
  }
  const newRefund = { id: 'ref' + (refunds.length + 1), reservationId, amount: Number(amount), reason, status: 'Completed' };
  refunds.push(newRefund);
  res.json({ status: 'success', refund: newRefund });
});

app.get('/api/refunds', (req, res) => {
  res.json(refunds);
});

// INTENTIONAL BACKEND BUG
// site020-bug05: System Information Disclosure (검색 자동완성)
app.get('/api/search/suggestions', (req, res) => {
  const { q } = req.query;
  if (q && (hasFormatError(q) || q === '*')) {
    return res.status(500).json({
      error: "SyntaxError: Invalid regular expression in search engine compile.",
      stack: `SyntaxError: Invalid regular expression: /*/: Nothing to repeat
    at new RegExp (<anonymous>)
    at autocompleteSearchSuggestions (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:330:19)
    at getSearchSuggestions (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:345:30)`
    });
  }
  const suggestions = [
    '2026 글로벌 AI 서밋',
    '글로벌 테크 서포터즈',
    '스타트업 피칭 로드쇼',
    '스마트시티 네트워킹 데이',
    '콘퍼런스 대관 세미나'
  ];
  if (!q) return res.json(suggestions);
  res.json(suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase())));
});

// INTENTIONAL BACKEND BUG
// site020-bug06: System Information Disclosure (알림 센터)
app.post('/api/notifications', (req, res) => {
  const { channel, message } = req.body;
  if (!channel || hasFormatError(channel) || channel === 'FAIL') {
    return res.status(500).json({
      error: "DispatcherConfigurationError: Notification channel is not registered.",
      stack: `Error: DispatcherConfigurationError: Channel not found
    at NotificationDispatcher.send (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:380:15)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
      envDump: {
        "NODE_ENV": "development",
        "CONFIG_PATH": "C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\config\\notification.json",
        "DISPATCHER_THREAD_ID": "thread_83902"
      }
    });
  }
  const newNoti = { id: 'n' + (notifications.length + 1), channel, message, timestamp: new Date().toISOString() };
  notifications.push(newNoti);
  res.json({ status: 'success', notification: newNoti });
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// INTENTIONAL BACKEND BUG
// site020-bug07: System Information Disclosure (행사 일정 등록)
app.post('/api/calendar', (req, res) => {
  const { title, date, location } = req.body;
  if (!date || hasFormatError(date) || date.includes('invalid') || isNaN(Date.parse(date))) {
    return res.status(500).json({
      error: "RangeError: Invalid time value in Date calculation engine.",
      stack: `RangeError: Invalid time value
    at Date.toISOString (<anonymous>)
    at parseCalendarEventDate (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:425:25)
    at validateCalendarEvent (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:440:10)`
    });
  }
  const newEvent = { id: 'cal' + (calendarEvents.length + 1), title, date, location };
  calendarEvents.push(newEvent);
  res.json({ status: 'success', event: newEvent });
});

app.get('/api/calendar', (req, res) => {
  res.json(calendarEvents);
});

// INTENTIONAL BACKEND BUG
// site020-bug08: System Information Disclosure (운영 리포트 필터)
app.post('/api/reports/filter', (req, res) => {
  const { year, category } = req.body;
  if (year && (isNaN(Number(year)) || Number(year) < 0 || hasFormatError(String(year)))) {
    return res.status(500).json({
      error: "AggregateError: Failed to compile report aggregation pipeline.",
      stack: `AggregateError: database syntax/expression error: Year parameter out of range
    at AggregationEngine.compilePipeline (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:485:44)
    at fetchFilteredReport (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:500:30)`,
      columns: ["id", "event_id", "revenue", "attendees_count", "date_year"]
    });
  }
  const yr = Number(year);
  const filtered = reports.filter(r => (yr ? r.year === yr : true) && (category ? r.category === category : true));
  res.json(filtered);
});

app.get('/api/reports/filter', (req, res) => {
  res.json(reports);
});

// INTENTIONAL BACKEND BUG
// site020-bug09: System Information Disclosure (CSV 참가자 업로드)
app.post('/api/import/csv', (req, res) => {
  const { filename, csvData } = req.body;
  if (!csvData || hasFormatError(csvData) || csvData.includes('error')) {
    return res.status(500).json({
      error: "CSVParserStreamException: Failed to parse CSV content.",
      stack: `Error: CSVParserStreamException: Malformed row delimiter
    at CSVParser.parseStream (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\node_modules\\csv-parser\\index.js:89:12)
    at processCSVImport (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:545:18)`,
      tempDirectory: "C:\\Users\\이주이\\AppData\\Local\\Temp\\upload_5e32c819a"
    });
  }
  const newImport = {
    id: 'csv' + (csvImports.length + 1),
    filename: filename || 'unknown.csv',
    count: Math.floor(Math.random() * 200) + 10,
    status: 'Completed',
    timestamp: new Date().toISOString()
  };
  csvImports.push(newImport);
  res.json({ status: 'success', import: newImport });
});

app.get('/api/import/history', (req, res) => {
  res.json(csvImports);
});

// INTENTIONAL BACKEND BUG
// site020-bug10: System Information Disclosure (API 쿼리 실행)
app.post('/api/query', (req, res) => {
  const { queryText } = req.body;
  if (!queryText || hasFormatError(queryText) || queryText.includes('FAIL')) {
    return res.status(500).json({
      error: "DatabaseDriverConnectionException: Connection query parsing failed.",
      stack: `DatabaseDriverConnectionException: invalid syntax near 'SELECT * FROM'
    at ORMConnection.executeQuery (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\node_modules\\orm-framework\\db.js:142:19)
    at runQueryConsole (C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\server.js:605:25)`,
      connectionString: "sqlite://C:\\Users\\이주이\\OneDrive\\바탕 화면\\웹제작\\site020\\data\\nexus_db.sqlite"
    });
  }
  const newQ = { id: 'q' + (queriesHistory.length + 1), queryText, status: 'Success', timestamp: new Date().toISOString() };
  queriesHistory.push(newQ);
  res.json({ status: 'success', query: newQ });
});

app.get('/api/query/history', (req, res) => {
  res.json(queriesHistory);
});

// ----------------------------------------------------
// Production/Dev Fallbacks
// ----------------------------------------------------
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
  console.log(`[Nexus Events Server] Running at http://localhost:${PORT}`);
});
