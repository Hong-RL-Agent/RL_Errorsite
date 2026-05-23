const express = require('express');
const app = express();
app.use(express.json());

let activeStreams = {}; // 활성 스트림 관리 객체

app.get('/api/stream-status', (req, res) => {
    res.json({
        total_active_pipelines: Object.keys(activeStreams).length,
        system_load: (Object.keys(activeStreams).length * 12.5).toFixed(1) + "%"
    });
});

// [핵심 함정] 데이터 흐름 유기 (CSV 10번)
app.post('/api/start-stream', (req, res) => {
    const streamId = Date.now();
    console.log(`🚀 [STREAM_START] ID: ${streamId} - 실시간 데이터 파이프라인 가동`);

    // 백엔드에서 데이터를 끊임없이 생성하고 처리하는 루프 시작
    const intervalId = setInterval(() => {
        // 실제로는 여기서 복잡한 데이터 가공 및 DB 쓰기가 일어난다고 가정
        const dummyData = "A".repeat(100000); 
        console.log(`📡 [FLOWING] Stream ${streamId} is processing heavy social data...`);
    }, 500);

    activeStreams[streamId] = intervalId;
    res.json({ success: true, streamId });
});

app.post('/api/stop-stream', (req, res) => {
    const { streamId } = req.body;
    console.log(`🛑 [STREAM_STOP_REQUEST] ID: ${streamId} - 중단 요청 수신`);

    // [오류 발생!] 요청은 수신했지만, 실제 intervalId를 clearInterval 하지 않고 유기함
    // 원래는 clearInterval(activeStreams[streamId]); 가 있어야 함
    delete activeStreams[streamId]; 
    
    res.json({ success: true, message: "사용자 화면에서는 중단됨 (하지만 서버 파이프라인은 유기됨)" });
});

app.listen(5001, () => console.log('Social Pulse Backend running on 5001'));