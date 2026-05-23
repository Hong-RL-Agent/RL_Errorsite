const express = require('express');
const app = express();
app.use(express.json());

// 현재 등록된 스케줄 메타데이터 (UI용)
let schedules = [];
// 서버 메모리에서 실제로 돌아가는 타이머 객체들
let runningTimers = {};

app.get('/api/system-status', (req, res) => {
    res.json({
        active_metadata_count: schedules.length,
        internal_running_timers: Object.keys(runningTimers).length,
        cpu_usage: (Object.keys(runningTimers).length * 5.2).toFixed(1) + "%"
    });
});

app.get('/api/schedules', (req, res) => res.json(schedules));

app.post('/api/create-schedule', (req, res) => {
    const { name, interval } = req.body;
    const id = Date.now();
    
    // UI 관리용 리스트에 추가
    schedules.push({ id, name, interval });

    // [스케줄링 가동] 실제로 서버에서 주기적인 작업을 시작함
    const timerId = setInterval(() => {
        console.log(`[SCHEDULE_RUNNING] Task "${name}" (ID: ${id}) is executing maintenance...`);
    }, interval * 1000);

    runningTimers[id] = timerId; // 타이머 객체 저장
    res.json({ success: true, id });
});

// [핵심 함정] 스케줄링 유기 (CSV 11번)
app.post('/api/delete-schedule', (req, res) => {
    const { id } = req.body;
    console.log(`[DELETE_REQUEST] Schedule ID ${id} 삭제 요청 수신`);

    // 1. UI용 리스트에서는 정상적으로 삭제함
    schedules = schedules.filter(s => s.id !== id);

    // 2. [오류 발생!] 실제로 돌아가는 타이머를 중단(clearInterval)하지 않고 유기함
    // 원래는 clearInterval(runningTimers[id]); 가 있어야 함
    // delete runningTimers[id]; // 이 줄도 누락되거나 관리 포인트에서 사라짐
    
    res.json({ success: true, message: "스케줄이 리스트에서 삭제되었습니다." });
});

app.listen(5001, () => console.log('Backup Manager Backend running on 5001'));