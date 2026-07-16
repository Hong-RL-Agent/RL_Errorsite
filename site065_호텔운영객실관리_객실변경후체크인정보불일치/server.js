import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9564;

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
    return { rooms: [], reservations: [], branchStats: {}, stats: {} };
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

// API: Get rooms list
app.get('/api/rooms', (req, res) => {
  const db = readDB();
  res.json(db.rooms);
});

// API: Room cleaning update
app.patch('/api/rooms/:id/cleaning', (req, res) => {
  const { id } = req.params;
  const { cleaning } = req.body;
  const db = readDB();
  
  const room = db.rooms.find(r => r.id === id);
  if (room) {
    room.cleaning = cleaning;
    writeDB(db);
    console.log(`[DB ROOM] Cleaned room ${room.number} to status ${cleaning}`);
  }
  res.json(room);
});

// API: Get reservations
app.get('/api/reservations', (req, res) => {
  const db = readDB();
  res.json(db.reservations);
});

// API: Search Reservations (Error 4 Target)
app.get('/api/reservations/search', (req, res) => {
  const { q } = req.query;
  const db = readDB();
  let filtered = db.reservations;

  if (q) {
    filtered = filtered.filter(r => r.guestName.includes(q) || r.id.includes(q));
  }

  let delay = 100;
  if (q === '김철수') {
    delay = 3000; // 3.0s delay
  } else if (q === '김영희') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 예약 검색어 '김철수'(3초 지연) 입력 직후 '김영희'(0.2초)로 고속 변경 시, 
  // 늦게 응답을 완료한 '김철수' 결과가 목록에 최종 덮어써지고, 오른쪽 상세 화면에는 
  // '김영희' 정보가 기재되어 화면 정보 불일치가 발생하는 비동기 경합 결함입니다.
  setTimeout(() => {
    res.json(filtered);
  }, delay);
});

// API: Room change (Error 1 Target - 0.1s delay)
app.patch('/api/reservations/:id/room', (req, res) => {
  const { id } = req.params;
  const { roomId, roomNumber } = req.body;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.roomId = roomId;
      resv.roomNumber = Number(roomNumber);
      writeDB(db);
      console.log(`[DB ROOM CHANGE] Changed reservation ${id} room to ${roomNumber} (0.1s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 100);
});

// API: Check-in (Error 1 Target - 3.0s delay)
app.post('/api/reservations/:id/checkin', (req, res) => {
  const { id } = req.params;
  const { roomId, roomNumber } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 객실 변경 직후 체크인을 요청하면, 체크인 API(3초 지연)가 수행되면서 
  // 프론트엔드로부터 전달된 이전의 객실 번호(roomId, roomNumber)를 토대로 투숙 처리를 완료하여, 
  // 실제 DB 데이터상에서는 변경 전 이전 객실로 투숙 처리가 원복되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CHECKED_IN';
      if (roomId) {
        resv.roomId = roomId;
        resv.roomNumber = Number(roomNumber);
      }
      
      // Update room occupancy status
      const room = db.rooms.find(r => r.id === resv.roomId);
      if (room) {
        room.status = 'OCCUPIED';
      }
      writeDB(db);
      console.log(`[DB CHECKIN] Check-in completed for ${resv.guestName} in room ${resv.roomNumber} (3s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 3000);
});

// API: Check-out (Error 3 Target - 0.5s delay)
app.post('/api/reservations/:id/checkout', (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.status = 'CHECKED_OUT';
      resv.paymentStatus = 'PAID';

      // Revert room occupancy
      const room = db.rooms.find(r => r.id === resv.roomId);
      if (room) {
        room.status = 'VACANT';
        room.cleaning = 'DIRTY';
      }
      writeDB(db);
      console.log(`[DB CHECKOUT] Checked out ${id}. Payment set to PAID (0.5s done)`);
    }
    res.json({ success: true, reservation: resv });
  }, 500);
});

// API: Update Service Charge (Error 3 Target - 4.0s delay)
app.patch('/api/reservations/:id/service', (req, res) => {
  const { id } = req.params;
  const { serviceCharge } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 체크아웃(POST, 0.5초 완료) 실행 직후 추가 요금 갱신(PATCH, 4초 지연)을 요청하면, 
  // 4초 뒤 서비스 요금액이 갱신되면서 결제 대금 상태를 'UNPAID'(미결제)로 무단 변경 처리하여, 
  // 이미 끝난 예약 건의 청구서가 미결제 상태로 복귀되는 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const resv = db.reservations.find(r => r.id === id);
    if (resv) {
      resv.serviceCharge = Number(serviceCharge);
      resv.paymentStatus = 'UNPAID'; // Reset to UNPAID since service details changed
      writeDB(db);
      console.log(`[DB SERVICE UPDATE] Service charge updated for ${id} to ${serviceCharge}. Payment status reset to UNPAID.`);
    }
    res.json({ success: true, reservation: resv });
  }, 4000);
});

// API: Delete Reservation (Error 5 Target)
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.reservations = db.reservations.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약을 완전히 삭제(DELETE) 처리하더라도, 
  // 전체 객실 점유 현황 및 청소 관리 일정 요약 통계 테이블(`stats.occupiedCount`)에서 
  // 해당 건수를 제외하지 않고 누락 방치하여 시스템 통계에 잔여 일정 허수가 남게 하는 결함입니다.
  writeDB(db);
  console.log(`[DB RESERVATION DELETE] Removed reservation ${id}. Left occupancy stats untouched!`);
  res.json({ success: true });
});

// Reset Sandbox Database
app.post('/api/reset', (req, res) => {
  const initial = {
    "rooms": [
      { "id": "RM-101", "number": 101, "type": "Standard", "floor": 1, "status": "OCCUPIED", "cleaning": "DIRTY" },
      { "id": "RM-102", "number": 102, "type": "Standard", "floor": 1, "status": "VACANT", "cleaning": "CLEAN" },
      { "id": "RM-103", "number": 103, "type": "Standard", "floor": 1, "status": "OCCUPIED", "cleaning": "DIRTY" }
    ],
    "reservations": [
      { "id": "RV-01", "guestName": "홍길동", "phone": "010-1111-2222", "roomId": "RM-101", "roomNumber": 101, "checkInDate": "2026-07-15", "checkOutDate": "2026-07-18", "status": "CHECKED_IN", "serviceCharge": 25000, "paymentStatus": "PAID" }
    ],
    "branchStats": {
      "서울 본점": {
        "dailyRevenue": 4850000,
        "pendingCustomerRequests": 8
      },
      "부산 지점": {
        "dailyRevenue": 2150000,
        "pendingCustomerRequests": 3
      }
    },
    "stats": {
      "occupiedCount": 10,
      "cleaningQueueCount": 18
    }
  };
  writeDB(initial);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[HotelDesk Server] Running on http://localhost:${PORT}`);
});
