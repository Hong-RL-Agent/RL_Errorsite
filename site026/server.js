import express from 'express';
import cors from 'cors';
import pathModule from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9925;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Mock Database & Session Store
// ----------------------------------------------------
let users = [
  { email: 'user@example.com', name: '김코딩강사', password: 'password123' }
];

let tokens = {}; // token -> context object

const generateToken = () => {
  return 'token_class_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const initTokenContext = (token, userObj = null) => {
  if (!tokens[token]) {
    tokens[token] = {
      token,
      isLoggedOut: false,
      user: userObj || { email: 'user@example.com', name: '김코딩강사' },
      actionTags: false,
      actionInvitations: false,
      actionShippingMemo: false,
      actionRefunds: false,
      actionSuggestions: false,
      actionNotifications: false,
      actionCalendar: false,
      actionReports: false,
      actionCsv: false,
      actionQuery: false,
      enrollments: [
        {
          id: 'REG_882910A',
          classId: 'c1',
          title: '처음부터 배우는 React 완벽 가이드',
          price: 99000,
          date: '2026-08-01',
          status: '수강중'
        }
      ],
      wishlist: [],
      calendarItems: [
        { id: 1, title: 'React 3강 라이브 세미나', date: '2026-08-20' }
      ],
      chatMessages: [
        { sender: 'mentor', text: '안녕하세요! ClassPass 1:1 수강 멘토입니다. 어떤 점이 궁금하신가요?', time: '오전 10:00' }
      ],
      reviews: [
        { classId: 'c1', rating: 5, comment: '커리큘럼이 너무 알차고 많은 도움이 되었습니다!', author: '김코딩강사' }
      ],
      tags: ['React', '프론트엔드'],
      invitations: [],
      shippingMemos: [],
      refunds: [],
      csvFiles: []
    };
  }
  return tokens[token];
};

// Initial default token for test/demo ease
const DEFAULT_TOKEN = 'token_class_demo_session_9925';
initTokenContext(DEFAULT_TOKEN);

// General authentication helper
const getAuthContext = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : req.headers['x-auth-token'];
  if (!token) return null;
  return initTokenContext(token);
};

let classProducts = [
  {
    id: 'c1',
    title: '처음부터 배우는 React 완벽 가이드',
    desc: '기초 문법부터 상태 관리, Vite 빌드 및 배포까지 한 번에 끝내는 웹 개발 실무',
    price: 99000,
    category: '프로그래밍',
    tag: 'POPULAR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60',
    instructor: '김코딩',
    level: '초급~중급',
    duration: '24시간'
  },
  {
    id: 'c2',
    title: '홈 카페 에스프레소 & 라떼아트 마스터',
    desc: '우리 집 거실을 카페로 만드는 전문가의 기기 선택과 완벽한 스팀/벨벳 폼 기법',
    price: 59000,
    category: '라이프스타일',
    tag: 'NEW',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=60',
    instructor: '이바리스타',
    level: '입문',
    duration: '12시간'
  },
  {
    id: 'c3',
    title: '아이패드로 그리는 아날로그 감성 수채화 드로잉',
    desc: '프로크리에이트 기초 브러시 설정부터 캐릭터 드로잉, 굿즈 템플릿 제작 완성까지',
    price: 74000,
    category: '미술/드로잉',
    tag: 'RECOMMENDED',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=60',
    instructor: '박화가',
    level: '전체 관람',
    duration: '18시간'
  },
  {
    id: 'c4',
    title: '원목 가구 목공 디자이너 입문 클래스',
    desc: '수공구 수리와 수종별 재단법, 나만의 원목 협탁 및 스툴 직접 만들어보기',
    price: 120000,
    category: '공예/취미',
    tag: 'POPULAR',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=60',
    instructor: '최목수',
    level: '중급',
    duration: '30시간'
  },
  {
    id: 'c5',
    title: '수제 파스타 & 이탈리안 가정식 입문',
    desc: '생면 파스타 반죽부터 소스 밸런스 잡기, 홈파티 파인 다이닝 플레이팅 기술',
    price: 68000,
    category: '요리/베이킹',
    tag: 'NEW',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
    instructor: '정셰프',
    level: '입문',
    duration: '15시간'
  },
  {
    id: 'c6',
    title: '나만의 시그니처 향수 & 룸스프레이 조향',
    desc: '탑-미들-베이스 노트 조향 이론과 내 취향에 딱 맞는 앰버 샌달우드 향 만들기',
    price: 52000,
    category: '공예/취미',
    tag: 'RECOMMENDED',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&auto=format&fit=crop&q=60',
    instructor: '강조향',
    level: '초급',
    duration: '10시간'
  }
];

