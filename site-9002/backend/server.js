const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// 업로드 경로 설정
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), (req, res) => {
    // 만약 폴더 권한이 없으면 multer가 내부적으로 에러를 발생시킵니다.
    console.log("파일 업로드 요청 수신");
    res.json({ message: "파일 업로드 성공!" });
});

// 에러 핸들러: 권한 에러 등을 캐치
app.use((err, req, res, next) => {
    console.error("서버 에러:", err.message);
    res.status(403).json({ error: "Access Denied: 폴더 쓰기 권한이 없습니다." });
});

app.listen(5001, () => console.log('Backend running on 5001'));