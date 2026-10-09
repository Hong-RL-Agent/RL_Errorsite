const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'workgrid.db');
const db = new sqlite3.Database(dbPath);

const initialProjects = [
  {
    id: 'P-101',
    name: 'Atlas Mobile',
    key: 'ATLAS',
    description: '차세대 모바일 앱 프레임워크 및 크로스플랫폼 클라이언트 개발',
    category: 'Mobile Application',
    status: 'ACTIVE',
    lead: 'Alex Johnson',
    created_at: '2026-09-01 09:00:00'
  },
  {
    id: 'P-102',
    name: 'Orion Commerce',
    key: 'ORION',
    description: '글로벌 엔터프라이즈 전자상거래 및 주문 정산 백엔드 플랫폼',
    category: 'E-Commerce Platform',
    status: 'ACTIVE',
    lead: 'Sophia Chen',
    created_at: '2026-09-10 10:00:00'
  },
  {
    id: 'P-103',
    name: 'Nova Platform',
    key: 'NOVA',
    description: '클라우드 네이티브 MSA 인프라 및 실시간 이벤트 스트리밍 시스템',
    category: 'Cloud Infrastructure',
    status: 'ACTIVE',
    lead: 'David Kim',
    created_at: '2026-09-15 11:00:00'
  }
];

