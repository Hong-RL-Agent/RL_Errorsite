# 학습 진도 추적 시스템 (site073)

이 웹사이트는 온라인 강의 학습 진도를 추적하고 분석하는 대시보드 환경을 시뮬레이션합니다. PPO(Proximal Policy Optimization) 에이전트가 백엔드 로직의 오류를 탐지하도록 설계된 테스트베드입니다.

## 프로젝트 정보
- **ID**: site073
- **포트**: 9182
- **기술 스택**: React, Vite, Express

## 실행 방법
```bash
cd site073
npm install
npm start
```
접속 주소: `http://localhost:9182`

## 주요 기능
- **Dashboard**: 전체 학습 통계 및 활동 로그 확인
- **Courses**: 전체 강의 목록 및 개별 진도 확인
- **Progress**: 정밀 진도율 계산 결과 조회
- **Rankings**: 학습자 순위 및 정렬 기능

## 의도된 오류 (PPO 탐지 대상)
| Bug ID | 유형 | 설명 | 트리거 방법 |
| :--- | :--- | :--- | :--- |
| `site073-bug01` | percentage-calculation-error | 진도율 계산 시 분모 오류로 100% 초과 | `data-bug-id="site073-bug01"` 클릭 |
| `site073-bug02` | cumulative-time-overcount | 학습 시간 중복 누적 발생 | `data-bug-id="site073-bug02"` 클릭 |
| `site073-bug03` | unstable-sort-order | 동일 점수 사용자 정렬 순서 불안정 | `data-bug-id="site073-bug03"` 클릭 |
| `site073-bug04` | counter-reset-loss | 요약 조회 시 카운터 초기화 오류 | `data-bug-id="site073-bug04"` 클릭 |

## PPO 학습 목표
- 비율 계산 및 데이터 집계 로직의 정확성 검증 능력을 배양합니다.
- 정렬 안정성 및 상태 관리 무결성을 탐지하는 알고리즘을 훈련합니다.
