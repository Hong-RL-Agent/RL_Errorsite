# FitnessTrack | 스마트 활동 기록 서비스 (site056)

## 개요
- **사이트 ID**: site056
- **포트 번호**: 9165
- **기술 스택**: Node.js, Express, React
- **주제**: 개인별 운동 활동 기록 및 건강 지표 대시보드

## 실행 방법
```bash
cd site056
npm install
npm start
```
브라우저에서 `http://localhost:9165`으로 접속 가능합니다.

## API 엔드포인트 목록
- `GET /api/health`: 서버 상태 확인
- `GET /api/fitness/summary`: 운동 요약 정보 및 총 칼로리 조회
- `GET /api/fitness/report`: 주간/월간 활동 리포트 조회
- `GET /api/fitness/goals/:userId`: 사용자별 목표 설정 정보 조회

## 정상 작동 기능
- 실시간 운동 활동 리스트 렌더링
- 주간 리포트 조회 기능
- 기존 사용자(active_user)의 목표 정보 로드
- 운동별 상세 수치(시간, 칼로리) 표시

## 의도된 백엔드 오류 (3개)

### 1. 칼로리 합계 연산 오류 (site056-bug01)
- **bugId**: `site056-bug01`
- **유형**: `incorrect-aggregation`
- **트리거**: 메인 대시보드 "Total Burned" 카드 확인
- **data-bug-id**: `[data-bug-id="site056-bug01"]`
- **PPO 탐지 기대**: 개별 칼로리 값들의 산술적 합계가 아닌, 문자열로 결합된 잘못된 수치(예: 350420280) 탐지

### 2. 월간 리포트 조회 지연 (site056-bug02)
- **bugId**: `site056-bug02`
- **유형**: `api-timeout`
- **트리거**: 우측 상단 "MONTHLY REPORT" 버튼 클릭
- **data-bug-id**: `[data-bug-id="site056-bug02"]`
- **PPO 탐지 기대**: 특정 요청 조건에서 발생하는 6초 이상의 비정상적 응답 지연 및 408 에러 탐지

### 3. 신규 사용자 목표 조회 오류 (site056-bug03)
- **bugId**: `site056-bug03`
- **유형**: `null-reference`
- **트리거**: 우측 상단 "SET GOALS" 버튼 클릭 (신규 유저 시뮬레이션)
- **data-bug-id**: `[data-bug-id="site056-bug03"]`
- **PPO 탐지 기대**: 목표 정보가 없는 유저의 속성에 접근할 때 발생하는 서버 내부 에러(500) 식별

## 참고 문서
- 상세 오류 정의: [BUGS.md](BUGS.md)
- 작업 진행 상황: [TODO.md](TODO.md)
