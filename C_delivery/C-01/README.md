# CloudFiles (C-01) — ACTION_REPLAY Training Environment

Modern cloud file management service built as a training environment for Deep Q-Network (DQN) reinforcement learning with **ACTION_REPLAY** strategy.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Install root dependencies
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
- **Backend**: `npm run server` (runs Express on `http://localhost:5000`)
- **Frontend**: `npm run client` (runs Vite React on `http://localhost:5173`)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Lucide Icons, Modern CSS Design System
- **Backend**: Node.js, Express, REST API
- **State/Database**: In-memory persistent deterministic store with transactional reset
- **RL Reset Endpoint**: `POST /api/test/reset`

---

## 📁 Initial Data Hierarchy

```text
My Drive (Root)
├── Documents (id: 'folder-documents')
│   ├── A.txt (id: 'file-a-txt', 12 KB, order: 1)
│   ├── B.txt (id: 'file-b-txt', 8 KB, order: 2)
│   └── Report.pdf (id: 'file-report-pdf', 1.2 MB, order: 3)
├── Projects (id: 'folder-projects')
│   ├── Design.docx (450 KB)
│   └── Notes.txt (15 KB)
└── Archive (id: 'folder-archive')
    └── Old_Report.pdf (2.1 MB)
```

---

## 🐛 Bug Catalog Summary (5 Bugs)

| Bug ID | Name | Trigger Action | Key Evidence |
|---|---|---|---|
| `C-01-112` | 데이터 삭제 불가 (Delete Failure) | `A.txt` 삭제 클릭 → 모달 확인 | Network `DELETE 500`, UI Optimistic 삭제 후 재조회 시 재등장 |
| `C-01-885` | 멱등성 위반 (Duplicate Folder) | 새 폴더 생성 더블 클릭 / 연속 제출 | Network `POST 201` 2회 수신, DOM에 동일 이름 폴더 2개 생성 |
| `C-01-007` | 잘못된 대상 수정 (Wrong Target Mutation) | `A.txt` 이름 변경 → `A_final.txt` 저장 | `A.txt`는 불변 유지, `B.txt`가 `A_final.txt`로 변조 |
| `C-01-2002` | 파일명 데이터 잘림 (Data Truncation) | 30자 초과 파일명 입력 후 저장 | Network `200 OK`, 저장 및 DOM 표시 이름이 30자로 절삭 |
| `C-01-1800` | UI-서버 상태 불일치 (Silent Move Failure) | `A.txt`를 `Archive`로 이동 | Network `PUT 500`, UI는 이동 표시되나 서버 재조회 시 원래 폴더에 잔존 |

상세 사양은 [`BUGS.md`](./BUGS.md) 및 [`bug_catalog.json`](./bug_catalog.json)을 참조하세요.

---

## 🔄 Reset API

```http
POST /api/test/reset
```

모든 파일, 폴더, 상태를 최초의 Seed 상태로 되돌립니다.
UI 좌측 사이드바 하단의 **"Reset Environment"** 버튼으로도 즉시 초기화할 수 있습니다.
