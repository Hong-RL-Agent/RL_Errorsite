import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9904;

app.use(express.json());

// Mock session user states (defaults to regular seller)
let currentSessionUser = 'user'; // 'admin' or 'user' (seller)

const users = [
  { id: 'user', name: '스마트라이프 스토어 (판매자)', role: 'user', storeName: 'Smart Life' },
  { id: 'admin', name: '마켓 총괄 최고관리자 (Admin)', role: 'admin', storeName: 'Marketplace Operations' }
];

// Mock Datasets (Seller specific vs Admin broad datasets)

// Standard User (Seller) datasets
const sellerSearch = [
  { id: 'item-101', name: '친환경 무선 가습기', category: '생활가전', stock: 120, status: '판매중' },
  { id: 'item-102', name: '초고속 3in1 무선충전기', category: '디지털/가전', stock: 85, status: '판매중' }
];
const sellerNotifications = [
  { id: 'noti-101', type: '정산 안내', message: '2026년 7월 3주차 판매 정산 대금이 지급되었습니다.', date: '2026-07-28' },
  { id: 'noti-102', type: '재고 경고', message: '초고속 3in1 무선충전기 품목 재고가 10개 미만입니다.', date: '2026-07-29' }
];
const sellerPayments = [
  { id: 'pay-101', amount: '₩3,450,000', period: '2026-07-15 ~ 2026-07-22', status: '지급완료' }
];
const sellerShipping = [
  { id: 'ship-101', trackingNo: 'TRK-7829-1029', courier: 'CJ대한통운', status: '배송중', destination: '서울 강남구' },
  { id: 'ship-102', trackingNo: 'TRK-8921-2910', courier: '우체국택배', status: '배송완료', destination: '부산 해운대구' }
];
const sellerReturns = [
  { id: 'ret-101', reason: '단순변심', item: '친환경 무선 가습기 1개', refundAmount: '₩45,000', status: '반품승인' }
];
const sellerReviews = [
  { id: 'rev-101', product: '친환경 무선 가습기', rating: '★★★★★', comment: '디자인이 깔끔하고 분무량이 적절하네요.', writer: 'kim***' }
];
const sellerCoupons = [
  { id: 'cpn-101', name: '신규 스토어 찜 10% 쿠폰', discount: '10%', expiredAt: '2026-08-31', status: '활성' }
];
const sellerWishlist = [
  { id: 'wsh-101', product: '스마트 살균 텀블러', interestLevel: '상', targetStock: 50 }
];
const sellerSupport = [
  { id: 'supt-101', title: '배송지 변경 요청 문의', answered: '답변완료', date: '2026-07-28' }
];
const sellerAnalytics = [
  { id: 'stat-101', metric: '일일 스토어 유입수', value: '1,450 회', change: '+12.4%' },
  { id: 'stat-102', metric: '일일 결제 전환율', value: '4.8%', change: '+0.5%' }
];

