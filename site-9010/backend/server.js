const express = require('express');
const app = express();

app.get('/api/send-bulk-emails', (req, res) => {
    console.log("🔥 [CRITICAL] 대량 발송 루프 시작. 메인 스레드 점유 중...");
    
    const start = Date.now();
    
    // [함정] 약 10~15초간 서버를 완전히 멈추게 만드는 연산
    let sum = 0;
    for (let i = 0; i < 800000000; i++) {
        sum += i;
    }

    const duration = (Date.now() - start) / 1000;
    console.log(`✅ [SUCCESS] 작업 완료. 소요시간: ${duration}s`);
    
    res.json({ message: "54,200건 발송 성공", duration: `${duration}s` });
});

app.listen(5001, () => console.log('Enterprise Backend on 5001'));