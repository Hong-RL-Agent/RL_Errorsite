# Idol PC Gallery - Circuit Breaker Simulation (Site030)

이 사이트는 K-pop 아이돌 포토카드 갤러리 서비스로 위장한 **Circuit Breaker(서킷 브레이커) 로직 오류 탐지 학습 환경**입니다. 
PPO 강화학습 에이전트는 API 요청의 안정성을 관리하는 서킷 브레이커의 비정상적인 상태 변화와 설정 오류를 찾아내야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9139

## 🚀 실행 방법
```bash
cd site030
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/cards`: 포토카드 목록 조회 (Circuit Breaker 적용)
  - `simulateFailure=true`: 인위적 실패 유도
  - `bug=not-opening`: Bug 01 트리거
  - `bug=flapping`: Bug 03 트리거
- `GET /api/cards/:id`: 카드 상세 조회
- `POST /api/cards/:id/like`: 좋아요 증가
- `GET /api/circuit/status`: 서킷 상태 조회
  - `bug=threshold`: Bug 04 트리거
- `GET /api/dashboard/summary`: 서비스 통계 요약

## ❗ 의도된 백엔드 오류 (Circuit Breaker)

### 1. [site030-bug01] circuit-not-opening (서킷 미오픈)
- **설명**: 실패 횟수가 임계값(5회)을 초과해도 서킷 상태가 `OPEN`으로 전환되지 않고 계속 실패 요청을 수행합니다.
- **탐지 목표**: 장애 발생 시 시스템 차단(OPEN)이 작동하지 않는 안정성 결함 탐지.

### 2. [site030-bug02] circuit-not-closing (서킷 미닫힘)
- **설명**: 서킷이 `OPEN`된 후 일정 시간(10초)이 지나도 `CLOSED` 상태로 자동 복귀하지 않고 계속 차단 상태를 유지합니다.
- **탐지 목표**: 시스템 복구 프로세스의 중단 탐지.

### 3. [site030-bug03] circuit-flapping (서킷 플래핑)
- **설명**: 서킷 상태가 `OPEN`과 `CLOSED` 사이를 매우 빠르게 오가며 시스템의 진동(Vibration)을 유발합니다.
- **탐지 목표**: 불안정한 상태 전이 탐지.

### 4. [site030-bug04] threshold-misconfiguration (임계값 설정 오류)
- **설명**: 서킷 브레이커의 임계값이 0으로 설정되어 모든 실패가 즉시 시스템을 차단하거나 로직 오류를 일으킬 수 있습니다.
- **탐지 목표**: 설정값의 무결성 및 비정상 범위 탐지.

## 📁 관련 문서
- [BUGS.md](./BUGS.md): 오류 상세 명세
- [TODO.md](./TODO.md): 개발 및 검증 체크리스트
