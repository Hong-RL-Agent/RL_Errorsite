const express = require('express');
const path = require('path');

const app = express();
const port = 9114;

app.use(express.json());

// Mock Data
const contents = [
    { id: 1, title: 'Stranger Nights', genre: 'Sci-Fi', duration: '50m' },
    { id: 2, title: 'Breaking Rules', genre: 'Drama', duration: '45m' },
    { id: 3, title: 'The Crowned', genre: 'History', duration: '60m' },
];

let userState = {
    isSubscribed: false,
    isCancelled: false,
    contentState: 'unwatched', // unwatched, watching, finished
    downloadState: 'none'      // none, downloading, downloaded
};

// ================= API ENDPOINTS =================

// 1. Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site005', status: 'healthy' });
});

// 2. Content List
app.get('/api/content/list', (req, res) => {
    res.json({ ok: true, data: contents });
});

// User State (for frontend UI)
app.get('/api/user/state', (req, res) => {
    res.json({ ok: true, state: userState });
});

// Normal Subscribe/Cancel actions
app.post('/api/user/subscribe', (req, res) => {
    userState.isSubscribed = true;
    userState.isCancelled = false;
    res.json({ ok: true, message: 'Subscribed successfully' });
});

app.post('/api/user/cancel', (req, res) => {
    userState.isSubscribed = false; // Intentionally set to false here, but Bug 04 will ignore this logic
    userState.isCancelled = true;
    res.json({ ok: true, message: 'Subscription cancelled' });
});

// Reset for testing
app.post('/api/test/reset', (req, res) => {
    userState = { isSubscribed: false, isCancelled: false, contentState: 'unwatched', downloadState: 'none' };
    res.json({ ok: true });
});

// 3. Content Play (BUG 02, BUG 04)
app.post('/api/content/play', (req, res) => {
    // INTENTIONAL BACKEND BUG: site005-bug04
    // Type: business-logic-paradox
    // Description: 구독 해지 후에도 콘텐츠 재생을 요청하면 서버가 이전의 구독 이력을 이유로 재생을 허가하는 논리적 모순
    if (userState.isCancelled) {
        userState.contentState = 'watching';
        return res.json({ ok: true, bugId: 'site005-bug04', message: 'Playing content even though subscription is cancelled' });
    }

    // INTENTIONAL BACKEND BUG: site005-bug02
    // Type: implicit-state-assumption
    // Description: 사용자가 구독하지 않았는데도 서버가 클라이언트의 재생 요청을 맹신하고 허용함
    if (!userState.isSubscribed) {
        userState.contentState = 'watching';
        return res.json({ ok: true, bugId: 'site005-bug02', message: 'Playing content without active subscription' });
    }

    userState.contentState = 'watching';
    res.json({ ok: true, message: 'Playing content', state: userState });
});

// 4. Content State Update (BUG 01)
app.post('/api/content/state', (req, res) => {
    const { state } = req.body;
    
    // INTENTIONAL BACKEND BUG: site005-bug01
    // Type: undefined-state-transition
    // Description: 허용되지 않은 비정상 상태값(예: WATCHING_UNKNOWN_FINAL)을 서버가 검증 없이 그대로 저장함
    userState.contentState = state;

    res.json({ ok: true, bugId: 'site005-bug01', message: `State updated to ${state}`, state: userState });
});

// 5 & 6. Download and Delete (BUG 03)
app.post('/api/content/download', async (req, res) => {
    // INTENTIONAL BACKEND BUG: site005-bug03
    // Type: feature-interaction-conflict
    // Description: 다운로드 도중 삭제 요청이 들어오면 동시성 제어(Lock)가 없어 상태가 충돌/불일치함
    userState.downloadState = 'downloading';
    
    // Simulate slow download
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If delete was called during this sleep, it gets overwritten back to downloaded!
    userState.downloadState = 'downloaded';
    
    // Bug 03 logic checking if conflict happened
    res.json({ ok: true, message: 'Download finished', state: userState });
});

app.post('/api/content/delete', (req, res) => {
    // Delete is instant
    userState.downloadState = 'none';
    res.json({ ok: true, message: 'Deleted content', state: userState });
});

// Helper route to trigger Race Condition Bug 03 reliably from frontend
app.post('/api/test/conflict', async (req, res) => {
    // Start download
    const p1 = fetch('http://localhost:' + port + '/api/content/download', {method: 'POST'});
    // Delete it halfway through
    await new Promise(resolve => setTimeout(resolve, 500));
    const p2 = fetch('http://localhost:' + port + '/api/content/delete', {method: 'POST'});
    
    await Promise.all([p1, p2]);
    
    // Because download overwrites the state at the end, it becomes 'downloaded' even though we just deleted it
    res.json({ 
        ok: true, 
        bugId: 'site005-bug03', 
        message: 'Conflict generated: Deleted but download state is still Downloaded',
        state: userState 
    });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
