# DayNest (B-07) — 일정 관리 사이트

- 사이트 ID: **B-07** / 이름: **DayNest** (개인 캘린더 · 일정 · 할 일 · 메모 · 검색)
- 학습 용도: **Training** / 확인전략: **STATE_REVISIT** / DQN_학습대상: **조건부**
- 모든 데이터는 가상 테스트 데이터이며 외부 캘린더·메일 API 는 사용하지 않는다.

## 기술 스택
- Frontend: React 18 + Vite + React Router(BrowserRouter) — 포트 **5322**
- Backend: Node.js + Express — 포트 **9721**
- DB: SQLite(`better-sqlite3`, `backend/data/daynest.db`, 최초 기동 시 자동 생성·시드)

## 폴더 구조
```
siteB07_일정관리/
├─ frontend/ (src: components, pages, hooks, context, api, utils, styles)
├─ backend/  (server.js, routes, controllers, services, db/{init,seed}.js, data/)
├─ README.md  BUGS.md  TODO.md
```

## 설치 및 실행 (각각 다른 터미널)
```
cd backend  && npm install && npm run dev     # http://localhost:9721
cd frontend && npm install && npm run dev     # http://localhost:5322
```
브라우저: http://localhost:5322 (기준일 "오늘"은 서버 고정값 2026-10-14)

## 정상 기능
월간/주간/일간 조회, 날짜 이동·미니 캘린더, 일정 상세(패널·페이지), 일정 생성(모달·전체 화면)·수정·삭제·완료, 반복 일정 생성/시리즈 수정·삭제, 제목/날짜 범위/카테고리/상태 검색, 할 일 추가·수정·완료·삭제, 일정 메모 작성·수정, 알림 읽음 변경, 활동 로그·최근 변경 내역, 오늘 일정 요약·통계 카드, 오프라인 작성 모드 토글, 테스트 데이터 초기화.

## API
```
GET /api/health
GET /api/users, /api/users/:id           GET /api/categories
GET /api/events (from,to,category,status,q,userId)   GET /api/events/:id
POST /api/events   PATCH /api/events/:id   DELETE /api/events/:id (?scope=series)
GET /api/events/search | /calendar (view,date) | /statistics
GET/POST /api/recurring-events   PATCH /api/recurring-events/:id
GET/POST /api/tasks   PATCH/DELETE /api/tasks/:id
GET/POST /api/events/:id/notes   PATCH /api/notes/:id
GET /api/notifications   PATCH /api/notifications/:id/read
GET /api/activity
POST /api/test/reset
```
응답은 `{ data, meta? }`, 오류는 `{ error: { code, message } }` 이며 잘못된 요청은 4xx(400/404/410)로 반환한다.

## 초기 데이터 (고정 seed)
사용자 100 / 일정 360(활성 280, 삭제 80) / 반복 일정 100(반복 규칙 일정 200건) / 할 일 200 / 카테고리 12 / 메모 160 / 수정 기록 150 / 삭제 기록 80 / 알림 120 / 활동 로그 150. 고정 ID 일정 1~12 (BUGS.md 참고).

## 의도적 오류 5개 (상세: BUGS.md)
| ID | 요약 | 재현 요약 |
|---|---|---|
| B07-ERR01 | 검색어 유지 실패 | `/search` 에서 `디자인 리뷰` 검색 → 결과(일정 3) 클릭 → 뒤로가기 → 검색어 소실 |
| B07-ERR02 | 일정 작성 중 뒤로가기 상태 유실 | `/events/new` 입력 → 임시 미리보기 → 뒤로가기 → 입력 초기화 |
| B07-ERR03 | 복귀 후 수정 전 일정 표시(월간) | 월간 → 일정 1 상세 → 제목/시간 수정 → 뒤로가기 → 카드 수정 전 값 |
| B07-ERR04 | 삭제 일정 잔존(주간) | 주간 → 일정 5 상세 → 삭제 → 뒤로가기 → 카드 잔존 |
| B07-ERR05 | 오프라인 메모 입력 휘발 | 오프라인 ON → `/events/9/notes` 입력 → 새로고침 → 입력 소실 |

## Reset API 와 상태 복원 테스트
- `POST http://localhost:9721/api/test/reset`: DB 전체를 고정 seed 로 재생성(사용자·일정·반복·할 일·메모·알림·활동 로그, 삭제/수정 상태 포함).
- 프론트 상태(캘린더 스냅샷, 임시 작성값, 검색어, 오프라인 모드)는 사이드바 "테스트 데이터 초기화" 또는 `await window.__dayNestReset()` 로 함께 초기화되고 `/calendar/month` 로 복귀한다.
- 재방문 테스트 흐름: Reset → 작업 수행(저장/수정/삭제/입력) → 다른 화면 이동 → 뒤로가기 또는 새로고침 → `window.__dayNestActions`, Network, DOM(`[data-bug-id]`, `[data-event-id]`)을 이전 상태와 비교.
- 복원 판정은 React Router `POP` 네비게이션 기준이라 브라우저의 BFCache 사용 여부와 무관하게 재현된다.

## 문서
BUGS.md(오류 명세), TODO.md(진행·미검증 항목).
정적 점검만 수행했으며 npm install / 서버 실행 / 브라우저 재현은 수행하지 않았다.
