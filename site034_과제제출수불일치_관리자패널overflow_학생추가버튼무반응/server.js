import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9253;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const students = [
  { id: "S-1001", name: "김민서", course: "React 실전", progress: 88, attendance: 96, lastLogin: "2026-05-01", submittedAssignments: 7, submitted: true },
  { id: "S-1002", name: "이준호", course: "React 실전", progress: 72, attendance: 89, lastLogin: "2026-04-30", submittedAssignments: 6, submitted: true },
  { id: "S-1003", name: "박소연", course: "데이터 분석", progress: 91, attendance: 98, lastLogin: "2026-05-02", submittedAssignments: 8, submitted: true },
  { id: "S-1004", name: "최유진", course: "UX 리서치", progress: 64, attendance: 82, lastLogin: "2026-04-29", submittedAssignments: 5, submitted: false },
  { id: "S-1005", name: "정하늘", course: "데이터 분석", progress: 79, attendance: 92, lastLogin: "2026-05-01", submittedAssignments: 7, submitted: true },
  { id: "S-1006", name: "한도윤", course: "UX 리서치", progress: 58, attendance: 77, lastLogin: "2026-04-28", submittedAssignments: 4, submitted: false },
  { id: "S-1007", name: "오지아", course: "React 실전", progress: 95, attendance: 99, lastLogin: "2026-05-02", submittedAssignments: 8, submitted: true },
  { id: "S-1008", name: "문서진", course: "AI 기초", progress: 69, attendance: 84, lastLogin: "2026-04-30", submittedAssignments: 5, submitted: false }
];

const assignments = [
  { id: "A-01", course: "React 실전", submittedCount: 28, missingCount: 4, dueDate: "2026-05-06" },
  { id: "A-02", course: "데이터 분석", submittedCount: 25, missingCount: 7, dueDate: "2026-05-08" },
  { id: "A-03", course: "UX 리서치", submittedCount: 19, missingCount: 6, dueDate: "2026-05-10" },
  { id: "A-04", course: "AI 기초", submittedCount: 31, missingCount: 3, dueDate: "2026-05-12" }
];

app.get("/api/health", (req, res) => res.json({ ok: true, site: "site034", service: "LearnOps Admin", port: PORT }));
app.get("/api/students", (req, res) => res.json({ students }));
app.get("/api/assignments", (req, res) => res.json({ assignments }));

app.use(express.static(path.join(__dirname, "dist")));
app.get("/assets/*", (req, res) => res.status(404).type("text/plain").send("Asset not found. Refresh the page to load the latest bundle."));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(PORT, () => console.log(`site034 LearnOps Admin running at http://localhost:${PORT}`));
