import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9565;

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
    return { orders: [], drivers: [], settlements: [] };
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

// API: Get drivers list
app.get('/api/drivers', (req, res) => {
  const db = readDB();
  res.json(db.drivers);
});

// API: Get settlements list
app.get('/api/settlements', (req, res) => {
  const db = readDB();
  res.json(db.settlements);
});

// API: Confirm settlement status
app.patch('/api/settlements/:id/confirm', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const settlement = db.settlements.find(s => s.id === id);
  if (settlement) {
    settlement.status = 'CONFIRMED';
    writeDB(db);
    console.log(`[DB SETTLEMENT] Confirmed settlement ${id}`);
  }
  res.json(settlement);
});

// API: Cancel rider settlement (Error 2 Target)
app.delete('/api/settlements/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  // Find settlement
  const settlementIndex = db.settlements.findIndex(s => s.id === id);
  if (settlementIndex !== -1) {
    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 기사 정산 취소(DELETE) 시 정산 내역서(`settlements`)는 DB에서 영구 삭제 처리하지만, 
    // 기사 프로필 통계의 누적 배달 실적 및 총 정산 완료 수치(`earnings`, `completedCount`)는 
    // 전혀 감소 차감시키지 않고 누수 유지하는 결함입니다.
    db.settlements.splice(settlementIndex, 1);
    writeDB(db);
    console.log(`[DB SETTLEMENT DELETE] Deleted settlement record ${id}. Left driver stats untouched!`);
  }
  res.json({ success: true });
});

// API: Get orders list
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// API: Filtered orders search (Error 3 Target)
app.get('/api/orders/search', (req, res) => {
  const { status, region } = req.query;
  const db = readDB();
  let list = db.orders;

  if (status && status !== 'ALL') {
    list = list.filter(o => o.status === status);
  }
  if (region && region !== 'ALL') {
    list = list.filter(o => o.region === region);
  }

  let delay = 100;
  if (status === 'DELIVERED') {
    delay = 3000; // 3.0s delay
  } else if (region === '강남') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 필터 변경 시 '배달완료'(DELIVERED, 3초 지연)에서 '강남'(0.2초) 지역 필터로 고속 연속 변경할 때, 
  // 상호 경합으로 인하여 늦게 수신된 배달완료 데이터가 목록 뷰를 덮어씌워 지도 마커 개수와 주문 목록 건수 간에 불일치가 발생하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
});

// API: Driver Assign (Error 1 Target)
app.patch('/api/orders/:id/driver', (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;

  let delay = 100;
  if (driverId === 'DR-01') {
    delay = 3000; // 3.0s delay for Driver A (DR-01)
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 기사 A(DR-01, 3초 지연)에게 배정한 직후 기사 B(DR-02, 0.1초 완료)로 연속 변경하면, 
  // 화면에는 일시적으로 B가 즉시 표시되나 3초 후 늦게 완료된 A 배정 요청이 최종 DB를 덮어써서 
  // 새로고침 시 기사가 도로 A로 되돌아가는 배차 경합 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.driverId = driverId;
      order.status = driverId ? 'DELIVERING' : 'MATCHING';
      
      if (driverId) {
        const driver = db.drivers.find(d => d.id === driverId);
        if (driver) driver.status = 'DELIVERING';
      }
      writeDB(db);
      console.log(`[DB ASSIGN] Order ${id} assigned to driver ${driverId} (delayed ${delay}ms)`);
    }
    res.json({ success: true, order });
  }, delay);
});

// API: Complete order
app.post('/api/orders/:id/complete', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const order = db.orders.find(o => o.id === id);
  if (order && order.driverId) {
    order.status = 'DELIVERED';
    
    // Increment driver stats
    const driver = db.drivers.find(d => d.id === order.driverId);
    if (driver) {
      driver.status = 'IDLE';
      driver.completedCount += 1;
      driver.earnings += order.fee;

      // Add settlement record
      const newSettlement = {
        id: `ST-${String(db.settlements.length + 1).padStart(2, '0')}`,
        driverId: driver.id,
        driverName: driver.name,
        amount: driver.earnings,
        status: 'PENDING'
      };
      db.settlements.push(newSettlement);
    }
    writeDB(db);
    console.log(`[DB COMPLETE] Order ${id} completed. Added settlement.`);
  }
  res.json({ success: true, order });
});

// API: Cancel order (Error 4 Target - 0.5s delay)
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = 'CANCELLED';
      if (order.driverId) {
        const driver = db.drivers.find(d => d.id === order.driverId);
        if (driver) driver.status = 'IDLE';
        order.driverId = null;
      }
      writeDB(db);
      console.log(`[DB CANCEL] Order ${id} cancelled (0.5s done)`);
    }
    res.json({ success: true, order });
  }, 500);
});

// API: Address update (Error 4 Target - 4.0s delay)
app.patch('/api/orders/:id/address', (req, res) => {
  const { id } = req.params;
  const { address } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 배달 취소(POST, 0.5초 완료) 실행 직후 주소지 수정(PATCH, 4초 지연)을 요청하면, 
  // 4초 뒤 주소가 수정되면서 주문 상태가 다시 'MATCHING'(배차 대기)으로 무단 롤백되어 
  // 취소된 주문이 강제 복구 생성되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.address = address;
      order.status = 'MATCHING'; // Resets status back to matching!
      writeDB(db);
      console.log(`[DB ADDRESS UPDATE] Saved address for ${id} to ${address}. Reverted status to MATCHING.`);
    }
    res.json({ success: true, order });
  }, 4000);
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "orders": [
      { "id": "OD-01", "storeName": "굽네치킨 신림점", "address": "관악구 신림로 340", "region": "관악", "price": 18000, "fee": 3500, "status": "MATCHING", "driverId": null, "x": 80, "y": 140 },
      { "id": "OD-02", "storeName": "엽기떡볶이 서울대점", "address": "관악구 대학길 12", "region": "관악", "price": 22000, "fee": 4000, "status": "MATCHING", "driverId": null, "x": 110, "y": 180 },
      { "id": "OD-03", "storeName": "스타벅스 구로점", "address": "구로구 디지털로 32", "region": "구로", "price": 12000, "fee": 3000, "status": "PICKED_UP", "driverId": "DR-01", "x": 60, "y": 80 }
    ],
    "drivers": [
      { "id": "DR-01", "name": "김라이더", "phone": "010-9999-1111", "status": "DELIVERING", "completedCount": 15, "earnings": 52500 },
      { "id": "DR-02", "name": "박배달", "phone": "010-9999-2222", "status": "DELIVERING", "completedCount": 8, "earnings": 28000 }
    ],
    "settlements": [
      { "id": "ST-01", "driverId": "DR-01", "driverName": "김라이더", "amount": 52500, "status": "PENDING" }
    ]
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[LocalDispatch Server] Running on http://localhost:${PORT}`);
});
