import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5047;

app.use(cors());
app.use(express.json());

// Smart Homes DB
let homes = [
  { id: "home-A", name: "서울 서초 아파트" },
  { id: "home-B", name: "양평 산골 전원주택" }
];

// Smart Rooms DB (Error 4 Target)
let rooms = [
  { id: "room-01", homeId: "home-A", name: "거실" },
  { id: "room-02", homeId: "home-A", name: "침실" },
  { id: "room-03", homeId: "home-A", name: "주방" },
  { id: "room-04", homeId: "home-B", name: "안방" },
  { id: "room-05", homeId: "home-B", name: "잔디마당" }
];

// Smart Devices DB (Minimum 18 items)
let devices = [
  // Home A - Room 01 (거실)
  { id: "dev-01", homeId: "home-A", roomId: "room-01", name: "거실 스마트 LED 조명", type: "light", status: "ON", temperature: 24, power: 15 },
  { id: "dev-02", homeId: "home-A", roomId: "room-01", name: "거실 인버터 에어컨", type: "ac", status: "OFF", temperature: 26, power: 1200 },
  { id: "dev-03", homeId: "home-A", roomId: "room-01", name: "65인치 스마트 QLED TV", type: "tv", status: "OFF", temperature: 22, power: 150 },
  { id: "dev-04", homeId: "home-A", roomId: "room-01", name: "IoT 실내 공기청정기", type: "purifier", status: "ON", temperature: 23, power: 45 },
  { id: "dev-05", homeId: "home-A", roomId: "room-01", name: "거실 윈도우 블라인드", type: "blind", status: "OFF", temperature: 24, power: 10 },
  
  // Home A - Room 02 (침실)
  { id: "dev-06", homeId: "home-A", roomId: "room-02", name: "침실 은은한 수면 무드등", type: "light", status: "ON", temperature: 22, power: 8 },
  { id: "dev-07", homeId: "home-A", roomId: "room-02", name: "스마트 온수매트 조절기", type: "heater", status: "OFF", temperature: 35, power: 250 },
  { id: "dev-08", homeId: "home-A", roomId: "room-02", name: "초음파 가습기 복합식", type: "humidifier", status: "OFF", temperature: 23, power: 30 },
  { id: "dev-09", homeId: "home-A", roomId: "room-02", name: "침실 전동 모션베드", type: "bed", status: "OFF", temperature: 22, power: 12 },
  
  // Home A - Room 03 (주방)
  { id: "dev-10", homeId: "home-A", roomId: "room-03", name: "스마트 인덕션 3구", type: "cooker", status: "OFF", temperature: 18, power: 3000 },
  { id: "dev-11", homeId: "home-A", roomId: "room-03", name: "주방 빌트인 식기세척기", type: "dishwasher", status: "OFF", temperature: 20, power: 1500 },
  { id: "dev-12", homeId: "home-A", roomId: "room-03", name: "스마트 환풍기 시스템", type: "fan", status: "OFF", temperature: 21, power: 60 },
  
  // Home B - Room 04 (안방)
  { id: "dev-13", homeId: "home-B", roomId: "room-04", name: "전원주택 안방 메인등", type: "light", status: "OFF", temperature: 23, power: 20 },
  { id: "dev-14", homeId: "home-B", roomId: "room-04", name: "기름보일러 온도 조절기", type: "heater", status: "ON", temperature: 22, power: 80 },
  { id: "dev-15", homeId: "home-B", roomId: "room-04", name: "안방 매립형 에어컨", type: "ac", status: "OFF", temperature: 24, power: 900 },
  { id: "dev-16", homeId: "home-B", roomId: "room-04", name: "스마트 IoT 도어락", type: "lock", status: "ON", temperature: 22, power: 5 },
  
  // Home B - Room 05 (잔디마당)
  { id: "dev-17", homeId: "home-B", roomId: "room-05", name: "잔디마당 자동 스프링클러", type: "waterer", status: "OFF", temperature: 18, power: 120 },
  { id: "dev-18", homeId: "home-B", roomId: "room-05", name: "태양광 인버터 발전 감시기", type: "solar", status: "ON", temperature: 35, power: 0 }
];

// Energy Consumption Logs DB (Error 4 stats preservation)
let energyLogs = [
  { id: "el-01", roomId: "room-01", usage: 340, timestamp: "14:00" },
  { id: "el-02", roomId: "room-02", usage: 120, timestamp: "14:00" },
  { id: "el-03", roomId: "room-03", usage: 450, timestamp: "14:00" },
  { id: "el-04", roomId: "room-04", usage: 220, timestamp: "14:00" },
  { id: "el-05", roomId: "room-05", usage: 80,  timestamp: "14:00" }
];

// Automation Rules DB
let automations = [
  { id: "auto-01", name: "실내 온도 28도 이상 시 거실 에어컨 켜기", condition: "온도 > 28도", action: "에어컨 ON", active: true },
  { id: "auto-02", name: "일몰 시간 안방 블라인드 내리기", condition: "오후 7:00", action: "블라인드 닫기", active: false }
];

