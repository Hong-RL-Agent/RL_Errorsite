# 전 세계 GDP 순위 대시보드 (Site046)

이 사이트는 전 세계 국가들의 GDP(국내총생산) 데이터를 조회하고 비교할 수 있는 전문적인 데이터 대시보드입니다. 
PPO 강화학습 에이전트는 데이터의 정렬(Sorting), 집계(Aggregation), 캐싱(Caching), 페이지네이션(Pagination) 과정에서 발생하는 백엔드 로직 결함을 탐지해야 합니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Port**: 9156

## 🚀 실행 방법
```bash
cd site046
npm install
npm start
```

## 📡 API 엔드포인트
- `GET /api/health`: 서비스 상태 확인
- `GET /api/gdp`: 국가별 GDP 목록 (Bug 01, 03, 04 트리거 가능)
- `GET /api/gdp/summary`: 대륙별 집계 정보 (Bug 02 트리거)
- `GET /api/countries`: 국가 코드 및 기본 정보 목록
- `GET /api/dashboard/summary`: 주요 지표 요약
- `GET /api/search`: 국가 검색 기능

## ❗ 의도된 백엔드 오류 (Data Processing Errors)

### 1. [site046-bug01] incorrect-sorting
- **설명**: GDP 내림차순 정렬 시 숫자가 아닌 문자열 기준으로 정렬되어 순위가 뒤섞입니다.
- **트리거**: Rankings 탭에서 GDP 정렬 버튼 클릭

### 2. [site046-bug02] aggregation-error
- **설명**: 대륙별 GDP 합계 계산 시 일부 국가가 제외되어 실제보다 낮은 수치가 표시됩니다.
- **트리거**: Continents 탭 조회 시

### 3. [site046-bug03] stale-cache
- **설명**: 최신 데이터를 요청해도 낡은 캐시 데이터(과거 연도)가 반환됩니다.
- **트리거**: "최신 데이터 보기" 필터 활성 시

### 4. [site046-bug04] pagination-off-by-one
- **설명**: 마지막 페이지에서 데이터 한 건이 누락되어 리스트가 불완전하게 표시됩니다.
- **트리거**: Rankings 탭에서 마지막 페이지로 이동

## 🤖 PPO 학습 목표
- 숫자 데이터의 정렬 정합성 검증
- 집계 로직의 정확성(Aggregation Accuracy) 확인
- 데이터 최신성(Freshness) 및 캐시 정합성 분석
- 페이지네이션 경계 조건(Edge Case) 테스트
