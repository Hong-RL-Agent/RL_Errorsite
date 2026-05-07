import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9110;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Memory State ---
let poll = {
  question: "오늘의 실시간 라이브 주제 선택",
  yes: 0,
  no: 0,
  active: true,
  createdAt: new Date().toISOString()
};

let eventQueue = [];
let logs = [];

const pushLog = (msg, type = "INFO") => {
  logs.unshift({ id: Date.now(), msg, type, time: new Date().toISOString() });
  if (logs.length > 50) logs.pop();
};

// --- API ---

app.get('/api/health', (req, res) => res.json({ ok: true, site: "site001", status: "healthy" }));

app.get('/api/analytics', (req, res) => {
  res.json({
    total: poll.yes + poll.no,
    ratio: poll.yes > 0 || poll.no > 0 ? (poll.yes / (poll.yes + poll.no) * 100).toFixed(1) : 0,
    startTime: poll.createdAt,
    peakTime: new Date().toLocaleTimeString()
  });
});

app.post('/api/poll', (req, res) => {
  const { question } = req.body;
  poll = { question: question || "라이브 설문", yes: 0, no: 0, active: true, createdAt: new Date().toISOString() };
  eventQueue = [];
  pushLog(`System Reset: ${poll.question}`, "SYSTEM");
  res.json({ status: "created", poll });
});

app.post('/api/vote', (req, res) => {
  const { choice, triggerBug } = req.body;
  let bugId = null;

  // Bug 04: Delayed Event Misapplied (종료 후 반영)
  if (!poll.active || triggerBug === 'bug04') {
    bugId = 'site001-bug04';
    poll.yes += 1; // 종료 후에도 반영
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Late vote processed after session end (site001-bug04).`, "BUG");
    return res.json({ status: "counted", bugId });
  }

  // Bug 01: Duplicate Event Processing (이벤트 중복 처리)
  if (triggerBug === 'bug01') {
    bugId = 'site001-bug01';
    poll.yes += 2; // 1번 요청에 2번 반영
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Duplicate event processing detected in stream (site001-bug01).`, "BUG");
    return res.json({ status: "counted", bugId });
  }

  // Bug 03: Event Loss (이벤트 유실)
  if (triggerBug === 'bug03') {
    bugId = 'site001-bug03';
    // poll.yes/no 증가 안함
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Event lost during secondary server transmission (site001-bug03).`, "BUG");
    return res.json({ status: "counted", bugId });
  }

  // Normal Vote
  if (choice === 'yes') poll.yes += 1;
  else poll.no += 1;

  eventQueue.push({ choice, time: Date.now() });
  res.json({ status: "counted" });
});

app.get('/api/result', (req, res) => {
  const { triggerBug } = req.query;

  // Bug 02: Out of order handling (이벤트 순서 오류 - 결과 왜곡)
  if (triggerBug === 'bug02') {
    const bugId = 'site001-bug02';
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Out-of-order event handling caused result distortion (site001-bug02).`, "BUG");
    // 실제와 반대로 응답 (결과 왜곡)
    return res.json({ yes: poll.no + 5, no: poll.yes - 2, bugId });
  }

  res.json({ yes: poll.yes, no: poll.no });
});

app.post('/api/poll/end', (req, res) => {
  poll.active = false;
  pushLog("Polling session closed.", "SYSTEM");
  res.json({ status: "closed" });
});

app.get('/api/logs', (req, res) => res.json({ data: logs }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site001 Engine online at http://localhost:${PORT}`);
});
