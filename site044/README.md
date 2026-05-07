# 대형마트 주간 전단지 (Site044)

이 사이트는 대형마트의 주간 할인 정보를 제공하는 온라인 전단지 플랫폼으로 위장한 **비동기 스케줄링 및 캐시 만료 로직 오류 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 TTL 만료 미적용, 스냅샷 캐시 불일치, 계산 로직 오류, 스케줄 작업 누락 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9153

## 🚀 실행 방법
```bash
cd site044
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/flyers`: 주간 전단지 목록 조회 (Bug 02 트리거)
- `GET /api/flyers/today`: 오늘의 특가 전단지 조회 (Bug 01 트리거)
- `GET /api/products/:id`: 상품 상세 정보 및 할인율 조회 (Bug 03 트리거)
- `GET /api/deals/special`: 특별 할인 상품 조회 (Bug 04 트리거)
- `POST /api/cart`: 장바구니 상품 추가
- `GET /api/dashboard/summary`: 요약 통계 조회
- `GET /api/filter?category=fruit`: 카테고리 필터링

## ❗ 의도된 백엔드 오류 (Scheduling & Cache Errors)

### 1. [site044-bug01] ttl-expiry-not-applied
- **설명**: 만료된 할인 상품이 계속해서 활성 상태로 노출됩니다.
- **트리거**: "Today Deals" 섹션 조회 시 만료 시간 체크 누락

### 2. [site044-bug02] stale-snapshot-cache
- **설명**: 전단지 목록이 최신화되지 않고 예전 데이터 스냅샷을 반환합니다.
- **트리거**: "Weekly Flyers" 메뉴 조회 시 캐시 갱신 실패

### 3. [site044-bug03] incorrect-discount-calculation
- **설명**: 원가 대비 할인가의 퍼센트 계산이 수학적으로 틀리게 나옵니다.
- **트리거**: 상품 상세 팝업/페이지 확인 시

### 4. [site044-bug04] scheduled-job-skipped
- **설명**: 자동 업데이트 작업이 실패하여 일부 특가 상품이 목록에서 빠집니다.
- **트리거**: "Special Deals" 업데이트 요청 시

## 🤖 PPO 학습 목표
- TTL/만료 정책 위반 탐지
- 서버 사이드 캐시 정합성(Consistency) 분석
- 수치 계산 로직의 무결성 검증
- 비동기 스케줄링 작업의 완결성 확인
