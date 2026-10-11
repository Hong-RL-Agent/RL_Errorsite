# BUGS.md — B-07 DayNest 의도적 오류 명세

공통 사항
- 5개 오류 모두 **STATE_REVISIT**, DQN_학습대상은 모두 **조건부**.
- Backend(SQLite) 데이터는 어떤 오류로도 손상되지 않는다. 오류는 Frontend 의 상태 보관·복원 로직에만 있다.
- 오류 ID/원인은 화면에 표시하지 않는다. `data-bug-id` 속성으로만 식별한다.
- **기준일(오늘)은 서버가 고정값 `2026-10-14`(수)** 를 `GET /api/health` 의 `today` 로 내려준다. 시드 일정이 이 날짜 주변에 있으므로 실제 날짜와 무관하게 재현된다.
- 고정 ID 일정(사용자 1): 1 팀 주간 회의(10/14 10:00) · 2 치과 정기검진(10/15) · 3 디자인 리뷰(10/13) · 4 요가 클래스(10/14) · 5 스터디 모임: 알고리즘(10/16) · 6 제주도 여행 계획 점검(10/17) · 7 엄마 생일 저녁(10/18) · 8 분기 보고서 제출 · 9 독서 모임(10/21, 메모 2개) · 10 프로젝트 킥오프 회의 · 11 월간 회고 · 12 헬스장 PT.
- 증거 수집: `window.__dayNestActions`(행동 로그: month_loaded / week_restored / select_event / event_detail / search_results …), `window.__dayNestState`(offline, dataVersion), Network 탭(`/api/events/calendar`, `/api/events/:id`, `/api/events/search`, `/api/events/:id/notes`), DOM(`[data-bug-id]`, `[data-event-id]`).
- 뒤로가기는 실제 브라우저 뒤로가기(또는 `history.back()`)를 사용한다. React Router `useNavigationType() === 'POP'` 이 복원 판정 기준이므로 BFCache 사용 여부와 무관하게 재현된다(`pageshow`+`persisted` 복원도 동일 처리).
- 각 시나리오의 시작점은 `POST /api/test/reset`(또는 `window.__dayNestReset()`).

---

## B07-ERR01 — 일정 검색어 유지 실패

| 항목 | 내용 |
|---|---|
| bug_id | B07-ERR01 |
| CSV No | 1783 |
| CSV 오류명 | 검색어 유지 실패 |
| 확인전략 | STATE_REVISIT |
| DQN_학습대상 | 조건부 |
| 화면 위치 | `/search` 일정 검색 화면 |
| 관련 파일 | `frontend/src/pages/SearchPage.jsx` |
| data-bug-id selector | `[data-bug-id="B07-ERR01"]` (검색 카드 `section.search-card`) |
| precondition | Reset 직후, `/search` 진입. 카테고리 필터는 URL 쿼리(`?category=`)로 보관됨 |
| trigger sequence | 검색창에 `디자인 리뷰` 입력 → 결과 확인(1건, 일정 ID 3) → 결과 클릭(`/events/3`) → 상세 확인 → 브라우저 뒤로가기 |
| 저장 전 상태 | 검색어 `디자인 리뷰`, 결과 1건, (선택 시) 카테고리 `업무` 필터 |
| 작업 수행 후 상태 | 상세 화면 `/events/3` 표시 |
| 화면 이동/재방문 방법 | 상세 → **뒤로가기(필수)** |
| 정상 기대 동작 | 복귀 시 검색어와 검색 결과가 그대로 유지 |
| 실제 오류 동작 | 검색창이 빈 문자열, 결과는 검색어 없는 전체 목록(최대 60건). 카테고리/상태/날짜 필터는 URL 에 있어 정상 유지 |
| 코드상 의도된 원인 | 검색어를 `SearchPage` 지역 `useState('')` 로만 보관(URL/컨텍스트 미사용) → 라우트 이동 시 언마운트 |
| 필요한 Evidence | ActionLog + UI + DOM + State |
| Confirmation Oracle | 이동 전 `input[name=q]` 값(`디자인 리뷰`) vs 뒤로가기 후 값(`''`) 비교; `search_results` 로그의 `q=` 값 변화 |
| 새로고침 필요 여부 | 불필요 |
| 뒤로가기 필요 여부 | 필요 |
| Reset 이후 재현 방법 | Reset → `/search` → 동일 검색어 → 일정 3 클릭 → 뒤로가기 |
| DQN 기대 행동 | 검색어 입력 → 상세 이동 → 뒤로가기 후 입력값 diff 로 유실 확정. (카테고리 필터 유지는 정상 대조군) |

