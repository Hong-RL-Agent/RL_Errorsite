const express = require('express');
const path = require('path');
const app = express();
const PORT = 9245;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const surveyData = {
  id: "srv-001",
  title: "2026 하반기 신제품 만족도 조사",
  description: "더 나은 서비스를 위해 고객님의 소중한 의견을 들려주세요.",
  questions: [
    { id: 1, type: "choice", text: "신제품의 전반적인 디자인에 대해 어떻게 생각하시나요?", options: ["매우 만족", "만족", "보통", "불만족", "매우 불만족"], required: true },
    { id: 2, type: "choice", text: "기능 중 가장 유용했던 것은 무엇인가요?", options: ["빠른 동기화", "강력한 보안", "직관적인 UI", "저렴한 가격"], required: true },
    { id: 3, type: "text", text: "추가로 개선되었으면 하는 점이 있다면 자유롭게 적어주세요.", required: false }
  ]
};

const templates = [
  { id: 1, name: "고객 만족도 조사", category: "비즈니스", count: 12, recommended: true },
  { id: 2, name: "제품 선호도 설문", category: "마케팅", count: 8, recommended: false },
  { id: 3, name: "직원 몰입도 진단", category: "인사", count: 15, recommended: true },
  { id: 4, name: "행사 사후 피드백", category: "이벤트", count: 5, recommended: false }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/survey', (req, res) => {
  res.json(surveyData);
});

app.get('/api/templates', (req, res) => {
  res.json(templates);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
