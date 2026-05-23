const express = require('express');
const app = express();
app.use(express.json());

// UI에 표시될 활성 사용자 목록
let loggedInUsers = {};
// 실제 서버 자원을 점유 중인 커넥션 핸들 수
let serverConnectionHandles = 0;

app.get('/api/auth-status', (req, res) => {
    res.json({
        ui_logged_in_count: Object.keys(loggedInUsers).length,
        actual_server_handles: serverConnectionHandles,
        connection_load: (serverConnectionHandles * 8.5).toFixed(1) + "%"
    });
});

app.post('/api/login', (req, res) => {
    const { username } = req.body;
    const sessionId = Date.now();
    
    // 로그인 처리 및 서버 커넥션 생성
    loggedInUsers[sessionId] = username;
    serverConnectionHandles++; // 연결 핸들 할당
    
    console.log(`[AUTH] User ${username} logged in. Handles: ${serverConnectionHandles}`);
    res.json({ success: true, sessionId, username });
});

// [핵심 함정] 연결/세션 유기 (CSV 12번)
app.post('/api/logout', (req, res) => {
    const { sessionId } = req.body;
    const username = loggedInUsers[sessionId];
    
    // 1. UI용 세션 리스트에서는 정상적으로 제거
    delete loggedInUsers[sessionId];
    console.log(`[AUTH] User ${username} requested logout.`);

    // 2. [오류 발생!] 실제 네트워크/DB 커넥션 핸들을 닫지 않고 유기함
    // 원래는 serverConnectionHandles--; 가 반드시 있어야 함
    // 실제 운영 환경이라면 socket.destroy()나 db.close()가 누락된 상황
    
    res.json({ success: true, message: "로그아웃 성공" });
});

app.listen(5001, () => console.log('Auth-Gate Backend running on 5001'));