// Admin (Global Marketplace Operations) datasets
const adminSearch = [
  { id: 'adm-item-901', name: '샤오미 로봇청소기 글로벌 에디션 (해외구매)', category: '대형가전', stock: 1500, status: '전사금지검토' },
  { id: 'adm-item-902', name: '애플 정품 맥북프로 16인치 M3 맥스', category: '디지털/가전', stock: 240, status: '직구특가운영' }
];
const adminNotifications = [
  { id: 'adm-noti-901', type: '전사 공지', message: '개인정보보호법 개정에 따른 판매자 정보 위탁 동의 의무화 고지.', date: '2026-07-25' },
  { id: 'adm-noti-902', type: '시스템 정검', message: '결제 게이트웨이(PG) 고도화 점검으로 인해 7/30 새벽 2~4시 결제가 일시 차단됩니다.', date: '2026-07-29' }
];
const adminPayments = [
  { id: 'adm-pay-901', amount: '₩1,894,500,000', period: '2026년 7월 전사 통합 매출 합산', status: '정산대기' }
];
const adminShipping = [
  { id: 'adm-ship-901', trackingNo: 'ADM-TRK-1002', courier: '전사통합 허브물류', status: '통관대기', destination: '인천물류센터' }
];
const adminReturns = [
  { id: 'adm-ret-901', reason: '초기불량 대량 접수 건', item: '맥북프로 16인치 외 14건', refundAmount: '₩42,500,000', status: '본사 심사중' }
];
const adminReviews = [
  { id: 'adm-rev-901', product: '애플 정품 맥북프로', rating: '★☆☆☆☆', comment: '화면에 불량화소가 너무 많아 반품 요청합니다.', writer: 'buyer_prime' }
];
const adminCoupons = [
  { id: 'adm-cpn-901', name: '마켓 전사 연쇄 7월 통합 기획 할인 쿠폰', discount: '₩10,000 일괄', expiredAt: '2026-07-31', status: '전사적용' }
];
const adminWishlist = [
  { id: 'adm-wsh-901', product: '삼성 OLED 8K TV 대형 스마트 스크린', interestLevel: '최상', targetStock: 300 }
];
const adminSupport = [
  { id: 'adm-supt-901', title: '입점 수수료율 인하 관련 정책 질의서', answered: '대기중', date: '2026-07-29' }
];
const adminAnalytics = [
  { id: 'adm-stat-901', metric: '전사 총 결제 총액 (GMV)', value: '₩12,450,200,000', change: '+8.7%' },
  { id: 'adm-stat-902', metric: '신규 셀러 유치 및 유지 비율', value: '94.2%', change: '+1.2%' }
];

// Helpers
const getSessionRole = () => currentSessionUser;

// Required API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'marketplace-seller-backend' });
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
  res.status(400).json({ error: '유효하지 않은 셀러/어드민 세션 아이디입니다.' });
});

// 4. GET /api/me/summary
app.get('/api/me/summary', (req, res) => {
  const activeUser = currentSessionUser;
  const userDetails = users.find(u => u.id === activeUser);
  res.json({
    user: userDetails,
    searchCount: activeUser === 'admin' ? adminSearch.length : sellerSearch.length,
    notificationsCount: activeUser === 'admin' ? adminNotifications.length : sellerNotifications.length,
    paymentsCount: activeUser === 'admin' ? adminPayments.length : sellerPayments.length
  });
});

// User self APIs
app.get('/api/me/search', (req, res) => { res.json(currentSessionUser === 'admin' ? adminSearch : sellerSearch); });
app.get('/api/me/notifications', (req, res) => { res.json(currentSessionUser === 'admin' ? adminNotifications : sellerNotifications); });
app.get('/api/me/payments', (req, res) => { res.json(currentSessionUser === 'admin' ? adminPayments : sellerPayments); });
app.get('/api/me/shipping', (req, res) => { res.json(currentSessionUser === 'admin' ? adminShipping : sellerShipping); });
app.get('/api/me/returns', (req, res) => { res.json(currentSessionUser === 'admin' ? adminReturns : sellerReturns); });
app.get('/api/me/reviews', (req, res) => { res.json(currentSessionUser === 'admin' ? adminReviews : sellerReviews); });
app.get('/api/me/coupons', (req, res) => { res.json(currentSessionUser === 'admin' ? adminCoupons : sellerCoupons); });
app.get('/api/me/wishlist', (req, res) => { res.json(currentSessionUser === 'admin' ? adminWishlist : sellerWishlist); });
app.get('/api/me/support', (req, res) => { res.json(currentSessionUser === 'admin' ? adminSupport : sellerSupport); });
app.get('/api/me/analytics', (req, res) => { res.json(currentSessionUser === 'admin' ? adminAnalytics : sellerAnalytics); });


// ==========================================
// VULNERABLE ADMIN ENDPOINTS (INTENTIONAL BUGS)
// ==========================================

// 15. GET /api/admin/search
// INTENTIONAL BACKEND BUG: site005-bug01
// CSV: SEC-040
// Type: Vertical Privilege Escalation
// Description: 관리자 Search API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 검색 목록을 조회할 수 있음.
app.get('/api/admin/search', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/search',
    status: 200,
    protected_data: adminSearch
  });
});

// 16. GET /api/admin/notifications
// INTENTIONAL BACKEND BUG: site005-bug02
// CSV: SEC-041
// Type: Vertical Privilege Escalation
// Description: 관리자 Notifications API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 알림 데이터를 조회할 수 있음.
app.get('/api/admin/notifications', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/notifications',
    status: 200,
    protected_data: adminNotifications
  });
});

