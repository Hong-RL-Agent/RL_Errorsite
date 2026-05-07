import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9148;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Data
const lines = [
  { lineId: "L1", name: "1호선", color: "#0052A4", stationCount: 30 },
  { lineId: "L2", name: "2호선", color: "#009D3E", stationCount: 51 },
  { lineId: "L3", name: "3호선", color: "#EF7C1C", stationCount: 44 },
  { lineId: "L4", name: "4호선", color: "#00A5DE", stationCount: 48 },
  { lineId: "L5", name: "5호선", color: "#996CAC", stationCount: 56 }
];

const stations = [
  { stationId: "S100", name: "시청", lineId: "L1", congestionLevel: 3, transfer: true },
  { stationId: "S101", name: "종각", lineId: "L1", congestionLevel: 4, transfer: false },
  { stationId: "S102", name: "종로3가", lineId: "L1", congestionLevel: 5, transfer: true },
  { stationId: "S200", name: "강남", lineId: "L2", congestionLevel: 5, transfer: true },
  { stationId: "S201", name: "역삼", lineId: "L2", congestionLevel: 4, transfer: false },
  { stationId: "S300", name: "교대", lineId: "L3", congestionLevel: 3, transfer: true }
];

let alerts = [
  { alertId: "A1", lineId: "L1", title: "신호 장애로 인한 지연", status: "DELAY", description: "1호선 하행선 신호 장애로 인해 약 10분 지연 운행 중입니다.", updatedAt: "2026-05-02T20:00:00Z" },
  { alertId: "A2", lineId: "L2", title: "시설물 점검 안내", status: "NORMAL", description: "역삼역 스크린도어 점검이 완료되어 정상 운행 중입니다.", updatedAt: "2026-05-02T21:30:00Z" },
  { alertId: "A3", lineId: "L4", title: "열차 고장 운행 중단", status: "SUSPENDED", description: "4호선 일부 구간 열차 고장으로 운행이 일시 중단되었습니다.", updatedAt: "2026-05-02T22:00:00Z" }
];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    site: "site034",
    status: "healthy"
  });
});

// 2. GET /api/lines
app.get('/api/lines', (req, res) => {
  // INTENTIONAL BUG: site034-bug02
  // Type: unexpected-extra-field
  res.json({
    data: lines,
    debugMeta: { 
      source: "internal-mock-db",
      timestamp: Date.now(),
      internalFlag: "BETA_TEST_MODE"
    },
    bugId: "site034-bug02",
    type: "unexpected-extra-field"
  });
});

// 3. GET /api/stations
app.get('/api/stations', (req, res) => {
  const { lineId, search } = req.query;
  let filtered = [...stations];

  if (lineId) filtered = filtered.filter(s => s.lineId === lineId);
  if (search) filtered = filtered.filter(s => s.name.includes(search));

  // INTENTIONAL BUG: site034-bug03
  // Type: field-type-mismatch
  // Some congestionLevel values are strings instead of numbers
  const mapped = filtered.map((s, idx) => {
    if (idx % 2 === 0) {
      return { ...s, congestionLevel: s.congestionLevel > 4 ? "critical" : "high" };
    }
    return s;
  });

  res.json({
    data: mapped,
    bugId: "site034-bug03",
    type: "field-type-mismatch"
  });
});

// 4. GET /api/stations/:stationId
app.get('/api/stations/:stationId', (req, res) => {
  const station = stations.find(s => s.stationId === req.params.stationId);
  if (!station) return res.status(404).json({ error: "Station not found" });

  res.json({
    ...station,
    lines: [station.lineId, "L5"], // Mock transfer lines
    firstTrain: "05:30",
    lastTrain: "23:50"
  });
});

// 5. GET /api/alerts
app.get('/api/alerts', (req, res) => {
  // INTENTIONAL BUG: site034-bug01
  // Type: missing-required-field
  // Some records miss lineId or status
  const mapped = alerts.map((a, idx) => {
    if (idx === 1) {
      const { lineId, status, ...rest } = a;
      return rest;
    }
    return a;
  });

  res.json({
    data: mapped,
    bugId: "site034-bug01",
    type: "missing-required-field"
  });
});

// 6. GET /api/alerts/:alertId
app.get('/api/alerts/:alertId', (req, res) => {
  const alert = alerts.find(a => a.alertId === req.params.alertId);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  // INTENTIONAL BUG: site034-bug04
  // Type: enum-value-mismatch
  // Returns "LATE" or "STOP" which are not in [NORMAL, DELAY, SUSPENDED]
  res.json({
    ...alert,
    status: alert.status === "DELAY" ? "LATE" : "STOP",
    bugId: "site034-bug04",
    type: "enum-value-mismatch"
  });
});

// 7. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalLines: lines.length,
    totalStations: 300,
    activeAlerts: alerts.filter(a => a.status !== "NORMAL").length
  });
});

// 8. GET /api/search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = [
    ...stations.filter(s => s.name.includes(q)).map(s => ({ type: 'station', id: s.stationId, name: s.name })),
    ...lines.filter(l => l.name.includes(q)).map(l => ({ type: 'line', id: l.lineId, name: l.name }))
  ];
  res.json(results);
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site034 Subway Dashboard running on http://localhost:${PORT}`);
});
