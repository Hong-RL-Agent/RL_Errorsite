# 게시글 랭킹 시스템 (site086)

PPO(Proximal Policy Optimization) 에이전트의 로직 오류 탐지 성능을 테스트하기 위한 고충실도 커뮤니티 대시보드입니다.

## 프로젝트 정보
- **사이트 ID**: site086
- **포트**: 9195
- **기술 스택**: React, Vite, Express, Lucide React

## 실행 방법
```bash
cd site086
npm install
npm start
```
접속 주소: `http://localhost:9195`

## API 목록
- `GET /api/health`: 헬스 체크
- `GET /api/posts`: 게시글 목록 (Bug 02 발생 가능)
- `GET /api/posts?sort=popular`: 인기순 정렬 (Bug 01 발생 가능)
- `POST /api/posts/like`: 좋아요 클릭
- `GET /api/recommendations`: 추천 피드 (Bug 04 발생 가능)
- `GET /api/dashboard/summary`: 통계 요약
- `GET /api/logs`: 랭킹 로그 (Bug 03 발생 가능)

## 의도된 오류 (PPO 학습 목표)
1. **정렬 기준 오류 (Bug 01)**: 인기순 정렬 시 조회수가 아닌 좋아요 기준으로 정렬됨.
2. **동점 처리 누락 (Bug 02)**: 동일 수치 데이터의 정렬 순서가 불안정함.
3. **최신성 반영 실패 (Bug 03)**: 좋아요 증가가 랭킹 로그에 즉시 반영되지 않음.
4. **우선순위 역전 (Bug 04)**: 추천 점수와 실제 리스트 순서가 정반대로 나타남.

## PPO 탐지 가이드
에이전트는 `data-bug-id`가 부여된 버튼을 조작하여 각 오류를 트리거하고, 응답 데이터와 UI 상태를 비교하여 논리적 결함을 찾아내야 합니다.
