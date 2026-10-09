# Flowdesk (C-02) — ACTION_REPLAY Training Environment

Enterprise collaborative task and workflow management platform built as an **ACTION_REPLAY Training Environment** for Deep Q-Network (DQN) reinforcement learning.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Install root dependencies
cd 사이트2
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Run the Application

Run both frontend and backend concurrently:
```bash
npm start
```

Or run separately:
- **Backend API**: `npm run server` (runs Express on `http://localhost:5001`)
- **Frontend App**: `npm run client` (runs Vite React on `http://localhost:5174`)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Lucide Icons, Kanban & List views
- **Backend**: Node.js, Express, SQLite3 (`flowdesk.db`)
- **Reset Endpoint**: `POST /api/test/reset`

---

## 📋 Initial Task Data (7 Tasks)

1. **Landing Page Review** (`TODO`, `HIGH`, Alice)
2. **API Documentation** (`TODO`, `MEDIUM`, Brian)
3. **Mobile Layout Check** (`TODO`, `LOW`, Chloe)
4. **Payment Integration** (`IN_PROGRESS`, `HIGH`, Alice)
5. **Dashboard Redesign** (`IN_PROGRESS`, `LOW`, David)
6. **Database Migration** (`DONE`, `HIGH`, Brian)
7. **Login Page** (`DONE`, `MEDIUM`, Chloe)

---

## 🐛 Bug Catalog (5 Core Bugs)

| Bug ID | Error Name | Trigger Action | Key Evidence |
|---|---|---|---|
| `C-02-424` | Invalid State Transition | Kanban에서 `TODO` Task를 `DONE`으로 직접 드래그/이동 | Network `PUT 200 OK`, Task가 `DONE` 컬럼에 직접 저장 및 렌더링 |
| `C-02-726` | Optimistic UI Revert Failure | List view에서 Task 완료 Checkbox 클릭 | Network `PUT 400 Bad Request`, Checkbox는 롤백 없이 `checked=true` 유지 |
| `C-02-051` | Task Priority Sorting Bug | 정렬 드롭다운에서 `Sort by Priority` 선택 | Network `GET /api/tasks?sort=priority`, DOM의 우선순위 배지가 `HIGH→MED→LOW`가 아닌 순서로 렌더링 |
| `C-02-865` | Assignee Dropdown Loss | Task 수정 모달에서 담당자 변경 후 저장 | Network `PATCH` Payload에 `assignee_id` 누락, DOM에서 담당자가 `미지정`으로 변경 |
| `C-02-006` | Deleted Task Resurrected | Task 삭제 후 상단 필터 변경 또는 재조회 | Network `DELETE` 성공 후, `GET /api/tasks`에서 삭제 필터 누락으로 삭제된 Task가 DOM에 재등장 |

상세 사양은 [`BUGS.md`](./BUGS.md) 및 [`bug_catalog.json`](./bug_catalog.json)을 참조하세요.
