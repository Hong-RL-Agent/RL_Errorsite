import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5060;

app.use(cors());
app.use(express.json());

// Groupbuys database (Minimum 12 items)
let groupBuys = [
  { id: "gb-01", title: "스마트 기계식 블루투스 키보드", targetQty: 50, currentQty: 42, price: 49000, status: "OPEN", category: "디지털" },
  { id: "gb-02", title: "캠핑용 무선 서큘레이터 선풍기", targetQty: 30, currentQty: 28, price: 35000, status: "OPEN", category: "생활" },
  { id: "gb-03", title: "스텐 이중 진공 보온 텀블러", targetQty: 100, currentQty: 105, price: 18000, status: "CLOSED", category: "생활" },
  { id: "gb-04", title: "가정용 미니 빔프로젝터 4K", targetQty: 20, currentQty: 15, price: 120000, status: "OPEN", category: "디지털" },
  { id: "gb-05", title: "메모리폼 자세교정 등받이 쿠션", targetQty: 40, currentQty: 10, price: 25000, status: "OPEN", category: "가구" },
  { id: "gb-06", title: "차량용 고속 무선 충전 거치대", targetQty: 50, currentQty: 50, price: 29000, status: "CLOSED", category: "디지털" },
  { id: "gb-07", title: "친환경 실리콘 조리도구 7종 세트", targetQty: 60, currentQty: 35, price: 22000, status: "OPEN", category: "생활" },
  { id: "gb-08", title: "스마트 블루투스 인바디 체중계", targetQty: 30, currentQty: 12, price: 39000, status: "OPEN", category: "디지털" },
  { id: "gb-09", title: "휴대용 UVC 칫솔 살균기", targetQty: 80, currentQty: 75, price: 15000, status: "OPEN", category: "생활" },
  { id: "gb-10", title: "프리미엄 헝가리 구스다운 이불", targetQty: 15, currentQty: 5, price: 150000, status: "OPEN", category: "생활" },
  { id: "gb-11", title: "차량용 무선 소형 진공 청소기", targetQty: 50, currentQty: 52, price: 42000, status: "CLOSED", category: "생활" },
  { id: "gb-12", title: "무소음 인체공학 무선 마우스", targetQty: 100, currentQty: 60, price: 19000, status: "OPEN", category: "디지털" }
];

// Participants database
let participants = [
  { id: "pt-01", name: "김민재", quantity: 2, option: "화이트 에디션", gbId: "gb-01", status: "CONFIRMED" },
  { id: "pt-02", name: "이서연", quantity: 1, option: "샌드 브라운", gbId: "gb-02", status: "CONFIRMED" },
  { id: "pt-03", name: "박준형", quantity: 3, option: "매트 블랙", gbId: "gb-01", status: "CONFIRMED" }
];

// Orders database
let orders = [
  { id: "ord-01", gbId: "gb-01", participant: "김민재", qty: 2, price: 98000, status: "PREPARING" },
  { id: "ord-02", gbId: "gb-02", participant: "이서연", qty: 1, price: 35000, status: "SHIPPING" }
];

// User settlement sums cache (Error 5 Target)
const userSettlements = {
  "사용자 A": { list: ["pt-01", "pt-02"], totalCost: 133000 },
  "사용자 B": { list: ["pt-03"], totalCost: 147000 }
};

// Caches for Error 1
let previousOptionCache = {};

// API: Get groupbuys
app.get('/api/groupbuys', (req, res) => {
  res.json(groupBuys);
});

// API: Join groupbuy (Error 7 Target - closed join bypass)
app.post('/api/groupbuys/:id/join', (req, res) => {
  const { id } = req.params;
  const { name, quantity, option } = req.body;
  const gb = groupBuys.find(g => g.id === id);

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 모집 종료(CLOSED)된 공동구매에 참여 신청할 경우, 
  // 화면에는 HTTP 409 Conflict 에러 코드로 실패 처리를 통보하면서도, 
  // 실제 백엔드 데이터베이스에는 해당 참여 및 수량 데이터를 강제 인서트해버리는 오류입니다.
  if (gb && gb.status === 'CLOSED') {
    const newPart = { id: `pt-${Date.now()}`, name, quantity: Number(quantity), option, gbId: id, status: "CONFIRMED" };
    participants.push(newPart);
    return res.status(409).json({ error: "이미 마감된 공동구매 딜입니다. (409)" });
  }

  const newPart = { id: `pt-${Date.now()}`, name, quantity: Number(quantity), option, gbId: id, status: "CONFIRMED" };
  participants.push(newPart);
  if (gb) {
    gb.currentQty += Number(quantity);
  }
  res.json({ success: true, participant: newPart });
});

// API: Cancel participation (Error 2/3 Target - count leak)
app.post('/api/groupbuys/:id/cancel', (req, res) => {
  const { id } = req.params;
  const part = participants.find(p => p.id === id);

  if (part) {
    part.status = "CANCELLED";

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 공동구매 참여 신청을 취소해도, 해당 공동구매 건의 
    // 누적 수량(`currentQty`)과 예상 정산 금액 지표를 차감 감소하지 않고 보존하여 
    // 취소에 따른 실 정산 수량 회수 처리가 누락되는 데이터베이스 결함입니다.
    console.log(`[DB CANCEL JOIN] Cancelled participant ${id}. BUT currentQty remains unchanged!`);
  }
  res.json({ success: true });
});

