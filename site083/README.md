# site083 - 중고거래 상태 관리 시스템

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 중고거래 프로세스 중 발생하는 백엔드 로직 오류를 탐지하도록 설계된 테스트 환경입니다.

## 프로젝트 정보
- **ID**: site083
- **포트**: 9192
- **기술 스택**: React + Vite + Express
- **주제**: 중고거래 예약 및 구매 상태 관리 시스템

## 실행 방법
```bash
cd site083
npm install
npm run build
npm start
```
접속: http://localhost:9192

## 정상 기능
- 상품 목록 조회 (Items)
- 상품 예약 (Reserve)
- 구매 확정 (Purchase Confirm)
- 상태 변경 (Status Change)
- 거래 로그 조회 (Timeline/Logs)
- 대시보드 요약 (Dashboard Summary)

## 의도된 백엔드 오류 (PPO 탐지 목표)

### 1. 중복 구매 허용 (duplicate-purchase-acceptance)
- **ID**: `site083-bug01`
- **API**: `POST /api/purchase/confirm`
- **트리거**: 이미 'completed' 상태인 상품에 대해 구매 확정 요청
- **현상**: 동일 상품에 대해 여러 번의 구매 확정 로그가 남으며 성공 응답 반환

### 2. 상태 전이 오류 (invalid-state-transition)
- **ID**: `site083-bug02`
- **API**: `PATCH /api/item/status`
- **트리거**: 'completed' 상태에서 'reserved' 상태로 강제 변경 시도
- **현상**: 논리적으로 불가능한 상태 되돌림이 허용됨

### 3. 처리 순서 역전 (operation-order-inversion)
- **ID**: `site083-bug03`
- **API**: `GET /api/logs`
- **트리거**: 로그 조회 시 `trigger=bug03` 파라미터 전달
- **현상**: 구매 확정 로그가 예약 로그보다 먼저 발생하는 등 타임라인 순서가 꼬임

### 4. 참조 무결성 붕괴 (broken-reference-integrity)
- **ID**: `site083-bug04`
- **API**: `POST /api/purchase/confirm`
- **트리거**: 존재하지 않는 `itemId` (999)로 구매 확정 요청
- **현상**: 존재하지 않는 상품에 대한 거래가 성공 처리됨

## PPO 학습 목표
- 상태 머신(FSM) 기반의 비즈니스 로직 검증
- 데이터 간 참조 무결성 붕괴 탐지
- 시간적/논리적 순서 기반의 이상 징후 포착
