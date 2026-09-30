import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9903;

app.use(express.json());

// Mock session user states (defaults to regular user)
let currentSessionUser = 'user'; // 'admin' or 'user'

const users = [
  { id: 'user', name: '정지원 대리', role: 'user', department: '영업지원본부' },
  { id: 'admin', name: '김형석 실장', role: 'admin', department: '경영혁신실' }
];

// Mock Datasets

// Standard/Personal User Datasets
const userOrders = [
  { id: 'ord-101', item: '사무용 멀티탭 5구 3개', total: '₩45,000', status: '배송 완료', date: '2026-07-28' },
  { id: 'ord-102', item: '인체공학 무소음 마우스 1개', total: '₩32,000', status: '준비 중', date: '2026-07-29' }
];
const userProfile = { id: 'usr-prof', phone: '010-4829-1029', email: 'jw.jung@corporation.com', duty: '일반 실무 사원' };
const userReports = [
  { id: 'rep-101', name: '7월 3주차 개인 비품 청구 목록', generatedDate: '2026-07-22', status: '승인 완료' }
];
const userInvoices = [
  { id: 'inv-101', amount: '₩77,000', billingPeriod: '2026년 7월분', paymentStatus: '결제 완료' }
];
const userFiles = [
  { id: 'file-101', filename: '비품청구신청서_정지원.pdf', size: '1.2 MB', uploadDate: '2026-07-22' }
];
const userMessages = [
  { id: 'msg-101', sender: '인사노무팀', subject: '정기 소방안전교육 참석 안내', content: '7월 30일 오후 3시 대회의실에서 정기 소방 교육이 진행되니 참석 바랍니다.', receivedAt: '2026-07-28 10:00' }
];
const userAppointments = [
  { id: 'apt-101', type: '인사 평가 면담', time: '2026-08-05 14:00', status: '예정됨' }
];
const userCart = { id: 'crt-101', items: [{ name: '사무용 복사지 A4 1Box', qty: 2, price: '₩28,000' }] };
const userCheckout = { id: 'chk-101', status: '결제 수단 확인', estimatedDelivery: '2026-08-01' };

// Secured Administrative Datasets (Protected)
const adminOrders = [
  { id: 'adm-ord-901', item: '워크스테이션용 제온 서버 2대', total: '₩12,450,000', status: '세관 통과', date: '2026-07-20' },
  { id: 'adm-ord-902', item: '지사 교체용 스마트 도어록 24개', total: '₩4,800,000', status: '설치 대기', date: '2026-07-25' }
];
const adminProfile = { id: 'adm-prof', phone: '010-8912-8821', email: 'hs.kim@corporation.com', duty: '전사 인프라 총괄 최고관리자' };
const adminReports = [
  { id: 'adm-rep-901', name: 'Q2 전사 서버 유지보수 비용 산정 보고서', generatedDate: '2026-07-15', status: '최종 결재 완료' },
  { id: 'adm-rep-902', name: '전사 기술 자산 실사 및 상각 평가 보고서', generatedDate: '2026-07-18', status: '대기 중' }
];
const adminInvoices = [
  { id: 'adm-inv-901', amount: '₩17,250,000', billingPeriod: '2026년 2분기 통합', paymentStatus: '결제 승인 완료' }
];
const adminFiles = [
  { id: 'adm-file-901', filename: '서버룸_출입통제_보안규정_v4.pdf', size: '14.8 MB', uploadDate: '2026-07-10' },
  { id: 'adm-file-902', filename: '임직원_개인정보_파기대장_2026.xlsx', size: '2.4 MB', uploadDate: '2026-07-22' }
];
const adminMessages = [
  { id: 'adm-msg-901', sender: '대표이사', subject: '보안 통제 정책 강화 권고', content: '최근 외부 감사 지적 사항에 따라 각 부서 서버 액세스 토큰 관리 실태 조사를 시행해 주세요.', receivedAt: '2026-07-29 09:30' }
];
const adminAppointments = [
  { id: 'adm-apt-901', type: '전사 인프라 이중화 관련 업체 미팅', time: '2026-08-10 11:00', status: '일정 확인됨' }
];
const adminCart = { id: 'adm-crt-901', items: [{ name: '고성능 보안 스위치 허브 L3', qty: 4, price: '₩2,200,000' }] };
const adminCheckout = { id: 'adm-chk-901', status: '법인카드 한도 승인 대기', estimatedDelivery: '2026-08-05' };

// Helpers
const getSessionRole = () => currentSessionUser;

// Required API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'admin-erp-backend' });
});

// 2. GET /api/session/users
app.get('/api/session/users', (req, res) => {
  res.json(users);
});

// 3. POST /api/session/switch-user
app.post('/api/session/switch-user', (req, res) => {
  const { userId } = req.body;
  if (users.find(u => u.id === userId)) {
    currentSessionUser = userId;
    return res.status(200).json({ status: 'success', activeUser: currentSessionUser });
  }
  res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
});

