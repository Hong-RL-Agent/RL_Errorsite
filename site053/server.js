const express = require('express');
const path = require('path');
const app = express();
const PORT = 9382;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let crops = [
  { id: 'crop-1', userId: 'farmer_A', name: '꿀 고구마', plantedDate: '2024-03-15', status: 'Growing' },
  { id: 'crop-2', userId: 'farmer_A', name: '방울 토마토', plantedDate: '2024-04-01', status: 'Flowering' },
  { id: 'crop-99', userId: 'farmer_B', name: '비밀 유기농 삼', plantedDate: '2023-10-10', status: 'Maturing' } // 타인의 작물
];

let tasks = [
  { id: 'task-1', cropId: 'crop-1', date: '2024-05-01', type: 'Watering', note: '충분히 관수함' },
  { id: 'task-2', cropId: 'crop-1', date: '2024-05-05', type: 'Fertilizing', note: '친환경 비료 투입' }
];

let harvests = [
  { id: 'h-1', cropId: 'crop-1', date: '2024-05-10', amount: 50, unit: 'kg', isDeleted: false },
  { id: 'h-2', cropId: 'crop-1', date: '2024-05-11', amount: 100, unit: 'kg', isDeleted: true } // 삭제된 데이터
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FarmDiary API is running' });
});

// API: Get Crops (with multi-tenant bug)
app.get('/api/crops', (req, res) => {
  const { userId } = req.query;

  // INTENTIONAL BUG: site053-bug03
  // CSV Error: 사용자 농장 데이터 분리 실패
  // Type: security-multi-tenant
  // 보안 취약점: 요청자의 userId로 필터링하지 않고 모든 사용자의 작물을 반환함
  // const userCrops = crops.filter(c => c.userId === userId);
  res.json(crops); 
});

// API: Get Harvest Stats (with aggregation and latency bugs)
app.get('/api/stats/:cropId', (req, res) => {
  const { cropId } = req.params;
  const crop = crops.find(c => c.id === cropId);

  // INTENTIONAL BUG: site053-bug02
  // CSV Error: 네트워크 응답 지연
  // Type: network-latency
  // 버그: 특정 작물(예: 방울 토마토) 조회 시 의도적으로 지연 발생
  const isDelayed = crop && (crop.name.includes('토마토'));
  const delay = isDelayed ? 6000 : 0;

  setTimeout(() => {
    const cropHarvests = harvests.filter(h => h.cropId === cropId);

    // INTENTIONAL BUG: site053-bug01
    // CSV Error: DB 수확량 합계 오류
    // Type: database-aggregation
    // 버그: isDeleted: true인 항목도 합산에 포함시킴
    const totalAmount = cropHarvests.reduce((acc, h) => acc + h.amount, 0);

    res.json({
      cropName: crop ? crop.name : 'Unknown',
      totalHarvest: totalAmount,
      history: cropHarvests
    });
  }, delay);
});

app.get('/api/tasks/:cropId', (req, res) => {
  res.json(tasks.filter(t => t.cropId === req.params.cropId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
