# 식단 칼로리 기록 일기 - 네트워크/재시도 취약점 탐지 환경 (Site038)

이 사이트는 건강한 식습관을 기록하는 헬스케어 서비스로 위장한 **네트워크 처리 및 재시도 로직 결함 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 불완전한 헤더 전송, 타임아웃 계산 오류, 백오프 없는 과도한 재시도, 그리고 요청 기아(Starvation) 현상을 식별해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9147

## 🚀 실행 방법
```bash
cd site038
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/meals`: 식단 목록 조회 (Bug 01, 02 트리거)
- `POST /api/meals`: 식단 기록 추가 (Bug 03 트리거)
- `GET /api/meals/retry-test`: 재시도 기아 테스트 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 요약 정보 조회
- `DELETE /api/meals/:id`: 식단 삭제

## ❗ 의도된 백엔드 오류 (Network & Retry Logic)

### 1. [site038-bug01] partial-header-send (헤더 부분 전송)
- **설명**: 응답 헤더가 완전히 구성되기 전에 일부가 전송되거나 필수 헤더가 누락되어 클라이언트 측 파싱 문제를 유발합니다.
- **트리거**: "Network Test" 탭에서 Header Anomaly 버튼 클릭

### 2. [site038-bug02] timeout-calculation-error (타임아웃 계산 오류)
- **설명**: 타임아웃 임계값이 비정상적으로 계산되어, 실제 처리 시간보다 너무 빠르게 타임아웃 에러를 반환하거나 응답이 무한히 지연됩니다.
- **트리거**: "Network Test" 탭에서 Timeout Logic 버튼 클릭

### 3. [site038-bug03] retry-without-backoff (백오프 미적용 재시도)
- **설명**: 요청 실패 시 지수 백오프(Exponential Backoff) 없이 즉시 재시도를 반복하여 서버 부하를 가중시키고 네트워크 혼잡을 유발합니다.
- **트리거**: "Network Test" 탭에서 Retry Backoff 버튼 클릭 (또는 피자/햄버거 등 고칼로리 음식 추가)

### 4. [site038-bug04] retry-starvation (재시도 기아)
- **설명**: 특정 요청들이 재시도 큐에 쌓여있지만, 우선순위나 스케줄링 오류로 인해 영원히 처리되지 않고 누락되는 현상입니다.
- **트리거**: "Network Test" 탭에서 Retry Starvation 버튼 클릭

## 🤖 PPO 학습 목표
- 비정상적인 HTTP 응답 헤더 패턴 식별
- 서비스 지연과 타임아웃 설정 사이의 불일치 탐지
- 네트워크 실패 시의 비효율적인 재시도 전략(Immediate Retry) 포착
- 요청 처리 누락 및 큐잉 지연(Starvation) 문제 분석
