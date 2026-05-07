import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9188;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Mock Job Store
let jobs = [
  { id: 1, name: "월간 결제 배치", time: "2026-05-10T09:00:00", status: "scheduled", type: "system" },
  { id: 2, name: "사용자 활동 로그 백업", time: "2026-05-10T10:00:00", status: "scheduled", type: "system" },
  { id: 3, name: "일간 리포트 생성", time: "2026-05-10T11:00:00", status: "scheduled", type: "report" },
];

let executionLogs = [
  { id: 101, jobId: 5, name: "테스트 리마인더", executedAt: new Date().toISOString(), status: "done" },
];

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site079", status: "healthy" });
});

// 2. GET /api/jobs
// Bug 03: scheduled-job-drop
app.get('/api/jobs', (req, res) => {
  // If specific condition (simulating a drop bug), filter out some jobs
  let filteredJobs = [...jobs];
  const isBugTriggered = req.query.trigger === 'bug';
  
  if (isBugTriggered) {
    filteredJobs = jobs.filter(j => j.id % 2 !== 0); // Drop even IDs
    return res.json({ data: filteredJobs, bugId: "site079-bug03", message: "Memory leak detected: 2 jobs dropped from buffer." });
  }

  res.json({ data: filteredJobs });
});

// 3. POST /api/jobs
// Bug 01: cron-schedule-offset-error
app.post('/api/jobs', (req, res) => {
  const { name, time, triggerBug } = req.body;
  const id = jobs.length + 1;
  
  let scheduledTime = time;
  let bugId = null;

  if (triggerBug) {
    // Offset by 1 hour (simulating TZ offset bug)
    const date = new Date(time);
    date.setHours(date.getHours() + 1);
    scheduledTime = date.toISOString();
    bugId = "site079-bug01";
  }

  const newJob = { id, name, time: scheduledTime, status: "scheduled", type: "user" };
  jobs.push(newJob);

  res.json({ ...newJob, bugId });
});

// 4. GET /api/jobs/run
// Bug 02: duplicate-job-execution
app.get('/api/jobs/run', (req, res) => {
  const { id } = req.query;
  const job = jobs.find(j => j.id === parseInt(id));
  
  if (!job) return res.status(404).json({ error: "Job not found" });

  const executions = [
    { jobId: job.id, name: job.name, executedAt: new Date().toISOString(), status: "done" },
    { jobId: job.id, name: job.name, executedAt: new Date().toISOString(), status: "done" } // Duplicate!
  ];

  executionLogs.push(...executions);
  
  res.json({ executions, bugId: "site079-bug02" });
});

// 5. GET /api/jobs/queue
// Bug 04: delayed-queue-order-inversion
app.get('/api/jobs/queue', (req, res) => {
  // Normally should be sorted by time
  // Bug 04: Reverse order or specific inversion
  let queue = jobs.filter(j => j.status === 'scheduled');
  
  // Inversion logic
  queue = [...queue].sort((a, b) => new Date(b.time) - new Date(a.time)); // Latest first (Error!)

  res.json({ queue, bugId: "site079-bug04" });
});

// 6. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalJobs: jobs.length,
    pending: jobs.filter(j => j.status === 'scheduled').length,
    completed: executionLogs.length,
    uptime: "14d 2h 31m"
  });
});

// 7. GET /api/logs
app.get('/api/logs', (req, res) => {
  res.json({ data: executionLogs.slice(-15).reverse() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
