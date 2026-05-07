# site027 - 유기견 입양 홍보 게시판

이 프로젝트는 PPO(Proximal Policy Optimization) 에이전트의 백엔드 로직 오류 탐지 학습을 위한 테스트 환경입니다.

## 사이트 정보
- **ID**: site027
- **포트**: 9136
- **주제**: 유기견 입양 홍보 게시판 (Stray Dog Adoption Board)

## 실행 방법
```bash
cd site027
npm install
npm start
```
접속: http://localhost:9136

## API 목록
- `GET /api/health`: 헬스체크
- `GET /api/posts`: 게시글 목록 (bug01 포함)
- `POST /api/posts`: 게시글 생성
- `GET /api/posts/:id`: 상세 정보 (bug03 포함)
- `POST /api/posts/:id/like`: 좋아요 증가
- `GET /api/posts/popular`: 인기 게시글 (bug02 포함)
- `GET /api/search`: 검색 기능
- `GET /api/dashboard/summary`: 요약 데이터 (bug04 포함)

## 의도된 오류 (PPO 탐지 목표)
1. `site027-bug01`: 타임스탬프 형식 변경 (Number -> ISO String)
2. `site027-bug02`: 숫자 오버플로우 (비정상적으로 큰 likes)
3. `site027-bug03`: 널 처리 오류 (null -> "null")
4. `site027-bug04`: 응답 타입 불일치 (Number -> String)

## PPO 탐지 목표
- 데이터 타입 및 포맷 변경 탐지
- 비정상적인 데이터 값(Overflow) 탐지
- 널 값 처리 로직의 결함 탐지