// 17. GET /api/admin/payments
// INTENTIONAL BACKEND BUG: site005-bug03
// CSV: SEC-042
// Type: Vertical Privilege Escalation
// Description: 관리자 Payments API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 매출 정산 정보를 조회할 수 있음.
app.get('/api/admin/payments', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/payments',
    status: 200,
    protected_data: adminPayments
  });
});

// 18. GET /api/admin/shipping
// INTENTIONAL BACKEND BUG: site005-bug04
// CSV: SEC-043
// Type: Vertical Privilege Escalation
// Description: 관리자 Shipping API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 배송 현황 데이터를 조회할 수 있음.
app.get('/api/admin/shipping', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/shipping',
    status: 200,
    protected_data: adminShipping
  });
});

// 19. GET /api/admin/returns
// INTENTIONAL BACKEND BUG: site005-bug05
// CSV: SEC-044
// Type: Vertical Privilege Escalation
// Description: 관리자 Returns API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 반품 데이터를 조회할 수 있음.
app.get('/api/admin/returns', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/returns',
    status: 200,
    protected_data: adminReturns
  });
});

// 20. GET /api/admin/reviews
// INTENTIONAL BACKEND BUG: site005-bug06
// CSV: SEC-045
// Type: Vertical Privilege Escalation
// Description: 관리자 Reviews API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 상품 리뷰 관리 내역을 조회할 수 있음.
app.get('/api/admin/reviews', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/reviews',
    status: 200,
    protected_data: adminReviews
  });
});

// 21. GET /api/admin/coupons
// INTENTIONAL BACKEND BUG: site005-bug07
// CSV: SEC-046
// Type: Vertical Privilege Escalation
// Description: 관리자 Coupons API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 쿠폰 및 혜택 대장을 조회할 수 있음.
app.get('/api/admin/coupons', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/coupons',
    status: 200,
    protected_data: adminCoupons
  });
});

// 22. GET /api/admin/wishlist
// INTENTIONAL BACKEND BUG: site005-bug08
// CSV: SEC-047
// Type: Vertical Privilege Escalation
// Description: 관리자 Wishlist API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 상품 위시리스트 현황을 조회할 수 있음.
app.get('/api/admin/wishlist', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/wishlist',
    status: 200,
    protected_data: adminWishlist
  });
});

// 23. GET /api/admin/support
// INTENTIONAL BACKEND BUG: site005-bug09
// CSV: SEC-048
// Type: Vertical Privilege Escalation
// Description: 관리자 Support API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 1:1 고객문의 내역을 조회할 수 있음.
app.get('/api/admin/support', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/support',
    status: 200,
    protected_data: adminSupport
  });
});

// 24. GET /api/admin/analytics
// INTENTIONAL BACKEND BUG: site005-bug10
// CSV: SEC-049
// Type: Vertical Privilege Escalation
// Description: 관리자 Analytics API에서 role 검증을 수행하지 않아 일반 판매자가 관리자 분석 통계 데이터를 조회할 수 있음.
app.get('/api/admin/analytics', (req, res) => {
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/admin/analytics',
    status: 200,
    protected_data: adminAnalytics
  });
});


// ==========================================
// SAFE REFERENCE ADMIN ENDPOINTS (ROLE CHECKED)
// ==========================================

// 25. GET /api/safe/admin/search
app.get('/api/safe/admin/search', (req, res) => {
  if (currentSessionUser !== 'admin') {
    return res.status(403).json({ error: '액세스 거부: 관리자 권한이 만료되었거나 부족합니다.' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/safe/admin/search',
    status: 200,
    protected_data: adminSearch
  });
});

// 26. GET /api/safe/admin/payments
app.get('/api/safe/admin/payments', (req, res) => {
  if (currentSessionUser !== 'admin') {
    return res.status(403).json({ error: '액세스 거부: 관리자 권한이 만료되었거나 부족합니다.' });
  }
  res.status(200).json({
    role: getSessionRole(),
    request: '/api/safe/admin/payments',
    status: 200,
    protected_data: adminPayments
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
