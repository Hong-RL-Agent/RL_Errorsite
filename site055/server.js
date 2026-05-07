const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9164;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const items = [
    { id: "item-001", title: "iPhone 15 Pro", price: 1200000, category: "Digital", seller: { name: "Steve", trust: 99 } },
    { id: "item-002", title: "Mechanical Keyboard", price: 150000, category: "Digital", seller: { name: "Logi", trust: 85 } },
    { id: "item-003", title: "Vintage Camera", price: 450000, category: "Hobby", seller: { name: "Canon", trust: 92 } },
    { id: "item-004", title: "Banned Item", price: 5000, category: "Misc", seller: { name: "Shadow", trust: 10 } }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site055", status: "healthy" });
});

// API: Get Items
app.get('/api/items', (req, res) => {
    const { sort } = req.query;
    let data = [...items];

    if (sort === 'priceDesc') {
        // INTENTIONAL BACKEND BUG: site055-bug01
        // Type: wrong-sort-logic
        // Description: 높은 가격순(Desc) 정렬 요청 시, 실수로 낮은 가격순(Asc)으로 정렬함.
        data.sort((a, b) => a.price - b.price);
        return res.json({ ok: true, data, bugId: "site055-bug01" });
    }

    res.json({ ok: true, data });
});

// API: Item Detail
app.get('/api/items/:id', (req, res) => {
    const item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ ok: false, message: "Item not found" });

    // INTENTIONAL BACKEND BUG: site055-bug02
    // Type: missing-field-response
    // Description: 금지된 품목(item-004) 조회 시 seller 정보를 누락시켜 응답함.
    if (item.id === 'item-004') {
        const { seller, ...rest } = item;
        return res.json({ ok: true, data: rest, bugId: "site055-bug02" });
    }

    res.json({ ok: true, data: item });
});

// API: Report Item
app.post('/api/items/report', (req, res) => {
    // INTENTIONAL BACKEND BUG: site055-bug03
    // Type: inconsistent-status-code
    // Description: 신고 성공 시에도 404 상태 코드를 반환하여 통계 오차를 유발함.
    res.status(404).json({ 
        ok: true, 
        message: "Report submitted successfully", 
        bugId: "site055-bug03" 
    });
});

app.listen(PORT, () => {
    console.log(`Site055 SecondMarket running on http://localhost:${PORT}`);
});
