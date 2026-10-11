# BUGS.md — Mingle (B-01) 의도적 오류 명세

공통: 사이트 B-01 / Training / ACTION_REPLAY. 모든 오류는 Frontend에서만 발생하며 Backend는 정상 동작한다.
공통 precondition: `POST /api/test/reset` 직후 `http://localhost:5316` 새로 진입 (기본 계정 id=1).
Evidence 유형: ActionLog(클릭 등 수행 행동 기록), UI(화면/토스트), DOM(요소 수·속성), Network(요청 수·응답), State(재조회한 서버/화면 값).

---

## B01-ERR01 — 페이징 드리프트 및 리스트 중복

- **bug_id**: B01-ERR01
- **CSV No**: 1611
- **오류명**: 페이징 드리프트 및 리스트 중복
- **확인전략**: ACTION_REPLAY
- **precondition**: 홈 피드 첫 페이지(8개) 표시, 필터 ‘전체’, 정렬 ‘최신순’, 검색어 없음
- **trigger**: 하단 ‘게시물 더보기’ 클릭
- **정상 기대 동작**: 기존 8개 아래에 다음 페이지의 새 게시물 8개만 추가 (총 16개, ID 중복 없음)
- **실제 오류 동작**: 이전 페이지 마지막 2개가 다시 추가된 뒤 다음 페이지가 이어져 총 18개 카드, 동일 게시물 2개가 두 번 표시
- **코드상 원인**: `mergePages()`가 `[...prev, ...prev.slice(-2), ...next]`로 병합. Backend `/api/feed?page=2`는 중복 없는 8개를 반환
- **관련 파일**: `frontend/src/hooks/useFeed.js`, `frontend/src/pages/HomePage.jsx`
- **data-bug-id selector**: `[data-bug-id="B01-ERR01"]` (피드 컨테이너 `div.feed`, 더보기 버튼)
- **필요한 Evidence**: ActionLog(더보기 클릭), DOM(`.feed > article` 개수 18, 동일 게시물 카드 중복), Network(`GET /api/feed?page=2` 응답 items 8개·중복 없음), UI(스크린샷 상 동일 카드 반복)
- **Confirmation Oracle**: 더보기 클릭 후 `.feed` 안 카드 수 = 이전 카드 수 + 응답 items 수 + 2 이고, 카드 내 게시물 식별자(이미지 `/img/post-N`)가 중복됨. 새로고침 후에는 중복이 사라짐
- **재현 절차**: ① Reset ② 홈 진입 ③ 피드 스크롤 하단의 ‘게시물 더보기’ 클릭 ④ 8번째·9번째로 보이던 직전 2개 카드가 다시 나타나는지 확인
- **DQN이 수행해야 하는 기대 행동**: 홈 피드에서 ‘게시물 더보기’ 버튼을 클릭하고, 클릭 직후 피드 DOM의 카드 중복 여부를 관찰/기록

---

## B01-ERR02 — 로고 클릭 시 홈 이동 불가

- **bug_id**: B01-ERR02
- **CSV No**: 1643
- **오류명**: 로고 클릭 시 홈 이동 불가
- **확인전략**: ACTION_REPLAY
- **precondition**: 프로필(‘내 프로필’ 또는 사용자 프로필) 또는 ‘저장한 게시물’ 화면에 있음
- **trigger**: 상단 Mingle 로고 클릭
- **정상 기대 동작**: 메인 피드(홈) 화면으로 이동
- **실제 오류 동작**: 화면 변화 없이 현재 페이지 유지. 좌측 ‘홈’ 메뉴 클릭은 정상적으로 홈 이동
- **코드상 원인**: 로고 `onClick`이 `handleLogoClick`(preventDefault만 수행)에 연결되어 App의 홈 이동 함수(`goHome`)가 호출되지 않음
- **관련 파일**: `frontend/src/components/Header.jsx`, (대조군) `frontend/src/components/Sidebar.jsx`, `frontend/src/App.jsx`
- **data-bug-id selector**: `a.logo[data-bug-id="B01-ERR02"]`
- **필요한 Evidence**: ActionLog(화면 이동 → 로고 클릭), UI(클릭 전후 동일 화면, 페이지 제목 ‘저장한 게시물’/프로필 유지), DOM(스토리 목록·피드 요소 미출현, 프로필/저장 영역 유지), State(현재 view가 그대로)
- **Confirmation Oracle**: 로고 클릭 후에도 홈 전용 요소(스토리 목록 `section.stories`, 피드 `.feed`)가 나타나지 않고 이전 화면 요소가 유지됨. 이후 ‘홈’ 메뉴 클릭 시에는 홈 요소가 나타남
- **재현 절차**: ① Reset ② 좌측 ‘저장한 게시물’(또는 ‘내 프로필’) 클릭 ③ 상단 로고 클릭 ④ 화면 유지 확인 ⑤ 대조: 좌측 ‘홈’ 클릭 시 정상 이동
- **DQN이 수행해야 하는 기대 행동**: 프로필 또는 저장 화면으로 이동한 뒤 헤더 로고를 클릭하고 화면 전환 여부를 비교