let notifications = [
  { id: 1, message: 'React 완벽 가이드 신규 라이브 특강 일정이 캘린더에 추가되었습니다.', time: '방금 전' },
  { id: 2, message: '수제 파스타 클래스 준비물 키트 배송 조회가 시작되었습니다.', time: '1시간 전' }
];

// ----------------------------------------------------
// Public APIs
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// GET /api/session
app.get('/api/session', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx || ctx.isLoggedOut) {
    return res.json({ authenticated: false, user: null, token: null });
  }

  res.json({
    authenticated: true,
    user: ctx.user,
    token: ctx.token
  });
});

// Authentication: Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  let matched = users.find(u => u.email === email && u.password === password);
  
  if (!matched && email) {
    matched = { email, name: email.split('@')[0] || '수강생', password: password || '1234' };
    users.push(matched);
  }

  if (!matched) {
    return res.status(401).json({ error: '인증 정보가 올바르지 않습니다.' });
  }

  const token = generateToken();
  initTokenContext(token, matched);

  res.json({ status: 'success', token, user: matched });
});

// Authentication: Register
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body || {};
  const newUser = { email, password, name: name || '크리에이터' };
  users.push(newUser);

  const token = generateToken();
  initTokenContext(token, newUser);

  res.json({ status: 'success', token, user: newUser });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  const ctx = getAuthContext(req);
  if (ctx) {
    ctx.isLoggedOut = true;
  }
  res.json({ status: 'success', message: '성공적으로 로그아웃되었습니다.' });
});

// Class list
app.get('/api/classes', (req, res) => {
  res.json(classProducts);
});

// Class details
app.get('/api/classes/:id', (req, res) => {
  const matched = classProducts.find(c => c.id === req.params.id);
  if (matched) res.json(matched);
  else res.status(404).json({ error: '클래스를 찾을 수 없습니다.' });
});

// Search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json(classProducts);
  const result = classProducts.filter(c => 
    c.title.includes(q) || c.desc.includes(q) || c.category.includes(q)
  );
  res.json(result);
});

// ----------------------------------------------------
// VULNERABLE PROTECTED ENDPOINTS (SEC-261 ~ SEC-270)
// ----------------------------------------------------

// INTENTIONAL BACKEND BUG
// SEC-261: Logout token is intentionally not invalidated.
app.post('/api/tags', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionTags = true;
  } else if (!ctx.actionTags) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { tag } = req.body || {};
  if (tag) ctx.tags.push(tag);
  res.json({ status: 'success', tags: ctx.tags });
});

// INTENTIONAL BACKEND BUG
// SEC-262: Logout token is intentionally not invalidated.
app.post('/api/invitations', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionInvitations = true;
  } else if (!ctx.actionInvitations) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { message } = req.body || {};
  if (message) ctx.invitations.push(message);
  res.json({ status: 'success', invitations: ctx.invitations });
});

// INTENTIONAL BACKEND BUG
// SEC-263: Logout token is intentionally not invalidated.
app.post('/api/shipping/memo', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionShippingMemo = true;
  } else if (!ctx.actionShippingMemo) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { memo } = req.body || {};
  if (memo) ctx.shippingMemos.push(memo);
  res.json({ status: 'success', shippingMemos: ctx.shippingMemos });
});

// INTENTIONAL BACKEND BUG
// SEC-264: Logout token is intentionally not invalidated.
app.post('/api/refunds/reason', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionRefunds = true;
  } else if (!ctx.actionRefunds) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { reason } = req.body || {};
  if (reason) ctx.refunds.push(reason);
  res.json({ status: 'success', refunds: ctx.refunds });
});

// INTENTIONAL BACKEND BUG
// SEC-265: Logout token is intentionally not invalidated.
app.get('/api/search/suggestions', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionSuggestions = true;
  } else if (!ctx.actionSuggestions) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { q } = req.query;
  const list = ['React 완벽 가이드', '라떼아트 스팀', '에스프레소 세팅', '아이패드 수채화', '원목 협탁 목공', '수제 파스타 생면', '시그니처 향수 조향']
    .filter(s => !q || s.includes(q));
  res.json(list);
});

// INTENTIONAL BACKEND BUG
// SEC-266: Logout token is intentionally not invalidated.
app.post('/api/notifications/title', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionNotifications = true;
  } else if (!ctx.actionNotifications) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { title } = req.body || {};
  res.json({ status: 'success', title: title || '공지 알림 머리글' });
});

// INTENTIONAL BACKEND BUG
// SEC-267: Logout token is intentionally not invalidated.
app.post('/api/calendar/title', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionCalendar = true;
  } else if (!ctx.actionCalendar) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { title, date } = req.body || {};
  const item = { id: Date.now(), title: title || '신규 수강 일정', date: date || '2026-08-30' };
  ctx.calendarItems.push(item);
  res.json(item);
});

