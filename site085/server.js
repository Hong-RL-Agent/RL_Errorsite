'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9414;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════
// Mock DB
// ══════════════════════════════════════════

const CURRENT_USER = 'user_maya';

const mockCustomers = [
  { id: 1, name: '(주)그린소프트', email: 'contact@greensoft.kr', phone: '02-1234-5678', address: '서울 강남구 테헤란로 123' },
  { id: 2, name: '블루스튜디오', email: 'hello@bluestudio.kr', phone: '010-9876-5432', address: '서울 마포구 합정동 56' },
  { id: 3, name: '레드에이전시', email: 'biz@redagency.co.kr', phone: '02-8765-4321', address: '경기 성남시 분당구 정자동' },
  { id: 4, name: '(개인) 박지훈', email: 'jihoon.park@gmail.com', phone: '010-1111-2222', address: '서울 용산구 한남동' }
];

// INTENTIONAL BUG: site085-bug01
// CSV Error: DB 세금 계산 오류
// Type: database-calculation
// Description: 세금 계산 시 할인 전 금액이 아닌 할인 후 금액을 두 번 적용함.
// 정상: tax = subtotal * (1 - discountRate) * taxRate
//       => tax = discountedSubtotal * taxRate (한 번만 할인 적용)
// 버그: tax = subtotal * (1 - discountRate) * (1 - discountRate) * taxRate
//       => 할인이 두 번 적용된 금액에 세금 계산 → 실제보다 세금이 낮아짐
// data-bug-id="site085-bug01"
function calcInvoiceTotals_buggy(items, discountRate, taxRate) {
  // data-bug-id="site085-bug01"
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discount = subtotal * (discountRate / 100);
  const discounted = subtotal - discount;

  // 버그: 이미 할인된 금액(discounted)에 또 한 번 discountRate를 적용하여 세금 계산
  // 정상: const tax = discounted * (taxRate / 100);
  const tax = discounted * (1 - discountRate / 100) * (taxRate / 100); // 할인 이중 적용
  const total = discounted + tax;

  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    discountRate,
    discounted: Math.round(discounted),
    tax: Math.round(tax),      // 버그: 이중 할인으로 인해 실제보다 낮음
    taxRate,
    total: Math.round(total)
  };
}

// 타 유저 청구서 (bug03용)
// INTENTIONAL BUG: site085-bug03
// CSV Error: 청구서 소유자 검증 누락
// Type: security-idor
// Description: invoiceId 변경으로 다른 사용자의 청구서 조회 가능.
// data-bug-id="site085-bug03"
let mockInvoices = [
  {
    id: 1, userId: 'user_maya', invoiceNo: 'INV-2026-001',
    customerId: 1, customerName: '(주)그린소프트',
    items: [
      { name: '웹사이트 개발', qty: 1, unitPrice: 3500000 },
      { name: '유지보수 (3개월)', qty: 3, unitPrice: 300000 }
    ],
    discountRate: 10, taxRate: 10,
    status: 'paid', issuedAt: '2026-04-01', dueAt: '2026-04-30',
    note: '1분기 개발 비용'
  },
  {
    id: 2, userId: 'user_maya', invoiceNo: 'INV-2026-002',
    customerId: 2, customerName: '블루스튜디오',
    items: [
      { name: 'UI/UX 디자인', qty: 1, unitPrice: 2000000 },
      { name: '아이콘 패키지', qty: 1, unitPrice: 500000 }
    ],
    discountRate: 0, taxRate: 10,
    status: 'pending', issuedAt: '2026-04-15', dueAt: '2026-05-15',
    note: '디자인 시스템 납품'
  },
  {
    id: 3, userId: 'user_maya', invoiceNo: 'INV-2026-003',
    customerId: 3, customerName: '레드에이전시',
    items: [
      { name: '컨설팅 (10h)', qty: 10, unitPrice: 200000 }
    ],
    discountRate: 5, taxRate: 10,
    status: 'overdue', issuedAt: '2026-03-20', dueAt: '2026-04-20',
    note: '마케팅 전략 컨설팅'
  },
  // 타 유저 청구서 — bug03 IDOR 타겟
  {
    id: 4, userId: 'user_ken', invoiceNo: 'INV-2026-K01',
    customerId: 4, customerName: '(개인) 박지훈',
    items: [{ name: '로고 디자인', qty: 1, unitPrice: 800000 }],
    discountRate: 0, taxRate: 10,
    status: 'paid', issuedAt: '2026-04-10', dueAt: '2026-04-25',
    note: '개인 브랜딩 작업'
  },
  {
    id: 5, userId: 'user_sarah', invoiceNo: 'INV-2026-S01',
    customerId: 1, customerName: '(주)그린소프트',
    items: [{ name: '번역 서비스 (EN→KO)', qty: 5000, unitPrice: 50 }],
    discountRate: 15, taxRate: 10,
    status: 'pending', issuedAt: '2026-04-28', dueAt: '2026-05-28',
    note: '기술 문서 번역'
  }
];
let invoiceIdCounter = 6;
let invoiceNoCounter = 4;

// ══════════════════════════════════════════
// Routes
// ══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site085', name: 'TinyInvoice', port: PORT, timestamp: new Date().toISOString() });
});