---

## B01-ERR03 — 저장 성공 피드백 누락

- **bug_id**: B01-ERR03
- **CSV No**: 1648
- **오류명**: 성공/실패 피드백 부재
- **확인전략**: ACTION_REPLAY
- **precondition**: 저장하지 않은 게시물(버튼 라벨 ‘🔖 게시물 저장’)의 상세 모달을 연 상태
- **trigger**: ‘게시물 저장’ 버튼 클릭
- **정상 기대 동작**: `POST /api/posts/:id/save` 성공 후 저장 아이콘 변경과 함께 성공 토스트 표시
- **실제 오류 동작**: 저장은 완료되고 버튼이 ‘📑 저장됨’으로 변경되지만 토스트/안내 메시지가 없음. (저장 취소·댓글·팔로우 등 다른 기능의 토스트는 정상 표시)
- **코드상 원인**: `handleToggleSave`의 저장 분기에서 `showToast` 호출 누락 (취소 분기에는 존재)
- **관련 파일**: `frontend/src/components/PostModal.jsx`
- **data-bug-id selector**: `button.save-btn[data-bug-id="B01-ERR03"]`
- **필요한 Evidence**: ActionLog(저장 버튼 클릭), Network(`POST /api/posts/:id/save` 200, `{saved:true}`), UI/DOM(버튼 라벨·`aria-pressed` 변경, `.toast-stack`에 토스트 없음), State(`GET /api/saved`에 해당 게시물 포함)
- **Confirmation Oracle**: 저장 API 성공 + 버튼 상태 변경이 관찰되었음에도 클릭 후 3초 이내 `.toast` 요소가 생성되지 않음
- **재현 절차**: ① Reset ② 홈에서 임의 게시물 이미지 클릭하여 상세 모달 열기(저장 안 된 게시물) ③ ‘게시물 저장’ 클릭 ④ 토스트 부재 확인 ⑤ 대조: ‘저장됨’ 재클릭 시 ‘저장을 취소했습니다.’ 토스트 표시
- **DQN이 수행해야 하는 기대 행동**: 게시물 상세 모달에서 저장 버튼을 클릭하고 클릭 직후 토스트 영역/네트워크 응답/버튼 상태를 함께 관찰

---

## B01-ERR04 — 댓글 중복 등록

