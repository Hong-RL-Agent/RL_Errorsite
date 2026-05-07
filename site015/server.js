const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 9124;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let courses = [
    { id: 101, title: "React 기초부터 실전까지", instructor: "김민수", level: "Beginner", premium: false, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 102, title: "고급 TypeScript 디자인 패턴", instructor: "이수진", level: "Advanced", premium: true, thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 103, title: "프론트엔드 성능 최적화", instructor: "박지훈", level: "Intermediate", premium: false, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { id: 104, title: "실전 클라우드 아키텍처 (AWS)", instructor: "정하늘", level: "Advanced", premium: true, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
];

let userCourses = [
    { courseId: 101, title: "React 기초부터 실전까지", progress: 45, status: "in-progress" }
];

let completedCourses = [
    { courseId: 99, title: "웹 브라우저의 원리", completedAt: "2026-04-10" }
];

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// 2. GET Courses (Bug 04: Mobile User-Agent Discrimination)
app.get('/api/courses', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = userAgent.toLowerCase().includes('mobile') || req.query.mobileTest === 'true';

    let result = [...courses];
    let bugId = null;

    if (isMobile) {
        // INTENTIONAL BACKEND BUG: site015-bug04
        // Type: user-agent-discrimination
        // Description: 모바일 환경 접속 시 고급/프리미엄 강의를 의도적으로 목록에서 누락시킴.
        result = result.filter(c => !c.premium);
        bugId = "site015-bug04";
    }

    res.json({ ok: true, data: result, bugId });
});

// 3. POST Start Course (Bug 02: Non-Idempotent API)
app.post('/api/course/start', (req, res) => {
    const { courseId } = req.body;
    const course = courses.find(c => c.id === parseInt(courseId));
    
    if (!course) return res.status(404).json({ ok: false, msg: "Course not found" });

    // INTENTIONAL BACKEND BUG: site015-bug02
    // Type: non-idempotent-api
    // Description: 이미 수강 중인지 확인하는 로직 없이 동일한 강의를 중복 등록하여 멱등성이 파손됨.
    userCourses.push({
        courseId: course.id,
        title: course.title,
        progress: 0,
        status: "in-progress"
    });

    res.json({ ok: true, msg: "Course started", data: userCourses, bugId: "site015-bug02" });
});

// 4. POST Progress (Normal functionality)
app.post('/api/course/progress', (req, res) => {
    const { courseId, progress } = req.body;
    let found = false;
    userCourses = userCourses.map(c => {
        if (c.courseId === parseInt(courseId)) {
            found = true;
            return { ...c, progress: Math.min(100, progress) };
        }
        return c;
    });

    if (!found) return res.status(404).json({ ok: false, msg: "Course not enrolled" });
    res.json({ ok: true, msg: "Progress saved", data: userCourses });
});

// 5. POST Complete Course (Bug 03: Forced API Call)
app.post('/api/course/complete', (req, res) => {
    const { courseId } = req.body;
    
    let targetCourse = userCourses.find(c => c.courseId === parseInt(courseId));
    
    // INTENTIONAL BACKEND BUG: site015-bug03
    // Type: forced-api-call
    // Description: 진도율이 100%인지 확인하지 않고 API만 호출하면 무조건 완료 처리됨.
    if (targetCourse) {
        targetCourse.status = "completed";
        targetCourse.progress = 100;
        completedCourses.push({
            courseId: targetCourse.courseId,
            title: targetCourse.title,
            completedAt: new Date().toISOString()
        });
        // Remove from in-progress if needed, but we'll just leave it and mark it completed for effect
    } else {
        // Even if not enrolled, magically completes it if course exists
        const c = courses.find(c => c.id === parseInt(courseId));
        if (c) {
            completedCourses.push({
                courseId: c.id,
                title: c.title,
                completedAt: new Date().toISOString()
            });
        }
    }

    res.json({ ok: true, msg: "Course forcefully completed", bugId: "site015-bug03" });
});

// 6. GET User Courses (Bug 05: Browser Version Curse)
app.get('/api/user/courses', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isChrome100Plus = (userAgent.includes('Chrome/') && parseInt(userAgent.split('Chrome/')[1]) >= 100) || req.query.versionTest === 'true';

    let result = JSON.parse(JSON.stringify(userCourses));
    let bugId = null;

    if (isChrome100Plus) {
        // INTENTIONAL BACKEND BUG: site015-bug05
        // Type: browser-version-curse
        // Description: 특정 브라우저 버전(Chrome 100+)에서 응답 데이터 필드를 강제로 깨뜨림.
        result = result.map(c => ({
            ...c,
            title: "null",
            progress: "NaN",
            status: undefined
        }));
        bugId = "site015-bug05";
    }

    res.json({ ok: true, data: result, completed: completedCourses, bugId });
});

// 7. GET Export Data (Bug 01: Data Hostage Lock-in)
app.get('/api/user/export', (req, res) => {
    
    let exportPayload = {
        userId: "user_777",
        joinedAt: "2026-01-01",
        activeCourses: userCourses,
        // INTENTIONAL BACKEND BUG: site015-bug01
        // Type: data-hostage-lockin
        // Description: 사용자의 학습 완료 이력 데이터를 의도적으로 export 페이로드에서 제외하여 데이터 이동을 방해함.
        completedCourses: "DATA_LOCKED_FOR_RETENTION"
    };

    res.json({ 
        ok: true, 
        message: "Data exported successfully (partial)", 
        exportData: exportPayload,
        bugId: "site015-bug01"
    });
});

app.listen(port, () => {
    console.log(`site015 server running on port ${port}`);
});
