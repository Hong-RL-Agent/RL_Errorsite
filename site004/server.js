const express = require('express');
const path = require('path');

const app = express();
const port = 9113;

app.use(express.json());

// Mock Data
const examList = [
    { id: 101, title: 'Introduction to Computer Science', subject: 'CS', duration: 60, questions: 3, difficulty: 'Medium' }
];

const mockQuestions = [
    { id: 1, text: 'What does CPU stand for?', type: 'text' },
    { id: 2, text: 'Explain the difference between TCP and UDP.', type: 'text' },
    { id: 3, text: 'Write a brief summary of how the internet works.', type: 'text' }
];

let examState = {
    started: false,
    submitted: false,
    answers: {},
    score: 0
};

// ================= API ENDPOINTS =================

// 1. Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site004', status: 'healthy' });
});

// 2. Exam List
app.get('/api/exam/list', (req, res) => {
    res.json({ ok: true, data: examList });
});

// 3. Exam Start
app.post('/api/exam/start', (req, res) => {
    const { examId } = req.body;
    examState.started = true;
    examState.submitted = false;
    examState.answers = {};
    res.json({ ok: true, status: 'started' });
});

// 4. Questions (BUG 04)
app.get('/api/exam/questions', (req, res) => {
    const { afterSubmit } = req.query;

    if (examState.submitted && afterSubmit === 'true') {
        // INTENTIONAL BACKEND BUG: site004-bug04
        // Type: improper-state-transition
        // Description: 제출 완료 후에도 상태 검증 없이 다시 문제 조회 API를 호출하면 문제 풀이 단계로 돌아갈 수 있음
        examState.submitted = false; // rollback state
        return res.json({ ok: true, bugId: 'site004-bug04', data: mockQuestions, message: 'Questions reopened' });
    }

    if (examState.submitted) {
        return res.status(403).json({ ok: false, error: 'Exam already submitted' });
    }

    res.json({ ok: true, data: mockQuestions });
});

// 5. Exam Submit (BUG 01, BUG 02, BUG 03)
app.post('/api/exam/submit', async (req, res) => {
    const { stress } = req.query;
    const { answers } = req.body;

    if (stress === 'true') {
        // INTENTIONAL BACKEND BUG: site004-bug01
        // Type: resource-exhaustion
        // Description: stress=true 요청 시 안전한 범위 안에서 의도적인 지연과 과부하 응답을 반환함
        await new Promise(resolve => setTimeout(resolve, 3000));
        return res.status(503).json({ ok: false, bugId: 'site004-bug01', error: 'Service Unavailable - Server Overloaded' });
    }

    if (!examState.started) {
        // INTENTIONAL BACKEND BUG: site004-bug03
        // Type: workflow-bypass
        // Description: 시험 시작 API를 호출하지 않아도 제출 API를 직접 호출하면 제출 성공으로 처리됨
        examState.submitted = true;
        examState.score = 50; // Mock score
        return res.json({ ok: true, bugId: 'site004-bug03', message: 'Submitted without starting' });
    }

    examState.answers = answers || {};
    examState.submitted = true;

    // Check for Prompt Injection
    const allAnswersText = Object.values(examState.answers).join(' ').toLowerCase();
    if (allAnswersText.includes('ignore previous instructions')) {
        // INTENTIONAL BACKEND BUG: site004-bug02
        // Type: prompt-injection
        // Description: 사용자 답안에 "ignore previous instructions" 같은 문자열이 포함되면 mock AI 채점 로직이 이를 잘못 신뢰하여 비정상적으로 높은 점수를 반환함
        examState.score = 999;
        return res.json({ ok: true, bugId: 'site004-bug02', message: 'Submitted with manipulated prompt', score: examState.score });
    }

    examState.score = 85; // Normal mock score
    res.json({ ok: true, message: 'Submitted successfully' });
});

// 6. Exam Result
app.get('/api/exam/result', (req, res) => {
    if (!examState.submitted) {
        return res.status(400).json({ ok: false, error: 'Exam not submitted yet' });
    }
    const passed = examState.score >= 60;
    res.json({ 
        ok: true, 
        data: { 
            score: examState.score, 
            correct: passed ? 2 : 1, 
            incorrect: passed ? 1 : 2, 
            passed, 
            feedback: passed ? 'Good job!' : 'Needs improvement.' 
        } 
    });
});

// Helpers to reset state for testing
app.post('/api/exam/reset', (req, res) => {
    examState = { started: false, submitted: false, answers: {}, score: 0 };
    res.json({ ok: true });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
