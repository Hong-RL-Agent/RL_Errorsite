const express = require('express');
const path = require('path');
const app = express();
const PORT = 9380;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let surveys = [
  { id: 's1', title: '2024 상반기 복지 만족도 조사', status: 'open', dept: 'All', question: '현재 복지에 만족하십니까?' },
  { id: 's2', title: '신규 오피스 인테리어 선호도', status: 'open', dept: 'Tech', question: '어떤 컨셉의 휴게실을 원하시나요?' },
  { id: 's3', title: '구내 식당 메뉴 개선 설문', status: 'closed', dept: 'All', question: '가장 선호하는 메뉴는?' }
];

let responses = [
  { surveyId: 's3', answer: '돈까스', userId: 'user_99' } // 과거 응답
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'QuickSurvey HR API is running' });
});

app.get('/api/surveys', (req, res) => {
  res.json(surveys);
});

// API: Submit Response (with privacy and status code bugs)
app.post('/api/responses', (req, res) => {
  const { surveyId, answer, userId } = req.body;

  // 중복 응답 체크
  const alreadyResponded = responses.find(r => r.surveyId === surveyId && r.userId === userId);
  if (alreadyResponded) {
    // INTENTIONAL BUG: site051-bug02
    // CSV Error: 네트워크 잘못된 성공 응답
    // Type: network-http-status
    // 버그: 실패 상황(중복 응답)임에도 200 OK를 반환함
    return res.status(200).json({ success: false, error: 'Already responded to this survey' });
  }

  // INTENTIONAL BUG: site051-bug01
  // CSV Error: DB 익명 처리 실패
  // Type: database-privacy
  // 버그: 익명 설문임에도 userId를 포함하여 저장함
  const newResponse = { surveyId, answer, userId };
  responses.push(newResponse);

  res.status(201).json({ success: true });
});

// API: Get Results (with privacy and authorization bugs)
app.get('/api/results/:surveyId', (req, res) => {
  const { surveyId } = req.params;
  const survey = surveys.find(s => s.id === surveyId);
  
  if (!survey) return res.status(404).json({ error: 'Survey not found' });

  // INTENTIONAL BUG: site051-bug03
  // CSV Error: 결과 접근 권한 누락
  // Type: security-authorization
  // 버그: 설문이 closed 상태가 아니어도 누구나 결과를 조회할 수 있음
  /*
  if (survey.status !== 'closed') {
    return res.status(403).json({ error: 'Survey is still in progress' });
  }
  */

  const surveyResponses = responses.filter(r => r.surveyId === surveyId);
  
  // INTENTIONAL BUG: site051-bug01 (Part 2)
  // 버그: 응답 목록을 반환할 때 userId를 포함시켜서 익명성을 파괴함
  res.json({
    survey,
    totalResponses: surveyResponses.length,
    rawResponses: surveyResponses // 익명이어야 하나 userId가 포함됨
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
