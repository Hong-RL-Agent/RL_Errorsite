const express = require('express');
const path = require('path');
const app = express();
const PORT = 9361;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let tutors = [
  { id: 't1', name: '김수학', subject: 'Math', hourlyRate: 35000, bio: '서울대 수학교육과 졸업. 10년 경력의 베테랑입니다.', rating: 4.9 },
  { id: 't2', name: '이영어', subject: 'English', hourlyRate: 28000, bio: '미국 유학 7년. 회화부터 수능까지 책임집니다.', rating: 4.7 },
  { id: 't3', name: '박과학', subject: 'Science', hourlyRate: 40000, bio: '카이스트 석사. 원리를 깨우치는 과학 수업.', rating: 4.8 },
  { id: 't4', name: '최국어', subject: 'Korean', hourlyRate: 30000, bio: '수능 국어 만점자 다수 배출. 논술 전문.', rating: 4.6 },
  { id: 't5', name: '정코딩', subject: 'Coding', hourlyRate: 50000, bio: '대기업 개발자 출신. 실무 위주 코딩 교육.', rating: 5.0 }
];

let consultations = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TutorMatch API is running' });
});

// API: Get Tutors (with sorting bug)
app.get('/api/tutors', (req, res) => {
  const { sort } = req.query;
  let result = [...tutors];

  if (sort === 'price_asc') {
    // INTENTIONAL BUG: site032-bug01
    // CSV Error: DB 가격 정렬 오류
    // Type: database-sort
    // Description: hourlyRate를 문자열 기준으로 정렬해 가격순 결과가 잘못됨.
    result.sort((a, b) => {
      const valA = String(a.hourlyRate);
      const valB = String(b.hourlyRate);
      return valA.localeCompare(valB); // 버그: 35000(문자열)과 40000(문자열) 비교
    });
  }

  res.json(result);
});

// API: Request Consultation
// INTENTIONAL BUG: site032-bug03
// CSV Error: 상담 신청 인증 누락
// Type: security-authentication
app.post('/api/consultations', (req, res) => {
  const { tutorId, userId, message } = req.body;
  
  // 보안 취약점: Authorization 헤더 체크가 생략되어 누구나 신청 가능
  const newConsult = {
    id: 'c-' + Date.now(),
    tutorId,
    userId,
    message,
    status: 'Pending',
    createdAt: new Date()
  };

  consultations.push(newConsult);
  res.status(201).json({ success: true, consultation: newConsult });
});

// API: Recommendations (with schema mismatch bug)
// INTENTIONAL BUG: site032-bug02
// CSV Error: API 필드명 불일치
// Type: network-schema-mismatch
// Description: 추천 API가 tutorName 대신 name 필드를 반환함.
app.get('/api/recommendations', (req, res) => {
  const recommended = [
    { id: 't5', name: '정코딩', subject: 'Coding', hourlyRate: 50000 }, // 버그: tutorName이 아닌 name 필드 사용
    { id: 't1', name: '김수학', subject: 'Math', hourlyRate: 35000 }
  ];
  res.json(recommended);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
