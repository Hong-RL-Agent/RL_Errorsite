const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 9125;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let posts = [
    { id: 1, author: "alex_dev", content: "Just deployed my first React app! 🚀", likes: 120, comments: 15, restricted: false },
    { id: 2, author: "design_guru", content: "Check out this new minimalist UI concept.", likes: 340, comments: 42, restricted: false },
    { id: 3, author: "nsfw_bot", content: "[Sensitive Content] This post contains violence and graphic material.", likes: 50, comments: 5, restricted: true },
    { id: 4, author: "coffee_lover", content: "Morning coffee is the best way to start coding.", likes: 88, comments: 3, restricted: false }
];

let currentUser = {
    id: 999,
    username: "test_user",
    email: "test@example.com",
    age: 25,
    deleted: false,
    ssn: "800101-1234567", // Sensitive data
    passwordPlainText: "mySecretPassword123" // Sensitive data
};

// 1. GET Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site016", status: "healthy" });
});

// 2. GET Feed (Bug 02: 부적절한 연령 확인 로직)
app.get('/api/feed', (req, res) => {
    const age = parseInt(req.query.age || currentUser.age);
    
    // INTENTIONAL BACKEND BUG: site016-bug02
    // Type: 부적절한 연령 확인 로직
    // Description: 18세 미만 사용자에게도 restricted 콘텐츠를 필터링 없이 그대로 반환함.
    let resultPosts = posts;
    let bugId = null;

    if (age < 18) {
        // 원래는 resultPosts = posts.filter(p => !p.restricted); 여야 함.
        bugId = "site016-bug02";
    }

    res.json({ ok: true, data: resultPosts, bugId });
});

// 3. GET Profile (Bug 03: 데이터 최소 수집 원칙 위반)
app.get('/api/user/profile', (req, res) => {
    
    // INTENTIONAL BACKEND BUG: site016-bug03
    // Type: 데이터 최소 수집 원칙 위반
    // Description: 불필요하게 민감한 정보(SSN, 평문 비밀번호)까지 모두 클라이언트에게 전송됨.
    const profileData = {
        ...currentUser,
        // 이 아래 데이터들은 내려보내면 안 됨
        ssn: currentUser.ssn,
        password: currentUser.passwordPlainText
    };

    res.json({ ok: true, data: profileData, bugId: "site016-bug03" });
});

// 4. DELETE /api/user/delete (Bug 01: 데이터 삭제 경로 부재)
// INTENTIONAL BACKEND BUG: site016-bug01
// Type: 데이터 삭제 경로 부재
// Description: 사용자 삭제 API 경로가 정상적으로 구현되지 않아 무조건 404 Not Found 발생
app.delete('/api/user/delete', (req, res) => {
    // 의도적으로 404를 발생시키고 bugId를 심어줌
    res.status(404).json({ 
        ok: false, 
        error: "Not Found: API route not implemented", 
        bugId: "site016-bug01" 
    });
});

// 5. POST /api/user/deactivate (Bug 04: 탈퇴 데이터 파기 지연)
app.post('/api/user/deactivate', (req, res) => {
    // INTENTIONAL BACKEND BUG: site016-bug04
    // Type: 탈퇴 데이터 파기 지연
    // Description: 탈퇴 요청 시 deleted 플래그만 true로 바꾸고, 실제 개인정보 파기는 즉시 이루어지지 않음
    currentUser.deleted = true;
    
    // 원래는 개인정보(email, ssn, password 등)를 마스킹하거나 DB에서 제거해야 함
    
    res.json({ 
        ok: true, 
        msg: "Account deactivated", 
        currentUserDataStillRetained: currentUser, 
        bugId: "site016-bug04" 
    });
});

// 6. GET /api/user/privacy (Bug 05: 법적 근거 고지 미흡)
app.get('/api/user/privacy', (req, res) => {
    // INTENTIONAL BACKEND BUG: site016-bug05
    // Type: 법적 근거 고지 미흡
    // Description: 개인정보 처리 방침을 응답하지만 합법적 근거(legalBasis)에 대한 항목이 의도적으로 누락됨.
    const privacyPolicy = {
        dataCollected: ["email", "usage", "ip"],
        retentionPeriod: "2 years",
        // legalBasis: "GDPR Article 6(1)(b) - Contractual necessity" -> 누락됨
    };

    res.json({ ok: true, data: privacyPolicy, bugId: "site016-bug05" });
});

// 7. GET /api/user/inactive (Bug 06: 휴면 계정 처리 정책 미고지)
app.get('/api/user/inactive', (req, res) => {
    // INTENTIONAL BACKEND BUG: site016-bug06
    // Type: 휴면 계정 처리 정책 미고지
    // Description: 휴면 계정 상태를 조회할 때, 데이터 파기 일정이나 정책 정보 안내가 전혀 없음.
    const inactiveStatus = {
        status: "inactive",
        lastLogin: "2024-01-01T00:00:00Z",
        // policy: "Accounts inactive for 1 year are permanently deleted" -> 누락됨
    };

    res.json({ ok: true, data: inactiveStatus, bugId: "site016-bug06" });
});

// 8. GET Trending (Normal feature)
app.get('/api/trending', (req, res) => {
    res.json({ 
        ok: true, 
        data: ["#React", "#JavaScript", "#WebDev", "#TailwindCSS"] 
    });
});

// --- NORMAL FEATURES ADDED FOR REALISM ---

// Normal Feature 1: Like Post
app.post('/api/post/like', (req, res) => {
    const { postId } = req.body;
    let post = posts.find(p => p.id === postId);
    if(post) {
        post.likes += 1;
        res.json({ ok: true, msg: "Post liked", likes: post.likes });
    } else {
        res.status(404).json({ ok: false, msg: "Post not found" });
    }
});

// Normal Feature 2: Comment on Post
app.post('/api/post/comment', (req, res) => {
    const { postId, comment } = req.body;
    let post = posts.find(p => p.id === postId);
    if(post && comment) {
        post.comments += 1;
        res.json({ ok: true, msg: "Comment added", comments: post.comments });
    } else {
        res.status(400).json({ ok: false, msg: "Invalid data" });
    }
});

// Normal Feature 3: Follow User
app.post('/api/user/follow', (req, res) => {
    const { username } = req.body;
    if(username) {
        res.json({ ok: true, msg: `You are now following @${username}` });
    } else {
        res.status(400).json({ ok: false, msg: "Username required" });
    }
});

app.listen(port, () => {
    console.log(`site016 server running on port ${port}`);
});
