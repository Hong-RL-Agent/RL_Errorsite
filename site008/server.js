import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9907;

app.use(express.json());

// Mock databases
const userDB = {
  student: {
    name: '홍길동 수강생',
    permissions: {
      notifications: true,
      payments: true,
      shipping: true,
      returns: true,
      reviews: true,
      coupons: true,
      wishlist: true,
      support: true,
      analytics: true,
      exports: true
    }
  },
  instructor: {
    name: '김철수 교수',
    permissions: {
      notifications: true,
      payments: true,
      shipping: true,
      returns: true,
      reviews: true,
      coupons: true,
      wishlist: true,
      support: true,
      analytics: true,
      exports: true
    }
  },
  admin: {
    name: '시스템 전산원',
    permissions: {
      notifications: true,
      payments: true,
      shipping: true,
      returns: true,
      reviews: true,
      coupons: true,
      wishlist: true,
      support: true,
      analytics: true,
      exports: true
    }
  }
};

const sessionStore = {
  'sess-student-lms8': {
    role: 'student',
    cachedPermissions: { ...userDB.student.permissions }
  },
  'sess-instructor-lms8': {
    role: 'instructor',
    cachedPermissions: { ...userDB.instructor.permissions }
  },
  'sess-admin-lms8': {
    role: 'admin',
    cachedPermissions: { ...userDB.admin.permissions }
  }
};

// Mock LMS data
const lmsData = {
  notifications: [
    { id: 'notif-101', title: '클라우드 인프라 아키텍처 신규 강좌 오픈 안내', time: '2026-07-28 10:00', sender: '평생교육처' },
    { id: 'notif-102', title: '초격차 패키지 강의자료 다운로드 기간 연장 공지', time: '2026-07-29 14:00', sender: '학사운영팀' }
  ],
  payments: [
    { id: 'pay-201', course: 'Kubernetes 마스터 클래스 입문부터 실무까지', amount: '₩120,000', date: '2026-07-15' },
    { id: 'pay-202', course: 'AI/머신러닝 알고리즘 수학 및 시각화 기본 완성', amount: '₩180,000', date: '2026-07-20' }
  ],
  shipping: [
    { id: 'ship-301', book: 'React 실전 프로젝트 디자인 패턴 가이드북', address: '서울특별시 강남구 테헤란로 124', status: '교재 배송중' },
    { id: 'ship-302', book: 'Go 언어를 활용한 마이크로서비스 설계 실무', address: '경기도 성남시 분당구 판교역로 230', status: '교재 배송 완료' }
  ],
  returns: [
    { id: 'ret-401', course: '파이썬 데이터 웹 스크래핑 완벽 백과사전', amount: '₩98,000', status: '환불 완료' },
    { id: 'ret-402', course: 'Unity 3D 게임 물리 및 애니메이션 완성 패키지', amount: '₩145,000', status: '환불 심사 승인 대기중' }
  ],
  reviews: [
    { id: 'rev-501', course: 'Docker & Docker Compose 컨테이너 인프라 완전 정복', rating: 5, comment: '컨테이너 구성 및 마이크로서비스 실습용으로 최고입니다.' },
    { id: 'rev-502', course: 'TypeScript 핵심 문법 바이블', rating: 4, comment: '자바스크립트 개발자 필수 강좌입니다.' }
  ],
  coupons: [
    { id: 'coup-601', code: 'EDU_WELCOME_30', discount: '30% 즉시 할인', expiry: '2026-08-31' },
    { id: 'coup-602', code: 'DEV_SPECIAL_50', discount: '50% 강좌 할인', expiry: '2026-08-15' }
  ],
  wishlist: [
    { id: 'wish-701', course: 'AWS 클라우드 아키텍트 핵심 자격증 가이드', level: '중급', price: '₩150,000' },
    { id: 'wish-702', course: 'Rust 프로그래밍 언어 디자인 실전 프로토타이핑', level: '고급', price: '₩220,000' }
  ],
  support: [
    { id: 'sup-801', subject: '영수증 발송 문의', question: '회사 제출용 영수증 이메일 재발송을 요청드립니다.', status: '답변 완료' },
    { id: 'sup-802', subject: '동영상 스트리밍 끊김 현상', question: '3강 크롬 브라우저 재생 시 끊김이 심합니다.', status: '상담 검토중' }
  ],
  analytics: [
    { id: 'anal-901', week: '7월 3주차 학습 분석', hours: 14.5, progress: '목표치 94% 달성' },
    { id: 'anal-902', week: '7월 4주차 학습 분석', hours: 18.2, progress: '목표치 105% 달성' }
  ],
  exports: [
    { id: 'exp-001', filename: '2026_Q2_학습_진도율_종합보고서.xlsx', format: 'Excel (XLSX)', created: '2026-07-29' },
    { id: 'exp-002', filename: '진로_커리어_패스포트_포트폴리오.pdf', format: 'PDF', created: '2026-07-28' }
  ],
  search: [
    { id: 'course-991', course: 'Spring Boot와 JPA 활용 엔터프라이즈 서버 아키텍처', instructor: '김철수 교수', lectures: 42 },
    { id: 'course-992', course: '풀스택 리액트 마스터 코스', instructor: '김철수 교수', lectures: 36 }
  ]
};

