const express = require('express');
const app = express();

app.get('/api/generate-ai', (req, res) => {
    console.log("🎨 고해상도 AI 이미지 생성 시뮬레이션 시작 (10초 소요 예정)...");
    
    // [함정] 10초 후에 응답을 보냅니다.
    setTimeout(() => {
        console.log("✅ 생성 완료!");
        if (!res.writableEnded) {
            res.json({ url: "https://example.com/ai-image.png", message: "생성 성공!" });
        }
    }, 10000);
});

app.listen(5001, () => console.log('Backend running on 5001'));