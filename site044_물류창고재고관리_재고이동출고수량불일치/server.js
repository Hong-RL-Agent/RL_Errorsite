import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5044;

app.use(cors());
app.use(express.json());

// ERP Warehouse Items Database (Minimum 25 items)
let items = [
  { id: "prod-01", name: "게이밍 기계식 키보드 K9", category: "가전/디지털", warehouseStocks: { A: 10, B: 5, C: 20 }, minRequired: 15 },
  { id: "prod-02", name: "무선 버티컬 마우스 V3", category: "가전/디지털", warehouseStocks: { A: 5, B: 2, C: 8 }, minRequired: 10 },
  { id: "prod-03", name: "울트라 와이드 모니터 34인치", category: "가전/디지털", warehouseStocks: { A: 12, B: 0, C: 4 }, minRequired: 15 },
  { id: "prod-04", name: "고성능 그래픽카드 RTX4080", category: "가전/디지털", warehouseStocks: { A: 4, B: 1, C: 2 }, minRequired: 8 },
  { id: "prod-05", name: "게이밍 노트북 16인치 i9", category: "가전/디지털", warehouseStocks: { A: 10, B: 0, C: 0 }, minRequired: 12 },
  
  { id: "prod-06", name: "오버사이즈 후드티 그레이", category: "패션/의류", warehouseStocks: { A: 20, B: 15, C: 40 }, minRequired: 30 },
  { id: "prod-07", name: "슬림핏 블랙 데님 팬츠", category: "패션/의류", warehouseStocks: { A: 15, B: 20, C: 25 }, minRequired: 25 },
  { id: "prod-08", name: "가죽 첼시 부츠 브라운", category: "패션/의류", warehouseStocks: { A: 8, B: 4, C: 12 }, minRequired: 10 },
  { id: "prod-09", name: "방풍 경량 바람막이 자켓", category: "패션/의류", warehouseStocks: { A: 30, B: 10, C: 15 }, minRequired: 20 },
  { id: "prod-10", name: "울 블렌드 싱글 코트 네이비", category: "패션/의류", warehouseStocks: { A: 5, B: 8, C: 2 }, minRequired: 10 },
  
  { id: "prod-11", name: "유기농 착즙 과일 주스", category: "식품/리빙", warehouseStocks: { A: 50, B: 30, C: 80 }, minRequired: 60 },
  { id: "prod-12", name: "통밀 아몬드 시리얼 바", category: "식품/리빙", warehouseStocks: { A: 100, B: 50, C: 120 }, minRequired: 80 },
  { id: "prod-13", name: "친환경 대나무 칫솔 세트", category: "식품/리빙", warehouseStocks: { A: 40, B: 20, C: 60 }, minRequired: 40 },
  { id: "prod-14", name: "스마트 무선 가습기 4L", category: "식품/리빙", warehouseStocks: { A: 14, B: 6, C: 10 }, minRequired: 15 },
  { id: "prod-15", name: "메모리폼 기능성 경추 베개", category: "식품/리빙", warehouseStocks: { A: 25, B: 10, C: 15 }, minRequired: 20 },
  
  { id: "prod-16", name: "블루투스 노이즈캔슬링 헤드폰", category: "가전/디지털", warehouseStocks: { A: 18, B: 8, C: 25 }, minRequired: 20 },
  { id: "prod-17", name: "USB Type-C 멀티 허브 8in1", category: "가전/디지털", warehouseStocks: { A: 35, B: 15, C: 40 }, minRequired: 30 },
  { id: "prod-18", name: "미러리스 카메라 단렌즈 키트", category: "가전/디지털", warehouseStocks: { A: 3, B: 2, C: 5 }, minRequired: 6 },
  { id: "prod-19", name: "스마트 터치 LED 스탠드", category: "가전/디지털", warehouseStocks: { A: 22, B: 12, C: 18 }, minRequired: 20 },
  { id: "prod-20", name: "휴대용 미니 보조배터리 10000", category: "가전/디지털", warehouseStocks: { A: 50, B: 25, C: 45 }, minRequired: 40 },
  
  { id: "prod-21", name: "캐주얼 코튼 옥스퍼드 셔츠", category: "패션/의류", warehouseStocks: { A: 45, B: 20, C: 35 }, minRequired: 35 },
  { id: "prod-22", name: "린넨 반소매 티셔츠 화이트", category: "패션/의류", warehouseStocks: { A: 60, B: 40, C: 80 }, minRequired: 50 },
  { id: "prod-23", name: "암막 차광 수면 안대 블랙", category: "식품/리빙", warehouseStocks: { A: 15, B: 5, C: 20 }, minRequired: 15 },
  { id: "prod-24", name: "무독성 실리콘 주방 조리기구", category: "식품/리빙", warehouseStocks: { A: 28, B: 12, C: 30 }, minRequired: 20 },
  { id: "prod-25", name: "에어프라이어 종이호일 100매", category: "식품/리빙", warehouseStocks: { A: 80, B: 40, C: 90 }, minRequired: 70 }
];

