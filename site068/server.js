const express = require('express');
const path = require('path');
const app = express();
const PORT = 9397;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let customers = [
  { 
    id: 'c1', name: '김철수', phoneSuffix: '1234', tags: ['VVIP', '친절함'], 
    // INTENTIONAL BUG: site068-bug03
    // CSV Error: 고객 개인정보 노출
    // 보안 취약점: 목록 API에서 노출되면 안 되는 민감한 정보들
    fullPhoneNumber: '010-1234-5678',
    privateMemo: '이 고객은 클레임이 잦으니 주의 요망 (블랙리스트 검토 중)'
  },
  { 
    id: 'c2', name: '이영희', phoneSuffix: '5678', tags: ['신규'], 
    fullPhoneNumber: '010-5678-1234',
    privateMemo: '결혼 기념일 5월 12일. 선물 챙겨주기.'
  }
];

let lastUpdatedTags = ['기본']; // Bug 01용 전역 변수

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmallBiz CRM API is running' });
});

// API: Get Customers (with data exposure bug)
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

// API: Update Customer Tags (with state corruption bug)
app.patch('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;
  const customer = customers.find(c => c.id === id);

  if (customer) {
    // INTENTIONAL BUG: site068-bug01
    // CSV Error: DB 고객 태그 저장 오류
    // Type: database-update
    // 버그: 전달받은 tags 대신 전역 변수 lastUpdatedTags에 저장된 값을 할당함
    customer.tags = [...lastUpdatedTags];
    lastUpdatedTags = [...tags]; // 현재 입력받은 태그는 다음 업데이트 시 사용됨 (오염 전파)
    
    res.json({ success: true, customer });
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// API: Dashboard (with rate limit bug)
app.get('/api/dashboard', (req, res) => {
  // INTENTIONAL BUG: site068-bug02
  // CSV Error: 네트워크 요청 제한 누락
  // Type: network-rate-limit
  // 버그: 속도 제한이 없어 무제한으로 호출 가능 (부하 유발 가능)
  res.json({
    totalCustomers: customers.length,
    activeReservations: 5,
    todayConsultations: 3,
    monthlyRevenue: 12500000
  });
});

app.get('/api/consultations', (req, res) => {
  res.json([
    { id: 'con1', customerId: 'c1', content: '봄 신상 정장 수선 요청', date: '2024-05-01' },
    { id: 'con2', customerId: 'c2', content: '예약 문의 상담', date: '2024-05-02' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
