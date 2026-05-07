const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 9129;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data: Smart Logistics
let shipments = [
  { id: 'SH-001', item: '전자기기 부품', status: 'delivered', origin: '인천', destination: '서울', lastUpdate: '10:00:05' },
  { id: 'SH-002', item: '냉동 식품', status: 'pending', origin: '부산', destination: '대구', lastUpdate: '10:15:20' },
  { id: 'SH-003', item: '의약품', status: 'active', origin: '청주', destination: '인천', lastUpdate: '10:30:11' },
  { id: 'SH-CHAOS', item: '데이터 손상 화물', status: 'error', origin: '???', destination: '???', lastUpdate: '11:00:00' }
];

let vehicleLocks = [
  { id: 'truck:A-102', owner: 'driver-01', location: '경부고속도로' },
  { id: 'truck:B-505', owner: 'driver-04', location: '서해안고속도로' },
  { id: 'van:C-001', owner: 'driver-12', location: '서울 도심' }
];

let logs = [
  { time: '11:00:05', level: 'info', message: 'Logistics Control Center Online.' },
  { time: '11:05:22', level: 'warn', message: 'Driver-03 Connection unstable.' },
  { time: '11:10:45', level: 'info', message: 'Route optimization algorithm applied.' }
];

let resourceUsage = 100;

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: 'site020',
    theme: 'Smart Logistics',
    status: 'operational'
  });
});

// 2. GET /api/shipments
app.get('/api/shipments', (req, res) => {
  res.json(shipments);
});

// 3. POST /api/recovery/dispatch (bug01)
app.post('/api/recovery/dispatch', (req, res) => {
  const { mode } = req.query;
  
  if (mode === 'async-loss') {
    // INTENTIONAL BACKEND BUG: site020-bug01
    // Type: async-recovery-task-loss
    // Description: 배차 복구 시 비동기 주문 데이터 유실 (일부 화물 데이터가 결과에서 누락됨)
    const recoveredShipments = shipments.slice(0, shipments.length - 2); 
    return res.json({ 
      success: true, 
      recoveredCount: recoveredShipments.length, 
      bugId: 'site020-bug01' 
    });
  }

  res.json({ success: true, recoveredCount: shipments.length });
});

// 4. GET /api/shipments/restore (bug02)
app.get('/api/shipments/restore', (req, res) => {
  const { id } = req.query;
  
  if (id === 'SH-CHAOS') {
    // INTENTIONAL BACKEND BUG: site020-bug02
    // Type: corrupted-state-restore-loop
    // Description: 부패한 배송 상태 복원 무한 루프 (응답 데이터에 반복적인 로그 포함하여 시뮬레이션)
    const loopLogs = [];
    for (let i = 0; i < 5; i++) {
      loopLogs.push({ time: new Date().toLocaleTimeString(), level: 'error', message: `Retry loop detected for ${id} state restoration... chunk ${i}` });
    }
    return res.json({ 
      success: false, 
      message: 'Restore Loop Detected', 
      logs: loopLogs,
      bugId: 'site020-bug02' 
    });
  }

  res.json({ success: true, message: `Shipment ${id} state restored successfully.` });
});

// 5. POST /api/shipments/retry (bug03)
app.post('/api/shipments/retry', (req, res) => {
  // INTENTIONAL BACKEND BUG: site020-bug03
  // Type: retry-handler-resource-leak
  // Description: 배송 재시도 핸들러 내 자원 누수 (호출할 때마다 내부 스레드/메모리 카운트가 비정상적으로 증가)
  resourceUsage += 50; 
  
  res.json({ 
    success: true, 
    message: 'Retry dispatch sequence initiated.', 
    usageCount: resourceUsage,
    bugId: 'site020-bug03' 
  });
});

// 6. POST /api/vehicles/simulate-orphan (bug04)
app.post('/api/vehicles/simulate-orphan', (req, res) => {
  // INTENTIONAL BACKEND BUG: site020-bug04
  // Type: distributed-lock-orphan
  // Description: 차량 배차 락(Lock) 고아 현상 (소유 운전자가 없는 고아 락 생성)
  const orphanLock = { id: 'truck:ORPHAN-' + Math.random().toString(36).substr(2, 5), owner: null, location: 'Unknown', bugId: 'site020-bug04' };
  vehicleLocks.push(orphanLock);
  
  res.json({ success: true, lock: orphanLock, bugId: 'site020-bug04' });
});

// 7. GET /api/vehicles
app.get('/api/vehicles', (req, res) => {
  res.json(vehicleLocks);
});

// 8. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Logistics Server is running on http://localhost:${PORT}`);
});
