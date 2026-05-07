# LedgerFlow Admin - site018

SaaS 구독 서비스의 관리자용 결제 및 웹훅 모니터링 대시보드입니다. 이 사이트는 PPO 강화학습 모델이 백엔드의 비동기 처리, 다형성 데이터 핸들링, 정렬 로직, 트랜잭션 복구 관련 오류를 탐지하도록 설계되었습니다.

## 프로젝트 정보
- **사이트 ID**: site018
- **포트 번호**: 9127
- **기술 스택**: React + Vite + Express

## 실행 방법
```bash
cd site018
npm install
npm start
```
브라우저에서 `http://localhost:9127`으로 접속하십시오.

## API 엔드포인트 목록
- `GET /api/health`: 시스템 상태 확인
- `GET /api/events`: 결제 이벤트 목록 조회 (Bug 03 발생 가능)
- `GET /api/subscriptions`: 구독 고객 목록 조회
- `GET /api/invoices`: 청구서 목록 조회
- `GET /api/events/:eventId`: 이벤트 상세 정보 조회
- `POST /api/webhooks/simulate`: 웹훅 시뮬레이션 실행 (Bug 01 발생 가능)
- `GET /api/events/polymorphic/missing-type`: 타입 식별자 누락 이벤트 조회 (Bug 02 발생 가능)
- `POST /api/recovery/simulate-crash`: 시스템 복구 시뮬레이션 (Bug 04 발생 가능)

## 정상 작동 기능
- 실시간 결제 이벤트 대시보드 요약
- 이벤트 상태별 필터링 및 상세 모달 조회
- 구독 및 청구서 데이터 연동 확인
- 정상적인 웹훅 시뮬레이션 및 데이터 정렬
- API 로딩 및 에러 처리 UI

## 의도된 백엔드 오류 (4개)

### 1. site018-bug01
- **유형**: async-webhook-causality-inversion (비동기 웹훅의 인과 관계 역전)
- **트리거**: "Webhook Lab" 메뉴에서 "Run Causality Inversion Test" 버튼 클릭.
- **증상**: 이벤트 타임라인에서 `subscription.activated`가 `payment.created`보다 먼저 발생한 것으로 표시됨.
- **data-bug-id**: `site018-bug01`

### 2. site018-bug02
- **유형**: missing-polymorphic-json-discriminator (다형성 JSON 타입 식별자 누락)
- **트리거**: "Webhook Lab" 메뉴에서 "Fetch Missing Type Discriminator" 버튼 클릭.
- **증상**: 은행 이체(`bank_transfer`) 데이터임에도 `type` 필드가 누락되어 서버가 `card_payment`로 오판하고 카드 수수료 등을 잘못 계산함.
- **data-bug-id**: `site018-bug02`

### 3. site018-bug03
- **유형**: opaque-sort-logic (정렬 로직의 불투명성)
- **트리거**: "Events" 또는 "Overview" 테이블 상단에서 "Sort by Risk" 버튼 클릭.
- **증상**: 위험도 점수가 낮은 이벤트가 높은 이벤트보다 상단에 위치하는 등 일관성 없는 정렬 결과가 반환됨.
- **data-bug-id**: `site018-bug03`

### 4. site018-bug04
- **유형**: transaction-recovery-failure-after-crash (비정상 종료 후 트랜잭션 복구 실패)
- **트리거**: "Recovery Test" 메뉴에서 "Simulate Crash & Recovery" 버튼 클릭.
- **증상**: 복구 후 결제 상태는 `paid`지만 청구서는 `pending`, 구독은 `suspended`로 남아 데이터 불일치가 발생함.
- **data-bug-id**: `site018-bug04`

## PPO 에이전트 탐지 가이드
- **비즈니스 로직 인과성**: 결제 완료 전 구독 활성화라는 비즈니스 규칙 위반 탐지 (Bug 01).
- **데이터 스키마 무결성**: 타입 식별자 누락에 따른 잘못된 데이터 해석 식별 (Bug 02).
- **정렬 알고리즘 검증**: 사용자 요청 기준(Risk)과 실제 반환 순서의 불일치 탐지 (Bug 03).
- **분산 상태 일관성**: 여러 리소스(Payment, Invoice, Subscription) 간의 상태 불일치 탐지 (Bug 04).

## 기타
- `BUGS.md`: 상세한 버그 기술서
- `TODO.md`: 개발 및 검증 체크리스트