// GET /api/invoices
app.get('/api/invoices', (req, res) => {
  const { status, customerId, sort, q } = req.query;
  let invoices = mockInvoices
    .filter(inv => inv.userId === CURRENT_USER)
    .map(inv => ({ ...inv, totals: calcInvoiceTotals_buggy(inv.items, inv.discountRate, inv.taxRate) }));

  if (status && status !== 'all') invoices = invoices.filter(i => i.status === status);
  if (customerId) invoices = invoices.filter(i => i.customerId === parseInt(customerId));
  if (q) {
    const query = q.toLowerCase();
    invoices = invoices.filter(i =>
      i.invoiceNo.toLowerCase().includes(query) ||
      i.customerName.toLowerCase().includes(query) ||
      i.note.toLowerCase().includes(query)
    );
  }
  if (sort === 'amount_desc') invoices.sort((a, b) => b.totals.total - a.totals.total);
  if (sort === 'amount_asc') invoices.sort((a, b) => a.totals.total - b.totals.total);
  if (sort === 'date_desc') invoices.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  if (sort === 'due') invoices.sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  res.json({ success: true, data: invoices, total: invoices.length });
});

// GET /api/invoices/:id — bug03: 소유자 검증 없음
app.get('/api/invoices/:id', (req, res) => {
  const inv = mockInvoices.find(i => i.id === parseInt(req.params.id));
  if (!inv) return res.status(404).json({ success: false, message: '청구서를 찾을 수 없습니다.' });

  // data-bug-id="site085-bug03"
  // inv.userId !== CURRENT_USER 검증 없음
  // 정상: if (inv.userId !== CURRENT_USER) return res.status(403)...
  const totals = calcInvoiceTotals_buggy(inv.items, inv.discountRate, inv.taxRate);
  res.json({ success: true, data: { ...inv, totals } });
});

// POST /api/invoices
// INTENTIONAL BUG: site085-bug02
// CSV Error: 네트워크 중복 발행
// Type: network-duplicate-submit
// Description: 발행 버튼 연속 클릭 시 같은 청구서가 중복 생성됨.
// 서버에 멱등성(idempotency key) 처리 없음 → 동일 요청을 여러 번 보내면 여러 개 생성.
// data-bug-id="site085-bug02"
app.post('/api/invoices', (req, res) => {
  // data-bug-id="site085-bug02"
  // 멱등성 키 없이 요청마다 새 청구서 생성
  // 정상: idempotency key 확인 후 이미 처리된 요청이면 기존 결과 반환
  const { customerId, items, discountRate, taxRate, dueAt, note } = req.body;
  if (!customerId || !items || !items.length) {
    return res.status(400).json({ success: false, message: '고객 및 항목을 입력하세요.' });
  }
  const customer = mockCustomers.find(c => c.id === parseInt(customerId));
  const invNo = `INV-2026-${String(invoiceNoCounter).padStart(3, '0')}`;
  const newInvoice = {
    id: invoiceIdCounter++,
    invoiceNo: invNo,
    userId: CURRENT_USER,
    customerId: parseInt(customerId),
    customerName: customer?.name || '알 수 없음',
    items,
    discountRate: parseFloat(discountRate) || 0,
    taxRate: parseFloat(taxRate) || 10,
    status: 'pending',
    issuedAt: new Date().toISOString().split('T')[0],
    dueAt: dueAt || '',
    note: note || ''
  };
  invoiceNoCounter++;
  const totals = calcInvoiceTotals_buggy(newInvoice.items, newInvoice.discountRate, newInvoice.taxRate);
  mockInvoices.unshift(newInvoice);
  res.status(201).json({ success: true, data: { ...newInvoice, totals } });
});

// PATCH /api/invoices/:id/status
app.patch('/api/invoices/:id/status', (req, res) => {
  const inv = mockInvoices.find(i => i.id === parseInt(req.params.id));
  if (!inv) return res.status(404).json({ success: false, message: '청구서 없음' });
  const { status } = req.body;
  if (!['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 상태' });
  }
  inv.status = status;
  res.json({ success: true, data: inv });
});

// GET /api/customers
app.get('/api/customers', (req, res) => {
  const { q } = req.query;
  let customers = [...mockCustomers];
  if (q) {
    const query = q.toLowerCase();
    customers = customers.filter(c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query));
  }
  res.json({ success: true, data: customers });
});

// GET /api/reports
app.get('/api/reports', (req, res) => {
  const myInvoices = mockInvoices.filter(i => i.userId === CURRENT_USER);
  const totalsAll = myInvoices.map(i => calcInvoiceTotals_buggy(i.items, i.discountRate, i.taxRate));
  const totalRevenue = totalsAll.reduce((s, t) => s + t.total, 0);
  const paidRevenue = myInvoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + calcInvoiceTotals_buggy(i.items, i.discountRate, i.taxRate).total, 0);
  const pendingRevenue = myInvoices
    .filter(i => i.status === 'pending')
    .reduce((s, i) => s + calcInvoiceTotals_buggy(i.items, i.discountRate, i.taxRate).total, 0);
  const overdueRevenue = myInvoices
    .filter(i => i.status === 'overdue')
    .reduce((s, i) => s + calcInvoiceTotals_buggy(i.items, i.discountRate, i.taxRate).total, 0);

  res.json({
    success: true,
    data: {
      totalInvoices: myInvoices.length,
      totalRevenue, paidRevenue, pendingRevenue, overdueRevenue,
      byStatus: { paid: myInvoices.filter(i => i.status === 'paid').length, pending: myInvoices.filter(i => i.status === 'pending').length, overdue: myInvoices.filter(i => i.status === 'overdue').length }
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🧾 TinyInvoice server running at http://localhost:${PORT}`);
  console.log(`   Site ID: site085`);
  console.log(`   Bugs: bug01(db-calculation), bug02(network-duplicate), bug03(security-idor)`);
});
