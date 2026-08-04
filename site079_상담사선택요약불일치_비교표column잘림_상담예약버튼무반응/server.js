const express = require('express');
const path = require('path');
const app = express();
const PORT = 9298;

app.use(express.static(path.join(__dirname, 'public')));

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Insurance Types
app.get('/api/insurance-types', (req, res) => {
    const types = [
        { id: "LIFE", name: "생명보험", description: "가족을 위한 든든한 준비", available: true },
        { id: "HEALTH", name: "건강보험", description: "질병과 사고에 대한 실속 보장", available: true },
        { id: "AUTO", name: "자동차보험", description: "안전 운전을 위한 필수 선택", available: true },
        { id: "FIRE", name: "화재/재물보험", description: "소중한 내 집과 재산 보호", available: true },
        { id: "PENSION", name: "연금보험", description: "여유로운 노후 생활 설계", available: true },
        { id: "CHILD", name: "어린이보험", description: "자녀의 건강한 성장을 위해", available: true }
    ];
    res.json(types);
});

// API Advisors
app.get('/api/advisors', (req, res) => {
    const advisors = [
        { id: 1, name: "김태진", specialty: "생명/연금", experience: "12년", rating: 4.9, times: ["10:00", "14:00", "16:00"], image: "/assets/advisor_01.webp" },
        { id: 2, name: "이지혜", specialty: "건강/실손", experience: "8년", rating: 4.8, times: ["11:00", "13:00", "15:00"], image: "/assets/advisor_02.webp" },
        { id: 3, name: "박성호", specialty: "자동차/운전자", experience: "15년", rating: 5.0, times: ["09:00", "10:30", "14:30"], image: "/assets/advisor_03.webp" },
        { id: 4, name: "최유나", specialty: "어린이/교육", experience: "6년", rating: 4.7, times: ["11:30", "15:30", "17:00"], image: "/assets/advisor_04.webp" },
        { id: 5, name: "정민우", specialty: "종합자산관리", experience: "10년", rating: 4.9, times: ["13:00", "16:00"], image: "/assets/advisor_05.webp" }
    ];
    res.json(advisors);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
