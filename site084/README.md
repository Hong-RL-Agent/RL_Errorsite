# site084 - 운동 통계 분석 대시보드

이 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 데이터 집계, 통계 연산 및 필터링 로직에서 발생하는 백엔드 오류를 탐지하도록 설계된 테스트 환경입니다.

## 프로젝트 정보
- **ID**: site084
- **포트**: 9193
- **기술 스택**: React + Vite + Express + Recharts
- **주제**: 개인 운동 기록 및 통계 분석 대시보드

## 실행 방법
```bash
cd site084
npm install
npm run build
npm start
```
접속: http://localhost:9193

## 정상 기능
- 운동 기록 등록 및 목록 조회 (Workouts)
- 실시간 통계 차트 및 트렌드 분석 (Statistics)
- 종목별 점유율 및 건강 효율성 리포트 (Analytics)
- 대시보드 요약 (Dashboard Summary)
- 시스템 로그 모니터링 (Logs)

## 의도된 백엔드 오류 (PPO 탐지 목표)

### 1. 평균 계산 오류 (average-calculation-error)
- **ID**: `site084-bug01`
- **API**: `GET /api/stats/average`
- **트리거**: **Statistics** 탭에서 **'운동 기록 평균 분석'** 버튼 클릭
- **현상**: 전체 합계를 데이터 개수가 아닌 고정된 상수(10)로 나누어 잘못된 평균값이 산출됨

### 2. 누적 합계 불일치 (cumulative-sum-inconsistency)
- **ID**: `site084-bug02`
- **API**: `GET /api/stats/total`
- **트리거**: **Statistics** 탭에서 **'활동량 누적 집계'** 버튼 클릭
- **현상**: 전체 합계 계산 시 마지막 기록 데이터를 제외하고 합산하여 정합성 불일치 발생

### 3. 필터링 누락 (filter-omission-error)
- **ID**: `site084-bug03`
- **API**: `GET /api/stats`
- **트리거**: **Statistics** 탭에서 **'맞춤 기간 필터링'** 버튼 클릭
- **현상**: 기간 필터 조건이 무시되고 전체 데이터가 반환되어 차트에 표시됨

### 4. 그룹화 기준 오류 (grouping-key-misalignment)
- **ID**: `site084-bug04`
- **API**: `GET /api/stats/group`
- **트리거**: **Analytics** 탭에서 **'종목별 리포트 생성'** 버튼 클릭
- **현상**: 운동 종목별 그룹화가 아닌 'Other'라는 단일 키로 모든 데이터가 병합되어 표시됨

## PPO 학습 목표
- 데이터 집계(Aggregation) 정확성 검증 능력 배양
- 필터 조건 및 경계값 처리 로직 검증
- 비즈니스 그룹화(Grouping) 정합성 판단
