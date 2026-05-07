import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9177;

app.use(cors());
app.use(express.json());

// --- Mock Data ---
let quizzes = [
  { id: 1, title: 'JavaScript Fundamentals', duration: 10, totalQuestions: 5, category: 'Tech' },
  { id: 2, title: 'World History Trivia', duration: 15, totalQuestions: 10, category: 'History' },
  { id: 3, title: 'Science & Nature', duration: 12, totalQuestions: 8, category: 'Science' }
];

const masterQuestions = [
  { id: 1, text: "Which keyword is used to declare a variable in ES6?", options: ["var", "let", "make", "create"], answer: "let", score: 20 },
  { id: 2, text: "What is the result of 2 + '2'?", options: ["4", "22", "NaN", "Error"], answer: "22", score: 20 },
  { id: 3, text: "Which array method adds an element to the end?", options: ["push", "pop", "shift", "unshift"], answer: "push", score: 20 },
  { id: 4, text: "Select all JavaScript primitive types:", options: ["String", "Object", "Number", "Array"], answer: ["String", "Number"], isMultiple: true, score: 20 },
  { id: 5, text: "What is the type of null in JS?", options: ["null", "undefined", "object", "string"], answer: "object", score: 20 }
];

let attempts = [];
let logs = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// --- APIs ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: "site068", status: "healthy" });
});

app.get('/api/quizzes', (req, res) => {
  const { search } = req.query;
  let data = quizzes;
  if (search) {
    data = data.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
  }
  res.json({ data });
});

app.get('/api/quiz/start', (req, res) => {
  const { quizId, triggerBug } = req.query;
  let questions = [...masterQuestions];
  let bugId = null;

  // BUG 01: question-order-shuffle-mismatch
  if (triggerBug === 'true') {
    bugId = 'site068-bug01';
    // Shuffle the questions visually but server-side grading will use master order
    questions = questions.sort(() => Math.random() - 0.5);
    logs.push({ time: Date.now(), msg: `[로직 오류] 문항 셔플 불일치 발생 (Bug 01): Quiz #${quizId}` });
  }

  res.json({ quizId: parseInt(quizId), questions, bugId });
});

app.post('/api/quiz/submit', (req, res) => {
  const { quizId, answers, triggerBug } = req.body;
  let score = 0;
  let submitted = true;
  let bugId = null;

  // Calculate score
  masterQuestions.forEach((q, index) => {
    const userAns = answers[q.id];
    let isCorrect = false;
    
    if (q.isMultiple) {
      isCorrect = Array.isArray(userAns) && userAns.sort().join(',') === q.answer.sort().join(',');
    } else {
      isCorrect = userAns === q.answer;
    }

    if (isCorrect) {
      // BUG 02: score-accumulation-skip
      if (triggerBug === 'true' && index === 0) {
        bugId = 'site068-bug02';
        logs.push({ time: Date.now(), msg: `[계산 오류] 점수 누적 누락 (Bug 02): 1번 문항 점수 반영 안 됨` });
        // Don't add score
      } else {
        score += q.score;
      }
    }
  });

  // BUG 04: submission-status-flag-inversion
  if (triggerBug === 'true' && !bugId) { // Only if bug 2 didn't already set it, but actually they are different buttons
    bugId = 'site068-bug04';
    submitted = false; 
    logs.push({ time: Date.now(), msg: `[상태 오류] 제출 상태 플래그 반전 (Bug 04): 제출했으나 미제출 처리` });
  }

  const result = { quizId, score, answers, submitted, timestamp: Date.now(), bugId };
  attempts.push(result);
  res.json(result);
});

app.get('/api/quiz/result', (req, res) => {
  const lastAttempt = attempts[attempts.length - 1];
  if (!lastAttempt) return res.status(404).json({ error: "No attempts found" });
  
  res.json({
    score: lastAttempt.score,
    correct: Math.floor(lastAttempt.score / 20),
    wrong: 5 - Math.floor(lastAttempt.score / 20),
    bugId: lastAttempt.bugId
  });
});

app.get('/api/quiz/review', (req, res) => {
  const { triggerBug } = req.query;
  const lastAttempt = attempts[attempts.length - 1];
  
  if (!lastAttempt) return res.status(404).json({ error: "No attempts found" });

  let details = masterQuestions.map(q => {
    const userAns = lastAttempt.answers[q.id];
    let isCorrect = false;
    if (q.isMultiple) {
      isCorrect = Array.isArray(userAns) && userAns.sort().join(',') === q.answer.sort().join(',');
    } else {
      isCorrect = userAns === q.answer;
    }

    return {
      id: q.id,
      text: q.text,
      correct: isCorrect,
      earnedScore: isCorrect ? q.score : 0
    };
  });

  let bugId = null;
  // BUG 03: partial-grading-logic-error
  if (triggerBug === 'true') {
    bugId = 'site068-bug03';
    // Logic error: mark Q4 (multiple choice) as wrong even if partially correct or even fully correct
    details = details.map(d => d.id === 4 ? { ...d, correct: false, earnedScore: 0 } : d);
    logs.push({ time: Date.now(), msg: `[채점 오류] 부분 채점 로직 결함 (Bug 03)` });
  }

  res.json({ details, bugId: bugId || lastAttempt.bugId });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalAttempts: attempts.length + 120,
    avgScore: 78,
    completionRate: '94%'
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ data: logs.slice(-20).reverse() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Site068 on http://localhost:${PORT}`));
