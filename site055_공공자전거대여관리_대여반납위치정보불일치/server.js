import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5055;

app.use(cors());
app.use(express.json());

// Stations database (Minimum 12 items)
let stations = [
  { id: "st-01", name: "강남역 1번 출구", region: "강남구", x: 120, y: 160, capacity: 15, bikesCount: 8 },
  { id: "st-02", name: "신도림역 앞 광장", region: "구로구", x: 60, y: 220, capacity: 20, bikesCount: 12 },
  { id: "st-03", name: "여의도 한강공원 입구", region: "영등포구", x: 140, y: 240, capacity: 30, bikesCount: 18 },
  { id: "st-04", name: "홍대입구역 2번 출구", region: "마포구", x: 80, y: 80, capacity: 20, bikesCount: 10 },
  { id: "st-05", name: "잠실역 롯데월드타워", region: "송파구", x: 260, y: 180, capacity: 25, bikesCount: 15 },
  { id: "st-06", name: "고속터미널 센트럴시티", region: "서초구", x: 180, y: 200, capacity: 15, bikesCount: 7 },
  { id: "st-07", name: "마포대교 남단 초소", region: "영등포구", x: 130, y: 200, capacity: 18, bikesCount: 9 },
  { id: "st-08", name: "시청역 덕수궁 대한문", region: "중구", x: 160, y: 110, capacity: 15, bikesCount: 6 },
  { id: "st-09", name: "대학로 마로니에 공원", region: "종로구", x: 200, y: 90, capacity: 12, bikesCount: 5 },
  { id: "st-10", name: "가산디지털단지 3번출구", region: "금천구", x: 50, y: 280, capacity: 15, bikesCount: 8 },
  { id: "st-11", name: "상암 월드컵경기장역", region: "마포구", x: 40, y: 120, capacity: 20, bikesCount: 11 },
  { id: "st-12", name: "성수역 4번 출구 앞", region: "성동구", x: 240, y: 120, capacity: 18, bikesCount: 9 }
];

// Bikes database (Minimum 30 items)
let bikes = [];
for (let i = 1; i <= 30; i++) {
  const stationIndex = (i % 12);
  bikes.push({
    id: `bike-${String(i).padStart(2, '0')}`,
    stationId: `st-${String(stationIndex + 1).padStart(2, '0')}`,
    status: i % 10 === 0 ? "UNDER_INSPECTION" : "AVAILABLE",
    model: i % 2 === 0 ? "일반 따릉이" : "QR형 자전거"
  });
}

// Rentals database
let rentals = [
  { id: "rent-init-01", bikeId: "bike-05", user: "사용자 A", startStation: "st-01", endStation: "st-03", date: "2026-07-12", status: "COMPLETED" }
];

// Fault reports
let faultReports = [];

// Tickets Info
const userTickets = {
  "사용자 A": { name: "1일 2시간 패스권", remainingMinutes: 120 },
  "사용자 B": { name: "30일 1시간 정기권", remainingMinutes: 15 }
};

// Return targets cache (Error 2 Target)
const bikeReturnStations = {};

// API: Get stations
app.get('/api/stations', (req, res) => {
  res.json(stations);
});

