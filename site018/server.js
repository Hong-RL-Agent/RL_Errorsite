const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 9127;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Data
let events = [
  { id: 'evt_101', type: 'payment.created', customer: 'Alice Kim', amount: 29900, riskScore: 12, status: 'success', timestamp: '2024-05-01T10:00:00Z', provider: 'OrbitPay' },
  { id: 'evt_102', type: 'invoice.paid', customer: 'Bob Lee', amount: 99000, riskScore: 45, status: 'success', timestamp: '2024-05-01T10:05:00Z', provider: 'NovaBilling' },
  { id: 'evt_103', type: 'payment.failed', customer: 'Charlie Park', amount: 49000, riskScore: 88, status: 'failed', timestamp: '2024-05-01T10:10:00Z', provider: 'LedgerFlow' },
  { id: 'evt_104', type: 'subscription.updated', customer: 'Alice Kim', amount: 0, riskScore: 5, status: 'success', timestamp: '2024-05-01T10:15:00Z', provider: 'OrbitPay' },
  { id: 'evt_105', type: 'webhook.received', customer: 'Dave Song', amount: 15000, riskScore: 60, status: 'pending', timestamp: '2024-05-01T10:20:00Z', provider: 'NovaBilling' }
];

let subscriptions = [
  { id: 'sub_001', customer: 'Alice Kim', plan: 'Pro Monthly', status: 'Active', amount: 29900, nextBilling: '2024-06-01' },
  { id: 'sub_002', customer: 'Bob Lee', plan: 'Enterprise Yearly', status: 'Active', amount: 990000, nextBilling: '2025-05-01' },
  { id: 'sub_003', customer: 'Charlie Park', plan: 'Basic Monthly', status: 'Suspended', amount: 9900, nextBilling: 'N/A' }
];

let invoices = [
  { invoiceId: 'inv_201', customerId: 'Alice Kim', amount: 29900, status: 'paid', dueDate: '2024-05-01' },
  { invoiceId: 'inv_202', customerId: 'Bob Lee', amount: 99000, status: 'paid', dueDate: '2024-05-01' },
  { invoiceId: 'inv_203', customerId: 'Charlie Park', amount: 49000, status: 'pending', dueDate: '2024-05-10' }
];

// --- API Endpoints ---

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: 'site018', status: 'healthy' });
});

// 2. GET /api/events
app.get('/api/events', (req, res) => {
  const { sort, status, type } = req.query;
  let filtered = [...events];

  if (status) filtered = filtered.filter(e => e.status === status);
  if (type) filtered = filtered.filter(e => e.type === type);

  if (sort === 'risk') {
    // INTENTIONAL BACKEND BUG: site018-bug03
    // Type: opaque-sort-logic
    // Description: riskScore만 사용하지 않고 amount와 timestamp 가중치를 섞은 불투명한 정렬식으로 인해 기대와 다른 순서 반환
    filtered.sort((a, b) => {
      const scoreA = a.riskScore * 0.4 + (a.amount / 1000) * 0.3 + (new Date(a.timestamp).getTime() % 100) * 0.3;
      const scoreB = b.riskScore * 0.4 + (b.amount / 1000) * 0.3 + (new Date(b.timestamp).getTime() % 100) * 0.3;
      return scoreB - scoreA; 
    });
    return res.json({ ok: true, data: filtered, bugId: 'site018-bug03' });
  }

  res.json({ ok: true, data: filtered });
});

// 3. GET /api/subscriptions
app.get('/api/subscriptions', (req, res) => {
  res.json({ ok: true, data: subscriptions });
});

// 4. GET /api/invoices
app.get('/api/invoices', (req, res) => {
  res.json({ ok: true, data: invoices });
});

// 5. GET /api/events/:eventId
app.get('/api/events/:eventId', (req, res) => {
  const event = events.find(e => e.id === req.params.eventId);
  if (!event) return res.status(404).json({ ok: false, error: 'Event not found' });
  res.json({ ok: true, data: event });
});

// 6. POST /api/webhooks/simulate
app.post('/api/webhooks/simulate', (req, res) => {
  const { scenario } = req.query;
  
  if (scenario === 'causality-inversion') {
    // INTENTIONAL BACKEND BUG: site018-bug01
    // Type: async-webhook-causality-inversion
    // Description: payment.created보다 subscription.activated를 먼저 처리하여 웹훅 인과 관계가 역전되도록 함
    const sequence = [
      { type: 'subscription.activated', timestamp: new Date(Date.now() - 5000).toISOString(), note: 'Inverted Order' },
      { type: 'payment.created', timestamp: new Date().toISOString(), note: 'Delayed Event' }
    ];
    return res.json({ 
      ok: true, 
      scenario: 'causality-inversion', 
      timeline: sequence,
      bugId: 'site018-bug01' 
    });
  }

  res.json({ ok: true, msg: 'Normal simulation complete' });
});

// 7. GET /api/events/polymorphic/missing-type
app.get('/api/events/polymorphic/missing-type', (req, res) => {
  // INTENTIONAL BACKEND BUG: site018-bug02
  // Type: missing-polymorphic-json-discriminator
  // Description: payload.type이 누락되었는데 기본 타입을 card_payment로 강제 처리하여 잘못된 데이터 반환
  const rawData = {
    eventId: 'evt_999',
    payload: {
      // type: 'bank_transfer', // Missing!
      accountNumber: '123-456-789',
      bankName: 'Global Bank',
      amount: 50000
    }
  };
  
  const processed = {
    ...rawData,
    interpretedType: 'card_payment', // Buggy default
    cardFee: 1500,
    maskedCardNumber: '**** **** **** 0000'
  };

  res.json({ ok: true, data: processed, bugId: 'site018-bug02' });
});

// 8. POST /api/recovery/simulate-crash
app.post('/api/recovery/simulate-crash', (req, res) => {
  // INTENTIONAL BACKEND BUG: site018-bug04
  // Type: transaction-recovery-failure-after-crash
  // Description: mock crash 복구 과정에서 payment 상태만 paid로 복구하고 invoice, subscription 상태를 불일치하게 남김
  const result = {
    payment: { id: 'pay_777', status: 'paid' },
    invoice: { id: 'inv_777', status: 'pending' }, // Inconsistent
    subscription: { id: 'sub_777', status: 'suspended' }, // Inconsistent
    recoveryLog: 'Partial recovery due to state sync error'
  };

  res.json({ 
    ok: true, 
    data: result, 
    bugId: 'site018-bug04' 
  });
});

// Serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
