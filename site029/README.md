# NEON Music - 실시간 음악 차트 서비스 (Site029)

NEON Music은 실시간 글로벌 음악 Top 100 차트를 제공하는 프리미엄 음악 스트리밍 플랫폼 모의 서비스입니다. 
본 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 백엔드 로직의 정밀한 오류를 탐지하고 학습할 수 있도록 설계된 테스트 환경입니다.

## 🛠 기술 스택
- **Frontend**: React + Vite + Lucide React + Framer Motion
- **Backend**: Express (Node.js)
- **Styling**: Vanilla CSS (Custom Design System)
- **Port**: 9138

## 🚀 실행 방법
```bash
cd site029
npm install
npm start
```
서버 실행 후 브라우저에서 `http://localhost:9138`로 접속하십시오.

## 📡 API 엔드포인트
- `GET /api/health`: 시스템 상태 확인
- `GET /api/charts`: 실시간 Top 100 차트 조회 (쿼리 파라미터: genre, minPlays, search)
- `GET /api/charts/popular`: 인기 차트 조회 (10곡)
- `GET /api/charts/:id`: 곡 상세 정보 조회
- `GET /api/search`: 곡 검색 (자동완성용)
- `GET /api/dashboard/summary`: 서비스 통계 요약

## ❗ 의도된 백엔드 오류 (PPO 탐지 목표)

### 1. [site029-bug01] 엣지 케이스 부족 (Edge Case Missing)
- **트리거**: 사이드바의 '엣지 케이스 테스트' 클릭 또는 `GET /api/charts?genre=unknown` 호출
- **현상**: 빈 배열이나 404 에러 대신 `data: null`을 반환하여 프론트엔드에서 데이터 구조 불일치 발생
- **탐지 목표**: 비정상적인 데이터 구조(`null`) 수신 시 이를 시스템 오류로 분류

### 2. [site029-bug02] 산술 연산자 오류 (Arithmetic Operator Error)
- **트리거**: 메인 차트 목록 조회 시 자동 발생
- **현상**: 순위 변동(`rankChange`) 계산 시 상승(+) 값을 하락(-) 값으로 잘못 계산함. (이전 순위 - 현재 순위가 아닌 현재 순위 - 이전 순위로 계산)
- **탐지 목표**: 실제 랭킹 수치와 `rankChange` 값 사이의 논리적 모순 탐지

### 3. [site029-bug03] 논리 연산자 오류 (Logical Operator Error)
- **트리거**: 헤더의 '복합 필터 (BUG 03)' 버튼 클릭
- **현상**: 장르와 최소 재생 수 조건을 모두 만족(AND)해야 하지만, 하나만 만족해도 결과에 포함(OR)됨
- **탐지 목표**: 필터링 결과 집합이 예상보다 크거나 조건에 부합하지 않는 데이터가 포함됨을 탐지

### 4. [site029-bug04] 정렬 로직 오류 (Sorting Logic Error)
- **트리거**: 사이드바의 '명예의 전당 (Popular)' 클릭
- **현상**: 재생 수가 높은 순서(내림차순)가 아닌 낮은 순서(오름차순)로 정렬되어 상위 10곡이 반환됨
- **탐지 목표**: 응답 내 `sorted` 필드와 실제 데이터의 정렬 순서가 일치하지 않음을 탐지

## 📂 관련 문서
- [BUGS.md](./BUGS.md): 오류 상세 명세 및 PPO 기대 행동
- [TODO.md](./TODO.md): 프로젝트 개발 및 검증 체크리스트
