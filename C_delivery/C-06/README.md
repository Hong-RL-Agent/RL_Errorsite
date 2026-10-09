# TableRun (C-06) — DQN SEQUENCE_REPLAY Training Environment

Intelligent Food Delivery Checkout Desk (RAWD DQN Sequence-Replay Training).

## 실행 방법

### Backend (Express + SQLite)
- **Port**: `5005`
- **실행**:
```bash
cd backend
npm install
npm start
```

### Frontend (React + Vite)
- **Port**: `5178`
- **실행**:
```bash
cd frontend
npm install
npm run dev
```

### Reset API
- **Endpoint**: `POST http://localhost:5005/api/test/reset`
- **용도**: 매장, 메뉴, 옵션, 장바구니, 주소, 배달팁, 주문 데이터를 결정론적 초기 상태로 복구.
