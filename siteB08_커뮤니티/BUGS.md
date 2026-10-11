# B-08 Intentional Bugs

## B08-ERR01

- bug_id: B08-ERR01
- CSV No 및 CSV 오류명: 1700, 의도치 않은 더블 클릭 (이벤트 중복)
- 확인전략: ACTION_REPLAY
- DQN_학습대상: O
- 화면 위치: 게시글 상세 댓글 영역의 답글 등록 버튼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B08-ERR01"]`
- precondition: `T0001` 게시글 상세에서 댓글 아래 답글 작성 상태를 연다.
- trigger 및 action sequence: 댓글 선택 → 답글 내용 입력 → `답글 등록` 한 번 클릭
- 정상 기대 동작: 답글 하나가 등록된다.
- 실제 오류 동작: POST 요청이 두 번 발생하고 동일 내용의 답글 두 개가 표시된다.
- 의도된 코드 원인: 특정 게시글의 답글 등록 경로에서 `api.createReply`가 두 번 호출된다.
- 필요한 Evidence: ActionLog + Network + UI + State
- Confirmation Oracle: 단일 클릭 후 Network의 POST 2건과 같은 본문 답글 2개를 확인한다.
- Reset 이후 재현 단계: Reset → `T0001` 상세 → 답글 작성 → 등록.
- DQN 기대 행동: 클릭 횟수와 요청/DOM 증가량을 비교한다.

## B08-ERR02

- bug_id: B08-ERR02
- CSV No 및 CSV 오류명: 1611, 페이징 드리프트 및 리스트 중복
- 확인전략: ACTION_REPLAY
- DQN_학습대상: O
- 화면 위치: 개발 게시판 피드 하단 `다음 페이지`
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B08-ERR02"]`
- precondition: 개발 게시판 첫 페이지에 게시글 20개가 표시된다.
- trigger 및 action sequence: `다음 페이지` 클릭
- 정상 기대 동작: 서버가 반환한 2페이지 게시글만 표시된다.
- 실제 오류 동작: 첫 페이지 마지막 2개 게시글이 2페이지 결과 앞에 중복 표시된다.
- 의도된 코드 원인: 프론트엔드 병합 로직이 현재 목록의 마지막 2개 항목을 새 응답 앞에 덧붙인다.
- 필요한 Evidence: ActionLog + UI + DOM + Network
- Confirmation Oracle: API 응답은 중복이 없지만 DOM에는 동일 `data-thread-id`가 반복된다.
- Reset 이후 재현 단계: Reset → 개발 게시판 → 다음 페이지.
- DQN 기대 행동: 네트워크 응답 ID와 렌더링 ID를 비교한다.

## B08-ERR03

- bug_id: B08-ERR03
- CSV No 및 CSV 오류명: 1783, 검색어 유지 실패
- 확인전략: STATE_REVISIT
- DQN_학습대상: 조건부
- 화면 위치: 헤더 검색창과 게시글 상세 복귀 버튼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B08-ERR03"]`
- precondition: 게시판 검색 화면을 연다.
- trigger 및 action sequence: 키워드 입력 → 검색 → 게시글 상세 열기 → 목록으로 복귀 → 검색어와 결과 확인
- 정상 기대 동작: 검색어, 검색 결과, 필터가 유지된다.
- 실제 오류 동작: 상세 진입 시 검색 상태가 초기화되어 복귀 후 기본 목록이 표시된다.
- 의도된 코드 원인: 상세 열기 함수가 검색어 복원용 상태와 입력값을 비운다.
- 필요한 Evidence: ActionLog + UI + State + DOM
- Confirmation Oracle: 상세 복귀 후 검색 input value가 비어 있고 기본 목록이 렌더링된다.
- Reset 이후 재현 단계: Reset → 검색 → 상세 → 목록으로.
- DQN 기대 행동: 검색 전후 input value와 결과 목록을 추적한다.

## B08-ERR04

- bug_id: B08-ERR04
- CSV No 및 CSV 오류명: 1972, 캐시 상태 불일치
- 확인전략: ACTION_REPLAY
- DQN_학습대상: O
- 화면 위치: 게시글 상세 북마크 버튼과 우측 내 활동 패널
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B08-ERR04"]`
- precondition: 저장하지 않은 게시글을 연다.
- trigger 및 action sequence: 북마크 버튼 클릭
- 정상 기대 동작: 북마크 버튼 상태와 내 북마크 개수가 함께 갱신된다.
- 실제 오류 동작: Backend 저장과 버튼 상태는 바뀌지만 우측 북마크 개수는 이전 값을 유지한다.
- 의도된 코드 원인: 북마크 추가 후 `bookmarks` 캐시를 재조회하거나 갱신하지 않는다.
- 필요한 Evidence: ActionLog + UI + Network + State
- Confirmation Oracle: POST `/api/bookmarks` 성공 후 버튼은 저장됨이나 카운트는 그대로다.
- Reset 이후 재현 단계: Reset → 미저장 글 상세 → 북마크.
- DQN 기대 행동: 버튼 상태와 우측 카운트 불일치를 확인한다.

## B08-ERR05

- bug_id: B08-ERR05
- CSV No 및 CSV 오류명: 2090, 다단계 기억 부담
- 확인전략: SEQUENCE_REPLAY
- DQN_학습대상: O
- 화면 위치: 게시글 작성 에디터와 카테고리 선택 단계
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B08-ERR05"]`
- precondition: 새 게시글 작성을 시작한다.
- trigger 및 action sequence: 제목 입력 → 본문 작성 → 태그 2개 입력 → 카테고리 선택 → 본문 편집으로 복귀
- 정상 기대 동작: 제목, 본문, 태그가 유지된다.
- 실제 오류 동작: 본문과 태그 임시 상태가 사라진다.
- 의도된 코드 원인: 카테고리 단계에서 편집 단계로 돌아올 때 draft의 `body`와 `tags`를 빈 값으로 덮어쓴다.
- 필요한 Evidence: ActionLog + UI + State + DOM
- Confirmation Oracle: 복귀 후 textarea와 tag input 값이 최초 입력값과 다르다.
- Reset 이후 재현 단계: Reset → 글쓰기 → 본문/태그 입력 → 카테고리 → 복귀.
- DQN 기대 행동: 단계 전후 입력 DOM 값을 비교한다.
