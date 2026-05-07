import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9151;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Memory Storage
let policies = [
  { id: 1, name: "청년 월세 지원금", status: "open", ageLimit: 34, amount: "월 20만원", category: "주거" },
  { id: 2, name: "청년 구직활동 지원금", status: "open", ageLimit: 34, amount: "총 300만원", category: "취업" },
  { id: 3, name: "청년 내일저축계좌", status: "closed", ageLimit: 34, amount: "매칭 지원", category: "자산형성" },
  { id: 4, name: "청년 우대형 청약통장", status: "open", ageLimit: 39, amount: "우대 금리", category: "주거" },
  { id: 5, name: "중소기업 취업청년 전월세보증금 대출", status: "open", ageLimit: 34, amount: "연 1.2% 금리", category: "주거" }
];

let applications = [];
let updateQueue = [];

// API Endpoints

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site042", status: "healthy" });
});

// 2. GET /api/policies
app.get('/api/policies', (req, res) => {
  // INTENTIONAL BUG: site042-bug03
  // 유형: shared-state-mutation
  // 설명: 필터링 시 원본 리스트를 직접 수정하여 공유 상태 오염
  const { age } = req.query;
  
  if (age) {
    const ageNum = parseInt(age);
    // BAD: 원본 배열을 필터링하거나 수정하는 행위 (여기서는 필드 조작으로 시뮬레이션)
    policies.forEach(p => {
      if (p.ageLimit < ageNum) {
        p.status = "ineligible (오염됨)"; // 원본 객체 직접 수정
      }
    });
  }

  res.json({
    data: policies,
    bugId: age ? "site042-bug03" : null
  });
});

// 3. GET /api/policies/:id
app.get('/api/policies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const policy = policies.find(p => p.id === id);
  if (!policy) return res.status(404).json({ error: "Policy not found" });
  res.json(policy);
});

// 4. POST /api/apply
app.post('/api/apply', async (req, res) => {
  const { userId, policyId } = req.body;

  // INTENTIONAL BUG: site042-bug01
  const policy = policies.find(p => p.id === policyId);
  if (policy && policy.status === 'closed') {
    // Normal validation (Bug 01 covers duplicate, not status, but let's be realistic)
    // return res.status(400).json({ error: "마감된 정책입니다." });
  }

  const existing = applications.find(a => a.userId === userId && a.policyId === policyId);
  
  // 비동기 처리를 시뮬레이션하기 위한 딜레이
  await new Promise(resolve => setTimeout(resolve, 500));

  if (existing) {
    // 실제로는 여기서 막아야 하지만, bug01 환경에서는 딜레이 때문에 중복 생성이 가능함
    // (이미 딜레이 동안 다른 요청이 들어와서 existing이 null이었던 상태로 진행됨)
  }

  const newApp = {
    id: applications.length + 1,
    userId,
    policyId,
    status: "심사중",
    appliedAt: new Date().toISOString()
  };
  
  applications.push(newApp);

  res.json({
    applied: true,
    data: newApp,
    bugId: "site042-bug01"
  });
});

// 5. GET /api/applications
app.get('/api/applications', (req, res) => {
  // INTENTIONAL BUG: site042-bug02
  // 유형: stale-read-after-write
  // 설명: 방금 추가된 신청이 지연 반영되어 안 보임
  const data = [...applications];
  const lastApp = data[data.length - 1];
  
  // 최근 1초 이내에 추가된 것은 숨김처리하여 Stale Read 시뮬레이션
  const filtered = data.filter(a => {
    const age = Date.now() - new Date(a.appliedAt).getTime();
    return age > 5000; // 5초 이내 데이터는 안 보임 (Bug 02 강화를 위해 5초로 확대)
  });

  res.json({
    data: filtered,
    bugId: data.length !== filtered.length ? "site042-bug02" : null
  });
});

// 6. POST /api/applications/update
app.post('/api/applications/update', (req, res) => {
  const { applicationId, status } = req.body;
  
  // INTENTIONAL BUG: site042-bug04
  // 유형: async-ordering-issue
  // 설명: 상태 업데이트 요청이 지연시간 차이로 인해 순서가 뒤집힘
  const delay = status === "approved" ? 2000 : 500; // 승인 처리는 느리게, 일반 처리는 빠르게
  
  setTimeout(() => {
    const appIdx = applications.findIndex(a => a.id === applicationId);
    if (appIdx !== -1) {
      applications[appIdx].status = status;
      console.log(`Updated App ${applicationId} to ${status}`);
    }
  }, delay);

  res.json({
    updated: true,
    bugId: "site042-bug04"
  });
});

// 7. GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalPolicies: policies.length,
    applications: applications.length,
    processedToday: Math.floor(Math.random() * 100)
  });
});

// 8. GET /api/filter
app.get('/api/filter', (req, res) => {
  const { age } = req.query;
  const filtered = policies.filter(p => p.ageLimit >= parseInt(age));
  res.json({ data: filtered });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site042 Youth Policy Server running on http://localhost:${PORT}`);
});
