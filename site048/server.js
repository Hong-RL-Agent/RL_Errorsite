const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9157;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const accommodations = [
    { id: "stay-001", name: "Grand Blue Resort", location: "Jeju", price: 150, rating: 4.8, reviews: [{ author: { name: "Alice" }, text: "Amazing!" }] },
    { id: "stay-002", name: "Urban Nest Hotel", location: "Seoul", price: 85, rating: 4.2, reviews: [{ author: { name: "Bob" }, text: "Good value." }] },
    { id: "stay-003", name: "Mountain View Cabin", location: "Gangwon", price: 120, rating: 4.5, reviews: [{ author: { name: "Charlie" }, text: "Beautiful scenery." }] },
    { id: "stay-999", name: "Ghost Stay", location: "Hidden", price: 0, rating: 0, reviews: [{ author: null, text: "Ghost review" }] }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site048", status: "healthy" });
});

// API: Get Accommodations
app.get('/api/accommodations', async (req, res) => {
    const { location, priceMax } = req.query;
    
    // INTENTIONAL BACKEND BUG: site048-bug03
    // Type: api-timeout
    // Description: location=Antarctica 요청 시 의도적으로 6초 지연을 발생시킴.
    if (location === 'Antarctica') {
        await new Promise(resolve => setTimeout(resolve, 6000));
        return res.status(408).json({ ok: false, bugId: "site048-bug03", message: "Request Timeout" });
    }

    let filtered = [...accommodations];

    if (location) {
        filtered = filtered.filter(a => a.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (priceMax) {
        const max = parseInt(priceMax);
        // INTENTIONAL BACKEND BUG: site048-bug01
        // Type: invalid-filter-logic
        // Description: priceMax 필터링 시 < 연산자 대신 > 연산자를 사용하여 의도된 범위 밖의 데이터를 반환함.
        filtered = filtered.filter(a => a.price > max);
        return res.json({ ok: true, data: filtered, bugId: "site048-bug01" });
    }

    res.json({ ok: true, data: filtered });
});

// API: Get Detail
app.get('/api/accommodations/:id', (req, res) => {
    const item = accommodations.find(a => a.id === req.params.id);
    if (!item) return res.status(404).json({ ok: false, message: "Not found" });

    try {
        if (item.id === 'stay-999') {
            // INTENTIONAL BACKEND BUG: site048-bug02
            // Type: null-reference
            // Description: author가 null인 리뷰 객체의 name 필드에 접근하여 TypeError를 유발함.
            const authorName = item.reviews[0].author.name;
            return res.json({ ok: true, data: { ...item, firstReviewer: authorName } });
        }
        res.json({ ok: true, data: item });
    } catch (err) {
        res.status(500).json({ ok: false, bugId: "site048-bug02", message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Site048 TravelStay running on http://localhost:${PORT}`);
});
