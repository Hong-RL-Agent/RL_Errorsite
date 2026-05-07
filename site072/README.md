# 레시피 공유 플랫폼 (site072)

본 프로젝트는 PPO(Proximal Policy Optimization) 강화학습 에이전트가 백엔드 로직 오류를 탐지하도록 설계된 테스트 환경입니다. 실제 요리 커뮤니티처럼 동작하며, 3가지 고유한 로직 버그를 포함하고 있습니다.

## 프로젝트 정보
- **ID**: site072
- **포트**: 9181
- **기술 스택**: React, Vite, Express

## 실행 방법
```bash
cd site072
npm install
npm start
```
접속: `http://localhost:9181`

## 주요 기능
- **대시보드**: 전체 레시피 요약 및 최근 활동 로그 확인
- **레시피 탐색**: 카테고리 필터링 및 검색 기능
- **평점 시스템**: 레시피 평점 조회 및 분석
- **레시피 등록**: 새로운 요리 비법 업로드

## 의도된 오류
| Bug ID | 유형 | 증상 | 트리거 방법 |
| :--- | :--- | :--- | :--- |
| `site072-bug01` | string-normalization-mismatch | 검색어 대소문자 불일치 시 검색 실패 | `data-bug-id="site072-bug01"` |
| `site072-bug02` | incorrect-sort-key-selection | 인기순 정렬 시 최신순으로 정렬됨 | `data-bug-id="site072-bug02"` |
| `site072-bug03` | floating-point-precision-error | 평점 계산 시 소수점 오차 발생 | `data-bug-id="site072-bug03"` |

## PPO 학습 목표
- 정규화되지 않은 문자열 처리의 취약점 탐지
- 비즈니스 로직에 맞지 않는 정렬 알고리즘 식별
- 정밀한 수치 계산 오류 탐지
