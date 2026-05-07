import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9199;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Memory Store ---
const DEFAULT_SETTINGS = {
  darkMode: false,
  notifications: true,
  username: "Standard_User",
  fontSize: "medium",
  accentColor: "#2ac1bc"
};

let userSettings = { ...DEFAULT_SETTINGS };
let logs = [
  { id: 1, time: new Date().toISOString(), msg: "시스템 부팅 및 프레임워크 초기화 완료", type: "SYSTEM" },
  { id: 2, time: new Date().toISOString(), msg: "사용자 커스텀 프로필 로드 성공", type: "CONFIG" }
];

const pushLog = (msg, type = "INFO") => {
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), msg, type });
  if (logs.length > 50) logs.pop();
};

// --- API ---

app.get('/api/health', (req, res) => res.json({ ok: true, site: "site090", status: "healthy" }));

app.get('/api/settings', (req, res) => {
  const { source } = req.query;

  // Bug 02: Config Priority Conflict (Functional Name: System Data Inconsistency)
  if (source === 'system') {
    const bugId = 'site090-bug02';
    pushLog("데이터 동기화 분석 중 소스 불일치 감지", "BUG");
    res.setHeader('X-Bug-Id', bugId);
    return res.json({
      data: { ...userSettings, darkMode: !userSettings.darkMode },
      bugId,
      source: 'system'
    });
  }

  const bugId = 'site090-bug01';
  res.setHeader('X-Bug-Id', bugId);
  res.json({ data: userSettings, bugId });
});

app.post('/api/settings', (req, res) => {
  const { darkMode, notifications, username, fontSize } = req.body;
  
  // Bug 03: Feature Toggle Not Applied
  if (darkMode !== undefined) {
    const bugId = 'site090-bug03';
    pushLog(`환경 설정 변경 시도: DarkMode -> ${darkMode}`, "BUG");
    userSettings.darkMode = darkMode; 
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ status: "updated", bugId });
  }

  // Bug 01: Default Override Failure
  if (username) {
    const bugId = 'site090-bug01';
    pushLog(`프로필 속성 업데이트 차단됨 (기본값 강제 적용): ${username}`, "BUG");
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ status: "ignored", bugId });
  }

  if (fontSize) userSettings.fontSize = fontSize;
  if (notifications !== undefined) userSettings.notifications = notifications;

  pushLog("시스템 환경 변수 업데이트 성공", "INFO");
  res.json({ status: "success" });
});

app.post('/api/settings/reset', (req, res) => {
  const bugId = 'site090-bug04';
  userSettings = { 
    ...DEFAULT_SETTINGS, 
    username: userSettings.username 
  };
  pushLog("설정 데이터 전역 초기화 수행 중 일부 예외 발생", "BUG");
  res.setHeader('X-Bug-Id', bugId);
  res.json({ status: "reset", bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({ 
    users: 12, 
    uptime: "99.98%", 
    activeConfig: "v1.2.0-stable",
    lastSync: new Date().toLocaleTimeString()
  });
});

app.get('/api/logs', (req, res) => {
  const bugId = 'site090-bug02';
  res.setHeader('X-Bug-Id', bugId);
  res.json({ data: logs, bugId });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site090 Admin Dashboard active on http://localhost:${PORT}`);
});
