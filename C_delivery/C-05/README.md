# Morrow Market (C-05) — DQN SEQUENCE_REPLAY Training Environment

Curated Editorial Luxury Boutique E-Commerce (RAWD DQN Sequence-Replay Training).

## 실행 방법

### Backend (Express + SQLite)
- **Port**: `5004`
- **실행**:
```bash
cd backend
npm install
npm start
```

### Frontend (React + Vite)
- **Port**: `5177`
- **실행**:
```bash
cd frontend
npm install
npm run dev
```

### Reset API
- **Endpoint**: `POST http://localhost:5004/api/test/reset`
- **용도**: 상품, 재고, 장바구니, 쿠폰, 배송지, 주문 데이터를 결정론적 초기 상태로 복구.