// Check if user session cached permission is active (Vulnerable)
const checkSessionPermission = (resource) => {
  return (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || 'sess-student-lms8';
    const session = sessionStore[sessionId];

    if (!session) {
      return res.status(403).json({ error: '액세스 거부: 세션이 올바르지 않습니다.' });
    }

    const hasPermission = session.cachedPermissions[resource];
    if (!hasPermission) {
      return res.status(403).json({ error: `접근 제한: ${resource} 기능 사용 권한이 부족합니다.` });
    }

    next();
  };
};

// Check live DB permission directly (Safe)
const checkLivePermission = (resource) => {
  return (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || 'sess-student-lms8';
    const session = sessionStore[sessionId];

    if (!session || !userDB[session.role]) {
      return res.status(403).json({ error: '액세스 거부: 세션이 올바르지 않습니다.' });
    }

    const hasPermission = userDB[session.role].permissions[resource];
    if (!hasPermission) {
      return res.status(403).json({ error: `접근 제한: ${resource} 기능 사용 권한이 부족합니다.` });
    }

    next();
  };
};

// Standard API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/session/users', (req, res) => {
  res.json({
    sessions: {
      student: 'sess-student-lms8',
      instructor: 'sess-instructor-lms8',
      admin: 'sess-admin-lms8'
    },
    users: userDB
  });
});

app.post('/api/session/switch-user', (req, res) => {
  const { user } = req.body;
  if (userDB[user]) {
    return res.json({ success: true, sessionId: `sess-${user}-lms8` });
  }
  res.status(400).json({ error: '존재하지 않는 유저입니다.' });
});

app.get('/api/system/status', (req, res) => {
  res.json({
    sessions: {
      student: 'sess-student-lms8',
      instructor: 'sess-instructor-lms8',
      admin: 'sess-admin-lms8'
    },
    permissions: {
      student: userDB.student.permissions,
      instructor: userDB.instructor.permissions
    }
  });
});

app.post('/api/system/sync-session', (req, res) => {
  const { sessionId } = req.body;
  const session = sessionStore[sessionId];
  if (session && userDB[session.role]) {
    session.cachedPermissions = { ...userDB[session.role].permissions };
    return res.json({ success: true });
  }
  res.status(400).json({ error: '세션을 찾을 수 없습니다.' });
});

app.post('/api/admin/grant-permission', (req, res) => {
  const { role, resource } = req.body;
  if (userDB[role] && userDB[role].permissions[resource] !== undefined) {
    userDB[role].permissions[resource] = true;
    return res.json({ success: true });
  }
  res.status(400).json({ error: '잘못된 인자값입니다.' });
});

app.post('/api/admin/toggle-permission', (req, res) => {
  const { role, resource, state } = req.body;
  if (userDB[role] && userDB[role].permissions[resource] !== undefined) {
    userDB[role].permissions[resource] = state;
    return res.json({ success: true });
  }
  res.status(400).json({ error: '잘못된 인자값입니다.' });
});

app.post('/api/admin/revoke-permission', (req, res) => {
  const { role, resource } = req.body;
  if (userDB[role] && userDB[role].permissions[resource] !== undefined) {
    userDB[role].permissions[resource] = false;
    return res.json({ success: true });
  }
  res.status(400).json({ error: '잘못된 인자값입니다.' });
});

// Helper response generator
const sendTelemetryResponse = (req, res, resource, data) => {
  const sessionId = req.headers['x-session-id'] || 'sess-student-lms8';
  const session = sessionStore[sessionId];
  res.json({
    role: session.role,
    endpoint: req.originalUrl,
    status: 200,
    sessionId,
    data
  });
};

// 1. notifications API
// INTENTIONAL BACKEND BUG: site008-bug01
// CSV: SEC-071
// Type: Permission Drift
// Description: Notifications 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/notifications', checkSessionPermission('notifications'), (req, res) => {
  sendTelemetryResponse(req, res, 'notifications', lmsData.notifications);
});
app.get('/api/me/notifications', checkSessionPermission('notifications'), (req, res) => {
  sendTelemetryResponse(req, res, 'notifications', lmsData.notifications);
});

// 2. payments API
// INTENTIONAL BACKEND BUG: site008-bug02
// CSV: SEC-072
// Type: Permission Drift
// Description: Payments 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/payments', checkSessionPermission('payments'), (req, res) => {
  sendTelemetryResponse(req, res, 'payments', lmsData.payments);
});
app.get('/api/me/payments', checkSessionPermission('payments'), (req, res) => {
  sendTelemetryResponse(req, res, 'payments', lmsData.payments);
});

