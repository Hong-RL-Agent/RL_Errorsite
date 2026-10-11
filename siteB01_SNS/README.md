# Mingle (B-01) — SNS 웹사이트

- 사이트 ID: **B-01** / 사이트 이름: **Mingle**
- 구분: **Training — ACTION_REPLAY**
- 설명: 사진 공유, 게시물 작성, 좋아요, 댓글, 팔로우를 제공하는 소셜 네트워크 서비스. RAWD(PPO+DQN) 모델의 GUI 오류 탐지/재현 학습용.

## 기술 스택 및 포트

| 구분 | 기술 | 포트 |
|---|---|---|
| Frontend | React 18 + Vite 5 (useState/useEffect/props, fetch) | **5316** |
| Backend | Node.js + Express 4 | **9715** |
| DB | SQLite (better-sqlite3), 파일: `backend/data/mingle.db` | - |

접속 주소: Frontend `http://localhost:5316` / Backend `http://localhost:9715`

## 실행 방법 (Frontend/Backend 독립 실행)

```bash
# Backend (터미널 1)
cd backend
npm install
npm start            # http://localhost:9715

# Frontend (터미널 2)
cd frontend
npm install
npm run dev          # vite --host 0.0.0.0 --port 5316 --strictPort
```

Backend는 최초 실행 시 DB가 비어 있으면 고정 시드(20260301)로 초기 데이터를 생성한다.
Frontend의 API 주소는 기본 `http://localhost:9715`이며 `VITE_API_BASE`로 변경할 수 있다.
`better-sqlite3`는 네이티브 모듈이므로 Node.js LTS 환경에서 설치한다.

## 초기 데이터 (고정 시드)

사용자 100 · 게시물 190 · 댓글 320 · 좋아요 900 · 팔로우 230 · 저장 140 · 알림 120 · 활동 로그 140.
기본 계정은 `id=1 (mingle_me)`이며 인증 없이 항상 이 계정으로 동작한다. 이미지는 Backend가 `/img/*`로 생성하는 SVG(외부 호출 없음)이다.

## API 목록

```text
GET    /api/health
GET    /api/feed?page&limit&sort(latest|popular|discussed)&filter(following|mine)&q&user_id
GET    /api/stories
GET    /api/me
GET    /api/posts/:id
POST   /api/posts
PATCH  /api/posts/:id
DELETE /api/posts/:id
GET    /api/users?recommend=1&q&limit
GET    /api/users/:id
GET    /api/users/:id/following
POST   /api/users/:id/follow
DELETE /api/users/:id/follow
GET    /api/posts/:id/comments
POST   /api/posts/:id/comments
DELETE /api/comments/:id
POST   /api/posts/:id/like
DELETE /api/posts/:id/like
POST   /api/posts/:id/save
DELETE /api/posts/:id/save
GET    /api/saved
GET    /api/notifications?unread&page&limit
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
GET    /api/activity?category(post|like|comment|follow|save)&page&limit
POST   /api/test/reset
GET    /img/:name            (생성형 SVG 이미지)
```

## 정상 기능

게시물 검색 · 작성 · 수정 · 삭제 · 상세 조회 · 피드 정렬/필터 · 페이지네이션(더보기) · 댓글 작성/삭제 · 좋아요/취소 · 팔로우/언팔로우 · 게시물 저장/취소 · 사용자 프로필 · 팔로잉 목록 · 스토리 목록 · 추천 사용자 · 알림 목록/읽음 처리/모두 읽음 · 활동 내역(카테고리 필터) · 토스트 · 로딩 UI · 데이터 초기화.

## 의도적 오류 5개 (모두 Frontend에서 발생)

| bug_id | CSV No | 오류명 | 재현 행동 |
|---|---|---|---|
| B01-ERR01 | 1611 | 페이징 드리프트 및 리스트 중복 | 홈 피드 하단 **‘게시물 더보기’** 클릭 → 직전 페이지 마지막 2개 카드가 다시 나타남 |
| B01-ERR02 | 1643 | 로고 클릭 시 홈 이동 불가 | 프로필/저장한 게시물 화면에서 상단 **Mingle 로고** 클릭 → 화면 유지 (좌측 ‘홈’ 메뉴는 정상) |
| B01-ERR03 | 1648 | 성공/실패 피드백 부재 | 저장하지 않은 게시물의 상세 모달에서 **‘게시물 저장’** 클릭 → 저장·아이콘 변경은 되나 토스트 없음 |
| B01-ERR04 | 1700 | 의도치 않은 더블 클릭 (이벤트 중복) | 상세 모달에서 댓글 입력 후 **‘댓글 등록’** 1회 클릭 → 동일 댓글 2개 (POST 2회) |
| B01-ERR05 | 1972 | 캐시 상태 불일치 | 우측 추천 사용자 **‘팔로우’** 클릭 → 버튼은 ‘팔로잉’, 우측 프로필 요약의 팔로잉 수는 그대로 (새로고침 시 갱신) |

각 오류 관련 UI에는 `data-bug-id` 속성이 있고, 코드에는 `INTENTIONAL_ERROR` 주석이 있다. 상세 명세와 DQN Evidence는 `BUGS.md` 참고.

## Reset API

```bash
curl -X POST http://localhost:9715/api/test/reset
```

모든 테이블을 삭제하고 고정 시드로 게시물·댓글·좋아요·팔로우·저장·알림·활동 로그와 기본 계정을 복원한다. 응답에 복원된 행 수(`counts`)가 포함된다.
화면의 좌측 하단 **‘데이터 초기화’** 버튼은 위 API 호출 후 프로필 요약 캐시와 localStorage/sessionStorage를 비우고 화면을 다시 마운트한다.
외부에서 API만 호출한 경우에는 브라우저를 새로고침해야 클라이언트 캐시가 비워진다.
