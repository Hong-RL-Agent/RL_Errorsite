# 유기농 야채몰 - 복구 후 장애 탐지 학습 환경 (Site032)

이 사이트는 유기농 야채 쇼핑몰로 위장한 **시스템 복구 후 발생하는 논리적 결함 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 장애 복구(Recovery) 이후 발생하는 메시지 손실, 중복 처리, 상태 미복구, 캐시 초기화 문제를 식별해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9141 (Frontend) / 9144 (Backend)

## 🚀 실행 방법
```bash
cd site032
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/products`: 상품 목록 조회 (Bug 04 트리거 가능)
- `POST /api/orders`: 주문 생성 (Bug 02 트리거 가능)
- `POST /api/system/recover`: 시스템 복구 실행 (모든 버그 활성화 지점)
- `GET /api/queue/messages`: 큐 메시지 상세 확인 (Bug 01 트리거)
- `GET /api/queue/status`: 큐 상태 확인 (Bug 03 트리거)
- `GET /api/cache/status`: 캐시 상태 확인 (Bug 04 트리거)

## ❗ 의도된 백엔드 오류

### 1. [site032-bug01] message-loss-after-recovery (복구 후 메시지 손실)
- **설명**: 복구 완료 후 큐에 적재되었어야 할 메시지 중 일부가 증발합니다.
- **트리거**: 복구 실행 후 "Queue" 탭에서 "메시지 상세 조회" 클릭

### 2. [site032-bug02] duplicate-processing-after-recovery (복구 후 중복 처리)
- **설명**: 복구 직후 발생한 주문이 큐에서 중복 처리되어 주문 목록에 동일 주문이 2번 생성됩니다.
- **트리거**: 복구 실행 후 "Products" 탭에서 상품 "구매하기" 클릭

### 3. [site032-bug03] queue-state-not-restored (큐 상태 미복구)
- **설명**: 큐에 메시지가 존재함에도 불구하고 시스템 상태 인터페이스에는 큐 크기가 0으로 표시됩니다.
- **트리거**: 복구 실행 후 "Queue" 탭에서 "큐 상태 새로고침" 클릭

### 4. [site032-bug04] cache-not-warmed (캐시 워밍업 없음)
- **설명**: 시스템 시작 또는 복구 후 캐시가 비어 있어 첫 데이터 로딩 시 지연이나 캐시 미스가 발생합니다.
- **트리거**: 시스템 시작 직후 또는 복구 후 "Products" 탭 진입 또는 "Cache" 탭에서 "캐시 정합성 체크" 클릭

## 🤖 PPO 학습 목표
- 복구 시퀀스 이후의 데이터 정합성(Expected vs Actual) 검증
- 중복 트랜잭션 발생 패턴 인식
- 추상화된 상태 레이어와 실제 데이터 레이어 간의 불일치 탐지
- 캐시 가용성 및 콜드 스타트 문제 식별