// Active IoT Alerts list
let alerts = [
  { id: "not-01", roomId: "room-01", message: "거실 공기질 나쁨 수준 도달. 환풍 시스템 기기 자동 가동 예정", time: "오후 9:00" },
  { id: "not-02", homeId: "home-B", roomId: "room-05", message: "잔디마당 스프링클러 물 공급 완료", time: "오후 8:40" }
];

// API: Get Homes & Rooms
app.get('/api/homes', (req, res) => {
  res.json(homes);
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// API: Get Devices
app.get('/api/devices', (req, res) => {
  res.json(devices);
});

// API: Device status toggle (Error 5 read-only permission control bypass)
app.patch('/api/devices/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const device = devices.find(d => d.id === id);

  if (device) {
    // Actually apply the state change in database!
    device.status = device.status === 'ON' ? 'OFF' : 'ON';
    console.log(`[DB IoT] Device ${id} state toggled to: ${device.status}`);
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 사용자의 권한이 읽기전용(read-only)일 때 HTTP 403 Forbidden 상태코드를 돌려보내 
  // 거절된 척 가장하지만, 실제 데이터베이스의 기기 상태변화 코드를 먼저 덮어쓰고 락을 해제하는 
  // 권한 검증 누수 오류를 구현합니다.
  if (role === 'read-only') {
    console.log(`[AUTH BREACH] Read-only user triggered ${id} toggle. Returned 403 but DB applied state!`);
    return res.status(403).json({
      error: "권한 차단 (403 Forbidden): 읽기 전용 계정은 기기 전원을 조작할 자격이 없습니다."
    });
  }

  res.json({ success: true, device });
});

// API: Set Device Temperature (Error 3 temperature race delay)
app.patch('/api/devices/:id/temperature', (req, res) => {
  const { id } = req.params;
  const { temperature } = req.body;
  
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 홀수 온도(예: 21, 23도 등)로 설정 시 응답에 3000ms(3초) 고의 지연을 걸고,
  // 짝수 온도에는 200ms 즉시 응답을 줌으로써 연달아 슬라이더를 옮겼을 때 
  // 구버전 패킷이 신버전 수치를 덮어쓰게 하여 값이 예전 수치로 되돌아가는 현상을 일으킵니다.
  let delay = 200;
  if (temperature % 2 !== 0) {
    delay = 3000;
  }

  setTimeout(() => {
    const device = devices.find(d => d.id === id);
    if (device) {
      device.temperature = temperature;
      console.log(`[DB IoT] Device ${id} temperature updated: ${temperature}도`);
    }
    res.json({ success: true, temperature });
  }, delay);
});

// API: Get Automations
app.get('/api/automations', (req, res) => {
  res.json(automations);
});

// API: Edit Automation (Error 2 automation edit race 3s delay)
app.put('/api/automations/:id', (req, res) => {
  const { id } = req.params;
  const { name, condition, action } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 자동화 규칙 수정 요청에 3000ms(3초) 인위적 지연을 부여합니다. 
  // 수정 직후 비활성화(PATCH, 0.1초 완료)를 누르면 규칙이 잠시 비활성 처리되나, 
  // 3초 뒤 도달한 수정 핸들러가 규칙을 `active = true` 상태로 회귀 롤백 기입해 버립니다.
  setTimeout(() => {
    const rule = automations.find(a => a.id === id);
    if (rule) {
      rule.name = name;
      rule.condition = condition;
      rule.action = action;
      rule.active = true; // Forced back to active/enabled
      console.log(`[DB AUTO] Automation ${id} updated and forced active: true`);
    }
    res.json({ success: true, rule });
  }, 3000);
});

// API: Disable Automation (Error 2 executes in 0.1s)
app.patch('/api/automations/:id/disable', (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const rule = automations.find(a => a.id === id);
    if (rule) {
      rule.active = false;
      console.log(`[DB AUTO] Automation ${id} disabled (0.1s)`);
    }
  }, 100);
  res.json({ success: true });
});

// API: Delete Room (Error 4 Room deleted, but energy/alerts data remain)
app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  
  // Delete the room from rooms list
  rooms = rooms.filter(r => r.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 방을 제거할 때 디비 무결성 제약 조건(Foreign Key / Cascade Delete)을 해제하여
  // 해당 방에 누적되어 온 에너지 로그(`energyLogs`) 및 기존 경고 알림(`alerts`)을 연쇄 삭제하지 않고 방치합니다.
  // 이 결과로 대시보드의 총 전력량 연산 결과가 눈에 보이는 방들의 합보다 크게 측정되는 버그를 유발합니다.
  console.log(`[DB IoT] Room ${id} deleted from list, but energy logs & notifications remain in DB!`);
  
  res.json({ success: true });
});

// API: Get Energy logs
app.get('/api/energy', (req, res) => {
  res.json(energyLogs);
});

// API: Get Alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// API: Create Automation Rule
app.post('/api/automations', (req, res) => {
  const { name, condition, action } = req.body;
  const newRule = {
    id: `auto-${Date.now()}`,
    name,
    condition,
    action,
    active: true
  };
  automations.push(newRule);
  res.json(newRule);
});

