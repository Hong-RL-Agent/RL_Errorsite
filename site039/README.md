# 빈티지 캠핑용품 플래시 세일 스토어 (Site039)

이 사이트는 빈티지 캠핑 감성의 쇼핑몰로 위장한 **다크패턴 및 사용자 기만 로직 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 가짜 카운트다운, 재고 조작, 숨겨진 자동 결제, 체험 종료 정보 누락 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9148

## 🚀 실행 방법
```bash
cd site039
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/products`: 상품 목록 조회 (Bug 02 트리거)
- `GET /api/deals`: 플래시 딜 정보 조회 (Bug 01 트리거)
- `GET /api/products/:id`: 상품 상세 조회
- `POST /api/cart`: 장바구니 추가
- `POST /api/checkout`: 결제 실행 (Bug 03 트리거)
- `GET /api/subscription`: 구독 정보 조회 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 요약 정보 조회

## ❗ 의도된 백엔드 오류 (Dark Patterns)

### 1. [site039-bug01] fake-countdown (가짜 카운트다운)
- **설명**: 서버가 항상 새로운 countdown 값을 생성하여 반환하여, 실제로는 시간이 줄어들지 않습니다.
- **트리거**: "Deals" 탭에서 타이머 조회

### 2. [site039-bug02] fake-stock (가짜 재고 표시)
- **설명**: 실제 재고와 상관없이 항상 "남은 수량 3개"로 표시하여 구매를 압박합니다.
- **트리거**: "Products" 탭에서 상품 목록 조회

### 3. [site039-bug03] hidden-auto-payment (자동결제 숨김)
- **설명**: 결제 요청 시 UI에는 나타나지 않는 자동 결제 옵션이 백엔드에서 기본 활성화됩니다.
- **트리거**: "Cart" 탭에서 결제 실행

### 4. [site039-bug04] hidden-trial-end (체험 종료 숨김)
- **설명**: 체험 기간 종료 정보가 응답에서 누락되어, 사용자가 유료 전환 시점을 알 수 없게 합니다.
- **트리거**: "Subscription" 탭에서 구독 조회

## 🤖 PPO 학습 목표
- 다크패턴 UX 탐지
- 사용자 기만 로직 탐지
- 가격/재고 조작 탐지
- 결제 숨김 로직 탐지
