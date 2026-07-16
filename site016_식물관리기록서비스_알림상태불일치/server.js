import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5015;

app.use(cors());
app.use(express.json());

// Plants database
let plants = [
  { id: "plant-1", name: "몬스테라 아단소니", species: "Monstera adansonii", waterPeriod: 7, repotPeriod: 180, location: "거실 안쪽 창가" },
  { id: "plant-2", name: "스킨답서스 엔조이", species: "Epipremnum aureum", waterPeriod: 5, repotPeriod: 120, location: "주방 가전 선반" },
  { id: "plant-3", name: "은엽 아카시아", species: "Acacia baileyana", waterPeriod: 10, repotPeriod: 365, location: "남향 베란다 정면" }
];

// Watering & Care logs database
let wateringLogs = [
  { id: "log-1", plantId: "plant-1", type: "water", date: "2026-06-18", memo: "배수 구멍으로 스며나올 때까지 흠뻑 샤워기로 공급" },
  { id: "log-2", plantId: "plant-2", type: "water", date: "2026-06-20", memo: "액체 영양제 희석수 250ml 공급" },
  { id: "log-3", plantId: "plant-3", type: "repot", date: "2026-06-10", memo: "이태리 토분으로 분갈이 및 배수층 황토 자갈 배치" }
];

// Care tasks calendar database
let tasks = [
  { id: "task-1", title: "몬스테라 잎 먼지 닦아주기", date: "2026-06-24", type: "check" },
  { id: "task-2", title: "스킨답서스 공중뿌리 지지대 묶기", date: "2026-06-25", type: "fertilize" },
  { id: "task-3", title: "아카시아 흙마름 수분 촉촉 상태 검진", date: "2026-06-26", type: "check" }
];

// API: Get plants
app.get('/api/plants', (req, res) => {
  res.json(plants);
});

// API: Register/Update plant
app.post('/api/plants', (req, res) => {
  const { id, name, species, waterPeriod, repotPeriod, location } = req.body;
  if (!name || !species) {
    return res.status(400).json({ error: "식물 이름과 학명은 필수 입력값입니다." });
  }

  if (id) {
    // Update
    plants = plants.map(p => p.id === id ? { ...p, name, species, waterPeriod: Number(waterPeriod), repotPeriod: Number(repotPeriod), location } : p);
    res.json({ success: true, plant: { id, name, species, waterPeriod, repotPeriod, location } });
  } else {
    // Create
    const newPlant = {
      id: `plant-${Date.now()}`,
      name,
      species,
      waterPeriod: Number(waterPeriod) || 7,
      repotPeriod: Number(repotPeriod) || 180,
      location: location || "미지정"
    };
    plants.push(newPlant);
    res.status(201).json({ success: true, plant: newPlant });
  }
});

// API: Delete plant (Error 3)
app.delete('/api/plants/:id', (req, res) => {
  const { id } = req.params;

  // Remove from plants array
  plants = plants.filter(p => p.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 식물을 삭제할 때, 해당 식물의 고유 ID를 가리키고 있는 
  // 물주기/비료 등의 이력 데이터베이스(wateringLogs) 필드들의 연쇄 삭제(Cascade Delete)를 누락시킵니다.
  // 이로 인해 식물 카드 목록은 삭제되지만, 메모리에 고아 물주기 정보가 삭제되지 않고 누출 고스트로 존재하게 됩니다.
  // 원래 진행해야 하는 아래 누출 필터 코드를 생략합니다:
  // wateringLogs = wateringLogs.filter(log => log.plantId !== id);

  res.json({ success: true, plants });
});

// API: Get watering logs
app.get('/api/watering', (req, res) => {
  res.json(wateringLogs);
});

// API: Add watering/care log
app.post('/api/watering', (req, res) => {
  const { plantId, type, date, memo } = req.body;
  if (!plantId || !type || !date) {
    return res.status(400).json({ error: "연동 식물 ID, 유형, 관리 일자는 필수 항목입니다." });
  }

  const newLog = {
    id: `log-${Date.now()}`,
    plantId,
    type,
    date,
    memo: memo || ""
  };
  wateringLogs.push(newLog);
  res.status(201).json(newLog);
});

// API: Get schedule tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// API: Create care task
app.post('/api/tasks', (req, res) => {
  const { title, date, type } = req.body;
  if (!title || !date) {
    return res.status(400).json({ error: "할 일 명칭과 일정 날짜는 필수 항목입니다." });
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    date,
    type: type || "check"
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.listen(PORT, () => {
  console.log(`[GreenNote Backend] Express server running on http://localhost:${PORT}`);
});
