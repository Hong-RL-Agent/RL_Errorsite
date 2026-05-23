const express = require('express');
const app = express();
app.use(express.json());

// 회의실 데이터베이스 (메모리 상주)
let rooms = [
    { id: 1, name: "Alpha Room (4인)", isAvailable: true, internalLock: false },
    { id: 2, name: "Beta Room (8인)", isAvailable: true, internalLock: false },
    { id: 3, name: "Gamma Room (12인)", isAvailable: true, internalLock: false }
];

app.get('/api/rooms', (req, res) => {
    res.json({
        rooms,
        system_integrity: rooms.every(r => r.isAvailable === !r.internalLock) ? "STABLE" : "CORRUPTED"
    });
});

app.post('/api/reserve', (req, res) => {
    const { id } = req.body;
    const room = rooms.find(r => r.id === id);

    if (room && room.internalLock) {
        return res.status(409).json({ error: "Resource is already locked by another process." });
    }

    // 리소스 점유
    room.isAvailable = false;
    room.internalLock = true;
    
    console.log(`[RESERVE] Room ${id} is now locked.`);
    res.json({ success: true, room });
});

// [핵심 함정] 공유 리소스 유기 (CSV 15번)
app.post('/api/release', (req, res) => {
    const { id } = req.body;
    const room = rooms.find(r => r.id === id);

    if (room) {
        // 1. UI용 상태는 사용 가능으로 변경
        room.isAvailable = true;
        
        // 2. [오류 발생!] 실제 내부 리소스 락(internalLock)을 해제하지 않고 유기함
        // 원래는 room.internalLock = false; 가 반드시 있어야 함
        console.log(`⚠️ [CLEANUP_FAILURE] Room ${id} metadata updated, but internal lock was NOT released.`);
        
        res.json({ success: true, message: "Resource released successfully (Metadata only)" });
    } else {
        res.status(404).json({ error: "Room not found" });
    }
});

app.listen(5001, () => console.log('Shared Office Backend running on 5001'));