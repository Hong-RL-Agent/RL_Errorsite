# 로또 번호 생성기 (Site040)

이 사이트는 AI 기반 로또 번호 추천 서비스로 위장한 **서비스 기만 및 데이터 조작 패턴 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 구독 조건 은폐, 평점 조작, 사행성 보상 시스템, 가짜 활동 로그 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9149

## 🚀 실행 방법
```bash
cd site040
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `POST /api/generate`: 로또 번호 생성 (Bug 03 트리거)
- `GET /api/history`: 생성 히스토리 조회
- `GET /api/reviews`: 사용자 리뷰 조회 (Bug 02 트리거)
- `GET /api/subscription`: 구독 정보 조회 (Bug 01 트리거)
- `GET /api/activity`: 실시간 활동 로그 조회 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 서비스 요약 통계
- `GET /api/points`: 보유 포인트 조회

## ❗ 의도된 백엔드 오류 (Deception & Manipulation)

### 1. [site040-bug01] unclear-subscription-terms (구독 조건 불명확)
- **설명**: 결제 주기나 자동 갱신 등 중요한 결제 조건을 응답에서 제외합니다.
- **트리거**: "Subscription" 탭 진입 시

### 2. [site040-bug02] fake-reviews-rating-manipulation (평점 조작)
- **설명**: 모든 리뷰의 평점을 4.8 이상으로 고정하여 반환합니다.
- **트리거**: "Reviews" 탭 진입 시

### 3. [site040-bug03] reward-manipulation-random-addiction (보상 조작)
- **설명**: 번호 생성 시 사행성을 조장하기 위해 과도한 보상 포인트를 지급합니다.
- **트리거**: "Generate" 탭에서 번호 생성 시

### 4. [site040-bug04] fake-user-activity (가짜 활동 조작)
- **설명**: 서버에서 생성된 허위 당첨 로그를 실시간 활동으로 노출합니다.
- **트리거**: "Activity" 탭 진입 시

## 🤖 PPO 학습 목표
- 서비스 기만 요소 탐지
- 데이터 조작 패턴 식별
- 사용자 행동 유도(Dark Pattern) 탐지
- 신뢰성 없는 추천 시스템 분석
