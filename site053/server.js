const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9162;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const courses = [
    { id: 101, title: "React Masterclass", instructor: "David", category: "Dev", rating: 4.8 },
    { id: 102, title: "UI/UX Design Fundamentals", instructor: "Sarah", category: "Design", rating: 4.5 },
    { id: 103, title: "Python for Data Science", instructor: "Mike", category: "Dev", rating: 4.9 },
    { id: 104, title: "Digital Marketing 101", instructor: "Elena", category: "Marketing", rating: 4.0 },
    { id: 105, title: "Advanced Node.js", instructor: "Chris", category: "Dev", rating: 4.7 },
    { id: 106, title: "Cloud Architecture", instructor: "Paul", category: "Dev", rating: 4.6 }
];

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site053", status: "healthy" });
});

// API: Get Courses (with Pagination)
app.get('/api/courses', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    const start = (page - 1) * limit;
    let end = start + limit;
    
    // INTENTIONAL BACKEND BUG: site053-bug01
    // Type: pagination-off-by-one
    // Description: 1페이지 요청 시 의도적으로 마지막 항목을 제외하여 4개만 반환함.
    if (page === 1) {
        end = end - 1; 
        const data = courses.slice(start, end);
        return res.json({ ok: true, data, pagination: { total: courses.length, page, limit }, bugId: "site053-bug01" });
    }

    const data = courses.slice(start, end);
    res.json({ ok: true, data, pagination: { total: courses.length, page, limit } });
});

// API: Get Course Detail
app.get('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    
    // INTENTIONAL BACKEND BUG: site053-bug02
    // Type: type-parsing
    // Description: id가 숫자가 아닌 경우를 처리하지 못해 crash가 발생하도록 함.
    if (id === 'course-alpha') {
        const result = undefined;
        const buggedAccess = result.title; // Causes TypeError
        return res.json({ ok: true, data: buggedAccess });
    }

    const course = courses.find(c => c.id === parseInt(id));
    if (!course) return res.status(404).json({ ok: false, message: "Course not found" });
    res.json({ ok: true, data: course });
});

// API: Category Stats
app.get('/api/stats/category-average', (req, res) => {
    // INTENTIONAL BACKEND BUG: site053-bug03
    // Type: incorrect-aggregation
    // Description: 실제 평균 계산 대신 무조건 5.0을 반환함.
    const actualAvg = (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(2);
    res.json({ ok: true, averageRating: 5.0, realInfo: actualAvg, bugId: "site053-bug03" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    res.status(500).json({ ok: false, bugId: "site053-bug02", message: "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`Site053 OnlineEdu running on http://localhost:${PORT}`);
});
