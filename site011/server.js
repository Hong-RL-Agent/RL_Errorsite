const express = require('express');
const path = require('path');
const app = express();
const PORT = 9340;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock DB
let plants = [
  { id: 'p1', name: '몬스테라', type: '관엽식물', watered: false, lastWatered: '2024-04-20', ownerId: 'user123', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p2', name: '산세베리아', type: '다육식물', watered: true, lastWatered: '2024-05-01', ownerId: 'user123', image: 'https://images.unsplash.com/photo-1599307767316-776533da941c?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p3', name: '테이블야자', type: '관엽식물', watered: false, lastWatered: '2024-04-28', ownerId: 'user123', image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=300&h=300' }
];

let growthRecords = [
  { id: 'g1', plantId: 'p1', date: '2024-04-25', note: '새 잎이 돋아나기 시작함!', height: '35cm' },
  { id: 'g2', plantId: 'p1', date: '2024-05-01', note: '잎이 아주 커졌어요.', height: '38cm' }
];

let currentUser = 'user123';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Garden Planner API is running' });
});

app.get('/api/plants', (req, res) => {
  res.json(plants.filter(p => p.ownerId === currentUser));
});

// INTENTIONAL BUG: site011-bug01
// CSV Error: DB 상태 저장 누락
// Type: database-persistence
// Description: 물주기 완료 API가 성공 응답을 보내지만 실제 mock DB의 watered 상태를 변경하지 않음.
app.post('/api/watering/:id', (req, res) => {
  const plant = plants.find(p => p.id === req.params.id);
  if (!plant) return res.status(404).json({ error: 'Plant not found' });

  // // 원래는 이 코드가 있어야 함:
  // plant.watered = true;
  // plant.lastWatered = new Date().toISOString().split('T')[0];

  res.json({ success: true, message: 'Watered successfully' });
});

// INTENTIONAL BUG: site011-bug02
// CSV Error: API 응답 스키마 불일치
// Type: network-schema-mismatch
// Description: 성장 기록 API가 records 배열 대신 data 객체로 반환하여 일부 데이터 흐름이 어긋남.
app.get('/api/growth/:plantId', (req, res) => {
  const records = growthRecords.filter(r => r.plantId === req.params.id || r.plantId === req.params.plantId);
  // 원래 기대 형태: res.json(records);
  res.json({ data: records }); // Schema mismatch
});

// INTENTIONAL BUG: site011-bug03
// CSV Error: 사용자 식별 검증 누락
// Type: security-user-validation
// Description: 요청 body의 ownerId를 그대로 신뢰해 다른 사용자의 식물 기록을 추가할 수 있음.
app.post('/api/growth', (req, res) => {
  const { plantId, note, height, ownerId } = req.body;
  
  // ownerId 검증 없이 그대로 저장
  const newRecord = {
    id: 'g' + Date.now(),
    plantId,
    date: new Date().toISOString().split('T')[0],
    note,
    height,
    ownerId // 클라이언트가 보낸 ownerId를 그대로 신뢰
  };

  growthRecords.push(newRecord);
  res.status(201).json({ success: true, record: newRecord });
});

app.get('/api/tips', (req, res) => {
  res.json([
    { title: '과습 방지법', content: '겉흙이 말랐을 때 물을 주는 것이 중요합니다.' },
    { title: '일조량 관리', content: '몬스테라는 반음지에서도 잘 자라지만 밝은 곳을 좋아해요.' },
    { title: '환기의 중요성', content: '식물에게 공기 순환은 영양분만큼 중요합니다.' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
