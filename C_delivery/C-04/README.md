# SupportHub (C-04) — DQN ACTION_REPLAY Training Environment

Intelligent Customer Ticket Desk 환경 (RAWD DQN Action-Replay Training).

## 실행 방법

### Backend (Express + SQLite)
- **Port**: `5003`
- **실행**:
```bash
cd backend
npm install
npm start
```

### Frontend (React + Vite)
- **Port**: `5176`
- **실행**:
```bash
cd frontend
npm install
npm run dev
```

### Reset API
- **Endpoint**: `POST http://localhost:5003/api/test/reset`
- **용도**: 6개의 초기 티켓 및 템플릿, 답변, 임시저장 데이터를 결정론적 초기 상태로 복구.
