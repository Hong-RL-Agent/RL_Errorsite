import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5056;

app.use(cors());
app.use(express.json());

// Subscriptions database (Minimum 15 items)
let subscriptions = [
  { id: "sub-01", name: "넷플릭스 프리미엄", plan: "4K UHD 요금제", price: 17000, billingDate: "15", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 3, category: "영상" },
  { id: "sub-02", name: "스포티파이 듀오", plan: "듀오 요금제", price: 16350, billingDate: "28", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 2, category: "음악" },
  { id: "sub-03", name: "어도비 크리에이티브 클라우드", plan: "전체 앱 플랜", price: 62000, billingDate: "05", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
  { id: "sub-04", name: "유튜브 프리미엄", plan: "개인 플랜", price: 14900, billingDate: "20", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "음악" },
  { id: "sub-05", name: "쿠팡 와우 멤버십", plan: "와우 회원", price: 7890, billingDate: "10", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "쇼핑" },
  { id: "sub-06", name: "노션 플러스", plan: "개인 프로", price: 13500, billingDate: "18", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
  { id: "sub-07", name: "깃허브 코파일럿", plan: "개인 개발자", price: 26000, billingDate: "25", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
  { id: "sub-08", name: "마이크로소프트 365 패밀리", plan: "가족 공유형", price: 11900, billingDate: "08", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 4, category: "소프트웨어" },
  { id: "sub-09", name: "챗GPT 플러스", plan: "Plus 플랜", price: 27500, billingDate: "22", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
  { id: "sub-10", name: "디즈니 플러스", plan: "스탠다드", price: 13900, billingDate: "14", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 2, category: "영상" },
  { id: "sub-11", name: "티빙 프리미엄", plan: "프리미엄", price: 17000, billingDate: "17", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "영상" },
  { id: "sub-12", name: "밀리의 서재", plan: "전자책 무제한", price: 9900, billingDate: "12", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "도서" },
  { id: "sub-13", name: "플로 무제한 패스", plan: "올인원 스트리밍", price: 7900, billingDate: "02", status: "ACTIVE", autoPay: false, paymentMethodId: "pm-01", occupiedSeats: 1, category: "음악" },
  { id: "sub-14", name: "슬랙 프로 요금제", plan: "워크스페이스 프로", price: 9500, billingDate: "30", status: "ACTIVE", autoPay: false, paymentMethodId: "pm-02", occupiedSeats: 3, category: "소프트웨어" },
  { id: "sub-15", name: "드롭박스 플러스", plan: "개인 2TB 플랜", price: 12000, billingDate: "07", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "소프트웨어" }
];

// Family Members
let familyMembers = [
  { id: "fam-01", name: "김철수 (아버지)", subId: "sub-01" },
  { id: "fam-02", name: "박영희 (어머니)", subId: "sub-01" },
  { id: "fam-03", name: "김동우 (동생)", subId: "sub-08" }
];

// Payment methods
let paymentMethods = [
  { id: "pm-01", name: "신한 개인 신용카드 (끝자리 *9921)" },
  { id: "pm-02", name: "국민 법인 신용카드 (끝자리 *0012)" },
  { id: "pm-invalid", name: "종료된 무효 카드 (끝자리 *0000)" }
];

// User Info statistics
const userStats = {
  "사용자 A": { totalCost: 310840, nextAlert: "넷플릭스 프리미엄 (결제일: 07-15)" },
  "사용자 B": { totalCost: 31250, nextAlert: "마이크로소프트 365 (결제일: 07-08)" }
};

// API: Get subscriptions
app.get('/api/subscriptions', (req, res) => {
  res.json(subscriptions);
});

// API: Add subscription
app.post('/api/subscriptions', (req, res) => {
  const { name, plan, price, billingDate, category } = req.body;
  const newSub = {
    id: `sub-${Date.now()}`,
    name,
    plan,
    price: Number(price),
    billingDate,
    status: "ACTIVE",
    autoPay: true,
    paymentMethodId: "pm-01",
    occupiedSeats: 1,
    category
  };
  subscriptions.push(newSub);
  res.json(newSub);
});

// API: Patch plan (Error 1 Target - plan update delay)
app.patch('/api/subscriptions/:id/plan', (req, res) => {
  const { id } = req.params;
  const { plan, price } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Database
  // DESCRIPTION: 요금제 수정(PATCH) 처리를 3초간 강제 지연시킵니다. 
  // 그 사이에 결제일 변경(0.1초 완료)이 실행되면, 3초 뒤 요금제 변경 완료 시 
  // 클라이언트가 처음에 전달했던 구형 요금제 문자열 및 가격이 DB에 거꾸로 덮어써지는 경합 결함입니다.
  setTimeout(() => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      // Overwrite back with the plan/price sent in the body (which might be the stale value)
      sub.plan = plan;
      sub.price = Number(price);
      console.log(`[DB PLAN UPDATE] Plan for ${id} set to ${plan} (${price}원)`);
    }
    res.json({ success: true, subscription: sub });
  }, 3000);
});

// API: Patch billing date (Error 1 Target - billing date update)
app.patch('/api/subscriptions/:id/billing-date', (req, res) => {
  const { id } = req.params;
  const { billingDate } = req.body;

  setTimeout(() => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      sub.billingDate = billingDate;
      console.log(`[DB DATE UPDATE] Billing date for ${id} set to ${billingDate}`);
    }
    res.json({ success: true, subscription: sub });
  }, 100);
});

