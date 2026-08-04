import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 9254;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const flowers = [
  { id: "fl-rose", name: "로즈 밀크 부케", purpose: "기념일", price: 68000, image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80", deliverable: true, recommended: true, deliveryDateLabel: "오늘 도착", soldOut: false },
  { id: "fl-sage", name: "세이지 가든 핸드타이드", purpose: "생일", price: 52000, image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=900&q=80", deliverable: true, recommended: true, deliveryDateLabel: "내일 오전", soldOut: false },
  { id: "fl-cream", name: "크림 라넌큘러스 바스켓", purpose: "집들이", price: 74000, image: "https://images.unsplash.com/photo-1487530903081-59e0e3331512?auto=format&fit=crop&w=900&q=80", deliverable: true, recommended: false, soldOut: false },
  { id: "fl-long", name: "프리미엄 로즈핑크 앤 세이지그린 시즌 한정 플라워 오브제 라지 부케", purpose: "프로포즈", price: 98000, image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80", deliverable: true, recommended: true, deliveryDateLabel: "오늘 저녁", soldOut: false },
  { id: "fl-orchid", name: "화이트 오키드 박스", purpose: "축하", price: 88000, image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=900&q=80", deliverable: false, recommended: false, deliveryDateLabel: "배송 마감", soldOut: true },
  { id: "fl-daisy", name: "데이지 모닝 번들", purpose: "감사", price: 39000, image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80", deliverable: true, recommended: false, deliveryDateLabel: "모레 도착", soldOut: false }
];

const deliveryDates = [
  { date: "2026-05-02", weekday: "Sat", available: true, extraFee: 3000 },
  { date: "2026-05-03", weekday: "Sun", available: true, extraFee: 5000 },
  { date: "2026-05-04", weekday: "Mon", available: true, extraFee: 0 },
  { date: "2026-05-05", weekday: "Tue", available: false, extraFee: 0 }
];

app.get("/api/health", (req, res) => res.json({ ok: true, site: "site035", service: "BloomLane", port: PORT }));
app.get("/api/flowers", (req, res) => res.json({ flowers }));
app.get("/api/delivery-dates", (req, res) => res.json({ deliveryDates }));

app.use(express.static(path.join(__dirname, "dist")));
app.get("/assets/*", (req, res) => res.status(404).type("text/plain").send("Asset not found. Refresh the page to load the latest bundle."));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(PORT, () => console.log(`site035 BloomLane running at http://localhost:${PORT}`));
