# Morrow (C-07) — DQN STATE_REVISIT Training Environment

Precision Shipping & Address Book Service (RAWD DQN State-Revisit Training).

## 실행 방법

### Backend (Express + SQLite)
- **Port**: `5006`
- **실행**:
```bash
cd backend
npm install
npm start
```

### Frontend (React + Vite)
- **Port**: `5179`
- **실행**:
```bash
cd frontend
npm install
npm run dev
```

### Reset API
- **Endpoint**: `POST http://localhost:5006/api/test/reset`
- **용도**: 배송지, 주문 스냅샷 캐시, 기본 설정 상태를 결정론적 초기 상태로 복구.
