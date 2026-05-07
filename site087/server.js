import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9196;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Bug-Id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- Mock Data ---
let coupons = [
  { id: 1001, name: "웰컴 신규 회원 할인", expiresAt: new Date(Date.now() + 3600000 * 24).toISOString(), status: "active", createdAt: new Date().toISOString(), type: "PERCENT", value: 15 },
  { id: 1002, name: "앱 전용 깜짝 쿠폰", expiresAt: new Date(Date.now() - 3600000).toISOString(), status: "expired", createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), type: "FIXED", value: 5000 }
];

let logs = [
  { id: 1, time: new Date().toISOString(), msg: "시스템 가동: 엔터프라이즈 모드 활성화", type: "SYSTEM" }
];

const addLog = (msg, type = "INFO") => {
  logs.unshift({ id: Date.now(), time: new Date().toISOString(), msg, type });
  if (logs.length > 50) logs.pop();
};

// --- API Endpoints ---

// [Bug 01] expiration-time-miscalculation
app.post('/api/coupons/create', (req, res) => {
  const { name, validHours, type, value } = req.body;
  const bugId = 'site087-bug01';
  
  const requestedHours = parseFloat(validHours);
  const actualDurationMs = (requestedHours / 2) * 3600000; // Logic Error: / 2
  const expiresAt = new Date(Date.now() + actualDurationMs).toISOString();
  
  const newCoupon = {
    id: Math.floor(Math.random() * 8999) + 1000,
    name: name || "새 쿠폰",
    expiresAt,
    status: "active",
    createdAt: new Date().toISOString(),
    type: type || "FIXED",
    value: value || 1000
  };
  
  coupons.unshift(newCoupon);
  addLog(`쿠폰 생성: ${newCoupon.name} (ID: ${newCoupon.id})`);
  
  res.setHeader('X-Bug-Id', bugId);
  res.json({ success: true, coupon: newCoupon, bugId });
});

// [Bug 02] timezone-mismatch
app.get('/api/coupons', (req, res) => {
  const bugId = 'site087-bug02';
  
  const data = coupons.map(c => {
    const now = new Date();
    // Logic Error: Server uses 9-hour delay (UTC vs KST mismatch) for status check
    const internalServerTime = new Date(now.getTime() - 3600000 * 9); 
    const expiry = new Date(c.expiresAt);
    
    let currentStatus = c.status;
    if (currentStatus === 'active') {
      if (internalServerTime > expiry) {
        currentStatus = 'expired';
      }
    }
    return { ...c, status: currentStatus };
  });

  res.setHeader('X-Bug-Id', bugId);
  res.json({ 
    data, 
    serverTime: new Date().toISOString(), 
    bugId 
  });
});

// [Bug 03] ttl-refresh-missing
app.patch('/api/coupons/extend', (req, res) => {
  const { couponId, extendHours } = req.body;
  const bugId = 'site087-bug03';
  
  const coupon = coupons.find(c => c.id === parseInt(couponId));
  if (coupon) {
    // Logic Error: Report success but DO NOT update data
    addLog(`유효기간 연장 승인: #${couponId} (+${extendHours}h)`);
    
    res.setHeader('X-Bug-Id', bugId);
    return res.json({ 
      success: true, 
      message: "연장 요청이 정상적으로 처리되었습니다.", 
      currentExpiresAt: coupon.expiresAt, // Discrepancy: unchanged time
      bugId 
    });
  }
  res.status(404).json({ error: "쿠폰을 찾을 수 없습니다." });
});

// [Bug 04] scheduled-activation-drift
app.post('/api/coupons/schedule', (req, res) => {
  const { name, activateAt, validHours } = req.body;
  const bugId = 'site087-bug04';
  
  const requestedActivation = new Date(activateAt);
  const actualActivation = new Date(requestedActivation.getTime() + 3600000); // Logic Error: + 1h drift
  
  const scheduledCoupon = {
    id: Math.floor(Math.random() * 8999) + 1000,
    name: name || "예약 쿠폰",
    expiresAt: new Date(actualActivation.getTime() + 3600000 * (validHours || 24)).toISOString(),
    status: "scheduled",
    activateAt: actualActivation.toISOString(),
    createdAt: new Date().toISOString(),
    type: "PERCENT",
    value: 10
  };
  
  coupons.unshift(scheduledCoupon);
  addLog(`시스템 예약 완료: ${scheduledCoupon.name} (활성 예정: ${actualActivation.toISOString()})`);
  
  res.setHeader('X-Bug-Id', bugId);
  res.json({ success: true, coupon: scheduledCoupon, bugId });
});

// Normal Features
app.post('/api/coupons/use', (req, res) => {
  const { couponId } = req.body;
  const coupon = coupons.find(c => c.id === parseInt(couponId));
  if (coupon && coupon.status === 'active') {
    coupon.status = 'used';
    addLog(`쿠폰 사용: #${couponId}`, "SUCCESS");
    return res.json({ success: true });
  }
  res.status(400).json({ error: "사용할 수 없는 상태의 쿠폰입니다." });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    total: coupons.length,
    active: coupons.filter(c => c.status === 'active').length,
    expired: coupons.filter(c => c.status === 'expired').length,
    used: coupons.filter(c => c.status === 'used').length,
    scheduled: coupons.filter(c => c.status === 'scheduled').length
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs });
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Site087 Coupon Master running on http://localhost:${PORT}`);
});