// Activity Logs Database
let activityLogs = [
  { id: "log-01", itemId: "prod-01", type: "입고", msg: "키보드 K9 A창고 10개 입고 완료", time: "2026-07-13 14:00" },
  { id: "log-02", itemId: "prod-04", type: "출고", msg: "RTX4080 C창고 2개 출고 완료", time: "2026-07-13 15:30" }
];

// Purchase Orders (발주) list
let purchaseOrders = [
  { id: "po-01", itemId: "prod-04", qty: 20, status: "발주중", date: "2026-07-13" },
  { id: "po-02", itemId: "prod-18", qty: 10, status: "발주중", date: "2026-07-13" }
];

// expected stocks (separate cache for PO quantities in low-stock computation - Error 4 Target)
let expectedIncomingStocks = {
  "prod-04": 20,
  "prod-18": 10
};

// API: Get Items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// API: Search items (Error 5 search race condition delays)
app.get('/api/items/search', (req, res) => {
  const { q } = req.query;
  let delay = 0;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: '노트북' 키워드 입력 시 응답을 3000ms(3초) 고의 지연시키고,
  // '마우스' 등 다른 키워드는 즉각 응답 처리하게 함으로써 검색어 레이스 컨디션을 유도합니다.
  if (q === '노트북') {
    delay = 3000;
  } else if (q === '마우스') {
    delay = 400;
  }

  setTimeout(() => {
    const results = items.filter(i => i.name.includes(q) || i.category.includes(q));
    res.json(results);
  }, delay);
});

// API: Input stock
app.post('/api/inventory/input', (req, res) => {
  const { itemId, warehouse, qty } = req.body;
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.warehouseStocks[warehouse] += qty;
    activityLogs.unshift({
      id: `log-${Date.now()}`,
      itemId,
      type: "입고",
      msg: `${item.name} ${warehouse}창고 ${qty}개 입고 처리`,
      time: new Date().toLocaleTimeString()
    });
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: "품목 없음" });
  }
});

// API: Output stock (Error 1 output race 1s delay)
app.post('/api/inventory/output', (req, res) => {
  const { itemId, warehouse, qty } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 출고 처리를 1000ms(1초) 인위 지연시킵니다. 
  // 만약 목적지 창고(B)의 재고가 지연 4초로 인해 아직 0개라면,
  // 출고 기능은 에러를 처리하지 않고 엉뚱하게 출발지 A 창고에서 차감하여 A와 B 재고를 
  // 이중 차감시키고 총 재고가 증발하는 데이터 유실 상태를 초래합니다.
  setTimeout(() => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      if (item.warehouseStocks[warehouse] >= qty) {
        item.warehouseStocks[warehouse] -= qty;
        console.log(`[DB OUTPUT] Outputted ${qty} from ${warehouse}. Current: ${item.warehouseStocks[warehouse]}`);
      } else {
        // Buggy fallback: deducts from 'A'!
        item.warehouseStocks['A'] -= qty;
        console.log(`[DB OUTPUT BUG] Out of stock at ${warehouse}. Deducted ${qty} from A instead!`);
      }
      
      activityLogs.unshift({
        id: `log-${Date.now()}`,
        itemId,
        type: "출고",
        msg: `${item.name} 출고 처리 (${warehouse}창고 시도 / 대리 차감 오류 가능)`,
        time: new Date().toLocaleTimeString()
      });
    }
  }, 1000);

  res.json({ success: true });
});

// API: Transfer stock between warehouses (Error 1 transfer race 4s delay on adding)
app.post('/api/inventory/transfer', (req, res) => {
  const { itemId, fromWh, toWh, qty } = req.body;
  const item = items.find(i => i.id === itemId);

  if (item) {
    // Deduct immediately
    item.warehouseStocks[fromWh] -= qty;
    console.log(`[DB TRANSFER] Deducted ${qty} from source ${fromWh} immediately.`);

    // INTENTIONAL_ERROR
    // CATEGORY: Backend + Database
    // DESCRIPTION: 창고간 재고 이동 요청 시, 출발지 창고의 재고 차감은 즉시 완료되지만
    // 목적지 창고의 재고 합산 반영은 4000ms(4초)의 인위 지연을 부여합니다.
    setTimeout(() => {
      item.warehouseStocks[toWh] += qty;
      console.log(`[DB TRANSFER] Completed delayed addition of ${qty} to dest ${toWh}`);
    }, 4000);

    activityLogs.unshift({
      id: `log-${Date.now()}`,
      itemId,
      type: "이동",
      msg: `${item.name} 재고 이동 (${fromWh} -> ${toWh}, 수량 ${qty})`,
      time: new Date().toLocaleTimeString()
    });
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "품목 없음" });
  }
});

