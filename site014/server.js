import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9123;

app.use(cors({ origin: '*', exposedHeaders: ['X-Bug-Id'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Memory State ---
let userSettings = { marketingOptIn: false, privacyLevel: "Standard" };
let logs = [];

const listings = [
  { id: 1, name: "루미나 더 가든", price: "25억", area: "105㎡", views: 120, tags: ["신축", "숲세권"] },
  { id: 2, name: "펜트하우스 스카이", price: "55억", area: "210㎡", views: 340, tags: ["럭셔리", "한강뷰"] },
  { id: 3, name: "골든 팰리스", price: "40억", area: "150㎡", views: 215, tags: ["역세권", "호화"] },
  { id: 4, name: "어반 테라스", price: "18억", area: "84㎡", views: 180, tags: ["모던", "도심"] }
];

const pushLog = (msg, type = "INFO") => {
  logs.unshift({ id: Date.now(), msg, type, time: new Date().toISOString() });
  if (logs.length > 30) logs.pop();
};

// --- API ---

app.get('/api/health', (req, res) => res.json({ ok: true, site: "site014", status: "healthy" }));

// Bug 01: Silent Privacy Setting Change (개인정보 설정 무단 변경)
app.post('/api/user/settings', (req, res) => {
  const { privacyLevel, triggerBug } = req.body;
  const bugId = 'site014-bug01';
  
  userSettings.privacyLevel = privacyLevel;
  if (triggerBug) {
    userSettings.marketingOptIn = true; // 무단으로 마케팅 수신 동의 변경
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Silent marketing opt-in during privacy update (site014-bug01).`, "BUG");
    return res.json({ status: "updated", bugId, settings: userSettings });
  }
  res.json({ status: "updated", settings: userSettings });
});

// Bug 02: Contextless Form Requirement (민감 정보 과다 요구)
app.get('/api/form/metadata', (req, res) => {
  const { triggerBug } = req.query;
  const bugId = 'site014-bug02';
  const fields = [
    { id: "name", label: "성함", required: true },
    { id: "phone", label: "연락처", required: true }
  ];
  if (triggerBug) {
    fields.push({ id: "ssn", label: "주민등록번호", required: true, reason: null }); // 맥락 없는 주민번호 요구
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Sensitive field requested without context (site014-bug02).`, "BUG");
    return res.json({ fields, bugId });
  }
  res.json({ fields });
});

// Bug 03: Personalized Recommendation Failure (추천 로직 미작동)
app.get('/api/recommendations', (req, res) => {
  const { filter, triggerBug } = req.query;
  const bugId = 'site014-bug03';
  if (triggerBug) {
    // 필터를 무시하고 항상 정적인 광고성 매물만 반환
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Recommendation engine returning static promotional content only (site014-bug03).`, "BUG");
    return res.json({ data: [listings[1], listings[2]], bugId });
  }
  const filtered = listings.filter(l => !filter || l.tags.includes(filter));
  res.json({ data: filtered });
});

// Bug 04: Fake Social Proof (조회수 인위적 조작)
app.get('/api/listings/analytics', (req, res) => {
  const { triggerBug } = req.query;
  const bugId = 'site014-bug04';
  if (triggerBug) {
    const fakeData = listings.map(l => ({ ...l, views: l.views * 100 + 1500 })); // 가짜 조회수
    res.setHeader('X-Bug-Id', bugId);
    pushLog(`ERROR: Artificially inflated view counts for marketing pressure (site014-bug04).`, "BUG");
    return res.json({ data: fakeData, bugId });
  }
  res.json({ data: listings });
});

// 정상 기능: 매물 통계 리포트
app.get('/api/report/summary', (req, res) => {
  const summary = {
    totalListings: listings.length,
    averagePrice: "34.5억",
    activeUsers: 142,
    lastUpdate: new Date().toLocaleTimeString()
  };
  pushLog("System summary report generated.", "SYSTEM");
  res.json(summary);
});

app.get('/api/logs', (req, res) => res.json({ data: logs }));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site014 Lumina Real Estate running on http://localhost:${PORT}`);
});
