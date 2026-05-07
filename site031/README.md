# Personal Expense Analytics - Recovery & Queue Simulation (Site031)

이 사이트는 개인 가계부 지출 통계 대시보드로 위장한 **시스템 복구 및 메시지 큐 장애 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 장애 발생 후 복구 로직의 오류, 외부 서비스 상태 불일치, 그리고 데이터 유실 문제를 찾아내야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9140

## 🚀 실행 방법
```bash
cd site031
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/expenses`: 지출 목록 조회
- `POST /api/expenses`: 지출 등록 (메시지 큐 시뮬레이션)
- `GET /api/stats/category`: 카테고리별 통계
- `POST /api/system/recover`: 시스템 복구 실행 (Bug 01 트리거)
- `GET /api/external/status`: 외부 서비스 상태 감사 (Bug 02 트리거)
- `POST /api/messages/retry`: 실패 메시지 재처리 (Bug 03 트리거)
- `GET /api/messages`: 메시지 정합성 확인 (Bug 04 트리거)

## ❗ 의도된 백엔드 오류

### 1. [site031-bug01] recovery-order-error (복구 순서 오류)
- **설명**: 시스템 복구 시 종속성 순서가 잘못되어 데이터 불일치가 발생합니다.
- **트리거**: "Recovery Lab" 탭에서 "Run Full Recovery" 클릭

### 2. [site031-bug02] external-service-recovery-failure (외부 서비스 복구 실패)
- **설명**: 외부 결제 서비스가 실제로는 DOWN 상태이나, 대시보드에는 UP으로 보고되는 상태 불일치가 발생합니다.
- **트리거**: "Recovery Lab" 탭에서 "Perform Audit" 클릭

### 3. [site031-bug03] message-reprocessing-failure (메시지 재처리 실패)
- **설명**: 실패한 메시지에 대한 재처리(Retry) 요청이 정상적으로 수행되지 않습니다.
- **트리거**: "Message Queue" 탭에서 "Retry Failed Messages" 클릭

### 4. [site031-bug04] message-loss-after-recovery (복구 후 메시지 손실)
- **설명**: 복구 프로세스 완료 후 기대되는 메시지 수보다 실제 저장된 메시지 수가 적은 유실 현상이 발생합니다.
- **트리거**: "Message Queue" 탭에서 "Run Integrity Check" 클릭

## 🤖 PPO 학습 목표
- 복구 시퀀스의 논리적 오류 탐지
- 보고된 상태와 실제 상태 간의 괴리 분석
- 메시지 큐의 재처리 메커니즘 실패 식별
- 데이터 무결성 검사를 통한 유실 탐지