// API: Reset Sandbox
app.post('/api/reset', (req, res) => {
  rooms = [
    { id: "room-01", homeId: "home-A", name: "거실" },
    { id: "room-02", homeId: "home-A", name: "침실" },
    { id: "room-03", homeId: "home-A", name: "주방" },
    { id: "room-04", homeId: "home-B", name: "안방" },
    { id: "room-05", homeId: "home-B", name: "잔디마당" }
  ];
  devices = [
    { id: "dev-01", homeId: "home-A", roomId: "room-01", name: "거실 스마트 LED 조명", type: "light", status: "ON", temperature: 24, power: 15 },
    { id: "dev-02", homeId: "home-A", roomId: "room-01", name: "거실 인버터 에어컨", type: "ac", status: "OFF", temperature: 26, power: 1200 },
    { id: "dev-03", homeId: "home-A", roomId: "room-01", name: "65인치 스마트 QLED TV", type: "tv", status: "OFF", temperature: 22, power: 150 },
    { id: "dev-04", homeId: "home-A", roomId: "room-01", name: "IoT 실내 공기청정기", type: "purifier", status: "ON", temperature: 23, power: 45 },
    { id: "dev-05", homeId: "home-A", roomId: "room-01", name: "거실 윈도우 블라인드", type: "blind", status: "OFF", temperature: 24, power: 10 },
    
    { id: "dev-06", homeId: "home-A", roomId: "room-02", name: "침실 은은한 수면 무드등", type: "light", status: "ON", temperature: 22, power: 8 },
    { id: "dev-07", homeId: "home-A", roomId: "room-02", name: "스마트 온수매트 조절기", type: "heater", status: "OFF", temperature: 35, power: 250 },
    { id: "dev-08", homeId: "home-A", roomId: "room-02", name: "초음파 가습기 복합식", type: "humidifier", status: "OFF", temperature: 23, power: 30 },
    { id: "dev-09", homeId: "home-A", roomId: "room-02", name: "침실 전동 모션베드", type: "bed", status: "OFF", temperature: 22, power: 12 },
    
    { id: "dev-10", homeId: "home-A", roomId: "room-03", name: "스마트 인덕션 3구", type: "cooker", status: "OFF", temperature: 18, power: 3000 },
    { id: "dev-11", homeId: "home-A", roomId: "room-03", name: "주방 빌트인 식기세척기", type: "dishwasher", status: "OFF", temperature: 20, power: 1500 },
    { id: "dev-12", homeId: "home-A", roomId: "room-03", name: "스마트 환풍기 시스템", type: "fan", status: "OFF", temperature: 21, power: 60 },
    
    { id: "dev-13", homeId: "home-B", roomId: "room-04", name: "전원주택 안방 메인등", type: "light", status: "OFF", temperature: 23, power: 20 },
    { id: "dev-14", homeId: "home-B", roomId: "room-04", name: "기름보일러 온도 조절기", type: "heater", status: "ON", temperature: 22, power: 80 },
    { id: "dev-15", homeId: "home-B", roomId: "room-04", name: "안방 매립형 에어컨", type: "ac", status: "OFF", temperature: 24, power: 900 },
    { id: "dev-16", homeId: "home-B", roomId: "room-04", name: "스마트 IoT 도어락", type: "lock", status: "ON", temperature: 22, power: 5 },
    
    { id: "dev-17", homeId: "home-B", roomId: "room-05", name: "잔디마당 자동 스프링클러", type: "waterer", status: "OFF", temperature: 18, power: 120 },
    { id: "dev-18", homeId: "home-B", roomId: "room-05", name: "태양광 인버터 발전 감시기", type: "solar", status: "ON", temperature: 35, power: 0 }
  ];
  energyLogs = [
    { id: "el-01", roomId: "room-01", usage: 340, timestamp: "14:00" },
    { id: "el-02", roomId: "room-02", usage: 120, timestamp: "14:00" },
    { id: "el-03", roomId: "room-03", usage: 450, timestamp: "14:00" },
    { id: "el-04", roomId: "room-04", usage: 220, timestamp: "14:00" },
    { id: "el-05", roomId: "room-05", usage: 80,  timestamp: "14:00" }
  ];
  automations = [
    { id: "auto-01", name: "실내 온도 28도 이상 시 거실 에어컨 켜기", condition: "온도 > 28도", action: "에어컨 ON", active: true },
    { id: "auto-02", name: "일몰 시간 안방 블라인드 내리기", condition: "오후 7:00", action: "블라인드 닫기", active: false }
  ];
  alerts = [
    { id: "not-01", roomId: "room-01", message: "거실 공기질 나쁨 수준 도달. 환풍 시스템 기기 자동 가동 예정", time: "오후 9:00" },
    { id: "not-02", homeId: "home-B", roomId: "room-05", message: "잔디마당 스프링클러 물 공급 완료", time: "오후 8:40" }
  ];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[HomePulse Backend] Express server running on http://localhost:${PORT}`);
});
