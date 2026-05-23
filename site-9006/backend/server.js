const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // [함정] 초기 비밀번호 admin/admin을 그대로 방치함
    if (username === 'admin' && password === 'admin') {
        res.json({ success: true, token: "JWT_DUMMY_TOKEN_9006", message: "관리자 로그인 성공" });
    } else {
        res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 틀립니다." });
    }
});

app.listen(5001, () => console.log('Admin Server running on 5001'));