// 3. shipping API
// INTENTIONAL BACKEND BUG: site008-bug03
// CSV: SEC-073
// Type: Permission Drift
// Description: Book Shipping 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/shipping', checkSessionPermission('shipping'), (req, res) => {
  sendTelemetryResponse(req, res, 'shipping', lmsData.shipping);
});
app.get('/api/me/shipping', checkSessionPermission('shipping'), (req, res) => {
  sendTelemetryResponse(req, res, 'shipping', lmsData.shipping);
});

// 4. returns API
// INTENTIONAL BACKEND BUG: site008-bug04
// CSV: SEC-074
// Type: Permission Drift
// Description: Refund 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/returns', checkSessionPermission('returns'), (req, res) => {
  sendTelemetryResponse(req, res, 'returns', lmsData.returns);
});
app.get('/api/me/returns', checkSessionPermission('returns'), (req, res) => {
  sendTelemetryResponse(req, res, 'returns', lmsData.returns);
});

// 5. reviews API
// INTENTIONAL BACKEND BUG: site008-bug05
// CSV: SEC-075
// Type: Permission Drift
// Description: Reviews 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/reviews', checkSessionPermission('reviews'), (req, res) => {
  sendTelemetryResponse(req, res, 'reviews', lmsData.reviews);
});
app.get('/api/me/reviews', checkSessionPermission('reviews'), (req, res) => {
  sendTelemetryResponse(req, res, 'reviews', lmsData.reviews);
});

// 6. coupons API
// INTENTIONAL BACKEND BUG: site008-bug06
// CSV: SEC-076
// Type: Permission Drift
// Description: Coupons 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/coupons', checkSessionPermission('coupons'), (req, res) => {
  sendTelemetryResponse(req, res, 'coupons', lmsData.coupons);
});
app.get('/api/me/coupons', checkSessionPermission('coupons'), (req, res) => {
  sendTelemetryResponse(req, res, 'coupons', lmsData.coupons);
});

// 7. wishlist API
// INTENTIONAL BACKEND BUG: site008-bug07
// CSV: SEC-077
// Type: Permission Drift
// Description: Wishlist 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/wishlist', checkSessionPermission('wishlist'), (req, res) => {
  sendTelemetryResponse(req, res, 'wishlist', lmsData.wishlist);
});
app.get('/api/me/wishlist', checkSessionPermission('wishlist'), (req, res) => {
  sendTelemetryResponse(req, res, 'wishlist', lmsData.wishlist);
});

// 8. support API
// INTENTIONAL BACKEND BUG: site008-bug08
// CSV: SEC-078
// Type: Permission Drift
// Description: Support 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/support', checkSessionPermission('support'), (req, res) => {
  sendTelemetryResponse(req, res, 'support', lmsData.support);
});
app.get('/api/me/support', checkSessionPermission('support'), (req, res) => {
  sendTelemetryResponse(req, res, 'support', lmsData.support);
});

// 9. analytics API
// INTENTIONAL BACKEND BUG: site008-bug09
// CSV: SEC-079
// Type: Permission Drift
// Description: Learning Analytics 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/analytics', checkSessionPermission('analytics'), (req, res) => {
  sendTelemetryResponse(req, res, 'analytics', lmsData.analytics);
});
app.get('/api/me/analytics', checkSessionPermission('analytics'), (req, res) => {
  sendTelemetryResponse(req, res, 'analytics', lmsData.analytics);
});

// 10. exports API
// INTENTIONAL BACKEND BUG: site008-bug10
// CSV: SEC-080
// Type: Permission Drift
// Description: Export Reports 권한이 회수된 이후에도 Session Permission Cache를 사용하여 기존 세션 접근을 허용한다.
app.get('/api/exports', checkSessionPermission('exports'), (req, res) => {
  sendTelemetryResponse(req, res, 'exports', lmsData.exports);
});
app.get('/api/me/exports', checkSessionPermission('exports'), (req, res) => {
  sendTelemetryResponse(req, res, 'exports', lmsData.exports);
});

// Normal/Safe APIs for comparison
app.get('/api/safe/notifications', checkLivePermission('notifications'), (req, res) => {
  sendTelemetryResponse(req, res, 'notifications', lmsData.notifications);
});

app.get('/api/safe/analytics', checkLivePermission('analytics'), (req, res) => {
  sendTelemetryResponse(req, res, 'analytics', lmsData.analytics);
});

// Search API (Instructor search, etc.)
app.get('/api/search', checkSessionPermission('exports'), (req, res) => {
  const q = req.query.q || '';
  const filtered = lmsData.search.filter(item => 
    item.course.toLowerCase().includes(q.toLowerCase()) || 
    item.instructor.toLowerCase().includes(q.toLowerCase())
  );
  sendTelemetryResponse(req, res, 'exports', filtered);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
