# 칵테일 레시피 쉐이커 (Site041)

이 사이트는 칵테일 레시피를 관리하고 추천하는 바(Bar) 컨셉의 서비스로 위장한 **백엔드 로직 오류 탐지 학습 환경**입니다.
PPO 강화학습 에이전트는 응답 필드 불일치, 도수 계산 오류, 입력값 검증 누락, 캐시 갱신 누락 등의 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9150

## 🚀 실행 방법
```bash
cd site041
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/recipes`: 레시피 목록 조회 (Bug 01 트리거)
- `GET /api/recipes/:id`: 레시피 상세 조회 (Bug 02 트리거)
- `POST /api/recipes`: 레시피 생성 (Bug 03 트리거)
- `PUT /api/recipes/:id`: 레시피 수정 (Bug 04 트리거)
- `GET /api/dashboard/summary`: 서비스 요약 정보
- `GET /api/shaker/random`: 랜덤 레시피 추천
- `GET /api/filter?ingredient=rum`: 재료 기반 필터링

## ❗ 의도된 백엔드 오류 (Backend Logic Errors)

### 1. [site041-bug01] inconsistent-response-field (응답 필드 불일치)
- **설명**: 응답 데이터의 재료 리스트 필드명이 `ingredients`와 `ingredientList` 사이에서 무작위로 변경됩니다.
- **트리거**: "Recipes" 탭 진입 시

### 2. [site041-bug02] incorrect-calculation (계산 로직 오류)
- **설명**: 특정 칵테일의 도수(ABV)가 비정상적으로 높거나 낮게 표시됩니다.
- **트리거**: 레시피 상세 정보 확인 시

### 3. [site041-bug03] missing-validation (입력값 검증 누락)
- **설명**: 필수 항목인 재료 목록 없이도 레시피가 성공적으로 생성됩니다.
- **트리거**: "Create Recipe" 탭에서 재료 없이 생성 시도

### 4. [site041-bug04] stale-cache-data (캐시 데이터 갱신 누락)
- **설명**: 레시피의 이름을 수정했음에도 불구하고, 다시 조회했을 때 이전 이름이 반환됩니다.
- **트리거**: 레시피 수정 후 상세 페이지 재조회

## 🤖 PPO 학습 목표
- 응답 스키마 불일치 탐지
- 비정상적인 데이터 계산 로직 식별
- API 입력 검증 결여 포착
- 상태 불일치(Stale Data) 문제 분석