- **bug_id**: B01-ERR04
- **CSV No**: 1700
- **오류명**: 의도치 않은 더블 클릭 (이벤트 중복)
- **확인전략**: ACTION_REPLAY
- **precondition**: 게시물 상세 모달 열림, 댓글 입력창에 내용 입력
- **trigger**: ‘댓글 등록’ 버튼 1회 클릭
- **정상 기대 동작**: 댓글 1개 등록 (POST 1회)
- **실제 오류 동작**: 동일 내용의 댓글 2개가 목록과 DB에 등록됨 (POST 2회, 댓글 수 +2)
- **코드상 원인**: 제출 버튼에 `onClick={submitComment}`가 있고 form에도 `onSubmit`이 `submitComment`를 호출. 클릭 시 두 핸들러가 모두 실행됨. Backend는 요청당 1건만 생성 (중복 생성 로직 없음)
- **관련 파일**: `frontend/src/components/CommentForm.jsx`, `frontend/src/components/PostModal.jsx`
- **data-bug-id selector**: `button[data-bug-id="B01-ERR04"]`
- **필요한 Evidence**: ActionLog(입력 후 등록 1회 클릭), Network(`POST /api/posts/:id/comments` 2건, 동일 body), DOM(`.comment-item` 2개 증가, 동일 텍스트), State(`GET /api/posts/:id/comments` 및 `comment_count` +2)
- **Confirmation Oracle**: 단일 클릭 후 동일 content의 POST가 2회 발생하고 댓글 목록에 동일 텍스트 항목 2개가 나타남. 새로고침 후에도 2개 유지 (DB 영속)
- **재현 절차**: ① Reset ② 게시물 상세 모달 열기 ③ 댓글 입력창에 “테스트” 입력 ④ ‘댓글 등록’ 1회 클릭 ⑤ 동일 댓글 2개 확인
- **DQN이 수행해야 하는 기대 행동**: 댓글 입력창에 텍스트를 입력한 뒤 ‘댓글 등록’을 한 번만 클릭하고 네트워크 요청 수와 댓글 목록 증가 수를 관찰

---

## B01-ERR05 — 팔로잉 캐시 상태 불일치

- **bug_id**: B01-ERR05
- **CSV No**: 1972
- **오류명**: 캐시 상태 불일치
- **확인전략**: ACTION_REPLAY
- **precondition**: 우측 ‘회원님을 위한 추천’ 목록에 ‘팔로우’ 버튼이 있는 사용자가 존재. 우측 프로필 요약의 팔로잉 수가 기본값(Reset 시 24)
- **trigger**: 추천 사용자의 ‘팔로우’ 버튼 클릭
- **정상 기대 동작**: 버튼이 ‘팔로잉’으로 바뀌고 프로필 요약 팔로잉 수가 +1 (25)
- **실제 오류 동작**: 버튼은 ‘팔로잉’으로 바뀌고 Backend에는 팔로우가 저장되지만, 프로필 요약의 팔로잉 수는 24로 유지. 새로고침하면 25로 갱신. (프로필 페이지·팔로잉 목록에서의 팔로우는 요약이 정상 갱신)
- **코드상 원인**: `SuggestedUsers.handleToggle`의 팔로우 분기에서 `refreshMySummary()` 호출 누락 → `useMySummary`의 모듈 캐시가 이전 값을 유지
- **관련 파일**: `frontend/src/components/SuggestedUsers.jsx`, `frontend/src/hooks/useMySummary.js`, `frontend/src/components/ProfileSummary.jsx`
- **data-bug-id selector**: `button[data-bug-id="B01-ERR05"]` (추천 팔로우 버튼), `dd#summary-following-count[data-bug-id="B01-ERR05"]` (팔로잉 수)
- **필요한 Evidence**: ActionLog(팔로우 클릭), Network(`POST /api/users/:id/follow` 200, `my_following_count` 25), DOM/UI(버튼 텍스트 ‘팔로잉’, 요약 팔로잉 수 텍스트 24 유지), State(`GET /api/me`의 `following_count` 25 vs 화면 24)
- **Confirmation Oracle**: 팔로우 API 응답의 `my_following_count`(또는 이후 `GET /api/me`)와 화면의 `#summary-following-count` 값이 다름. 새로고침 후 두 값이 일치
- **재현 절차**: ① Reset ② 홈 진입 후 우측 프로필 요약의 팔로잉 수(24) 확인 ③ 추천 사용자 하나의 ‘팔로우’ 클릭 ④ 버튼은 ‘팔로잉’, 팔로잉 수는 24 그대로 확인 ⑤ 새로고침 시 25로 갱신
- **DQN이 수행해야 하는 기대 행동**: 추천 목록의 ‘팔로우’ 버튼을 클릭하고 클릭 전후의 팔로잉 수 텍스트와 Backend 응답 값을 비교
