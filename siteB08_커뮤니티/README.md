# ThreadGarden (B-08)

ThreadGarden은 주제별 게시판, 질문과 답변, 토론, 게시글·댓글 관리를 제공하는 Validation용 커뮤니티 플랫폼입니다.

- 사이트 ID: B-08
- 용도: Validation
- 확인전략: ACTION_REPLAY + SEQUENCE_REPLAY + STATE_REVISIT
- 기술 스택: Next.js App Router, React, Node.js, Express, SQLite

## 실행 정보

- Frontend: `http://localhost:5323`
- Backend API: `http://localhost:9722`

Backend:

```bash
cd siteB08_커뮤니티/backend
npm install
npm run dev
```

Frontend:

```bash
cd siteB08_커뮤니티/frontend
npm install
npm run dev
```

## 정상 기능

게시판 목록 조회, 게시글 검색, 게시판 필터, 태그 검색, 최신순/인기순 정렬, 게시글 상세 조회, 게시글 작성/수정/삭제, 댓글 작성, 답글 작성, 댓글 수정/삭제, 추천 및 취소, 북마크 추가/취소, 질문 해결 처리, 임시저장, 임시저장 불러오기, 내 게시글 조회, 내 북마크 조회, 알림 읽음 처리, 활동 로그 조회, 테스트 데이터 초기화를 구현했습니다.

## API 목록

```text
GET    /api/health
GET    /api/boards
GET    /api/boards/:id
GET    /api/threads
GET    /api/threads/:id
POST   /api/threads
PATCH  /api/threads/:id
DELETE /api/threads/:id
GET    /api/threads/:id/replies
POST   /api/threads/:id/replies
PATCH  /api/replies/:id
DELETE /api/replies/:id
POST   /api/threads/:id/recommend
DELETE /api/threads/:id/recommend
GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:threadId
GET    /api/drafts
POST   /api/drafts
PATCH  /api/drafts/:id
POST   /api/threads/:id/resolve
GET    /api/tags
GET    /api/users
GET    /api/users/:id
GET    /api/notifications
PATCH  /api/notifications/:id/read
GET    /api/activity
POST   /api/test/reset
```

## 의도적 오류 5개

1. `B08-ERR01`: 답글 등록 이벤트 중복
2. `B08-ERR02`: 게시글 페이지 이동 시 중복 노출
3. `B08-ERR03`: 검색 후 복귀 시 검색어 유실
4. `B08-ERR04`: 북마크 카운트 캐시 불일치
5. `B08-ERR05`: 게시글 작성 단계 복귀 시 초안 정보 유실

## 재현 시나리오

- `B08-ERR01`: `T0001` 상세에서 댓글의 답글 작성 상태로 만든 뒤 `답글 등록`을 한 번 클릭하면 동일 답글이 두 번 저장됩니다.
- `B08-ERR02`: 개발 게시판 첫 페이지에서 `다음 페이지`를 클릭하면 첫 페이지 마지막 2개 게시글이 다음 페이지 결과에 중복 표시됩니다.
- `B08-ERR03`: 검색어 입력 후 결과에서 상세를 열고 `목록으로` 돌아오면 검색어와 결과 상태가 초기화됩니다.
- `B08-ERR04`: 저장하지 않은 게시글 상세에서 북마크를 누르면 버튼은 저장됨으로 바뀌지만 우측 내 활동 북마크 개수는 갱신되지 않습니다.
- `B08-ERR05`: 글쓰기에서 제목/본문/태그 입력 후 카테고리 선택 화면으로 갔다가 본문 편집으로 복귀하면 본문과 태그가 유실됩니다.

## Reset API

`POST /api/test/reset`은 사용자, 게시판, 게시글, 댓글, 추천, 북마크, 임시저장, 해결 기록, 알림, 활동 로그를 고정 seed 상태로 복원합니다.

상세 오류 정의는 `BUGS.md`, 구현 및 점검 체크리스트는 `TODO.md`에 정리했습니다.
