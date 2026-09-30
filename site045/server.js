import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9944;

app.use(cors());
app.use(express.json());

// In-Memory Database
const db = {
  user: {
    id: 'user-401',
    name: '최현우',
    email: 'hyunwoo.passly@example.com',
    phone: '010-7712-9934',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-02-10'
  },
  plans: [
    {
      id: 'basic',
      name: 'Basic 플랜',
      monthlyPrice: 9900,
      yearlyPrice: 99000,
      description: '가장 핵심적인 디지털 스트리밍 & 아티클 무제한 이용',
      usageLimit: 50,
      features: ['기본 화질 스트리밍 (1080p)', '월 50회 콘텐츠 패스', '모바일/웹 지원', '기본 라이브러리']
    },
    {
      id: 'standard',
      name: 'Standard 플랜',
      monthlyPrice: 12900,
      yearlyPrice: 129000,
      description: '인기 클래스와 멀티 디바이스 동시 재생 지원',
      usageLimit: 120,
      features: ['FHD 고화질 재생', '월 120회 콘텐츠 패스', '2대 동시 접속', '오프라인 다운로드 20편']
    },
    {
      id: 'premium',
      name: 'Premium 플랜',
      monthlyPrice: 14900,
      yearlyPrice: 149000,
      description: '4K UHD 최고화질, VIP 독점 오리지널 & 무제한 다운로드',
      usageLimit: 300,
      features: ['4K UHD + HDR 공간 음향', '월 300회 프리미엄 패스', '4대 동시 접속', '무제한 오프라인 저장', 'VIP 독점 마스터 클래스']
    },
    {
      id: 'family',
      name: 'Family 플랜',
      monthlyPrice: 22900,
      yearlyPrice: 229000,
      description: '온 가족 최대 6개 독립 프로필 & 키즈 안심 모드',
      usageLimit: 600,
      features: ['최대 6개 독립 계정 생성', '월 600회 통합 패스', '키즈 안심 세이프가드', '가족 공유 클라우드 1TB']
    }
  ],
  coupons: [
    { code: 'WELCOME10', discountType: 'percent', discountValue: 10, validFrom: '2026-01-01', validUntil: '2026-12-31', status: 'valid', name: '신규 가입 환영 10% 할인' },
    { code: 'MONTHLY20', discountType: 'amount', discountValue: 5000, validFrom: '2026-01-01', validUntil: '2026-05-01', status: 'expired', name: '[만료됨] 봄맞이 5,000원 할인 쿠폰' },
    { code: 'SPRING15', discountType: 'percent', discountValue: 15, validFrom: '2026-03-01', validUntil: '2026-04-30', status: 'expired', name: '[만료됨] 시즌 스페셜 15% 쿠폰' }
  ],
  subscription: {
    id: 'sub-9901',
    planId: 'monthly-basic', // Currently on monthly plan
    planType: 'monthly',
    planName: 'Basic 플랜 (월간)',
    status: 'active', // active, paused, cancelled
    cancelAtPeriodEnd: false,
    currentPeriodStart: '2026-09-01T00:00:00Z',
    currentPeriodEnd: '2026-10-20T23:59:59Z',
    pricePaid: 9900,
    appliedCoupon: 'MONTHLY20', // Has stored expired coupon
    discountAmount: 5000
  },
  usage: {
    current: 18,
    limit: 50,
    history: [
      { id: 'u-1', title: '4K 자연 다큐멘터리 에피소드 1', date: '2026-09-24', cost: 1 },
      { id: 'u-2', title: '클라우드 AI 오디오 마스터링', date: '2026-09-25', cost: 2 }
    ]
  },
  entitlements: {
    basicAccess: true,
    hdStreaming: true,
    premiumLibrary: true, // Remains true after downgrade (SEC-410 bug)
    offlineDownloads: true,
    vipMasterclass: true
  },
  contents: [
    { id: 'cnt-01', title: '4K 오리지널 시네마: 우주 탐사', category: 'video', requiredPlan: 'basic', duration: '124분', thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', description: '생생한 4K 영상미로 만나는 인터스텔라 우주 대탐사' },
    { id: 'cnt-02', title: 'VIP 마스터클래스: 실전 AI 프로덕트 기획', category: 'course', requiredPlan: 'premium', duration: '8개 챕터', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80', description: '실리콘밸리 수석 PM이 전하는 2026 AI 프로덕트 마스터 가이드' },
    { id: 'cnt-03', title: '로파이 릴렉스 사운드 & 집중 브레인웨이브', category: 'music', requiredPlan: 'basic', duration: '무제한 스트리밍', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80', description: '업무와 학업 집중력을 200% 올려주는 힐링 바이노럴 비트' },
    { id: 'cnt-04', title: '프리미엄 오프라인 독점 매거진 10월호', category: 'article', requiredPlan: 'premium', duration: 'PDF/EPUB 제공', thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80', description: '글로벌 테크 트렌드와 디자인 인사이트를 집약한 프리미엄 리포트' }
  ],
  billingHistory: [
    { id: 'bill-101', date: '2026-09-01', planName: 'Basic 플랜 (월간)', amount: 4900, originalAmount: 9900, status: 'paid', method: '신용카드 (•••• 4821)' }
  ],
  paymentMethods: [
    { id: 'pm-01', cardName: '현대카드 M Edition', last4: '4821', expiry: '08/29', isDefault: true }
  ]
};

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Plans API
app.get('/api/plans', (req, res) => {
  res.json({ success: true, data: db.plans });
});

app.get('/api/plans/:id', (req, res) => {
  const plan = db.plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: '플랜이 없습니다.' });
  res.json({ success: true, data: plan });
});

// 3. Subscriptions & Plan Changes
app.get('/api/subscriptions/me', (req, res) => {
  res.json({ success: true, data: db.subscription });
});

// Proration Preview API with SEC-406
// INTENTIONAL BACKEND BUG: site045-SEC-406
// Subscription Proration Error:
// When calculating proration for Monthly -> Yearly plan change,
// the server refunds the ENTIRE previous monthly payment (9,900원) instead of calculating unused days,
// resulting in flawed final charge in preview and change execution.
app.get('/api/billing/preview', (req, res) => {
  const { newPlanId, newPlanType = 'yearly' } = req.query;
  const targetPlan = db.plans.find(p => p.id === newPlanId) || db.plans[2]; // Premium default
  const newPrice = newPlanType === 'yearly' ? targetPlan.yearlyPrice : targetPlan.monthlyPrice;

  // Bug logic: full deduction of previous payment (9,900) instead of prorated unused days
  const flawedProrationDeduction = db.subscription.pricePaid; 
  const finalAmountToCharge = Math.max(0, newPrice - flawedProrationDeduction);

  res.json({
    success: true,
    bugId: 'site045-SEC-406',
    secId: 'SEC-406',
    data: {
      currentPlan: db.subscription.planName,
      newPlan: `${targetPlan.name} (${newPlanType === 'yearly' ? '연간' : '월간'})`,
      newPrice,
      prorationCredit: flawedProrationDeduction,
      finalAmountToCharge,
      nextBillingDate: '2027-10-20'
    }
  });
});

// Change Plan API (SEC-406 and SEC-410)
// INTENTIONAL BACKEND BUG: site045-SEC-410
// Entitlement Synchronization Error:
// When downgrading from Premium to Basic, subscription.planId is updated to basic,
// but db.entitlements.premiumLibrary and vipMasterclass are NOT revoked,
// allowing user to still access Premium-only exclusive features.
app.post('/api/subscriptions/change-plan', (req, res) => {
  const { newPlanId, newPlanType = 'yearly' } = req.body;
  const targetPlan = db.plans.find(p => p.id === newPlanId);
  if (!targetPlan) return res.status(404).json({ success: false, message: '플랜을 찾을 수 없습니다.' });

  const previousPlanId = db.subscription.planId;
  db.subscription.planId = targetPlan.id;
  db.subscription.planType = newPlanType;
  db.subscription.planName = `${targetPlan.name} (${newPlanType === 'yearly' ? '연간' : '월간'})`;
  db.subscription.currentPeriodEnd = newPlanType === 'yearly' ? '2027-10-20T23:59:59Z' : '2026-10-20T23:59:59Z';

  let triggeredBug = { bugId: 'site045-SEC-406', secId: 'SEC-406' };

  if (newPlanId === 'basic' && previousPlanId.includes('premium')) {
    // SEC-410 triggered: entitlements not removed
    triggeredBug = { bugId: 'site045-SEC-410', secId: 'SEC-410' };
  }

  // Record billing
  db.billingHistory.unshift({
    id: `bill-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    planName: db.subscription.planName,
    amount: newPlanType === 'yearly' ? targetPlan.yearlyPrice - 9900 : targetPlan.monthlyPrice,
    originalAmount: newPlanType === 'yearly' ? targetPlan.yearlyPrice : targetPlan.monthlyPrice,
    status: 'paid',
    method: '신용카드 (•••• 4821)'
  });

  res.json({
    success: true,
    bugId: triggeredBug.bugId,
    secId: triggeredBug.secId,
    message: `구독 플랜이 [${db.subscription.planName}] 으로 성공적으로 변경되었습니다.`,
    subscription: db.subscription
  });
});

// Cancellation API with SEC-407
// INTENTIONAL BACKEND BUG: site045-SEC-407
// Cancellation Effective-Date Error:
// User requests cancellation scheduled at period end (2026-10-20),
// but server immediately sets subscription.status = 'inactive' and disables access rights immediately,
// cutting off paid benefits before the period end date.
app.post('/api/subscriptions/cancel', (req, res) => {
  db.subscription.cancelAtPeriodEnd = true;
  db.subscription.status = 'inactive'; // Flaw: immediate deactivation

  res.json({
    success: true,
    bugId: 'site045-SEC-407',
    secId: 'SEC-407',
    message: '구독 해지 예약이 접수되었습니다. (현재 기간 종료일: 2026-10-20)',
    subscription: db.subscription
  });
});

// Pause & Resume API with SEC-408
// INTENTIONAL BACKEND BUG: site045-SEC-408
// Usage Quota State Error:
// When pausing and subsequently resuming subscription within the same billing cycle,
// the server resets db.usage.current = 0 instead of preserving prior consumed quota (e.g. 18).
app.post('/api/subscriptions/pause', (req, res) => {
  db.subscription.status = 'paused';
  res.json({ success: true, message: '구독이 일시정지되었습니다.', subscription: db.subscription });
});

app.post('/api/subscriptions/resume', (req, res) => {
  db.subscription.status = 'active';
  // Flaw: resets usage counter to 0 upon resume
  db.usage.current = 0;

  res.json({
    success: true,
    bugId: 'site045-SEC-408',
    secId: 'SEC-408',
    message: '구독이 정상적으로 재개되었습니다. 사용량 카운터가 갱신되었습니다.',
    subscription: db.subscription,
    usage: db.usage
  });
});

// 4. Billing Renewal with SEC-409
// INTENTIONAL BACKEND BUG: site045-SEC-409
// Coupon Expiration State Error:
// During subscription renewal, server applies previously registered discount (e.g. MONTHLY20 5,000원)
// without re-verifying whether the coupon has expired (coupon.status === 'expired').
app.post('/api/billing/renew', (req, res) => {
  const targetPlan = db.plans.find(p => p.id === db.subscription.planId.replace('monthly-', '')) || db.plans[0];
  const basePrice = db.subscription.planType === 'yearly' ? targetPlan.yearlyPrice : targetPlan.monthlyPrice;

  // Flaw: applies expired coupon discount on renewal without checking expiration
  const discount = db.subscription.discountAmount || 5000;
  const billedAmount = Math.max(0, basePrice - discount);

  db.billingHistory.unshift({
    id: `bill-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    planName: `${db.subscription.planName} (자동 갱신 결제)`,
    amount: billedAmount,
    originalAmount: basePrice,
    status: 'paid',
    method: '신용카드 (•••• 4821)'
  });

  res.json({
    success: true,
    bugId: 'site045-SEC-409',
    secId: 'SEC-409',
    message: `정기 구독 갱신 결제가 완료되었습니다. (할인 혜택 ${discount.toLocaleString()}원 적용)`,
    renewalAmount: billedAmount,
    discountApplied: discount
  });
});

app.get('/api/billing/history', (req, res) => {
  res.json({ success: true, data: db.billingHistory });
});

app.get('/api/payment-methods', (req, res) => {
  res.json({ success: true, data: db.paymentMethods });
});

// 5. Usage API
app.get('/api/usage', (req, res) => {
  res.json({
    success: true,
    bugId: 'site045-SEC-408',
    secId: 'SEC-408',
    data: db.usage
  });
});

// 6. Entitlements and Content Access
app.get('/api/entitlements', (req, res) => {
  res.json({
    success: true,
    bugId: 'site045-SEC-410',
    secId: 'SEC-410',
    data: db.entitlements,
    currentPlan: db.subscription.planId
  });
});

app.get('/api/content', (req, res) => {
  res.json({ success: true, data: db.contents });
});

app.get('/api/content/:id/access', (req, res) => {
  const content = db.contents.find(c => c.id === req.params.id);
  if (!content) return res.status(404).json({ success: false, message: '콘텐츠를 찾을 수 없습니다.' });

  // SEC-407 check: if subscription.status is inactive, blocks access even if within period
  const hasAccess = db.subscription.status === 'active';

  res.json({
    success: true,
    bugId: 'site045-SEC-407',
    secId: 'SEC-407',
    contentId: content.id,
    hasAccess,
    message: hasAccess ? '콘텐츠를 재생할 수 있습니다.' : '구독 해지로 인해 이용 권한이 없습니다.'
  });
});

app.get('/api/features/:id/access', (req, res) => {
  // SEC-410 check: Premium exclusive feature access
  const featureId = req.params.id;
  const isAllowed = db.entitlements.vipMasterclass === true;

  res.json({
    success: true,
    bugId: 'site045-SEC-410',
    secId: 'SEC-410',
    featureId,
    isAllowed,
    message: isAllowed ? 'VIP 프리미엄 마스터 기능에 접근할 수 있습니다.' : '상위 플랜 업그레이드가 필요합니다.'
  });
});

// 7. Coupons
app.get('/api/coupons/:code', (req, res) => {
  const coupon = db.coupons.find(c => c.code === req.params.code);
  if (!coupon) return res.status(404).json({ success: false, message: '쿠폰이 존재하지 않습니다.' });
  res.json({ success: true, data: coupon });
});

app.post('/api/coupons/apply', (req, res) => {
  const { code } = req.body;
  const coupon = db.coupons.find(c => c.code === code);
  if (!coupon) return res.status(404).json({ success: false, message: '유효하지 않은 쿠폰입니다.' });
  db.subscription.appliedCoupon = coupon.code;
  db.subscription.discountAmount = coupon.discountValue;
  res.json({ success: true, message: `쿠폰 [${coupon.name}] 이 등록되었습니다.`, data: coupon });
});

// Profile
app.get('/api/profile', (req, res) => {
  res.json({ success: true, data: db.user });
});

// Static files for Production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[site045] Passly Server running on http://localhost:${PORT}`);
});
