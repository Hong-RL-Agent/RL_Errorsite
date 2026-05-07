import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9175;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let sensors = [
  { id: 1, name: 'Main Living Room', location: 'Floor 1', type: 'Indoor' },
  { id: 2, name: 'Master Bedroom', location: 'Floor 2', type: 'Indoor' },
  { id: 3, name: 'Kitchen Vent', location: 'Floor 1', type: 'Exhaust' },
];

let sensorData = {};
sensors.forEach(s => {
  sensorData[s.id] = Array.from({ length: 24 }, (_, i) => ({
    pm25: Math.floor(Math.random() * 50) + 10,
    unit: 'μg/m3',
    timestamp: Date.now() - (24 - i) * 3600000
  }));
});

// Bug 01 Seed: Add some high values in mg/m3 unit
sensorData[1][5] = { pm25: 15, unit: 'mg/m3', timestamp: Date.now() - 18 * 3600000 }; 

let logs = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site066", status: "healthy" });
});

app.get('/api/sensors', (req, res) => {
  res.json({ data: sensors });
});

app.get('/api/sensors/data', (req, res) => {
  const { sensorId, avg, triggerBug } = req.query;
  const sId = parseInt(sensorId) || 1;
  let data = [...(sensorData[sId] || [])];
  let bugId = null;

  // BUG 01: unit-mismatch-conversion
  if (triggerBug === 'true' && avg !== 'true') {
    bugId = 'site066-bug01';
    // Actually apply the bug: multiply one record's value by 1000 (mg to ug mismatch)
    data = data.map((d, i) => i === 0 ? { ...d, pm25: d.pm25 * 1000, unit: 'mg/m3 (Error)' } : d);
    logs.push({ time: Date.now(), msg: `[오류] 단위 혼동 발생 (Bug 01) 트리거됨: 데이터 왜곡 발생` });
  }

  // BUG 02: moving-average-skip
  if (avg === 'true' && triggerBug === 'true') {
    bugId = 'site066-bug02';
    const subset = data.filter((_, i) => i < 5 || i > 15);
    const faultyAvg = subset.reduce((acc, curr) => acc + curr.pm25, 0) / subset.length;
    logs.push({ time: Date.now(), msg: `[오류] 이동 평균 계산 누락 (Bug 02) 트리거됨` });
    return res.json({ data, average: faultyAvg, bugId });
  }

  // Normal average if not bug
  const realAvg = data.reduce((acc, curr) => acc + curr.pm25, 0) / data.length;
  res.json({ data, average: realAvg, bugId: null });
});

app.get('/api/sensors/latest', (req, res) => {
  const { sensorId, triggerBug } = req.query;
  const sId = parseInt(sensorId) || 1;
  const data = [...(sensorData[sId] || [])];
  
  let bugId = null;
  let latest = null;

  if (triggerBug === 'true') {
    // BUG 03: latest-record-selection-error
    bugId = 'site066-bug03';
    latest = data[0]; // Return the OLDEST instead of latest
    logs.push({ time: Date.now(), msg: `[오류] 최신 데이터 선택 실패 (Bug 03) 트리거됨` });
  } else {
    // Normal: sort by timestamp and take latest
    data.sort((a, b) => b.timestamp - a.timestamp);
    latest = data[0];
  }
  
  res.json({ ...latest, sensorId: sId, bugId });
});

app.get('/api/sensors/status', (req, res) => {
  const { sensorId, triggerBug } = req.query;
  const sId = parseInt(sensorId) || 1;
  const data = [...sensorData[sId]];
  data.sort((a, b) => b.timestamp - a.timestamp);
  const latest = data[0];
  const pm25 = latest.pm25;

  let bugId = null;
  let status = "Moderate";

  if (triggerBug === 'true') {
    // BUG 04: threshold-comparison-inversion
    bugId = 'site066-bug04';
    if (pm25 < 100) status = "Bad"; 
    else status = "Good";
    logs.push({ time: Date.now(), msg: `[오류] 임계값 판별 반전 (Bug 04) 트리거됨` });
  } else {
    // Normal logic
    if (pm25 > 100) status = "Bad";
    else if (pm25 > 35) status = "Moderate";
    else status = "Good";
  }

  res.json({ sensorId: sId, pm25, status, bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  const allData = Object.values(sensorData).flat();
  const avg = allData.reduce((acc, curr) => acc + curr.pm25, 0) / allData.length;
  res.json({
    avgPm25: Math.round(avg),
    totalSensors: sensors.length,
    badSensors: sensors.filter(s => {
      const last = sensorData[s.id][sensorData[s.id].length - 1];
      return last.pm25 > 50;
    }).length
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

app.post('/api/sensors/simulate', (req, res) => {
  const { sensorId, pm25 } = req.body;
  const sId = parseInt(sensorId);
  if (sensorData[sId]) {
    sensorData[sId].push({ pm25, unit: 'μg/m3', timestamp: Date.now() });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Sensor not found" });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site066 on http://localhost:${PORT}`));
