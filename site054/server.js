const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9163;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const doctors = [
    { id: "doc-101", name: "Dr. Kim", dept: "Internal", specialty: "Cardiology", schedule: { today: "09:00 - 18:00" } },
    { id: "doc-102", name: "Dr. Lee", dept: "Dental", specialty: "Orthodontics", schedule: { today: "10:00 - 15:00" } },
    { id: "doc-103", name: "Dr. Park", dept: "Internal", specialty: "Digestive", schedule: { today: "09:00 - 18:00" } },
    { id: "doc-505", name: "Dr. Mystery", dept: "Research", specialty: "None", schedule: null }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site054", status: "healthy" });
});

// API: Get Doctors
app.get('/api/doctors', (req, res) => {
    const { dept } = req.query;
    let filtered = [...doctors];

    if (dept === 'internal') {
        // INTENTIONAL BACKEND BUG: site054-bug01
        // Type: invalid-filter-logic
        // Description: 내과(internal) 필터링 시 실수로 치과(dental) 데이터를 반환하도록 함.
        filtered = doctors.filter(d => d.dept === 'Dental');
        return res.json({ ok: true, data: filtered, bugId: "site054-bug01" });
    }

    res.json({ ok: true, data: filtered });
});

// API: Doctor Detail
app.get('/api/doctors/:id', (req, res) => {
    const doc = doctors.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ ok: false, message: "Doctor not found" });

    try {
        if (doc.id === 'doc-505') {
            // INTENTIONAL BACKEND BUG: site054-bug02
            // Type: null-reference
            // Description: schedule이 null인 데이터에서 today 속성에 접근하여 에러 발생.
            const todaySchedule = doc.schedule.today;
            return res.json({ ok: true, data: { ...doc, time: todaySchedule } });
        }
        res.json({ ok: true, data: doc });
    } catch (err) {
        res.status(500).json({ ok: false, bugId: "site054-bug02", message: "Internal Server Error" });
    }
});

// API: Appointment Check
app.get('/api/appointments/check', async (req, res) => {
    const { room } = req.query;
    
    // INTENTIONAL BACKEND BUG: site054-bug03
    // Type: api-timeout
    // Description: room=vip 요청 시 6초 지연 발생.
    if (room === 'vip') {
        await new Promise(resolve => setTimeout(resolve, 6000));
        return res.status(408).json({ ok: false, bugId: "site054-bug03", message: "Request Timeout" });
    }
    
    res.json({ ok: true, available: true });
});

app.listen(PORT, () => {
    console.log(`Site054 HospitalBooking running on http://localhost:${PORT}`);
});
