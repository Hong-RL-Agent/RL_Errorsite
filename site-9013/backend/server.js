const express = require('express');
const app = express();
app.use(express.json());

// 서버 메모리에 누적되는 세션 데이터
let meetingSessions = [];

// [함정] 메모리 점유를 시뮬레이션하기 위한 거대 더미 데이터 생성 함수
const createHeavyResource = () => new Array(1000000).fill("Resource_Chunk");

app.get('/api/status', (req, res) => {
    res.json({
        active_count: meetingSessions.length,
        memory_usage: process.memoryUsage().heapUsed / 1024 / 1024 + " MB"
    });
});

app.post('/api/join', (req, res) => {
    const session = {
        id: Date.now(),
        user: "User_" + Math.floor(Math.random() * 100),
        startTime: new Date(),
        data: createHeavyResource() // 방 하나당 무거운 자원 할당
    };
    meetingSessions.push(session);
    console.log(`[JOIN] New session created: ${session.id}. Total: ${meetingSessions.length}`);
    res.json({ success: true, session });
});

// [핵심 함정] 리소스 임대 유기 (CSV 8번)
app.post('/api/leave', (req, res) => {
    console.log("⚠️ [CLEANUP_FAILURE] 사용자가 퇴장했으나 세션 자원을 해제하지 못했습니다.");
    // 원래는 meetingSessions.filter 등으로 지워야 하지만, 로직 누락됨.
    res.json({ success: true, message: "회의 종료됨" });
});

app.listen(5001, () => console.log('Meet Backend running on 5001'));