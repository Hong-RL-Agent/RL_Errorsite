import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9908;

app.use(express.json());

// Mock Users Database
const users = {
  admin: {
    userId: 'admin',
    name: '시스템 총괄 관리자',
    role: 'admin'
  },
  employee: {
    userId: 'employee',
    name: 'PB 금융기획 담당자',
    role: 'employee'
  },
  customer: {
    userId: 'customer',
    name: '가나다 프리미엄 고객',
    role: 'customer'
  }
};

// Global User Permissions Database
// Managed by Administrator in real-time.
const userPermissions = {
  admin: {
    imports: true,
    documents: true,
    teams: true,
    roles: true,
    auditLogs: true,
    subscriptions: true,
    devices: true,
    apiKeys: true,
    webhooks: true,
    jobs: true
  },
  employee: {
    imports: false,
    documents: false,
    teams: false,
    roles: false,
    auditLogs: false,
    subscriptions: false,
    devices: false,
    apiKeys: false,
    webhooks: false,
    jobs: false
  },
  customer: {
    imports: false,
    documents: false,
    teams: false,
    roles: false,
    auditLogs: false,
    subscriptions: false,
    devices: false,
    apiKeys: false,
    webhooks: false,
    jobs: false
  }
};

// Active sessions storage
// In a secure application, session cached permissions should be updated or invalidated
// when user privileges are revoked in the central system.
// Here we simulate the bug where sessions retain cached permissions.
const sessionStore = {
  'sess-admin-init': {
    sessionId: 'sess-admin-init',
    userId: 'admin',
    role: 'admin',
    permissionCache: { ...userPermissions.admin }
  },
  'sess-employee-init': {
    sessionId: 'sess-employee-init',
    userId: 'employee',
    role: 'employee',
    permissionCache: { ...userPermissions.employee }
  },
  'sess-customer-init': {
    sessionId: 'sess-customer-init',
    userId: 'customer',
    role: 'customer',
    permissionCache: { ...userPermissions.customer }
  }
};

// Mock Protected Resources Data
const bankData = {
  imports: [
    { id: 'IMP-001', date: '2026-08-01', name: '상반기 법인 거래내역 임포트', count: 142, status: '완료' },
    { id: 'IMP-002', date: '2026-08-02', name: '해외 송금 내역 일괄 업로드', count: 28, status: '완료' }
  ],
  documents: [
    { id: 'DOC-001', title: '2026년 기업 신용등급 평가서', category: '금융보고서', date: '2026-07-15' },
    { id: 'DOC-002', title: '외환 거래 기본 약정서 (프리미엄)', category: '계약서', date: '2026-07-20' }
  ],
  teams: [
    { id: 'TEAM-001', teamName: '홍길동 가족 금융 그룹', memberCount: 4, totalAssets: '₩1,240,000,000' },
    { id: 'TEAM-002', teamName: '이철수 패밀리 모임 통장', memberCount: 3, totalAssets: '₩450,000,000' }
  ],
  roles: [
    { roleId: 'admin', name: '시스템 총괄 관리자', desc: '모든 시스템 관리 및 권한 부여/회수' },
    { roleId: 'employee', name: 'PB 금융기획 담당자', desc: '고객 정보 관리 및 금융 상품 처리' },
    { roleId: 'customer', name: '프리미엄 고객', desc: '개인 자산 조회 및 기본 금융 거래' }
  ],
  auditLogs: [
    { id: 'LOG-881', timestamp: '2026-08-02 11:24:15', actor: 'employee', action: '고객 자산 조회', ip: '192.168.1.45' },
    { id: 'LOG-882', timestamp: '2026-08-02 11:45:30', actor: 'admin', action: '시스템 권한 테이블 업데이트', ip: '192.168.1.2' }
  ],
  subscriptions: [
    { id: 'SUB-001', service: '프리미엄 자산 포트폴리오 정기 구독', amount: '₩55,000/월', nextDate: '2026-08-15' },
    { id: 'SUB-002', service: '외환 시장 실시간 리포트 알림', amount: '₩12,000/월', nextDate: '2026-08-20' }
  ],
  devices: [
    { id: 'DEV-301', deviceName: 'iPhone 15 Pro Max (본인 기기)', registeredDate: '2025-10-12', status: '승인 완료' },
    { id: 'DEV-302', deviceName: 'MacBook Pro 16 (인증 기기)', registeredDate: '2026-01-20', status: '승인 완료' }
  ],
  apiKeys: [
    { id: 'KEY-901', name: '오픈뱅킹 조회용 API Key', keyPrefix: 'ob_live_83fa...', created: '2026-03-10' },
    { id: 'KEY-902', name: '카드 거래 승인 알림 Key', keyPrefix: 'card_sync_491d...', created: '2026-05-18' }
  ],
  webhooks: [
    { id: 'WH-701', url: 'https://api.myfinance.com/v1/alerts', events: '이체 완료, 거액 거래 감지', status: '활성화' },
    { id: 'WH-702', url: 'https://api.myfinance.com/v1/security', events: '비밀번호 변경, 기기 등록', status: '활성화' }
  ],
  jobs: [
    { id: 'JOB-001', jobName: '매월 5일 적금 자동 이체', amount: '₩1,000,000', schedule: '매월 5일 10:00' },
    { id: 'JOB-002', jobName: '부모님 생활비 예약 이체', amount: '₩500,000', schedule: '매월 25일 09:00' }
  ]
};

