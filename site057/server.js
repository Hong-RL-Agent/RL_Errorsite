const express = require('express');
const path = require('path');
const app = express();
const PORT = 9386;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let notes = [
  { id: 'note-1', title: '경제학 원론 중간고사 요약', author: 'Kim', subject: 'Economics', isPrivate: false, downloads: 120 },
  { id: 'note-2', title: '데이터 구조 기초 필기', author: 'Lee', subject: 'Computer Science', isPrivate: false, downloads: 85 },
  { id: 'note-99', title: '나의 개인 비밀 연구 노트', author: 'Park', subject: 'General', isPrivate: true, downloads: 0 } // 비공개 노트
];

let comments = [
  { id: 'com-1', noteId: 'note-1', text: '정말 도움되는 자료네요! 감사합니다.', author: 'User_B' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ClassNote API is running' });
});

// API: Get Notes (filtering out private by default, but bug 03 allows bypass)
app.get('/api/notes', (req, res) => {
  const { subject } = req.query;
  let filtered = notes.filter(n => !n.isPrivate); // 목록에는 비공개 제외
  if (subject && subject !== 'All') {
    filtered = filtered.filter(n => n.subject === subject);
  }
  res.json(filtered);
});

// API: Get Note Detail (with security access control bug)
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const note = notes.find(n => n.id === id);

  if (note) {
    // INTENTIONAL BUG: site057-bug03
    // CSV Error: 비공개 노트 접근 실패
    // Type: security-access-control
    // 보안 취약점: isPrivate: true인 경우 작성자 본인 확인 절차 없이 모두에게 반환함
    /*
    if (note.isPrivate && req.headers['user-id'] !== note.author) {
      return res.status(403).json({ error: 'Private note' });
    }
    */
    res.json(note);
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

// API: Upload Note (with request validation bug)
app.post('/api/uploads', (req, res) => {
  const { title, fileName } = req.body;
  const ext = fileName.split('.').pop().toLowerCase();
  const allowed = ['pdf', 'docx', 'pptx'];

  // INTENTIONAL BUG: site057-bug02
  // CSV Error: 네트워크 파일 타입 검증 누락
  // Type: network-request-validation
  // 버그: 허용되지 않은 확장자임에도 에러를 반환하지 않고 성공 처리함
  const isValid = allowed.includes(ext);
  
  res.status(200).json({
    status: 'success',
    message: '파일이 성공적으로 업로드되었습니다.',
    fileInfo: { title, fileName, isValid } // 실제로는 유효하지 않아도 성공 응답
  });
});

// API: Create Comment (with database relation bug)
app.post('/api/comments', (req, res) => {
  const { noteId, userId, text } = req.body;

  // INTENTIONAL BUG: site057-bug01
  // CSV Error: DB 댓글 연결 오류
  // Type: database-relation
  // 버그: noteId가 아닌 userId를 noteId 필드에 잘못 저장함
  const newComment = {
    id: `com-${Date.now()}`,
    noteId: userId, // CRITICAL BUG: userId를 연결고리로 사용
    text,
    author: userId
  };

  comments.push(newComment);
  res.status(201).json(newComment);
});

app.get('/api/comments/:noteId', (req, res) => {
  res.json(comments.filter(c => c.noteId === req.params.noteId));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
