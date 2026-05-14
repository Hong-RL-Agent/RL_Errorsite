const express = require('express');
const path = require('path');
const app = express();
const PORT = 9299;

app.use(express.static(path.join(__dirname, 'public')));

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Construction Options
app.get('/api/options', (req, res) => {
    const options = [
        { id: "FLOOR", name: "강마루 시공", price: 1500000, category: "Floor", recommended: true },
        { id: "WALL", name: "실크 벽지 도배", price: 1200000, category: "Wall", recommended: true },
        { id: "KITCHEN", name: "주방 가구 교체", price: 4500000, category: "Kitchen", recommended: false },
        { id: "BATH", name: "욕실 전체 리모델링", price: 3500000, category: "Bathroom", recommended: true },
        { id: "LIGHT", name: "LED 조명 교체", price: 800000, category: "Lighting", recommended: false },
        { id: "WINDOW", name: "샷시/창호 교체", price: 5500000, category: "Window", recommended: false },
        { id: "DOOR", name: "중문 설치", price: 900000, category: "Door", recommended: true }
    ];
    res.json(options);
});

// API Portfolio
app.get('/api/portfolio', (req, res) => {
    const portfolio = [
        { id: 1, type: "Apartment", pyeong: 32, image: "/assets/port_01.webp", description: "모던 미니멀 아파트 인테리어", style: "Modern" },
        { id: 2, type: "Villa", pyeong: 24, image: "/assets/port_02.webp", description: "화이트&우드 감성 빌라", style: "Cozy" },
        { id: 3, type: "Apartment", pyeong: 45, image: "/assets/port_03.webp", description: "럭셔리 클래식 대형 아파트", style: "Luxury" },
        { id: 4, type: "Office", pyeong: 15, image: "/assets/port_04.webp", description: "공간 활용이 돋보이는 오피스", style: "Minimal" },
        { id: 5, type: "Studio", pyeong: 10, image: "/assets/port_05.webp", description: "원룸형 스튜디오 인테리어", style: "Modern" }
    ];
    res.json(portfolio);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
