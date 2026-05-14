# site019: 온라인 강의 플랫폼

## 정보
- 사이트 이름: EduConnect
- 사이트 ID: site019
- 포트 번호: 9238
- 기술 스택: React, Vite, Express, Vanilla CSS

## 실행 방법
1. `cd site019`
2. `npm install`
3. `npm run build`
4. `npm start`
5. http://localhost:9238 접속

## API 엔드포인트
- `GET /api/health`: 서버 상태 확인
- `GET /api/courses`: 전체 또는 카테고리별 강의 조회 및 검색 (query: category, search)
- `GET /api/progress`: 사용자의 현재 학습 진행 상태 조회
- `POST /api/courses/:id/wishlist`: 강의 찜하기 토글 (Interactive action)
- `POST /api/courses/:id/enroll`: 수강 신청 (Interactive action)

## 정상 기능 목록
- 강의 검색 기능 정상 동작
- 카테고리(분야) 탭 전환 및 필터링 동작
- 강의 상세 모달 표시
- 찜하기 버튼 기능(API 기반 상태 변경) 동작
- 수강 신청 시 API를 통해 내 학습 현황 패널 업데이트
- FAQ 아코디언 정상 동작
- 데이터 로딩 시 스피너 및 에러 메시지 표시

## 의도된 프론트엔드 오류 3개
1. **[site019-bug01] 텍스트 크기 조절 불가 (fixed-text-size-overflow)**: 강의 카드 제목의 높이 및 크기가 고정되어 브라우저 확대 시 텍스트 잘림.
2. **[site019-bug02] 비의미적 HTML 사용 (non-semantic-clickable-element)**: 수강 신청 요소가 `button`이 아닌 `div`로 구현되어 키보드 접근성 누락.
3. **[site019-bug03] 키보드 포커스 트랩 및 순서 (broken-focus-order)**: 모달 오픈 시 배경으로 `tab` 포커스가 이동하여 탐색 불가.

## PPO 에이전트 탐지 기대 행동
에이전트는 제공된 세 가지 UI/UX/접근성 오류(고정 텍스트 오버플로우, 비의미적 버튼 태그, 포커스 트랩 부재)를 정확히 식별해야 하며, 동시에 정상적으로 처리되는 API 호출 및 일반적인 리액트 상태 변화를 오류로 분류하지 않아야 합니다.

## 검증 및 점검 기록
진행 상황은 [TODO.md](./TODO.md)를 참고하시고, 오류 상세 명세는 [BUGS.md](./BUGS.md)를 참조하십시오.