// API: Cancel subscription (Error 2 Target - cancel delay)
app.post('/api/subscriptions/:id/cancel', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 구독 해지(cancel)를 3초 지연 수행합니다. 
  // 해지 후 즉각 재활성화(0.1초 완료)를 연타하면 재활성화가 먼저 실행되어 활성화 상태가 된 후, 
  // 3초 뒤 지연된 해지 콜백이 완료를 찍으며 상태값을 해지(CANCELLED)로 기록해버리는 경합 상태가 됩니다.
  setTimeout(() => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      sub.status = "CANCELLED";
      console.log(`[DB CANCEL] Subscription ${id} status set to CANCELLED`);
    }
    res.json({ success: true, subscription: sub });
  }, 3000);
});

// API: Reactivate subscription (Error 2 Target - reactivate instant)
app.post('/api/subscriptions/:id/reactivate', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      sub.status = "ACTIVE";
      console.log(`[DB REACTIVATE] Subscription ${id} status set to ACTIVE`);
    }
    res.json({ success: true, subscription: sub });
  }, 100);
});

// API: Bind payment method (Error 7 Target)
app.post('/api/subscriptions/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentMethodId } = req.body;

  const sub = subscriptions.find(s => s.id === id);
  if (sub) {
    // INTENTIONAL_ERROR
    // CATEGORY: Backend
    // DESCRIPTION: 무효한 결제 수단 ID(`pm-invalid`) 기입 시 HTTP 400 Bad Request 에러를 던지지만, 
    // 실제 백엔드 데이터베이스 상에는 해당 무효 ID가 구독 데이터에 그대로 저장되게 만들어 
    // 유효하지 않은 데이터가 남게 하는 트랜잭션 예외 흐름 제어 결함입니다.
    sub.paymentMethodId = paymentMethodId;
  }

  if (paymentMethodId === 'pm-invalid') {
    return res.status(400).json({ error: "유효하지 않은 결제 카드 정보입니다. (400)" });
  }

  res.json({ success: true, subscription: sub });
});

// API: Get family members
app.get('/api/family', (req, res) => {
  res.json(familyMembers);
});

// API: Add family member
app.post('/api/family', (req, res) => {
  const { name, subId } = req.body;
  const newMember = {
    id: `fam-${Date.now()}`,
    name,
    subId
  };
  familyMembers.push(newMember);

  const sub = subscriptions.find(s => s.id === subId);
  if (sub) {
    sub.occupiedSeats += 1;
  }

  res.json(newMember);
});

// API: Delete family member (Error 6 Target - delete seat bypass)
app.delete('/api/family/:id', (req, res) => {
  const { id } = req.params;
  const member = familyMembers.find(f => f.id === id);

  if (member) {
    familyMembers = familyMembers.filter(f => f.id !== id);

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 가족 공유원을 제거할 때, 해당 공유원이 차지하고 있던 
    // 구독 점유 좌석수(`occupiedSeats`)의 차감 구문을 생략하고 삭제 요청만 처리하여 
    // 실질 좌석 점유 지표가 감소하지 않고 누수되는 관계형 데이터베이스 결함입니다.
    console.log(`[DB FAMILY DELETE] Deleted member ${id}. BUT occupied seats count was not decreased!`);
  }

  res.json({ success: true });
});

