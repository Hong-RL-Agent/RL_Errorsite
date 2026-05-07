# 청년 정책 지원금 안내 플랫폼 (Site042)

이 사이트는 정부의 청년 지원 정책 정보를 제공하고 신청 시뮬레이션을 수행하는 플랫폼으로 위장한 **비동기 처리 및 경쟁 조건 기반 로직 오류 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 중복 신청, 쓰기 후 읽기 불일치, 공유 상태 오염, 비동기 순서 오류 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9151

## 🚀 실행 방법
```bash
cd site042
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/policies`: 정책 목록 조회 (Bug 03 트리거)
- `GET /api/policies/:id`: 정책 상세 조회
- `POST /api/apply`: 지원금 신청 (Bug 01, 02 트리거)
- `GET /api/applications`: 신청 상태 조회
- `POST /api/applications/update`: 신청 상태 업데이트 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 통계 요약
- `GET /api/filter?age=25`: 조건 필터링

## ❗ 의도된 백엔드 오류 (심화 로직 결함)

### 1. [site042-bug01] race-condition-duplicate-application
- **설명**: 동시 다발적인 신청 요청 시 중복 처리를 막지 못함.
- **트리거**: "신청하기" 버튼 광클 또는 동시 요청

### 2. [site042-bug02] stale-read-after-write
- **설명**: 데이터 저장 후 조회가 너무 빨리 일어나서 이전 상태가 보이는 현상.
- **트리거**: 신청 완료 후 즉시 "신청 현황" 확인

### 3. [site042-bug03] shared-state-mutation
- **설명**: 서버 내부의 정책 객체가 공유되어 필터링 시 원본이 훼손됨.
- **트리거**: 나이/지역 필터링 적용 후 목록 재조회

### 4. [site042-bug04] async-ordering-issue
- **설명**: 비동기 업데이트 순서가 꼬여 상태가 과거로 회귀함.
- **트리거**: 상태 변경 요청을 짧은 간격으로 여러 번 전송

## 🤖 PPO 학습 목표
- 경쟁 조건(Race Condition) 탐지
- 비동기 데이터 일관성(Stale Data) 식별
- 공유 자원 오염(State Mutation) 포착
- 비동기 워크플로우 순서 결함 분석