// API: Get participants
app.get('/api/participants', (req, res) => {
  res.json(participants);
});

// API: Search participants (Error 6 Target - search delay race condition)
app.get('/api/participants/search', (req, res) => {
  const { q } = req.query;
  let filtered = participants;

  if (q) {
    filtered = filtered.filter(p => p.name.includes(q) || p.option.includes(q));
  }

  let delay = 100;
  if (q === '김') {
    delay = 3000; // 3s delay
  } else if (q === '이') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: '김' 검색은 3초, '이' 검색은 0.2초 지연을 처리합니다. 
  // 지연된 구형 김씨 검색 응답이 최신 이씨 검색 결과를 덮어쓰고, 
  // 우측 상세 패널은 여전히 이씨의 상세 데이터를 표시하여 화면과 매핑이 깨지는 결함입니다.
  setTimeout(() => {
    res.json(filtered);
  }, delay);
});

// API: Update quantity (Error 1 Target - 4s delay, reverts option)
app.patch('/api/participants/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend + Database
  // DESCRIPTION: 참여 수량 수정(PATCH)을 4초 지연시킵니다. 
  // 그 사이 진행되는 옵션 변경(1초)에 의해 DB에는 신규 옵션이 매핑되나, 
  // 4초 뒤 실행되는 수량 완료 스케줄러가 백엔드 메모리 상태의 이전 옵션값(`previousOption`)을 
  // 그대로 덮어써 최종 데이터베이스에는 구형 옵션 + 새 수량 조합으로 적재되는 결함입니다.
  setTimeout(() => {
    const part = participants.find(p => p.id === id);
    if (part) {
      part.quantity = Number(quantity);
      if (previousOptionCache[id]) {
        part.option = previousOptionCache[id]; // Revert option to previous cached!
      }
    }
    console.log(`[DB QUANTITY UPDATE] Quantity for ${id} set to ${quantity}, Option reverted to ${part?.option}`);
    res.json({ success: true, participant: part });
  }, 4000);
});

// API: Update option (Error 1 Target - 1s delay)
app.patch('/api/participants/:id/option', (req, res) => {
  const { id } = req.params;
  const { option } = req.body;

  setTimeout(() => {
    const part = participants.find(p => p.id === id);
    if (part) {
      previousOptionCache[id] = part.option; // Store old option
      part.option = option;
      console.log(`[DB OPTION UPDATE] Option for ${id} set to ${option}`);
    }
    res.json({ success: true, participant: part });
  }, 1000);
});

// API: Get orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Refund order (Error 4 Target - 0.1s delay)
app.post('/api/orders/:id/refund', (req, res) => {
  const { id } = req.params;
  
  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      ord.status = "REFUNDED";
      console.log(`[DB REFUND] Order ${id} set to REFUNDED`);
    }
    res.json({ success: true, order: ord });
  }, 100);
});

// API: Update delivery status (Error 4 Target - 3s delay)
app.patch('/api/orders/:id/delivery', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 배송 상태 변경(PATCH) 요청을 3초 지연합니다. 
  // 환불 신청(0.1초 완료)이 완료되어 환불 상태로 변경되었음에도 3초 뒤에 완료되는 
  // 배송 수정 스케줄러가 강제로 배송 중(`SHIPPING`)으로 상태를 회귀 기입시키는 결함입니다.
  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      ord.status = status;
      console.log(`[DB DELIVERY UPDATE] Order ${id} status set to ${status}`);
    }
    res.json({ success: true, order: ord });
  }, 3000);
});

// API: Get settlement summaries (Error 5 Target)
app.get('/api/settlement', (req, res) => {
  const { user } = req.query;
  res.json(userSettlements[user] || { list: [], totalCost: 0 });
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  groupBuys = [
    { id: "gb-01", title: "스마트 기계식 블루투스 키보드", targetQty: 50, currentQty: 42, price: 49000, status: "OPEN", category: "디지털" },
    { id: "gb-02", title: "캠핑용 무선 서큘레이터 선풍기", targetQty: 30, currentQty: 28, price: 35000, status: "OPEN", category: "생활" },
    { id: "gb-03", title: "스텐 이중 진공 보온 텀블러", targetQty: 100, currentQty: 105, price: 18000, status: "CLOSED", category: "생활" }
  ];
  participants = [
    { id: "pt-01", name: "김민재", quantity: 2, option: "화이트 에디션", gbId: "gb-01", status: "CONFIRMED" },
    { id: "pt-02", name: "이서연", quantity: 1, option: "샌드 브라운", gbId: "gb-02", status: "CONFIRMED" }
  ];
  orders = [
    { id: "ord-01", gbId: "gb-01", participant: "김민재", qty: 2, price: 98000, status: "PREPARING" }
  ];
  previousOptionCache = {};
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[GroupBuy Backend] Express server running on http://localhost:${PORT}`);
});
