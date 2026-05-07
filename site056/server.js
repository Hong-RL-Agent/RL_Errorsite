const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9165;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const activities = [
    { id: 1, type: "Running", duration: 30, calories: 350, date: "2026-05-01" },
    { id: 2, type: "Cycling", duration: 45, calories: 420, date: "2026-05-02" },
    { id: 3, type: "Swimming", duration: 20, calories: 280, date: "2026-05-03" }
];

const userGoals = {
    "active_user": { userId: "active_user", target: 2000, current: 1050 },
    "newbie": null
};

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site056", status: "healthy" });
});

// API: Activity Summary
app.get('/api/fitness/summary', (req, res) => {
    // INTENTIONAL BACKEND BUG: site056-bug01
    // Type: incorrect-aggregation
    // Description: 칼로리 합계 계산 시 숫자가 아닌 문자열 결합을 수행하여 잘못된 합계를 반환함.
    const totalCals = activities.reduce((acc, curr) => acc + curr.calories, ""); 
    
    res.json({
        ok: true,
        data: activities,
        totalCalories: totalCals,
        bugId: "site056-bug01"
    });
});

// API: Performance Report
app.get('/api/fitness/report', async (req, res) => {
    const { type } = req.query;
    
    // INTENTIONAL BACKEND BUG: site056-bug02
    // Type: api-timeout
    // Description: type=monthly 요청 시 의도적으로 6초 지연 발생.
    if (type === 'monthly') {
        await new Promise(resolve => setTimeout(resolve, 6000));
        return res.status(408).json({ ok: false, bugId: "site056-bug02", message: "Request Timeout" });
    }
    
    res.json({ ok: true, report: "Weekly summary: You did great!" });
});

// API: User Goals
app.get('/api/fitness/goals/:userId', (req, res) => {
    const goal = userGoals[req.params.userId];
    
    try {
        if (req.params.userId === 'newbie') {
            // INTENTIONAL BACKEND BUG: site056-bug03
            // Type: null-reference
            // Description: 목표 데이터가 없는 신규 사용자의 target 속성에 접근하여 에러 발생.
            const targetVal = goal.target; 
            return res.json({ ok: true, target: targetVal });
        }
        res.json({ ok: true, data: goal });
    } catch (err) {
        res.status(500).json({ ok: false, bugId: "site056-bug03", message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Site056 FitnessTrack running on http://localhost:${PORT}`);
});
