import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9173;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let files = [
  { id: 1, name: 'vacation_photo.jpg', size: 1024 * 500, type: 'image/jpeg', category: 'image', uploadedAt: Date.now() - 1000000 },
  { id: 2, name: 'project_report.pdf', size: 1024 * 1200, type: 'application/pdf', category: 'doc', uploadedAt: Date.now() - 500000 },
  { id: 3, name: 'cat_video.mp4', size: 1024 * 5000, type: 'video/mp4', category: 'video', uploadedAt: Date.now() - 200000 },
];

let logs = [];
let nextId = 4;

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site064", status: "healthy" });
});

// BUG 04: metadata-write-delay-desync
app.get('/api/files', (req, res) => {
  const { type } = req.query;
  let data = JSON.parse(JSON.stringify(files));
  let bugId = null;

  if (type) {
    data = data.filter(f => f.category === type);
  }

  // Simulate Bug 04: If there's a very recent file, strip its metadata
  data = data.map(f => {
    if (Date.now() - f.uploadedAt < 10000) { 
      bugId = 'site064-bug04';
      const { name, ...rest } = f;
      return { id: f.id, name }; // Missing size, type, etc.
    }
    return f;
  });

  res.json({ data, bugId });
});

// BUG 01, 02, 03 are in the upload endpoint
app.post('/api/upload', (req, res) => {
  const { fileName, size, type } = req.body;
  let bugId = null;

  // 1. Filename Normalization Collision (BUG 03)
  const normalized = fileName.replace(/\s+/g, '').toLowerCase();
  const existingIdx = files.findIndex(f => f.name.replace(/\s+/g, '').toLowerCase() === normalized);
  
  if (existingIdx !== -1 && fileName !== files[existingIdx].name) {
    bugId = 'site064-bug03';
    logs.push({ time: Date.now(), msg: `[경고] 파일명 충돌 발생 (Bug 03): ${fileName} -> ${files[existingIdx].name} 덮어쓰기` });
    files[existingIdx] = { ...files[existingIdx], size, type, uploadedAt: Date.now() };
    return res.json({ uploaded: true, bugId });
  }

  // 2. MIME Type Spoof Acceptance (BUG 01)
  const isImageExt = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  if (isImageExt && type === 'application/x-msdownload') { // EXE spoofed as JPG
    bugId = 'site064-bug01';
    logs.push({ time: Date.now(), msg: `[보안 위험] MIME 타입 스푸핑 허용 (Bug 01): ${fileName} (실제: EXE)` });
  }

  // 3. File Size Validation Order Error (BUG 02)
  const MAX_SIZE = 1024 * 1024 * 10; // 10MB
  if (size > MAX_SIZE) {
    bugId = 'site064-bug02';
    // Logic error: Save it FIRST, then return error
    const faultyFile = { id: nextId++, name: fileName, size, type, category: 'unknown', uploadedAt: Date.now() };
    files.push(faultyFile);
    logs.push({ time: Date.now(), msg: `[오류] 용량 초과 파일 저장됨 (Bug 02): ${fileName} (${size} bytes)` });
    return res.status(400).json({ uploaded: false, error: "파일 용량이 너무 큽니다.", bugId });
  }

  const newFile = {
    id: nextId++,
    name: fileName,
    size,
    type,
    category: type.split('/')[0] === 'image' ? 'image' : 'doc',
    uploadedAt: Date.now()
  };

  files.push(newFile);
  logs.push({ time: Date.now(), msg: `파일 업로드 완료: ${fileName}` });
  res.json({ uploaded: true, bugId });
});

app.get('/api/files/:id', (req, res) => {
  const file = files.find(f => f.id === parseInt(req.params.id));
  if (file) res.json(file);
  else res.status(404).json({ error: "File not found" });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalFiles: files.length,
    images: files.filter(f => f.category === 'image').length,
    docs: files.filter(f => f.category === 'doc').length,
    videos: files.filter(f => f.category === 'video').length,
  });
});

app.get('/api/files/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

// Bug 01 specific trigger helper
app.get('/api/files/check', (req, res) => {
  const spoofed = files.filter(f => /\.(jpg|jpeg)$/i.test(f.name) && f.type === 'application/x-msdownload');
  res.json({ data: spoofed, bugId: spoofed.length > 0 ? 'site064-bug01' : null });
});

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site064 on http://localhost:${PORT}`));
