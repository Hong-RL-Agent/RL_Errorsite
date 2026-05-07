const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9169;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const properties = [
    { id: 101, title: "Grand Penthouse", type: "Apartment", rooms: 4, price: 2500000 },
    { id: 102, title: "Modern Studio", type: "Studio", rooms: 1, price: 350000 },
    { id: 103, title: "Family House", type: "Villa", rooms: 3, price: 890000 },
    { id: 104, title: "Compact Flat", type: "Apartment", rooms: 2, price: 500000 }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site060", status: "healthy" });
});

// API: Get Properties
app.get('/api/properties', (req, res) => {
    const { minRooms } = req.query;
    let data = [...properties];

    if (minRooms === '3') {
        // INTENTIONAL BACKEND BUG: site060-bug01
        // Type: invalid-filter-logic
        // Description: 방 3개 이상 필터링 요청 시, 실수로 방 3개 미만(<3)인 매물만 반환함.
        data = properties.filter(p => p.rooms < 3);
        return res.json({ ok: true, data, bugId: "site060-bug01" });
    }

    res.json({ ok: true, data });
});

// API: Premium Properties
app.get('/api/properties/premium', async (req, res) => {
    // INTENTIONAL BACKEND BUG: site060-bug02
    // Type: api-timeout
    // Description: 프리미엄 매물 조회 시 6초 지연 발생.
    await new Promise(resolve => setTimeout(resolve, 6000));
    res.status(408).json({ ok: false, bugId: "site060-bug02", message: "Request Timeout" });
});

// API: Save Property
app.post('/api/properties/save', (req, res) => {
    const { title, price } = req.body;
    
    if (!title) {
        // INTENTIONAL BACKEND BUG: site060-bug03
        // Type: inconsistent-status-code
        // Description: 제목 누락으로 실패했으나 200 상태 코드를 반환함.
        return res.json({ ok: false, bugId: "site060-bug03", message: "Property title is required" });
    }
    
    res.json({ ok: true, message: "Property saved successfully" });
});

app.listen(PORT, () => {
    console.log(`Site060 RealEstate running on http://localhost:${PORT}`);
});
