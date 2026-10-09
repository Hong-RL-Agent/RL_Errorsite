# AdminDesk (C-03) — ACTION_REPLAY Training Environment

Enterprise Admin User & Access Management Console built as an **ACTION_REPLAY Training Environment** for Deep Q-Network (DQN) reinforcement learning.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Install root dependencies
cd 사이트3
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
- **Backend API**: `npm run server` (runs Express on `http://localhost:5002`)
- **Frontend App**: `npm run client` (runs Vite React on `http://localhost:5175`)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Lucide Icons, Enterprise Emerald & Slate Design
- **Backend**: Node.js, Express, SQLite3 (`admindesk.db`)
- **Reset Endpoint**: `POST /api/test/reset`

---

## 👥 Initial Deterministic Users (7 Users)

1. **Alice Kim** (`#101`, `alice@example.com`, `USER`, Active, Engineering)
2. **Brian Lee** (`#102`, `brian@example.com`, `USER`, Active, Marketing)
3. **Chloe Park** (`#103`, `chloe@example.com`, `MANAGER`, Active, Design)
4. **David Choi** (`#104`, `david@example.com`, `USER`, Blocked, Sales)
5. **Elena Vance** (`#105`, `elena@example.com`, `ADMIN`, Active, Security)
6. **Frank Castle** (`#106`, `frank@example.com`, `USER`, Active, Operations)
7. **Grace Hopper** (`#107`, `grace@example.com`, `MANAGER`, Active, Engineering)

---

## 🐛 Bug Catalog (5 Core Bugs)

| Bug ID | Error Name | Trigger Action | Key Evidence |
|---|---|---|---|
| `C-03-936` | Role Toggle Desync | Brian Lee의 역할을 `ADMIN`으로 변경 | UI는 `ADMIN` + 성공 토스트 표시되나, 서버 DB는 `USER`로 미반영 |
| `C-03-182` | Wrong Target User Mutation | Brian Lee(102) 정보 수정 후 저장 | Alice Kim(101)의 정보가 Brian의 입력값으로 변조됨 |
| `C-03-1783` | Search Query Persistence Loss | 검색어 입력 후 상태 필터 드롭다운 변경 | 검색창 값이 `""`로 초기화되고 `search` 파라미터가 누락된 요청 발생 |
| `C-03-889` | Active Status Inversion | Active 사용자 계정 Block 클릭 | 백엔드 상태 반전 버그로 `isActive: true` 유지 및 `Active` 배지 유지 |
| `C-03-2088` | Action Confirm Without Feedback | [Reset Link] 버튼 클릭 | `POST 200 OK` 응답에도 화면에 토스트, 로딩, 텍스트 변화가 일절 없음 |

상세 사양은 [`BUGS.md`](./BUGS.md) 및 [`bug_catalog.json`](./bug_catalog.json)을 참조하세요.
