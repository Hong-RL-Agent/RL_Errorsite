const express = require('express');
const app = express();
app.use(express.json());

let sensorOnline = true;
let collectedLogs = []; // 무한히 쌓일 로그 저장소

// [핵심 함정] 데이터 수집 유기 (CSV 9번)
// 센서 상태와 상관없이 1초마다 로그를 생성합니다.
setInterval(() => {
    const timestamp = new Date().toISOString();
    if (sensorOnline) {
        collectedLogs.push({ t: timestamp, val: Math.random() * 100, status: "OK" });
    } else {
        // 센서가 꺼졌는데 수집 로직이 유기되어 에러 로그를 폭발적으로 생성
        for(let i=0; i<100; i++) { // 루프를 통해 더 빠르게 유기된 리소스 시뮬레이션
            collectedLogs.push({ 
                t: timestamp, 
                msg: "CRITICAL: SENSOR_UNREACHABLE_RETRYING_INFO_LEAK", 
                dummy: "A".repeat(1000) // 메모리/디스크 점유를 위한 더미 데이터
            });
        }
        console.log("⚠️ [COLLECTION_ABANDONED] 센서 오프라인이나 수집 프로세스가 계속 실행 중입니다.");
    }
    
    // 너무 커지면 서버가 즉사하므로 최근 50,000건만 유지 (현실적인 부하)
    if (collectedLogs.length > 50000) collectedLogs.shift();
}, 1000);

app.get('/api/factory-stats', (req, res) => {
    res.json({
        sensorOnline,
        logCount: collectedLogs.length,
        latestData: collectedLogs.slice(-10)
    });
});

app.post('/api/toggle-sensor', (req, res) => {
    sensorOnline = !sensorOnline;
    res.json({ sensorOnline });
});

app.listen(5001, () => console.log('Factory Backend running on 5001'));