---

## B07-ERR02 — 일정 작성 중 뒤로가기 상태 유실

| 항목 | 내용 |
|---|---|
| bug_id | B07-ERR02 |
| CSV No | 1664 |
| CSV 오류명 | 뒤로가기의 오작동 |
| 확인전략 | STATE_REVISIT |
| DQN_학습대상 | 조건부 |
| 화면 위치 | `/events/new` → `/preview` |
| 관련 파일 | `frontend/src/pages/NewEventPage.jsx`, `frontend/src/components/EventEditor.jsx`, `frontend/src/hooks/useDraftState.js`, `frontend/src/pages/PreviewPage.jsx` |
| data-bug-id selector | `[data-bug-id="B07-ERR02"]` (신규 작성 `form.editor`) |
| precondition | Reset 직후. 사이드바 "새 일정" → 모달의 "전체 화면에서 자세히 작성" 또는 URL `/events/new` 직접 진입 |
| trigger sequence | 제목 `병원 예약 확인` 입력 → 날짜·시간 변경 → 장소 `미소치과`, 상세 메모 작성 → "임시 미리보기" → 뒤로가기 |
| 저장 전 상태 | 폼에 제목/날짜/시간/장소/메모가 입력됨 (미저장) |
| 작업 수행 후 상태 | `/preview` 에 입력값이 정상 표시됨 |
| 화면 이동/재방문 방법 | 미리보기 → **뒤로가기(필수)** (미리보기의 "작성 화면으로 돌아가기"도 동일 history.back) |
| 정상 기대 동작 | 입력값 유지 |
| 실제 오류 동작 | 제목·장소·메모가 비고 날짜/시간도 기본값으로 초기화 |
| 코드상 의도된 원인 | `NewEventPage` 가 `draftKey={null}` 로 `EventEditor` 를 사용 → 폼 상태가 지역 state 뿐이라 언마운트 시 소멸 |
| 대조군 | `/events/:id/edit`(전체 화면 수정)은 `draftKey="edit-:id"` 로 sessionStorage 에 임시 보관 → 같은 순서(미리보기→뒤로가기)에서 입력값 정상 보존 |
| 필요한 Evidence | ActionLog + UI + DOM + State |
| Confirmation Oracle | 미리보기 이동 전 입력 필드 값 vs 뒤로가기 후 필드 값 비교 |
| 새로고침 필요 여부 | 불필요 |
| 뒤로가기 필요 여부 | 필요 |
| Reset 이후 재현 방법 | Reset → `/events/new` → 입력 → 미리보기 → 뒤로가기 |
| DQN 기대 행동 | 입력 후 이동·복귀하여 필드 값 diff 확인. 정상 저장된 일정은 영향 없음 |

---

## B07-ERR03 — 화면 복귀 후 오래된 일정 상태 유지