// INTENTIONAL BACKEND BUG
// SEC-268: Logout token is intentionally not invalidated.
app.get('/api/learning/report', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionReports = true;
  } else if (!ctx.actionReports) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { filter } = req.query;
  res.json({
    filter: filter || 'all',
    totalEnrolled: ctx.enrollments.length,
    completedLessons: 8,
    totalHoursSpent: 18.5,
    achievementRate: '85%'
  });
});

// INTENTIONAL BACKEND BUG
// SEC-269: Logout token is intentionally not invalidated.
app.post('/api/learning/csv', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionCsv = true;
  } else if (!ctx.actionCsv) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  const { csvText } = req.body || {};
  ctx.csvFiles.push({ csvText: csvText || '', timestamp: new Date().toISOString() });
  res.json({ status: 'success', count: csvText ? csvText.split('\n').length : 0 });
});

// INTENTIONAL BACKEND BUG
// SEC-270: Logout token is intentionally not invalidated.
app.get('/api/classes/query', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });

  if (!ctx.isLoggedOut) {
    ctx.actionQuery = true;
  } else if (!ctx.actionQuery) {
    return res.status(401).json({ error: '로그아웃된 토큰입니다.' });
  }

  res.json(ctx.enrollments);
});

// ----------------------------------------------------
// Standard Protected Endpoints (Correct Invalidation)
// ----------------------------------------------------

const enforceAuth = (req, res, next) => {
  const ctx = getAuthContext(req);
  if (!ctx) return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });
  if (ctx.isLoggedOut) return res.status(401).json({ error: '로그아웃된 토큰입니다. 다시 로그인해주십시오.' });
  req.authContext = ctx;
  next();
};

app.get('/api/calendar', enforceAuth, (req, res) => {
  res.json(req.authContext.calendarItems);
});

app.get('/api/enrollments', enforceAuth, (req, res) => {
  res.json(req.authContext.enrollments);
});

app.post('/api/enrollments', enforceAuth, (req, res) => {
  const { classId } = req.body || {};
  const matched = classProducts.find(c => c.id === classId);
  if (matched) {
    const item = {
      id: 'REG_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      classId,
      title: matched.title,
      price: matched.price,
      date: new Date().toISOString().split('T')[0],
      status: '수강중'
    };
    req.authContext.enrollments.push(item);
    res.json(item);
  } else {
    res.status(404).json({ error: '클래스를 찾을 수 없습니다.' });
  }
});

app.get('/api/wishlist', enforceAuth, (req, res) => {
  res.json(req.authContext.wishlist);
});

app.post('/api/wishlist', enforceAuth, (req, res) => {
  const { classId } = req.body || {};
  const matched = classProducts.find(c => c.id === classId);
  if (matched && !req.authContext.wishlist.some(w => w.id === classId)) {
    req.authContext.wishlist.push(matched);
  }
  res.json(req.authContext.wishlist);
});

app.get('/api/notifications', enforceAuth, (req, res) => {
  res.json(notifications);
});

app.get('/api/chat', enforceAuth, (req, res) => {
  res.json(req.authContext.chatMessages);
});

app.post('/api/chat', enforceAuth, (req, res) => {
  const { text } = req.body || {};
  if (text) {
    const msg = { sender: 'user', text, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) };
    req.authContext.chatMessages.push(msg);
    setTimeout(() => {
      req.authContext.chatMessages.push({
        sender: 'mentor',
        text: `'${text}' 문의가 정상 접수되었습니다. 담당 크리에이터 팀에서 검토 후 안내해 드리겠습니다.`,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      });
    }, 500);
    res.json(msg);
  } else {
    res.status(400).json({ error: '메시지 내용을 입력해 주세요.' });
  }
});

app.get('/api/reviews', (req, res) => {
  const { classId } = req.query;
  const allReviews = Object.values(tokens).flatMap(t => t.reviews || []);
  if (classId) {
    return res.json(allReviews.filter(r => r.classId === classId));
  }
  res.json(allReviews);
});

app.post('/api/reviews', enforceAuth, (req, res) => {
  const { classId, rating, comment } = req.body || {};
  const rev = {
    classId: classId || 'c1',
    rating: Number(rating) || 5,
    comment: comment || '유익한 강의입니다.',
    author: req.authContext.user.name
  };
  req.authContext.reviews.push(rev);
  res.json(rev);
});

// Fallback & Static Serving
app.use(express.static(pathModule.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  res.sendFile(pathModule.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) res.sendFile(pathModule.join(__dirname, 'index.html'));
  });
});

app.listen(PORT, () => {
  console.log(`[ClassPass Server] Running at http://localhost:${PORT}`);
});
