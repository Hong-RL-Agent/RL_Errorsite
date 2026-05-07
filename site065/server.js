import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9174;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let slots = [];
const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

// Initialize 100 slots for the next 10 days
const initSlots = () => {
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    times.forEach((t, idx) => {
      slots.push({
        slotId: slots.length + 1,
        date: dateStr,
        time: t,
        status: 'available'
      });
    });
  }
};
initSlots();

let reservations = [];
let logs = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site065", status: "healthy" });
});

app.get('/api/slots', (req, res) => {
  const { date, start, end } = req.query;
  let data = slots.filter(s => !date || s.date === date);
  let bugId = null;

  // BUG 02: timezone-conversion-shift
  // Intentionally shift time by +1 hour if queried
  if (date) {
    bugId = 'site065-bug02';
    data = data.map(s => {
      const h = parseInt(s.time.split(':')[0]);
      const shifted = (h + 1).toString().padStart(2, '0') + ":00";
      return { ...s, time: shifted, originalTime: s.time }; // metadata showing the shift
    });
    logs.push({ time: Date.now(), msg: `[오류] 타임존 변환 왜곡 감지 (Bug 02): 요청 날짜 ${date}` });
  }

  // BUG 03: boundary-time-inclusive-error
  if (start && end) {
    const sH = parseInt(start);
    const eH = parseInt(end);
    bugId = 'site065-bug03';
    // Logic error: should be s.time >= start && s.time < end
    // But we use s.time <= end, including the end boundary incorrectly
    data = data.filter(s => {
      const h = parseInt(s.time.split(':')[0]);
      return h >= sH && h <= eH; 
    });
    logs.push({ time: Date.now(), msg: `[오류] 경계 시간 필터링 오류 (Bug 03): 범위 ${start}~${end}` });
  }

  res.json({ data, bugId });
});

app.post('/api/reservations', (req, res) => {
  const { slotId, user } = req.body;
  const slot = slots.find(s => s.slotId === slotId);
  
  if (!slot) return res.status(404).json({ error: "Slot not found" });

  let bugId = null;

  // BUG 01: slot-double-booking
  // Logic error: Check if ALREADY booked, but allow it anyway if it's Bug 01
  if (slot.status === 'booked') {
    bugId = 'site065-bug01';
    logs.push({ time: Date.now(), msg: `[위험] 중복 예약 발생 (Bug 01): Slot #${slotId} (User: ${user})` });
  }

  const newRes = {
    id: reservations.length + 1,
    slotId,
    user: user || 'Anonymous',
    time: Date.now()
  };
  
  reservations.push(newRes);
  slot.status = 'booked';
  
  res.json({ reserved: true, reservation: newRes, bugId });
});

app.post('/api/reservations/cancel', (req, res) => {
  const { reservationId } = req.body;
  const idx = reservations.findIndex(r => r.id === reservationId);
  
  if (idx === -1) return res.status(404).json({ error: "Reservation not found" });

  const resv = reservations[idx];
  const slot = slots.find(s => s.slotId === resv.slotId);
  
  // BUG 04: cancel-without-slot-release
  // Remove the reservation but FAIL to update the slot status back to 'available'
  reservations.splice(idx, 1);
  const bugId = 'site065-bug04';
  logs.push({ time: Date.now(), msg: `[오류] 예약 취소 후 슬롯 복구 실패 (Bug 04): Res #${reservationId}` });
  
  // slot.status = 'available'; // Omitted intentionally

  res.json({ canceled: true, bugId });
});

app.get('/api/reservations', (req, res) => {
  const data = reservations.map(r => {
    const slot = slots.find(s => s.slotId === r.slotId);
    return { ...r, slotInfo: slot };
  });
  res.json({ data });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalSlots: slots.length,
    booked: slots.filter(s => s.status === 'booked').length,
    available: slots.filter(s => s.status === 'available').length,
    totalReservations: reservations.length
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site065 on http://localhost:${PORT}`));
