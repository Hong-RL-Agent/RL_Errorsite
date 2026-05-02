const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9416;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database
let userScore = 1500;
let userWrongNotes = [];
let solvedQuizzes = new Set();

const quizzes = [
  { id: 1, subject: 'Programming', question: 'What does "JS" stand for?', options: ['Just Saying', 'JavaScript', 'Junior System', 'Java Source'], answer: 1, explanation: 'JS is the standard abbreviation for JavaScript.' },
  { id: 2, subject: 'Programming', question: 'Which keyword is used to declare a constant in JS?', options: ['var', 'let', 'const', 'def'], answer: 2, explanation: '"const" creates a read-only reference to a value.' },
  { id: 3, subject: 'Science', question: 'What is the chemical symbol for Gold?', options: ['Gd', 'Go', 'Ag', 'Au'], answer: 3, explanation: 'Au comes from the Latin word "Aurum".' },
  { id: 4, subject: 'History', question: 'In which year did World War II end?', options: ['1941', '1945', '1948', '1950'], answer: 1, explanation: 'World War II ended in 1945.' },
  { id: 5, subject: 'Science', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2, explanation: 'Mars appears red due to iron oxide on its surface.' }
];

const rankings = [
  { name: 'Alice', score: 2800 },
  { name: 'Bob', score: 2450 },
  { name: 'Charlie', score: 2100 },
  { name: 'You', score: userScore },
  { name: 'Dave', score: 1200 }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', site: 'site087' });
});

app.get('/api/quizzes', (req, res) => {
  const { subject } = req.query;
  if (subject && subject !== 'All') {
    return res.json(quizzes.filter(q => q.subject === subject));
  }
  res.json(quizzes);
});

// INTENTIONAL BUG: site087-bug01
// CSV Error: DB 점수 중복 반영 / Type: database-duplicate
// Description: 같은 문제를 여러 번 제출하면 점수가 계속 누적됨. 원래는 이미 푼 문제는 점수를 주면 안 됨.
// data-bug-id="site087-bug01"
app.post('/api/answers', (req, res) => {
  const { quizId, selectedOption } = req.body;
  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const isCorrect = selectedOption === quiz.answer;

  if (isCorrect) {
    // INTENTIONAL BUG: site087-bug01
    // data-bug-id="site087-bug01"
    // No check if solvedQuizzes.has(quizId)
    userScore += 100;
    solvedQuizzes.add(quizId);
    
    return res.json({ correct: true, explanation: quiz.explanation, currentScore: userScore });
  } else {
    // INTENTIONAL BUG: site087-bug02
    // CSV Error: 네트워크 상태 코드 오류 / Type: network-http-status
    // Description: 오답 제출도 201 Created와 correct:true 형태로 반환될 수 있음.
    // data-bug-id="site087-bug02"
    userWrongNotes.push({ ...quiz, selected: selectedOption });
    return res.status(201).json({ correct: true, explanation: 'Actually, it is wrong but returning correct.', currentScore: userScore });
    
    // Normal behavior should be:
    // return res.json({ correct: false, explanation: quiz.explanation, currentScore: userScore });
  }
});

app.get('/api/scores', (req, res) => {
  res.json({ score: userScore, solvedCount: solvedQuizzes.size });
});

// INTENTIONAL BUG: site087-bug03
// CSV Error: 점수 조작 취약점 / Type: security-parameter-tampering
// Description: 클라이언트가 보낸 scoreDelta를 서버가 검증 없이 반영함.
// data-bug-id="site087-bug03"
app.patch('/api/scores', (req, res) => {
  const { scoreDelta } = req.body;
  
  // INTENTIONAL BUG: site087-bug03
  // data-bug-id="site087-bug03"
  if (typeof scoreDelta === 'number') {
    userScore += scoreDelta;
  }
  
  res.json({ success: true, newScore: userScore });
});

app.get('/api/ranking', (req, res) => {
  const currentRankings = rankings.map(r => r.name === 'You' ? { ...r, score: userScore } : r);
  currentRankings.sort((a, b) => b.score - a.score);
  res.json(currentRankings);
});

app.get('/api/wrong-notes', (req, res) => {
  res.json(userWrongNotes);
});

app.listen(PORT, () => {
  console.log(`MicroLearn Quiz running at http://localhost:${PORT}`);
});