// API: Adjust stock (Error 3 adjustment always returns 409 conflict)
app.post('/api/inventory/adjust', (req, res) => {
  const { itemId, warehouse, qty } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Frontend
  // DESCRIPTION: 재고 조정 수행 시 무조건 HTTP 409 Conflict 오류 상태코드를 리턴하게 고정합니다.
  // 그럼에도 프론트는 성공 응답처럼 수량을 갱신하고 화면에 표시하는 모순을 발생시킵니다.
  res.status(409).json({
    error: "재고 동시성 락 충돌 (Conflict): 다른 작업자가 세션을 선점하고 있습니다."
  });
});

// API: Get Purchase Orders
app.get('/api/orders', (req, res) => {
  res.json(purchaseOrders);
});

// API: Create Purchase Order
app.post('/api/orders', (req, res) => {
  const { itemId, qty } = req.body;
  const newOrder = {
    id: `po-${Date.now()}`,
    itemId,
    qty,
    status: "발주중",
    date: new Date().toLocaleDateString()
  };

  purchaseOrders.push(newOrder);

  // Sync expected stocks cache
  expectedIncomingStocks[itemId] = (expectedIncomingStocks[itemId] || 0) + qty;

  res.json(newOrder);
});

// API: Delete Purchase Order (Error 4 PO deletion expected stock orphan)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const po = purchaseOrders.find(p => p.id === id);

  if (po) {
    // Remove from active list
    purchaseOrders = purchaseOrders.filter(p => p.id !== id);

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 발주(PO) 건을 취소/삭제 처리하더라도, 연동되는 예상 입고 수량 스택(`expectedIncomingStocks`)
    // 에서는 해당 발주량을 차감하지 않고 영구 가산 유지합니다. 이 결과로 부족 재고 경고가 부당 차단됩니다.
    // Normally we should do: expectedIncomingStocks[po.itemId] -= po.qty;
    // But we leave it orphan.
    console.log(`[DB PO] PO ${id} deleted from list, but expected stock cache for ${po.itemId} remains ${expectedIncomingStocks[po.itemId]}`);
  }

  res.json({ success: true });
});

// API: Get expected stock quantities
app.get('/api/inventory/expected', (req, res) => {
  res.json(expectedIncomingStocks);
});

// API: Get Logs
app.get('/api/logs', (req, res) => {
  res.json(activityLogs);
});

