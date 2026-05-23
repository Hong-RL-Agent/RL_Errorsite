const express = require('express');
const app = express();

app.get('/api/analyze', (req, res) => {
    console.log("대용량 데이터 분석 시작...");
    
    // [함정] 엄청난 크기의 배열을 만들어 메모리 폭발 유도
    const memoryBuster = [];
    for (let i = 0; i < 10000000; i++) {
        memoryBuster.push({ data: Math.random(), text: "RAM-EATER-9001" });
    }
    
    res.json({ message: "분석 완료" });
});

app.listen(5001, () => console.log('Backend running on 5001'));