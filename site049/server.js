const express = require('express');
const path = require('path');
const app = express();
const PORT = 9378;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let projects = [
  { id: 'proj-1', name: 'UI 리뉴얼', team: 'Design' },
  { id: 'proj-2', name: '백엔드 최적화', team: 'Backend' },
  { id: 'proj-secret', name: '신규 수익 모델 기획', team: 'Strategy' } // 타 팀 프로젝트
];

let tasks = [
  { id: 'task-1', title: '와이어프레임 설계', status: 'Todo', projectId: 'proj-1', assignee: '김디자인' },
  { id: 'task-2', title: '데이터베이스 쿼리 튜닝', status: 'Doing', projectId: 'proj-2', assignee: '이백엔' },
  { id: 'task-3', title: '경쟁사 분석 보고서', status: 'Todo', projectId: 'proj-secret', assignee: '박기획' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TodoSprint API is running' });
});

// API: Get Project Tasks (with authorization bug)
app.get('/api/projects/:projectId/tasks', (req, res) => {
  const { projectId } = req.params;

  // INTENTIONAL BUG: site049-bug03
  // CSV Error: 프로젝트 권한 검증 누락
  // Type: security-authorization
  // 보안 취약점: 요청한 사용자가 해당 프로젝트 멤버인지 확인하지 않고 목록을 반환함
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  res.json(projectTasks);
});

// API: Update Task Status (with update target and race condition bugs)
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL BUG: site049-bug02
  // CSV Error: 네트워크 경쟁 상태
  // Type: network-race-condition
  // 버그: 랜덤 지연을 발생시켜 응답 순서가 뒤섞이게 유도함
  const delay = Math.random() * 2000;

  setTimeout(() => {
    // INTENTIONAL BUG: site049-bug01
    // CSV Error: DB 상태 업데이트 대상 오류
    // Type: database-update
    // 버그: ID로 검색하지 않고 단순히 ID 값을 배열 인덱스로 사용하여 업데이트함
    const index = parseInt(id.replace('task-', '')) - 1; // 0-based index
    
    if (tasks[index]) {
      tasks[index].status = status;
      res.json({ success: true, task: tasks[index] });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  }, delay);
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
