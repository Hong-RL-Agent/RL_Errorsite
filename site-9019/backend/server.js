const express = require('express');
const app = express();
app.use(express.json());

// UI용 활성 유저 목록
let activeUserNames = [];

// [핵심 함정] 객체 유기 (CSV 14번)
// GC(가비지 컬렉터)가 수거하지 못하도록 전역에 숨겨진 참조 보관소
let leakedObjectReferences = []; 

app.get('/api/server-health', (req, res) => {
    res.json({
        ui_active_users: activeUserNames.length,
        resident_objects_in_memory: leakedObjectReferences.length,
        heap_used: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB"
    });
});

app.post('/api/chat/join', (req, res) => {
    const { nickname } = req.body;
    
    // 1. 유저 객체 생성 (실제로는 복잡한 세팅과 버퍼를 가진 무거운 객체)
    const userObj = {
        id: Date.now(),
        nickname,
        joinedAt: new Date(),
        sessionBuffer: Buffer.alloc(1024 * 512, 'A'), // 0.5MB 더미 데이터
        metadata: { theme: 'dark', lang: 'ko', permissions: ['read', 'write'] }
    };

    activeUserNames.push(nickname);
    
    // [보관] 나중에 통계용으로 쓴다며 전역 배열에 참조를 슬쩍 넣어둠
    leakedObjectReferences.push(userObj);

    console.log(`[CHAT] ${nickname} joined. Resident Objects: ${leakedObjectReferences.length}`);
    res.json({ success: true, userId: userObj.id });
});

app.post('/api/chat/leave', (req, res) => {
    const { nickname } = req.body;
    
    // UI 리스트에서는 지우지만...
    activeUserNames = activeUserNames.filter(name => name !== nickname);
    
    // [오류 발생!] leakedObjectReferences에서 userObj를 지우는 로직이 누락됨.
    // 이 참조가 살아있는 한 Node.js GC는 메모리를 회수하지 못함 (객체 유기)
    
    console.log(`[CHAT] ${nickname} left. (Object still exists in memory)`);
    res.json({ success: true });
});

app.listen(5001, () => console.log('Chat Backend running on 5001'));