// Help Helper to generate session ID
const generateSessionId = (userId) => {
  return `sess-${userId}-${Math.random().toString(36).substring(2, 9)}`;
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Users List
app.get('/api/session/users', (req, res) => {
  res.json(Object.values(users));
});

// Switch User / Login Simulation
app.post('/api/session/switch-user', (req, res) => {
  const { userId } = req.body;
  if (!users[userId]) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }
  
  const sessionId = generateSessionId(userId);
  sessionStore[sessionId] = {
    sessionId,
    userId,
    role: users[userId].role,
    // Copy active permissions database to session cache at logon time
    permissionCache: { ...userPermissions[userId] }
  };

  res.json({
    sessionId,
    userId,
    role: users[userId].role,
    permissionCache: sessionStore[sessionId].permissionCache
  });
});

// Get all permissions state (open for control panel display)
app.get('/api/admin/permissions-state', (req, res) => {
  res.json({
    userPermissions,
    sessionStore
  });
});

// Grant Permission API (Admin Only)
app.post('/api/admin/grant-permission', (req, res) => {
  const { userId, permission } = req.body;
  
  // Verify Admin session (normally checked via headers)
  const authSessionId = req.headers['x-session-id'];
  const session = sessionStore[authSessionId];
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다. 관리자만 수행 가능합니다.' });
  }

  if (!userPermissions[userId]) {
    return res.status(404).json({ error: '해당 대상을 찾을 수 없습니다.' });
  }

  // Update central user database permissions
  userPermissions[userId][permission] = true;

  // Real-world insecure logic: We do NOT sync existing sessions or invalidate them.
  // However, for the user to transition to "Granted" state in the test flow,
  // we CAN optionally update active sessions during GRANT so they don't have to relogin,
  // but we strictly DO NOT sync during REVOKE. Or we can update for both if it's safe, 
  // but the bug requires drift on REVOKE. 
  // To make it easy for testing: we update the active session's cache immediately on GRANT,
  // but we DO NOT update it on REVOKE. This creates the perfect "drift" state after revoke.
  Object.values(sessionStore).forEach(sess => {
    if (sess.userId === userId) {
      sess.permissionCache[permission] = true;
    }
  });

  res.json({ success: true, userPermissions: userPermissions[userId] });
});

// Revoke Permission API (Admin Only)
app.post('/api/admin/revoke-permission', (req, res) => {
  const { userId, permission } = req.body;

  const authSessionId = req.headers['x-session-id'];
  const session = sessionStore[authSessionId];
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ error: '권한이 없습니다. 관리자만 수행 가능합니다.' });
  }

  if (!userPermissions[userId]) {
    return res.status(404).json({ error: '해당 대상을 찾을 수 없습니다.' });
  }

  // Revoke permission in the central user permissions database
  userPermissions[userId][permission] = false;

  // VULNERABILITY SIMULATION: We DO NOT sync or invalidate the active sessions' permissionCache.
  // This causes the existing session to retain the old 'true' permission.

  res.json({ success: true, userPermissions: userPermissions[userId] });
});

// Individual endpoints (/api/me/...) return private mock data and do not require special admin permissions
app.get('/api/me/imports', (req, res) => {
  res.json([{ id: 'ME-IMP-001', name: '내 개인 통장 이체내역.csv', count: 12, status: '완료' }]);
});
app.get('/api/me/documents', (req, res) => {
  res.json([{ id: 'ME-DOC-001', title: '개인 정보 활용 동의서', category: '동의서', date: '2026-08-01' }]);
});
app.get('/api/me/teams', (req, res) => {
  res.json([{ id: 'ME-TEAM-001', teamName: '우리집 생활비 모임', memberCount: 2 }]);
});
app.get('/api/me/roles', (req, res) => {
  res.json([{ roleId: 'customer', name: '개인 고객' }]);
});
app.get('/api/me/audit-logs', (req, res) => {
  res.json([{ id: 'ME-LOG-01', timestamp: '2026-08-02 12:00:00', action: '로그인 완료', ip: '127.0.0.1' }]);
});
app.get('/api/me/subscriptions', (req, res) => {
  res.json([{ id: 'ME-SUB-01', service: '휴대폰 문자 알림 서비스', amount: '₩900/월' }]);
});
app.get('/api/me/devices', (req, res) => {
  res.json([{ id: 'ME-DEV-01', deviceName: '내 안드로이드 폰', registeredDate: '2026-02-15' }]);
});
app.get('/api/me/api-keys', (req, res) => {
  res.json([{ id: 'ME-KEY-01', name: '테스트용 API Key', keyPrefix: 'test_key...' }]);
});
app.get('/api/me/webhooks', (req, res) => {
  res.json([{ id: 'ME-WH-01', url: 'https://localhost/local-callback', events: '인증' }]);
});
app.get('/api/me/jobs', (req, res) => {
  res.json([{ id: 'ME-JOB-01', jobName: '적금 만기 이체', amount: '₩3,000,000' }]);
});