// 4. GET /api/me/summary
app.get('/api/me/summary', (req, res) => {
  const activeUser = currentSessionUser;
  const userDetails = users.find(u => u.id === activeUser);
  res.json({
    user: userDetails,
    ordersCount: activeUser === 'admin' ? adminOrders.length : userOrders.length,
    reportsCount: activeUser === 'admin' ? adminReports.length : userReports.length,
    filesCount: activeUser === 'admin' ? adminFiles.length : userFiles.length
  });
});

// 5. GET /api/me/orders
app.get('/api/me/orders', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminOrders : userOrders);
});

// 6. GET /api/me/profile
app.get('/api/me/profile', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminProfile : userProfile);
});

// 7. GET /api/me/reports
app.get('/api/me/reports', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminReports : userReports);
});

// 8. GET /api/me/invoices
app.get('/api/me/invoices', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminInvoices : userInvoices);
});

// 9. GET /api/me/files
app.get('/api/me/files', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminFiles : userFiles);
});

// 10. GET /api/me/messages
app.get('/api/me/messages', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminMessages : userMessages);
});

// 11. GET /api/me/appointments
app.get('/api/me/appointments', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminAppointments : userAppointments);
});

// 12. GET /api/me/cart
app.get('/api/me/cart', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminCart : userCart);
});

// 13. GET /api/me/checkout
app.get('/api/me/checkout', (req, res) => {
  res.json(currentSessionUser === 'admin' ? adminCheckout : userCheckout);
});


// ==========================================
// VULNERABLE ADMIN ENDPOINTS (INTENTIONAL BUGS)
// ==========================================

// 14. GET /api/admin/orders
// INTENTIONAL BACKEND BUG: site004-bug01
// CSV: SEC-031
// Type: Vertical Privilege Escalation
// Description: 관리자 Orders API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/orders', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/orders',
    status: 200,
    protected_data: adminOrders
  });
});

// 15. GET /api/admin/profile
// INTENTIONAL BACKEND BUG: site004-bug02
// CSV: SEC-032
// Type: Vertical Privilege Escalation
// Description: 관리자 Profile API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/profile', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/profile',
    status: 200,
    protected_data: adminProfile
  });
});

// 16. GET /api/admin/reports
// INTENTIONAL BACKEND BUG: site004-bug03
// CSV: SEC-033
// Type: Vertical Privilege Escalation
// Description: 관리자 Reports API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/reports', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/reports',
    status: 200,
    protected_data: adminReports
  });
});

// 17. GET /api/admin/invoices
// INTENTIONAL BACKEND BUG: site004-bug04
// CSV: SEC-034
// Type: Vertical Privilege Escalation
// Description: 관리자 Invoices API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/invoices', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/invoices',
    status: 200,
    protected_data: adminInvoices
  });
});

// 18. GET /api/admin/files
// INTENTIONAL BACKEND BUG: site004-bug05
// CSV: SEC-035
// Type: Vertical Privilege Escalation
// Description: 관리자 Files API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/files', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/files',
    status: 200,
    protected_data: adminFiles
  });
});

// 19. GET /api/admin/messages
// INTENTIONAL BACKEND BUG: site004-bug06
// CSV: SEC-036
// Type: Vertical Privilege Escalation
// Description: 관리자 Messages API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/messages', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/messages',
    status: 200,
    protected_data: adminMessages
  });
});

// 20. GET /api/admin/appointments
// INTENTIONAL BACKEND BUG: site004-bug07
// CSV: SEC-037
// Type: Vertical Privilege Escalation
// Description: 관리자 Appointments API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/appointments', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/appointments',
    status: 200,
    protected_data: adminAppointments
  });
});

// 21. GET /api/admin/cart
// INTENTIONAL BACKEND BUG: site004-bug08
// CSV: SEC-038
// Type: Vertical Privilege Escalation
// Description: 관리자 Cart API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/cart', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/cart',
    status: 200,
    protected_data: adminCart
  });
});

// 22. GET /api/admin/checkout
// INTENTIONAL BACKEND BUG: site004-bug09
// CSV: SEC-039
// Type: Vertical Privilege Escalation
// Description: 관리자 Checkout API에서 role 검증을 수행하지 않아 일반 사용자가 관리자 데이터를 조회할 수 있음.
app.get('/api/admin/checkout', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/checkout',
    status: 200,
    protected_data: adminCheckout
  });
});


// ==========================================
// SAFE REFERENCE ADMIN ENDPOINTS (ROLE CHECKED)
// ==========================================

// 23. GET /api/safe/admin/orders
app.get('/api/safe/admin/orders', (req, res) => {
  if (currentSessionUser !== 'admin') {
    return res.status(403).json({ error: '액세스 거부: 관리자 권한이 요구됩니다.' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/safe/admin/orders',
    status: 200,
    protected_data: adminOrders
  });
});

// 24. GET /api/safe/admin/reports
app.get('/api/safe/admin/reports', (req, res) => {
  if (currentSessionUser !== 'admin') {
    return res.status(403).json({ error: '액세스 거부: 관리자 권한이 요구됩니다.' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/safe/admin/reports',
    status: 200,
    protected_data: adminReports
  });
});

// Serve frontend build static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback routing for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
