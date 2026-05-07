const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9161;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const restaurants = [
    { id: 1, name: "Sushi Master", type: "Japanese", isOpen: true, rating: 4.9, image: "🍣" },
    { id: 2, name: "Pasta Palace", type: "Italian", isOpen: true, rating: 4.5, image: "🍝" },
    { id: 3, name: "Burger Barn", type: "American", isOpen: false, rating: 4.2, image: "🍔" },
    { id: 4, name: "Taco Time", type: "Mexican", isOpen: false, rating: 4.0, image: "🌮" }
];

const trendingRankings = [
    { rank: 1, name: "Old Pizza Place", score: 980, lastUpdated: "2026-05-02T12:00:00Z" },
    { rank: 2, name: "Yesterday's Cafe", score: 940, lastUpdated: "2026-05-02T12:00:00Z" }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site052", status: "healthy" });
});

// API: Get Restaurants
app.get('/api/restaurants', (req, res) => {
    const { openNow } = req.query;
    let data = [...restaurants];

    if (openNow === 'true') {
        // INTENTIONAL BACKEND BUG: site052-bug01
        // Type: invalid-filter-logic
        // Description: 영업 중인 식당을 필터링해야 하나, 실수로 ! 연산자를 사용하여 닫힌 식당만 반환함.
        data = data.filter(r => !r.isOpen);
        return res.json({ ok: true, data, bugId: "site052-bug01" });
    }

    res.json({ ok: true, data });
});

// API: Get Rankings
app.get('/api/rankings', (req, res) => {
    const { region } = req.query;
    
    // INTENTIONAL BACKEND BUG: site052-bug03
    // Type: stale-cache-response
    // Description: trending 지역 요청 시 최신 데이터가 아닌 어제의 캐시 데이터를 무조건 반환함.
    if (region === 'trending') {
        return res.json({ ok: true, data: trendingRankings, bugId: "site052-bug03" });
    }
    
    res.json({ ok: true, data: [{ rank: 1, name: "Fresh Salad", score: 999, lastUpdated: new Date().toISOString() }] });
});

// API: Post Reservation
app.post('/api/reservations', (req, res) => {
    const { name, date, people } = req.body;
    
    if (!name || !date) {
        // INTENTIONAL BACKEND BUG: site052-bug02
        // Type: inconsistent-status-code
        // Description: 필수 입력값이 누락되었음에도 불구하고 HTTP 200 상태 코드로 실패 응답을 보냄.
        return res.json({ ok: false, bugId: "site052-bug02", message: "Required fields missing" });
    }
    
    res.json({ ok: true, message: "Reservation confirmed" });
});

app.listen(PORT, () => {
    console.log(`Site052 RestaurantFinder running on http://localhost:${PORT}`);
});
