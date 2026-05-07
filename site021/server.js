import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9130;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Memory Store ---
const LIMIT = 100; // 100MB
let userFiles = [
  { id: 1, userId: 1, fileName: "system_core.bin", size: 45, date: new Date().toISOString() },
  { id: 2, userId: 1, fileName: "logs_archive.zip", size: 20, date: new Date().toISOString() }
];

// Bug 02 support: keep track of "ghost" size that was not reclaimed
let phantomSize = 0;

let logs = [
  { time: new Date().toISOString(), msg: "시스템: 스토리지 서브시스템 온라인.", type: "SYSTEM" }
];

const pushLog = (msg, type = "INFO") => {
  logs.unshift({ time: new Date().toISOString(), msg, type });
  if (logs.length > 30) logs.pop();
};

const getUsedSize = (userId) => {
  const realSize = userFiles
    .filter(f => f.userId === userId)
    .reduce((acc, f) => acc + f.size, 0);
  return realSize + phantomSize; // phantomSize reflects Bug 02
};

// --- API ---

app.get('/api/health', (req, res) => res.json({ ok: true, site: "site021", status: "healthy" }));

// Bug 04: 사용자 격리 실패 (userId 무시하고 전체 반환)
app.get('/api/files', (req, res) => {
  const { userId } = req.query;
  const bugId = 'site021-bug04';
  
  res.setHeader('X-Bug-Id', bugId);
  res.json({ data: userFiles, bugId });
});

// Bug 03: 누적 용량 계산 오류 (인위적으로 15.5MB 가산)
app.get('/api/storage', (req, res) => {
  const { userId } = req.query;
  const bugId = 'site021-bug03';
  const realUsed = getUsedSize(parseInt(userId) || 1);
  const fakeUsed = realUsed + 15.5; 

  res.setHeader('X-Bug-Id', bugId);
  res.json({ used: fakeUsed, limit: LIMIT, bugId });
});

// Bug 01: 용량 제한 미적용 (LIMIT 초과해도 허용)
app.post('/api/upload', (req, res) => {
  const { userId, fileName, size } = req.body;
  const currentUsed = getUsedSize(userId);
  const bugId = 'site021-bug01';

  const newFile = {
    id: Date.now(),
    userId,
    fileName,
    size: parseInt(size),
    date: new Date().toISOString()
  };
  
  userFiles.push(newFile);
  pushLog(`업로드: ${fileName} (${size}MB) 저장 완료 (UID: ${userId})`, "SUCCESS");
  
  if (currentUsed + size > LIMIT) {
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`오류: 할당량 초과(${currentUsed + size}/${LIMIT})에도 업로드가 허용됨`, "BUG");
    return res.json({ status: "uploaded", bugId });
  }

  res.json({ status: "uploaded" });
});

// Bug 02: 삭제 후 공간 미회수 (파일은 삭제되나 used 수치는 그대로)
app.delete('/api/file', (req, res) => {
  const { fileName } = req.body;
  const bugId = 'site021-bug02';
  
  const fileToDelete = userFiles.find(f => f.fileName === fileName);
  if (fileToDelete) {
    phantomSize += fileToDelete.size; // Bug 02: 공간 미회수 처리
    userFiles = userFiles.filter(f => f.fileName !== fileName);
    pushLog(`삭제: ${fileName} 제거됨. (공간 회수 대기 중...)`, "WARN");
  }
  
  res.setHeader('X-Bug-Id', bugId);
  res.json({ status: "deleted", bugId });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site021 Storage Engine running on http://localhost:${PORT}`);
});
