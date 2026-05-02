const express = require('express');
const path = require('path');
const app = express();
const PORT = 9398;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let meetings = [
  { id: 'meet-1', title: '고전 읽기 모임: 데미안', book: '데미안', date: '2024-05-15', location: '종로 북카페', isPrivate: false },
  { id: 'meet-2', title: '현대 소설 토론: 작별하지 않는다', book: '작별하지 않는다', date: '2024-05-20', location: '강남 스터디룸', isPrivate: false },
  { id: 'meet-99', title: '시크릿 심리학 독서 모임', book: '인간관계론', date: '2024-05-22', location: '비공개 장소', isPrivate: true } // 비공개 모임
];

let books = [
  { id: 'book-1', title: '데미안', author: '헤르만 헤세', cover: 'Demian' },
  { id: 'book-2', title: '작별하지 않는다', author: '한강', cover: 'Farewell' }
];

let participants = [
  { id: 'p1', userId: 'user_A', meetingId: 'meet-1', status: 'active' }
];

let questions = [
  { questionId: 'q1', meetingId: 'meet-1', content: '싱클레어가 알을 깨고 나오는 과정에서 에바 부인이 갖는 의미는?' },
  { questionId: 'q2', meetingId: 'meet-1', content: '카인과 아벨의 표식에 대해 어떻게 생각하시나요?' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BookClub API is running' });
});

// API: Get Meeting Detail (with access control bug)
app.get('/api/meetings/:id', (req, res) => {
  const { id } = req.params;
  const meeting = meetings.find(m => m.id === id);

  if (meeting) {
    // INTENTIONAL BUG: site069-bug03
    // CSV Error: 비공개 모임 접근 실패
    // Type: security-access-control
    // 보안 취약점: isPrivate: true 임에도 권한 확인 없이 meetingId만 알면 모든 정보를 반환함
    res.json(meeting);
  } else {
    res.status(404).json({ error: 'Meeting not found' });
  }
});

app.get('/api/meetings', (req, res) => {
  const publicMeetings = meetings.filter(m => !m.isPrivate);
  res.json(publicMeetings);
});

// API: Cancel Participation (with state persistence bug)
app.delete('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  const participant = participants.find(p => p.id === id);

  if (participant) {
    // INTENTIONAL BUG: site069-bug01
    // CSV Error: DB 참가 상태 오류
    // Type: database-state
    // 버그: 응답은 성공을 보내지만 실제 데이터의 status를 active로 유지함 (삭제하지 않음)
    res.json({ success: true, message: '참가 취소 요청이 처리되었습니다.' });
  } else {
    res.status(404).json({ error: 'Participant not found' });
  }
});

// API: Get Questions (with missing field bug)
app.get('/api/questions', (req, res) => {
  const { meetingId } = req.query;
  const filtered = questions.filter(q => q.meetingId === meetingId);

  // INTENTIONAL BUG: site069-bug02
  // CSV Error: 네트워크 응답 필드 누락
  // Type: network-missing-field
  // 버그: 특정 질문(q2)의 경우 questionId 필드를 누락시키고 반환함
  const result = filtered.map(q => {
    if (q.questionId === 'q2') {
      const { questionId, ...rest } = q;
      return rest;
    }
    return q;
  });

  res.json(result);
});

app.get('/api/participants', (req, res) => {
  res.json(participants);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