const initialMembers = [
  // P-101 Members (4 members)
  { id: 1, project_id: 'P-101', name: '이주이 (나)', email: 'me@workgrid.io', role: 'TECH_LEAD', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
  { id: 2, project_id: 'P-101', name: 'Alex Johnson', email: 'alex@workgrid.io', role: 'PRODUCT_MANAGER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { id: 3, project_id: 'P-101', name: 'Elena Rostova', email: 'elena@workgrid.io', role: 'SENIOR_ENGINEER', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id: 4, project_id: 'P-101', name: 'Marcus Vance', email: 'marcus@workgrid.io', role: 'UI_UX_DESIGNER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },

  // P-102 Members (3 members)
  { id: 5, project_id: 'P-102', name: 'Sophia Chen', email: 'sophia@workgrid.io', role: 'LEAD', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
  { id: 6, project_id: 'P-102', name: 'James Miller', email: 'james@workgrid.io', role: 'ENGINEER', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' },
  { id: 7, project_id: 'P-102', name: 'Olivia Taylor', email: 'olivia@workgrid.io', role: 'QA_SPECIALIST', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' }
];

const initialMilestones = [
  {
    id: 'M-01',
    project_id: 'P-101',
    title: 'Core Architecture v1.0',
    description: '핵심 모바일 렌더링 엔진 및 인증 세션 아키텍처 구축',
    due_date: '2026-10-31',
    status: 'IN_PROGRESS',
    progress: 75
  },
  {
    id: 'M-02',
    project_id: 'P-101',
    title: 'User Experience Redesign',
    description: '디자인 시스템 2.0 마이그레이션 및 제스처 인터랙션 최적화',
    due_date: '2026-11-20',
    status: 'PLANNING',
    progress: 30
  },
  {
    id: 'M-03',
    project_id: 'P-102',
    title: 'Payment Gateway Migration',
    description: '글로벌 PG 연동 및 3D Secure 2.0 결제 보안 모듈 완성',
    due_date: '2026-11-15',
    status: 'IN_PROGRESS',
    progress: 50
  }
];

const initialSprints = [
  {
    id: 'SP-01',
    project_id: 'P-101',
    name: 'Sprint 42 - Performance & Core Engine',
    goal: '메모리 누수 해결 및 네트워크 캐시 최적화',
    start_date: '2026-10-15',
    end_date: '2026-10-31',
    status: 'ACTIVE'
  },
  {
    id: 'SP-02',
    project_id: 'P-102',
    name: 'Sprint 18 - Checkout Checkout Speedup',
    goal: '결제 플로우 속도 2배 개선',
    start_date: '2026-10-10',
    end_date: '2026-10-24',
    status: 'ACTIVE'
  }
];

// Helper to generate 24 issues for P-101 (with 6 assigned to 'me@workgrid.io')
function generateInitialIssues() {
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BACKLOG'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const issues = [];

  const myIssueIndices = [1, 5, 9, 13, 17, 21]; // 6 issues assigned to 'me@workgrid.io'

  for (let i = 1; i <= 24; i++) {
    const isMine = myIssueIndices.includes(i);
    const assigneeEmail = isMine ? 'me@workgrid.io' : i % 3 === 0 ? 'alex@workgrid.io' : i % 3 === 1 ? 'elena@workgrid.io' : 'marcus@workgrid.io';
    const assigneeName = isMine ? '이주이 (나)' : i % 3 === 0 ? 'Alex Johnson' : i % 3 === 1 ? 'Elena Rostova' : 'Marcus Vance';
    
    // Assign M-01 to first 4 issues
    const milestoneId = i <= 4 ? 'M-01' : i <= 8 ? 'M-02' : null;
    const status = statuses[(i - 1) % statuses.length];
    const priority = priorities[(i - 1) % priorities.length];

    issues.push({
      id: `ATLAS-${100 + i}`,
      project_id: 'P-101',
      title: `[엔진/UI] 기능 및 성능 개선 태스크 #${i}: ${isMine ? '핵심 비즈니스 로직' : '컴포넌트 리팩토링'}`,
      description: `프로젝트 관리 시스템 C-10의 세부 구현 티켓 #${i}에 대한 작업 내역입니다.`,
      status,
      priority,
      assignee_email: assigneeEmail,
      assignee_name: assigneeName,
      milestone_id: milestoneId,
      sprint_id: i <= 10 ? 'SP-01' : null,
      created_at: `2026-10-0${(i % 8) + 1} 10:00:00`
    });
  }

  // Add 6 issues for P-102
  for (let i = 1; i <= 6; i++) {
    issues.push({
      id: `ORION-${200 + i}`,
      project_id: 'P-102',
      title: `[커머스] 결제 및 주문 처리 작업 #${i}`,
      description: `Orion Commerce 티켓 #${i}`,
      status: statuses[i % statuses.length],
      priority: 'HIGH',
      assignee_email: 'sophia@workgrid.io',
      assignee_name: 'Sophia Chen',
      milestone_id: 'M-03',
      sprint_id: 'SP-02',
      created_at: '2026-10-05 11:00:00'
    });
  }

  return issues;
}

function initDb() {
  db.serialize(() => {
    // 1. projects
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        key TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        lead TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // 2. project_members
    db.run(`
      CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT
      )
    `);

    // 3. milestones
    db.run(`
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0
      )
    `);

    // 4. sprints
    db.run(`
      CREATE TABLE IF NOT EXISTS sprints (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        goal TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL
      )
    `);

    // 5. issues
    db.run(`
      CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        assignee_email TEXT,
        assignee_name TEXT,
        milestone_id TEXT,
        sprint_id TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // 6. invitations
    db.run(`
      CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Check count and seed if empty
    db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
      if (!err && (!row || row.count === 0)) {
        resetDb();
      }
    });
  });
}

function resetDb(callback) {
  db.serialize(() => {
    db.run('DELETE FROM invitations');
    db.run('DELETE FROM issues');
    db.run('DELETE FROM sprints');
    db.run('DELETE FROM milestones');
    db.run('DELETE FROM project_members');
    db.run('DELETE FROM projects');

    // Seed Projects
    const insertProj = db.prepare(`
      INSERT INTO projects (id, name, key, description, category, status, lead, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialProjects.forEach(p => {
      insertProj.run(p.id, p.name, p.key, p.description, p.category, p.status, p.lead, p.created_at);
    });
    insertProj.finalize();

    // Seed Members
    const insertMem = db.prepare(`
      INSERT INTO project_members (id, project_id, name, email, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    initialMembers.forEach(m => {
      insertMem.run(m.id, m.project_id, m.name, m.email, m.role, m.avatar);
    });
    insertMem.finalize();

    // Seed Milestones
    const insertMs = db.prepare(`
      INSERT INTO milestones (id, project_id, title, description, due_date, status, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialMilestones.forEach(ms => {
      insertMs.run(ms.id, ms.project_id, ms.title, ms.description, ms.due_date, ms.status, ms.progress);
    });
    insertMs.finalize();

    // Seed Sprints
    const insertSp = db.prepare(`
      INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialSprints.forEach(sp => {
      insertSp.run(sp.id, sp.project_id, sp.name, sp.goal, sp.start_date, sp.end_date, sp.status);
    });
    insertSp.finalize();

    // Seed Issues (24 in P-101, 6 in P-102)
    const issues = generateInitialIssues();
    const insertIss = db.prepare(`
      INSERT INTO issues (id, project_id, title, description, status, priority, assignee_email, assignee_name, milestone_id, sprint_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    issues.forEach(iss => {
      insertIss.run(iss.id, iss.project_id, iss.title, iss.description, iss.status, iss.priority, iss.assignee_email, iss.assignee_name, iss.milestone_id, iss.sprint_id, iss.created_at);
    });
    insertIss.finalize();

    if (callback) callback();
  });
}

initDb();

module.exports = {
  db,
  resetDb
};