// API: Refresh stations (Error 5 Target - refresh race simulator)
app.get('/api/stations/refresh', (req, res) => {
  const { count } = req.query; // Simulated counter to differentiate speed
  
  let delay = 100;
  if (count === '1') {
    delay = 3000; // 3s delay (returns outdated bikes count)
  } else if (count === '2') {
    delay = 200; // 0.2s delay (returns fresh/modified count)
  }

  // Modifying one station count dynamically to make the discrepancy visible
  const stationsCopy = JSON.parse(JSON.stringify(stations));
  if (count === '1') {
    // Old stale state
    stationsCopy[0].bikesCount = 8;
  } else {
    // Fresh state
    stationsCopy[0].bikesCount = 12;
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network
  // DESCRIPTION: 새로고침 순서(count 1 vs 2)에 따라 응답 지연을 다르게 주어 
  // 구형 수량 데이터(8대)가 3초 뒤에 뒤늦게 유입되어 최신 수량(12대)을 덮어쓰고, 
  // 지도상의 수치와 상세 패널의 수치 불합치를 자아내는 결함입니다.
  setTimeout(() => {
    res.json(stationsCopy);
  }, delay);
});

// API: Get Bikes
app.get('/api/bikes', (req, res) => {
  res.json(bikes);
});

// API: Start Rental (Error 1 Target - Concurrent double rental)
app.post('/api/rent', (req, res) => {
  const { bikeId, user, startStation } = req.body;

  const bike = bikes.find(b => b.id === bikeId);
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend
  // DESCRIPTION: 자전거의 'RENTED' 여부를 백엔드 컨트롤러 단에서 차단 확인하지 않고 
  // 들어오는 모든 요청에 성공 응답을 내려보냄으로써, 동일 자전거에 대해 2건의 
  // 대여 이력이 중복으로 DB에 적재되도록 만드는 동시성 결함입니다.
  if (bike) {
    bike.status = "RENTED";
    
    // Decrement bike count at start station
    const station = stations.find(s => s.id === startStation);
    if (station) {
      station.bikesCount = Math.max(0, station.bikesCount - 1);
    }
  }

  const newRental = {
    id: `rent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    bikeId,
    user,
    startStation,
    endStation: null,
    date: new Date().toLocaleDateString(),
    status: "ACTIVE"
  };
  rentals.push(newRental);

  res.json({ success: true, rental: newRental });
});

// API: Patch return station (Error 2 Target - 3s delay)
app.patch('/api/rentals/:bikeId/return-station', (req, res) => {
  const { bikeId } = req.params;
  const { stationId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 반납 대여소 변경(PATCH) 요청은 3000ms(3초) 강제 지연 처리됩니다. 
  // 변경 직후 반납(0.1초 완료)이 실행되면, 반납 완료 당시에는 이전 대여소를 타겟 삼아 완료 처리되고, 
  // 3초 뒤 변경 처리가 뒤늦게 덮어써져 자전거 위치가 모호해지는 결함입니다.
  setTimeout(() => {
    bikeReturnStations[bikeId] = stationId;
    console.log(`[DB RENTAL TARGET] Return target for ${bikeId} set to ${stationId}`);
    res.json({ success: true, targetStationId: stationId });
  }, 3000);
});

// API: Return bike (Error 2 Target - 0.1s delay)
app.post('/api/rentals/:bikeId/return', (req, res) => {
  const { bikeId } = req.params;
  const { user } = req.body;

  const activeRental = rentals.find(r => r.bikeId === bikeId && r.user === user && r.status === "ACTIVE");

  setTimeout(() => {
    if (activeRental) {
      // Determine End Station: reads from the current memory target.
      // If the PATCH hasn't resolved yet, this defaults to the previous target station.
      const assignedTarget = bikeReturnStations[bikeId] || "st-01"; // Default to previous/initial
      
      activeRental.status = "COMPLETED";
      activeRental.endStation = assignedTarget;

      const bike = bikes.find(b => b.id === bikeId);
      if (bike) {
        bike.status = "AVAILABLE";
        bike.stationId = assignedTarget; // Previous station!
      }

      // Increment bike count at return station
      const station = stations.find(s => s.id === assignedTarget);
      if (station) {
        station.bikesCount += 1;
      }

      console.log(`[DB RETURN] Bike ${bikeId} returned to ${assignedTarget}`);
    }
    res.json({ success: true });
  }, 100);
});

// API: Get usage history
app.get('/api/rentals/history', (req, res) => {
  const { user } = req.query;
  const filtered = rentals.filter(r => r.user === user);
  res.json(filtered);
});

// API: Get tickets
app.get('/api/tickets', (req, res) => {
  const { user } = req.query;
  res.json(userTickets[user] || { name: "이용권 없음", remainingMinutes: 0 });
});

// API: Get faults
app.get('/api/faults', (req, res) => {
  res.json(faultReports);
});

// API: File fault report
app.post('/api/faults', (req, res) => {
  const { bikeId, description } = req.body;
  const newReport = {
    id: `fault-${Date.now()}`,
    bikeId,
    description,
    status: "점검 중"
  };
  faultReports.push(newReport);

  const bike = bikes.find(b => b.id === bikeId);
  if (bike) {
    bike.status = "UNDER_INSPECTION";
  }

  res.json(newReport);
});

// API: Cancel fault report (Error 4 Target - Status bypass)
app.delete('/api/faults/:id', (req, res) => {
  const { id } = req.params;
  const report = faultReports.find(f => f.id === id);

  if (report) {
    faultReports = faultReports.filter(f => f.id !== id);

    // INTENTIONAL_ERROR
    // CATEGORY: Database
    // DESCRIPTION: 고장 신고가 철회/삭제되어도 해당 자전거(`bikeId`)의 물리적 상태 필드(`status`)를 
    // 점검 중('UNDER_INSPECTION')에서 사용 가능('AVAILABLE') 상태로 롤백해주는 로직을 누락하여 
    // 취소되었는데도 영구 점검 중으로 격리되는 결함입니다.
    console.log(`[DB FAULT CANCEL] Fault ${id} cancelled. BUT bike status remains UNDER_INSPECTION!`);
  }

  res.json({ success: true });
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  stations = [
    { id: "st-01", name: "강남역 1번 출구", region: "강남구", x: 120, y: 160, capacity: 15, bikesCount: 8 },
    { id: "st-02", name: "신도림역 앞 광장", region: "구로구", x: 60, y: 220, capacity: 20, bikesCount: 12 },
    { id: "st-03", name: "여의도 한강공원 입구", region: "영등포구", x: 140, y: 240, capacity: 30, bikesCount: 18 },
    { id: "st-04", name: "홍대입구역 2번 출구", region: "마포구", x: 80, y: 80, capacity: 20, bikesCount: 10 },
    { id: "st-05", name: "잠실역 롯데월드타워", region: "송파구", x: 260, y: 180, capacity: 25, bikesCount: 15 },
    { id: "st-06", name: "고속터미널 센트럴시티", region: "서초구", x: 180, y: 200, capacity: 15, bikesCount: 7 },
    { id: "st-07", name: "마포대교 남단 초소", region: "영등포구", x: 130, y: 200, capacity: 18, bikesCount: 9 },
    { id: "st-08", name: "시청역 덕수궁 대한문", region: "중구", x: 160, y: 110, capacity: 15, bikesCount: 6 },
    { id: "st-09", name: "대학로 마로니에 공원", region: "종로구", x: 200, y: 90, capacity: 12, bikesCount: 5 },
    { id: "st-10", name: "가산디지털단지 3번출구", region: "금천구", x: 50, y: 280, capacity: 15, bikesCount: 8 },
    { id: "st-11", name: "상암 월드컵경기장역", region: "마포구", x: 40, y: 120, capacity: 20, bikesCount: 11 },
    { id: "st-12", name: "성수역 4번 출구 앞", region: "성동구", x: 240, y: 120, capacity: 18, bikesCount: 9 }
  ];
  
  bikes = [];
  for (let i = 1; i <= 30; i++) {
    const stationIndex = (i % 12);
    bikes.push({
      id: `bike-${String(i).padStart(2, '0')}`,
      stationId: `st-${String(stationIndex + 1).padStart(2, '0')}`,
      status: i % 10 === 0 ? "UNDER_INSPECTION" : "AVAILABLE",
      model: i % 2 === 0 ? "일반 따릉이" : "QR형 자전거"
    });
  }

  rentals = [
    { id: "rent-init-01", bikeId: "bike-05", user: "사용자 A", startStation: "st-01", endStation: "st-03", date: "2026-07-12", status: "COMPLETED" }
  ];
  faultReports = [];

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[CityBike Backend] Express server running on http://localhost:${PORT}`);
});