| 항목 | 내용 |
|---|---|
| bug_id | B07-ERR03 |
| CSV No | 1850 |
| CSV 오류명 | BFCache 복원 시 유령 상태 유지 |
| 확인전략 | STATE_REVISIT |
| DQN_학습대상 | 조건부 |
| 화면 위치 | `/calendar/month` (월간 캘린더) |
| 관련 파일 | `frontend/src/pages/MonthPage.jsx`, `frontend/src/utils/viewSnapshots.js`, `frontend/src/components/CalendarGrid.jsx` |
| data-bug-id selector | `[data-bug-id="B07-ERR03"]` (월간 그리드 `.month-grid`) |
| precondition | Reset 직후 `/calendar/month` (2026년 10월). 일정 ID 1 `팀 주간 회의`가 10/14 칸에 표시 |
| trigger sequence | 월간 캘린더에서 일정 1 확인 → 카드 클릭(우측 패널) → "상세 페이지 열기" → "수정" 모달에서 제목을 `팀 주간 회의 (수정)`, 시작 시간을 `11:00` 으로 변경 후 저장 → 상세 화면에 최신 값 확인 → 뒤로가기 |
| 저장 전 상태 | 카드: `10:00 팀 주간 회의` |
| 작업 수행 후 상태 | DB/`GET /api/events/1`: `팀 주간 회의 (수정)` 11:00 (상세 화면도 최신) |
| 화면 이동/재방문 방법 | **뒤로가기(필수)** → 월간 캘린더 복귀 |
| 정상 기대 동작 | 복귀한 캘린더 카드가 `11:00 팀 주간 회의 (수정)` |
| 실제 오류 동작 | 카드가 계속 `10:00 팀 주간 회의`. 새로고침(F5)하면 최신으로 표시 |
| 코드상 의도된 원인 | POP 복귀 시 목록 API 는 다시 호출되지만, 이전에 표시했던 카드 스냅샷(`viewSnapshots`)을 id 별로 덮어씀 (삭제/추가 같은 목록 구성은 서버 기준). `pageshow(persisted)` 복원도 스냅샷 사용 |
| 필요한 Evidence | ActionLog + UI + Network + State + DOM |
| Confirmation Oracle | `GET /api/events/1`·`/api/events/calendar` 응답(수정값) vs `[data-event-id="1"]` 카드 텍스트(수정 전) 불일치 |
| 새로고침 필요 여부 | 해소 확인용으로만 사용 (재현에는 불필요) |
| 뒤로가기 필요 여부 | 필요 (사이드바 링크로 캘린더를 다시 열면 PUSH 이므로 최신 표시) |
| Reset 이후 재현 방법 | Reset → 월간 → 일정 1 → 상세 → 수정/저장 → 뒤로가기 |
| DQN 기대 행동 | 수정 전/후 카드 텍스트와 API 응답 비교 |
| ERR04 와의 독립성 | 월간 화면은 카드 정보만 이전 값을 사용하고 목록 구성은 서버 기준 → 삭제 일정은 월간에서 사라진다. ERR04 는 주간 화면·일정 5 |

---

## B07-ERR04 — 뒤로가기 캐시의 삭제 일정 잔존

| 항목 | 내용 |
|---|---|
| bug_id | B07-ERR04 |
| CSV No | 1610 |
| CSV 오류명 | 백포워드 캐시 상태 박제 |
| 확인전략 | STATE_REVISIT |
| DQN_학습대상 | 조건부 |
| 화면 위치 | `/calendar/week` (주간 일정) |
| 관련 파일 | `frontend/src/pages/WeekPage.jsx`, `frontend/src/utils/viewSnapshots.js`, `frontend/src/pages/EventDetailPage.jsx` |
| data-bug-id selector | `[data-bug-id="B07-ERR04"]` (주간 그리드 `.week-grid`) |
| precondition | Reset 직후 `/calendar/week` (10/11~10/17 주). 일정 ID 5 `스터디 모임: 알고리즘`(10/16)이 표시 |
| trigger sequence | 주간 화면에서 일정 5 선택(카드 클릭) → "상세 페이지 열기" → "삭제" → 확인 모달에서 "삭제 확정" → (앱이 일간 화면으로 이동) → 브라우저 뒤로가기 |
| 저장 전 상태 | 주간 목록에 일정 5 카드 존재 |
| 작업 수행 후 상태 | `DELETE /api/events/5` 성공, `GET /api/events/5` → `deleted:true`, `/api/events/calendar?view=week` 에서 제외 |
| 화면 이동/재방문 방법 | 삭제 후 `/calendar/day?date=2026-10-16`(상세 이력은 replace) → **뒤로가기(필수)** → 주간 화면 |
| 정상 기대 동작 | 일정 5 카드가 주간 목록에서 사라짐 |
| 실제 오류 동작 | 일정 5 카드가 그대로 표시. 클릭해 상세로 가면 "삭제된 일정입니다" 표시. 새로고침하면 사라짐 |
| 코드상 의도된 원인 | POP 복귀 시 목록 API 를 호출하지 않고 이전 주간 목록 스냅샷을 그대로 사용 |
| 필요한 Evidence | ActionLog + UI + Network + State + DOM |
| Confirmation Oracle | 복귀 후 `[data-event-id="5"]` 존재 + Network 에 복귀 시 `/events/calendar` 요청 없음 + `GET /api/events/5` 가 `deleted:true` |
| 새로고침 필요 여부 | 해소 확인용 |
| 뒤로가기 필요 여부 | 필요 |
| Reset 이후 재현 방법 | Reset → 주간 → 일정 5 → 삭제 → 뒤로가기 |
| DQN 기대 행동 | 삭제 API 완료 후 복귀한 목록의 ID 집합과 서버 상태 비교 |
| ERR03 와의 독립성 | ERR03: 월간 · 일정 1 · 수정 값 잔존 / ERR04: 주간 · 일정 5 · 삭제 카드 잔존. 서로 다른 스냅샷 키(`month:*`, `week:*`) 사용 |

