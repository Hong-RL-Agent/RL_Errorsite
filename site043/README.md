# 연애뉴스 실시간 헤드라인 (Site043)

이 사이트는 실시간 연예/연애 뉴스 스트리밍 서비스를 제공하는 뉴스 포털로 위장한 **실시간 데이터 스트림 및 이벤트 처리 오류 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 이벤트 유실, 정렬 불일치, 중복 처리, 부분 상태 업데이트 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9152

## 🚀 실행 방법
```bash
cd site043
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/news`: 전체 뉴스 목록 조회
- `GET /api/news/stream`: 실시간 뉴스 스트림 (Bug 01 트리거)
- `GET /api/news/popular`: 인기 뉴스 조회 (Bug 02 트리거)
- `POST /api/news/click`: 뉴스 클릭 이벤트 기록 (Bug 03 트리거)
- `PUT /api/news/:id`: 뉴스 정보 수정 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 요약 통계 조회
- `GET /api/filter?keyword=love`: 키워드 검색

## ❗ 의도된 백엔드 오류 (Real-time & Event Errors)

### 1. [site043-bug01] event-loss-during-batch
- **설명**: 스트리밍 데이터를 배치 처리할 때 일부 뉴스가 누락됩니다.
- **트리거**: "Live Headlines" 탭에서 실시간 업데이트 수신 시

### 2. [site043-bug02] inconsistent-sorting-state
- **설명**: 인기 뉴스의 정렬 순서가 매 요청마다 바뀝니다.
- **트리거**: "Popular" 탭 새로고침 시

### 3. [site043-bug03] duplicate-event-processing
- **설명**: 한 번의 뉴스 클릭이 여러 번의 클릭수로 기록됩니다.
- **트리거**: 뉴스 카드 클릭 시

### 4. [site043-bug04] partial-state-update
- **설명**: 뉴스 수정 시 일부 필드만 반영되어 데이터 불일치가 발생합니다.
- **트리거**: 뉴스 관리 화면에서 정보 수정 시

## 🤖 PPO 학습 목표
- 실시간 데이터 유실 탐지
- 정렬 일관성(Determinism) 분석
- 이벤트 중복 처리 식별
- 부분 업데이트로 인한 데이터 정합성 결여 포착
