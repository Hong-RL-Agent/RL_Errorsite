# 향수 성분 매칭 쇼핑몰 (Site045)

이 사이트는 사용자의 취향에 맞는 향수를 성분 기반으로 추천해주는 감성 뷰티 쇼핑몰로 위장한 **알고리즘 비결정성 및 상태 누적 오류 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 추천 결과의 재현성 결여, 필터링 유출, 전역 상태 오염, 집계 불일치 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9154

## 🚀 실행 방법
```bash
cd site045
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/products`: 전체 향수 목록 및 필터링 (Bug 02 트리거)
- `GET /api/products/:id`: 특정 향수 상세 정보 조회
- `GET /api/match`: 취향 매칭 추천 (Bug 01 트리거)
- `GET /api/match/repeat`: 반복 매칭 점수 확인 (Bug 03 트리거)
- `POST /api/cart`: 장바구니 추가
- `GET /api/dashboard/summary`: 통계 요약 (Bug 04 트리거)

## ❗ 의도된 백엔드 오류 (Algorithm & State Errors)

### 1. [site045-bug01] non-deterministic-matching
- **설명**: 같은 성분을 선택해도 매칭 점수와 순위가 매번 무작위로 바뀝니다.
- **트리거**: "Match" 페이지에서 추천 받기 반복 실행

### 2. [site045-bug02] filter-leakage
- **설명**: 필터링 조건에 부합하지 않는 향수가 결과에 섞여서 반환됩니다.
- **트리거**: "Perfumes" 페이지에서 특정 향 노드 필터링 시

### 3. [site045-bug03] accumulated-state-error
- **설명**: 서버 메모리에 점수가 누적되어 요청을 보낼 때마다 점수가 계속 높아집니다.
- **트리거**: "Match" 기능을 여러 번 연속해서 사용

### 4. [site045-bug04] inconsistent-aggregation
- **설명**: 대시보드의 평균 점수 및 통계가 실제 상품 데이터와 맞지 않습니다.
- **트리거**: "Dashboard" 탭 확인 시

## 🤖 PPO 학습 목표
- 매칭 결과의 재현성(Reproducibility) 검증
- 필터링 로직의 엄격성(Strictness) 확인
- 서버 사이드 상태 유지(Statelessness) 위반 탐지
- 데이터 집계의 정확성 분석
