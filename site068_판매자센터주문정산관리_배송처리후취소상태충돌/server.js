import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9567;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_PATH = path.join(__dirname, 'data', 'data.json');

// Read database helper
const readDB = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { products: [], orders: [], sellerStats: {} };
  }
};

// Write database helper
const writeDB = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// API: Get products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// API: Price Update (Error 1 Target - 3.0s delay)
app.patch('/api/products/:id/price', (req, res) => {
  const { id } = req.params;
  const { price, discountRate } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 상품 가격 수정(3초 지연) 직후 할인율 수정(0.1초 완료)을 연속 실행하면, 
  // 3초 뒤 가격 완료 처리 내부에서 이전 캐시 정보(discountRate)를 같이 갱신 덮어쓰기하여 
  // 새로고침 시 할인율이 변경 이전 값으로 회귀 롤백되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const prod = db.products.find(p => p.id === id);
    if (prod) {
      prod.price = Number(price);
      if (discountRate !== undefined) {
        prod.discountRate = Number(discountRate);
      }
      writeDB(db);
      console.log(`[DB PRICE UPDATE] Price saved for ${id} to ${price} (3s done)`);
    }
    res.json({ success: true, product: prod });
  }, 3000);
});

// API: Discount rate update (Error 1 Target - 0.1s delay)
app.patch('/api/products/:id/discount', (req, res) => {
  const { id } = req.params;
  const { discountRate } = req.body;

  setTimeout(() => {
    const db = readDB();
    const prod = db.products.find(p => p.id === id);
    if (prod) {
      prod.discountRate = Number(discountRate);
      writeDB(db);
      console.log(`[DB DISCOUNT UPDATE] Discount saved for ${id} to ${discountRate}% (0.1s done)`);
    }
    res.json({ success: true, product: prod });
  }, 100);
});

// API: Option Stock update (Error 3 Target)
app.patch('/api/products/:id/stock', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const db = readDB();

  const prod = db.products.find(p => p.id === id);
  if (prod) {
    prod.stock = Number(stock);
    writeDB(db);
    console.log(`[DB STOCK UPDATE] Stock updated for ${id} to ${stock}`);
  }
  res.json({ success: true, product: prod });
});

// API: Delete Product (Error 4 Target)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.products = db.products.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 상품을 카탈로그에서 영구 삭제하더라도, 
  // 기존 주문 기록 및 대시보드 매출 실적 통계(`sellerStats.totalSalesCount`)에서 
  // 삭제한 상품 분량을 차감/소거하지 않고 누출 유지하여 통계 지표에 허수가 생기는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE PRODUCT] Removed product ${id}. Statistics remain unchanged.`);
  res.json({ success: true });
});

// API: Get orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// API: Filtered search orders (Error 5 Target)
app.get('/api/orders/search', (req, res) => {
  const { q, status } = req.query;
  const db = readDB();
  let list = db.orders;

  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }
  if (q) {
    list = list.filter(o => o.guestName.includes(q) || o.productName.includes(q));
  }

  let delay = 100;
  if (status === 'CANCELLED') {
    delay = 3000; // 3.0s delay
  } else if (status === 'SHIPPING') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 주문 상태를 '주문취소'(CANCELLED, 3초 지연) 변경 후 즉시 '배송중'(SHIPPING, 0.2초)으로 변경 시 
  // 비동기 속도 차이로 인해 이전 요청(취소 목록)이 최신 배송중 목록 결과를 최종 덮어써서 
  // 선택 상세 패널 정보와 불일치되는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Cancel Order (Error 2 Target - 0.5s delay)
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL ORDER] Cancelled order ${id} (0.5s done)`);
    }
    res.json({ success: true, order });
  }, 500);
});

// API: Ship Order (Error 2 Target - 4.0s delay)
app.post('/api/orders/:id/ship', (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 배송 처리(POST, 4초 지연) 요청 즉시 주문 취소 승인(POST, 0.5초 완료)을 실행하면, 
  // 4초 뒤 지연 완료된 배송 처리 응답이 취소된 주문의 최종 상태값을 다시 'SHIPPING'(배송 중)으로 무단 롤백 오버라이트하는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = 'SHIPPING';
      writeDB(db);
      console.log(`[DB SHIP ORDER] Shipped order ${id} (4s done). Overwrote cancel state.`);
    }
    res.json({ success: true, order });
  }, 4000);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "products": [
      { "id": "PD-01", "name": "프리미엄 레더 미니백", "price": 89000, "discountRate": 10, "stock": 45, "status": "SALE" },
      { "id": "PD-02", "name": "오버핏 코튼 맨투맨 티셔츠", "price": 45000, "discountRate": 5, "stock": 120, "status": "SALE" }
    ],
    "orders": [
      { "id": "OD-01", "guestName": "김민수", "phone": "010-1234-5678", "productId": "PD-01", "productName": "프리미엄 레더 미니백", "quantity": 1, "price": 80100, "status": "PENDING" }
    ],
    "sellerStats": {
      "A": {
        "unsettledAmount": 1850000,
        "pendingInquiriesCount": 14,
        "totalSalesCount": 185
      },
      "B": {
        "unsettledAmount": 420000,
        "pendingInquiriesCount": 2,
        "totalSalesCount": 42
      }
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SellerHub Server] Running on http://localhost:${PORT}`);
});