// API: Cost statistics (Error 5 Target - stats delay race)
app.get('/api/stats', (req, res) => {
  const { range } = req.query;

  let delay = 100;
  let chartPoints = [];
  if (range === '6개월') {
    delay = 3000; // 3s delay
    chartPoints = [115000, 118000, 120000, 134000, 142000, 153000];
  } else {
    delay = 200; // 0.2s delay
    chartPoints = [120000, 134000, 142000];
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 6개월 보기 클릭은 3초, 3개월 보기는 0.2초의 네트워크 응답 지연을 갖습니다. 
  // 연속 교차 입력 시 구형 응답(6개월)이 3초 뒤 늦게 도착해 최신 렌더링 그래프(3개월)를 
  // 덮어씌워 출력하는 비용 그래프 꼬임 결함입니다.
  setTimeout(() => {
    res.json({ range, points: chartPoints });
  }, delay);
});

// API: Get user session info
app.get('/api/session', (req, res) => {
  const { user } = req.query;
  res.json(userStats[user] || { totalCost: 0, nextAlert: "알림 없음" });
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  subscriptions = [
    { id: "sub-01", name: "넷플릭스 프리미엄", plan: "4K UHD 요금제", price: 17000, billingDate: "15", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 3, category: "영상" },
    { id: "sub-02", name: "스포티파이 듀오", plan: "듀오 요금제", price: 16350, billingDate: "28", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 2, category: "음악" },
    { id: "sub-03", name: "어도비 크리에이티브 클라우드", plan: "전체 앱 플랜", price: 62000, billingDate: "05", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
    { id: "sub-04", name: "유튜브 프리미엄", plan: "개인 플랜", price: 14900, billingDate: "20", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "음악" },
    { id: "sub-05", name: "쿠팡 와우 멤버십", plan: "와우 회원", price: 7890, billingDate: "10", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "쇼핑" },
    { id: "sub-06", name: "노션 플러스", plan: "개인 프로", price: 13500, billingDate: "18", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
    { id: "sub-07", name: "깃허브 코파일럿", plan: "개인 개발자", price: 26000, billingDate: "25", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
    { id: "sub-08", name: "마이크로소프트 365 패밀리", plan: "가족 공유형", price: 11900, billingDate: "08", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 4, category: "소프트웨어" },
    { id: "sub-09", name: "챗GPT 플러스", plan: "Plus 플랜", price: 27500, billingDate: "22", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-02", occupiedSeats: 1, category: "소프트웨어" },
    { id: "sub-10", name: "디즈니 플러스", plan: "스탠다드", price: 13900, billingDate: "14", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 2, category: "영상" },
    { id: "sub-11", name: "티빙 프리미엄", plan: "프리미엄", price: 17000, billingDate: "17", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "영상" },
    { id: "sub-12", name: "밀리의 서재", plan: "전자책 무제한", price: 9900, billingDate: "12", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "도서" },
    { id: "sub-13", name: "플로 무제한 패스", plan: "올인원 스트리밍", price: 7900, billingDate: "02", status: "ACTIVE", autoPay: false, paymentMethodId: "pm-01", occupiedSeats: 1, category: "음악" },
    { id: "sub-14", name: "슬랙 프로 요금제", plan: "워크스페이스 프로", price: 9500, billingDate: "30", status: "ACTIVE", autoPay: false, paymentMethodId: "pm-02", occupiedSeats: 3, category: "소프트웨어" },
    { id: "sub-15", name: "드롭박스 플러스", plan: "개인 2TB 플랜", price: 12000, billingDate: "07", status: "ACTIVE", autoPay: true, paymentMethodId: "pm-01", occupiedSeats: 1, category: "소프트웨어" }
  ];
  familyMembers = [
    { id: "fam-01", name: "김철수 (아버지)", subId: "sub-01" },
    { id: "fam-02", name: "박영희 (어머니)", subId: "sub-01" },
    { id: "fam-03", name: "김동우 (동생)", subId: "sub-08" }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[SubTrack Backend] Express server running on http://localhost:${PORT}`);
});