// VULNERABLE ENDPOINTS (SEC-081 ~ SEC-090)

// INTENTIONAL BACKEND BUG: site009-bug01
// CSV: SEC-081
// Type: Permission Drift
// Description: 거래내역 Import 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/imports', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.imports) {
    return res.status(403).json({ error: '거래내역 가져오기 권한이 없습니다.' });
  }
  res.json(bankData.imports);
});

// INTENTIONAL BACKEND BUG: site009-bug02
// CSV: SEC-082
// Type: Permission Drift
// Description: 전자문서 조회 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/documents', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.documents) {
    return res.status(403).json({ error: '전자문서 조회 권한이 없습니다.' });
  }
  res.json(bankData.documents);
});

// INTENTIONAL BACKEND BUG: site009-bug03
// CSV: SEC-083
// Type: Permission Drift
// Description: 가족 금융 관리 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/teams', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.teams) {
    return res.status(403).json({ error: '가족 금융 권한이 없습니다.' });
  }
  res.json(bankData.teams);
});

// INTENTIONAL BACKEND BUG: site009-bug04
// CSV: SEC-084
// Type: Permission Drift
// Description: 권한 관리 기능을 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/roles', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.roles) {
    return res.status(403).json({ error: '역할 정보 조회 권한이 없습니다.' });
  }
  res.json(bankData.roles);
});

// INTENTIONAL BACKEND BUG: site009-bug05
// CSV: SEC-085
// Type: Permission Drift
// Description: 감사 로그 조회 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/audit-logs', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.auditLogs) {
    return res.status(403).json({ error: '감사 로그 조회 권한이 없습니다.' });
  }
  res.json(bankData.auditLogs);
});

// INTENTIONAL BACKEND BUG: site009-bug06
// CSV: SEC-086
// Type: Permission Drift
// Description: 자동이체 및 금융 구독 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/subscriptions', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.subscriptions) {
    return res.status(403).json({ error: '구독 관리 권한이 없습니다.' });
  }
  res.json(bankData.subscriptions);
});

// INTENTIONAL BACKEND BUG: site009-bug07
// CSV: SEC-087
// Type: Permission Drift
// Description: 등록 기기 조회 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/devices', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.devices) {
    return res.status(403).json({ error: '등록 기기 조회 권한이 없습니다.' });
  }
  res.json(bankData.devices);
});

// INTENTIONAL BACKEND BUG: site009-bug08
// CSV: SEC-088
// Type: Permission Drift
// Description: 오픈뱅킹 API Key 조회 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/api-keys', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.apiKeys) {
    return res.status(403).json({ error: 'API Key 관리 권한이 없습니다.' });
  }
  res.json(bankData.apiKeys);
});

// INTENTIONAL BACKEND BUG: site009-bug09
// CSV: SEC-089
// Type: Permission Drift
// Description: 금융 알림(Webhook) 조회 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/webhooks', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.webhooks) {
    return res.status(403).json({ error: '금융 웹훅 관리 권한이 없습니다.' });
  }
  res.json(bankData.webhooks);
});

// INTENTIONAL BACKEND BUG: site009-bug10
// CSV: SEC-090
// Type: Permission Drift
// Description: 예약이체 작업 조회 권한이 회수되었지만 Session Permission Cache를 사용하여 기존 Session 접근을 허용한다.
app.get('/api/jobs', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  if (!session.permissionCache.jobs) {
    return res.status(403).json({ error: '예약이체 작업 관리 권한이 없습니다.' });
  }
  res.json(bankData.jobs);
});


// SAFE ENDPOINTS FOR COMPARISON (Checking real-time global database)

app.get('/api/safe/imports', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  
  // Safe validation: Checks central userPermissions in real-time
  const hasRealtimePermission = userPermissions[session.userId] && userPermissions[session.userId].imports;
  if (!hasRealtimePermission) {
    return res.status(403).json({ error: '보안 정책에 따라 즉시 차단되었습니다: 거래내역 가져오기 권한 없음.' });
  }
  res.json(bankData.imports);
});

app.get('/api/safe/jobs', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessionStore[sessionId];
  if (!session) {
    return res.status(401).json({ error: '인증 세션이 유효하지 않습니다.' });
  }
  
  // Safe validation: Checks central userPermissions in real-time
  const hasRealtimePermission = userPermissions[session.userId] && userPermissions[session.userId].jobs;
  if (!hasRealtimePermission) {
    return res.status(403).json({ error: '보안 정책에 따라 즉시 차단되었습니다: 예약이체 작업 관리 권한 없음.' });
  }
  res.json(bankData.jobs);
});


// Serve React build outputs statically
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