// API: CSV Export (Error 6 Export filter divergence)
app.get('/api/inventory/export', (req, res) => {
  const { currentFilter, exportFilterName } = req.query;

  // INTENTIONAL_ERROR
  // CATEGORY: Server
  // DESCRIPTION: CSV 파일 다운로드 생성 시, 파일 내용 빌드는 요청 당시의 
  // 이전 필터 조건(currentFilter)을 기반으로 파일 스트림을 엮어내지만,
  // 다운로드 파일 명칭 헤더(Content-Disposition)에는 신규 변경된 필터명(exportFilterName)을 
  // 덮어씌워 출력하는 서버 필터 불동기화 오류를 내포합니다.
  setTimeout(() => {
    const filteredItems = items.filter(i => currentFilter === 'All' || i.category === currentFilter);
    
    // Write CSV content in UTF-8 with BOM
    let csvContent = "\uFEFFID,품목명,카테고리,A창고,B창고,C창고\n";
    filteredItems.forEach(x => {
      csvContent += `${x.id},${x.name},${x.category},${x.warehouseStocks.A},${x.warehouseStocks.B},${x.warehouseStocks.C}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=inventory_${encodeURIComponent(exportFilterName)}.csv`);
    res.send(csvContent);
  }, 1500);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  items = [
    { id: "prod-01", name: "게이밍 기계식 키보드 K9", category: "가전/디지털", warehouseStocks: { A: 10, B: 5, C: 20 }, minRequired: 15 },
    { id: "prod-02", name: "무선 버티컬 마우스 V3", category: "가전/디지털", warehouseStocks: { A: 5, B: 2, C: 8 }, minRequired: 10 },
    { id: "prod-03", name: "울트라 와이드 모니터 34인치", category: "가전/디지털", warehouseStocks: { A: 12, B: 0, C: 4 }, minRequired: 15 },
    { id: "prod-04", name: "고성능 그래픽카드 RTX4080", category: "가전/디지털", warehouseStocks: { A: 4, B: 1, C: 2 }, minRequired: 8 },
    { id: "prod-05", name: "게이밍 노트북 16인치 i9", category: "가전/디지털", warehouseStocks: { A: 10, B: 0, C: 0 }, minRequired: 12 },
    { id: "prod-06", name: "오버사이즈 후드티 그레이", category: "패션/의류", warehouseStocks: { A: 20, B: 15, C: 40 }, minRequired: 30 },
    { id: "prod-07", name: "슬림핏 블랙 데님 팬츠", category: "패션/의류", warehouseStocks: { A: 15, B: 20, C: 25 }, minRequired: 25 },
    { id: "prod-08", name: "가죽 첼시 부츠 브라운", category: "패션/의류", warehouseStocks: { A: 8, B: 4, C: 12 }, minRequired: 10 },
    { id: "prod-09", name: "방풍 경량 바람막이 자켓", category: "패션/의류", warehouseStocks: { A: 30, B: 10, C: 15 }, minRequired: 20 },
    { id: "prod-10", name: "울 블렌드 싱글 코트 네이비", category: "패션/의류", warehouseStocks: { A: 5, B: 8, C: 2 }, minRequired: 10 },
    { id: "prod-11", name: "유기농 착즙 과일 주스", category: "식품/리빙", warehouseStocks: { A: 50, B: 30, C: 80 }, minRequired: 60 },
    { id: "prod-12", name: "통밀 아몬드 시리얼 바", category: "식품/리빙", warehouseStocks: { A: 100, B: 50, C: 120 }, minRequired: 80 },
    { id: "prod-13", name: "친환경 대나무 칫솔 세트", category: "식품/리빙", warehouseStocks: { A: 40, B: 20, C: 60 }, minRequired: 40 },
    { id: "prod-14", name: "스마트 무선 가습기 4L", category: "식품/리빙", warehouseStocks: { A: 14, B: 6, C: 10 }, minRequired: 15 },
    { id: "prod-15", name: "메모리폼 기능성 경추 베개", category: "식품/리빙", warehouseStocks: { A: 25, B: 10, C: 15 }, minRequired: 20 },
    { id: "prod-16", name: "블루투스 노이즈캔슬링 헤드폰", category: "가전/디지털", warehouseStocks: { A: 18, B: 8, C: 25 }, minRequired: 20 },
    { id: "prod-17", name: "USB Type-C 멀티 허브 8in1", category: "가전/디지털", warehouseStocks: { A: 35, B: 15, C: 40 }, minRequired: 30 },
    { id: "prod-18", name: "미러리스 카메라 단렌즈 키트", category: "가전/디지털", warehouseStocks: { A: 3, B: 2, C: 5 }, minRequired: 6 },
    { id: "prod-19", name: "스마트 터치 LED 스탠드", category: "가전/디지털", warehouseStocks: { A: 22, B: 12, C: 18 }, minRequired: 20 },
    { id: "prod-20", name: "휴대용 미니 보조배터리 10000", category: "가전/디지털", warehouseStocks: { A: 50, B: 25, C: 45 }, minRequired: 40 },
    { id: "prod-21", name: "캐주얼 코튼 옥스퍼드 셔츠", category: "패션/의류", warehouseStocks: { A: 45, B: 20, C: 35 }, minRequired: 35 },
    { id: "prod-22", name: "린넨 반소매 티셔츠 화이트", category: "패션/의류", warehouseStocks: { A: 60, B: 40, C: 80 }, minRequired: 50 },
    { id: "prod-23", name: "암막 차광 수면 안대 블랙", category: "식품/리빙", warehouseStocks: { A: 15, B: 5, C: 20 }, minRequired: 15 },
    { id: "prod-24", name: "무독성 실리콘 주방 조리기구", category: "식품/리빙", warehouseStocks: { A: 28, B: 12, C: 30 }, minRequired: 20 },
    { id: "prod-25", name: "에어프라이어 종이호일 100매", category: "식품/리빙", warehouseStocks: { A: 80, B: 40, C: 90 }, minRequired: 70 }
  ];
  purchaseOrders = [
    { id: "po-01", itemId: "prod-04", qty: 20, status: "발주중", date: "2026-07-13" },
    { id: "po-02", itemId: "prod-18", qty: 10, status: "발주중", date: "2026-07-13" }
  ];
  expectedIncomingStocks = {
    "prod-04": 20,
    "prod-18": 10
  };
  activityLogs = [];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[StockPilot Backend] Express server running on http://localhost:${PORT}`);
});