---

## B07-ERR05 — 오프라인 입력 데이터 휘발

| 항목 | 내용 |
|---|---|
| bug_id | B07-ERR05 |
| CSV No | 1797 |
| CSV 오류명 | 오프라인 입력 데이터 휘발 |
| 확인전략 | STATE_REVISIT |
| DQN_학습대상 | 조건부 |
| 화면 위치 | `/events/:id/notes` 일정 메모 화면 |
| 관련 파일 | `frontend/src/pages/NotesPage.jsx`, `frontend/src/context/AppContext.jsx` (오프라인 토글), `frontend/src/components/AppShell.jsx` |
| data-bug-id selector | `[data-bug-id="B07-ERR05"]` (새 메모 작성 카드) |
| precondition | Reset 직후. 상단 우측 스위치로 오프라인 모드 ON(localStorage `daynest.offline`) |
| trigger sequence | 오프라인 ON → `/events/9/notes` 진입 → "새 메모"에 `오프라인 테스트 메모` 입력(미저장) → 브라우저 새로고침(F5) → 같은 메모 화면 재진입 |
| 저장 전 상태 | 입력란에 `오프라인 테스트 메모`, "오프라인 · 서버 미저장" 칩, 저장 API 호출 없음(저장 클릭 시 안내 토스트) |
| 작업 수행 후 상태 | 새로고침 직후 오프라인 모드는 유지됨(스위치 ON) |
| 화면 이동/재방문 방법 | **새로고침(필수)** 후 동일 화면 |
| 정상 기대 동작 | 임시 저장소에서 입력 내용 복구 |
| 실제 오류 동작 | 입력란이 비어 있음. 서버의 기존 메모 2건은 정상 |
| 코드상 의도된 원인 | 메모 입력값을 `NotesPage` 의 `useState` 에만 보관하고 localStorage/sessionStorage 에 쓰지 않음 |
| 대조군 | `/tasks` 의 할 일 제목 입력은 `usePersistedText`(localStorage)를 사용 → 새로고침 후 복구됨. 온라인 상태의 메모 저장 API 는 정상 |
| 필요한 Evidence | ActionLog + UI + DOM + State |
| Confirmation Oracle | 새로고침 전 `textarea[name=noteBody]` 값 vs 재방문 후 값(빈 문자열); 두 시점에 `POST /events/9/notes` 요청이 없음 |
| 새로고침 필요 여부 | 필요 |
| 뒤로가기 필요 여부 | 불필요 |
| Reset 이후 재현 방법 | Reset(오프라인 해제됨) → 오프라인 ON → 메모 입력 → F5 |
| DQN 기대 행동 | 오프라인 입력 → 새로고침 → 입력값 소실을 확인 |
