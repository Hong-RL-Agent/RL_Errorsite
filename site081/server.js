import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9190;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id', 'Content-Range', 'Content-Length', 'Accept-Ranges']
}));
app.use(express.json());

// --- Mock Data ---
const videos = [
  { id: 1, title: "Global Tech Summit 2026", duration: 120, size: 1048576 }, // 1MB mock video
  { id: 2, title: "Nature in 8K - Cinematic", duration: 300, size: 5242880 },
  { id: 3, title: "Cyberpunk City Drive", duration: 180, size: 2097152 },
];

let serverLogs = [];
const addLog = (method, url, status, bugId = null) => {
  serverLogs.push({
    id: Date.now(),
    time: new Date().toISOString(),
    method,
    url,
    status,
    bugId
  });
  if (serverLogs.length > 20) serverLogs.shift();
};

// Create a mock buffer of 1MB for streaming
const mockBuffer = Buffer.alloc(1048576);
for (let i = 0; i < mockBuffer.length; i++) {
  mockBuffer[i] = i % 256;
}

// --- API Endpoints ---

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site081", status: "healthy" });
});

// 2. GET /api/videos
app.get('/api/videos', (req, res) => {
  res.json({ data: videos });
});

// 3. GET /api/video/:id
app.get('/api/video/:id', (req, res) => {
  const video = videos.find(v => v.id === parseInt(req.params.id));
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json(video);
});

// 4. GET /api/video/stream (Core Logic for Bugs)
app.get('/api/video/stream', (req, res) => {
  const trigger = req.query.trigger;
  const range = req.headers.range;
  let bugId = null;

  // Default range if not provided
  let start = 0;
  let end = 10000; // Small chunk

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 10000, mockBuffer.length - 1);
  }

  // Ensure bounds
  start = Math.max(0, start);
  end = Math.min(end, mockBuffer.length - 1);

  let chunk = mockBuffer.slice(start, end + 1);
  let contentLength = chunk.length;

  // --- Bug Implementations ---

  // Bug 01: range-offset-miscalculation
  if (trigger === 'bug01') {
    // Return data from a completely different offset
    const offset = 50000;
    chunk = mockBuffer.slice(offset, offset + (end - start + 1));
    bugId = 'site081-bug01';
  }

  // Bug 02: chunk-boundary-loss
  if (trigger === 'bug02') {
    // Remove bytes in the middle of the chunk
    if (chunk.length > 100) {
      const p1 = chunk.slice(0, 20);
      const p2 = chunk.slice(50);
      chunk = Buffer.concat([p1, p2]);
      contentLength = chunk.length;
    }
    bugId = 'site081-bug02';
  }

  // Bug 03: partial-length-mismatch
  if (trigger === 'bug03') {
    // Set header length > actual data
    contentLength = chunk.length + 500; 
    bugId = 'site081-bug03';
  }

  // Bug 04: premature-stream-termination
  if (trigger === 'bug04') {
    bugId = 'site081-bug04';
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${mockBuffer.length}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunk.length);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('X-Bug-Id', bugId);
    
    // Send partial and destroy
    res.write(chunk.slice(0, Math.floor(chunk.length / 2)));
    addLog('GET', '/api/video/stream', 206, bugId);
    return res.destroy(); // Abruptly terminate
  }

  // Normal Response (or modified by bugs 01-03)
  res.status(206);
  res.setHeader('Content-Range', `bytes ${start}-${end}/${mockBuffer.length}`);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Length', contentLength);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('X-Bug-Id', bugId || '');

  addLog('GET', '/api/video/stream', 206, bugId);
  res.end(chunk);
});

// 5. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalVideos: videos.length,
    activeStreams: Math.floor(Math.random() * 50) + 10,
    serverUptime: "14d 2h 35m",
    bandwidthUsage: "1.2 GB/s"
  });
});

// 6. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({ data: serverLogs.slice().reverse() });
});

// SPA fallback & Static
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`StreamMaster server running on http://localhost:${PORT}`);
});
