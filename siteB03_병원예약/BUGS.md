# BUGS.md — B-03 MediSlot 의도적 오류 명세

공통 사항
- 모든 오류는 **Frontend 코드에만** 존재한다. Backend API / SQLite 는 정상 동작한다.
- 확인전략: `ACTION_REPLAY` / 학습 구분: Training / DQN_학습대상: 예
- 테스트 환자: `patientId=1` (김하늘). 대상 예약 ID는 `POST /api/test/reset` 후에도 항상 동일하다.
- 대상 레코드가 아닌 예약·의사에서는 동일 동작이 정상 작동한다.
- 예약 URL: `http://localhost:5318/#/appointments/{예약ID}`
- 진단용 상태 노출: `window.__medislotState` (route, summary, appointments, unreadNotifications)

| bug_id | 대상 | CSV No |
|---|---|---|
| B03-ERR01 | 예약 #1 | 1646 |
| B03-ERR02 | 예약 #3 | 1755 |
| B03-ERR03 | 예약 #4 | 1648 |
| B03-ERR04 | 예약 #5 | 1972 |
| B03-ERR05 | 의사 #2 (병원 #1) | 2038 |

---

## B03-ERR01 — 예약 변경 버튼 무응답

- **bug_id**: B03-ERR01
- **CSV No**: 1646
- **CSV 오류명**: 응답 없는 클릭 (Freeze)
- **확인전략**: ACTION_REPLAY
- **DQN_학습대상**: 예
- **화면 위치**: 내 예약 > 예약 #1 상세 패널 > `예약 변경` 버튼
- **관련 파일**: `frontend/src/components/AppointmentDetail.jsx` (`openChange`)
- **data-bug-id selector**: `button[data-bug-id="B03-ERR01"]` (예약 #1 상세 패널에만 존재)
- **precondition**: 예약확정 상태의 예약 #1 상세 화면(`#/appointments/1`)을 연다.
- **trigger**: `예약 변경` 버튼 클릭.
- **정상 기대 동작**: 예약 변경 모달이 즉시 열리고 현재 예약 일시가 표시된다.
- **실제 오류 동작**: 클릭 핸들러가 약 3.5초간 메인 스레드를 동기 점유한다. 그동안 화면이 반응하지 않고 로딩 표시도 없다. 점유가 끝나도 모달은 열리지 않는다(클릭이 유실됨). 앱은 계속 사용 가능하며 다시 클릭하면 동일하게 재현된다.
- **코드상 의도된 원인**: `item.id === 1` 일 때 `performance.now()` 기준 3500ms 동안 동기 반복 계산 후 `return` (무한 루프 아님, 서버 지연 아님).
- **필요한 Evidence**: ActionLog + UI + DOM + State
- **Confirmation Oracle**: (1) 클릭 직후 3초 이상 입력/렌더 응답 없음(long task), (2) 이후 `[data-modal="change"]` 가 DOM에 없음, (3) 네트워크 요청 없음, (4) 예약 #2 에서 같은 버튼은 즉시 모달이 열림.
- **재현 방법**: `#/appointments/1` 이동 → `예약 변경` 클릭 → 화면 정지 → 정지 해제 후 모달 없음 확인.
- **Reset 이후 재현 가능 여부**: 가능 (예약 ID 고정).
- **DQN 기대 행동**: 예약 목록에서 #1 선택 → `예약 변경` 클릭 → 무응답/모달 미출현 관찰 후 오류로 판정. 비교용으로 #2 의 정상 동작을 확인할 수 있다.

---

## B03-ERR02 — 예약 수정 중 취소 경로 차단

- **bug_id**: B03-ERR02
- **CSV No**: 1755
- **CSV 오류명**: 수정 및 취소 경로 차단
- **확인전략**: ACTION_REPLAY
- **DQN_학습대상**: 예
- **화면 위치**: 내 예약 > 예약 #3 > `예약 정보 수정` 모달 (취소 버튼 / ✕ 아이콘)
- **관련 파일**: `frontend/src/components/AppointmentDetail.jsx` (`openEdit`, `dismissEdit`), `frontend/src/components/AppointmentModals.jsx` (`EditModal`), `frontend/src/components/common.jsx` (`Modal`)
- **data-bug-id selector**: `[data-modal="edit"][data-bug-id="B03-ERR02"]`, `[data-action="edit-cancel"][data-bug-id="B03-ERR02"]`, `[data-role="modal-close"][data-bug-id="B03-ERR02"]`
- **precondition**: 내 예약에서 예약 #3 을 선택한다.
- **trigger**: `예약 정보 수정` 클릭 → 모달에서 `취소` 클릭 (또는 ✕ / 배경 클릭 / Esc).
- **정상 기대 동작**: 저장하지 않고 모달이 닫혀 상세 화면으로 복귀한다.
- **실제 오류 동작**: 모달이 닫히지 않는다. ✕ 아이콘·배경·Esc 도 같은 핸들러를 사용해 동일하게 닫히지 않는다. 헤더 메뉴(홈/내 예약/알림 등)로 이동하면 모달이 사라지고 앱은 정상 사용 가능하다. `저장` 버튼은 정상 동작한다.
- **코드상 의도된 원인**: 모달을 열 때 보관한 시트 상태(`sheetAtOpen`)를 닫기 핸들러가 다시 `setSheet` 에 넘겨(동일 참조) 상태가 변하지 않음. `item.id === 3` 에만 적용.
- **필요한 Evidence**: ActionLog + UI + DOM + State
- **Confirmation Oracle**: `취소`/✕ 클릭 후에도 `[data-modal="edit"]` 가 DOM에 유지됨. 다른 예약(예: #2)에서는 같은 클릭 후 모달이 제거됨. 다른 모달(변경/취소 확인)의 닫기는 정상.
- **재현 방법**: `#/appointments/3` → `예약 정보 수정` → `취소` 클릭 → 모달 유지 확인 → ✕ 클릭 재확인.
- **Reset 이후 재현 가능 여부**: 가능.
- **DQN 기대 행동**: 수정 모달 오픈 후 취소/닫기를 시도하고 상태 변화 없음을 관찰, 이후 헤더 메뉴로 탈출.

---

## B03-ERR03 — 예약 취소 피드백 누락

- **bug_id**: B03-ERR03
- **CSV No**: 1648
- **CSV 오류명**: 성공/실패 피드백 부재
- **확인전략**: ACTION_REPLAY
- **DQN_학습대상**: 예
- **화면 위치**: 내 예약 > 예약 #4 상세 > `예약 취소` → 취소 확인 모달
- **관련 파일**: `frontend/src/pages/AppointmentsPage.jsx` (`afterCancel`)
- **data-bug-id selector**: `button[data-action="cancel"][data-bug-id="B03-ERR03"]`
- **precondition**: 예약확정 상태의 예약 #4 를 연다.
- **trigger**: `예약 취소` → 모달에서 `예약 취소 확정`.
- **정상 기대 동작**: 상태가 예약취소로 바뀌고 `예약이 취소되었습니다.` 토스트가 표시된다.
- **실제 오류 동작**: `POST /api/appointments/4/cancel` 이 200 으로 성공하고 목록/상세 배지는 예약취소로 바뀌지만, 취소 완료 토스트/안내가 나타나지 않는다. 다른 예약 취소·변경·확정·수정·예약 생성에서는 토스트가 정상 표시된다.
- **코드상 의도된 원인**: `afterCancel` 에서 `updated.id !== 4` 일 때만 `notify('success', ...)` 호출.
- **필요한 Evidence**: ActionLog + UI + Network + DOM
- **Confirmation Oracle**: cancel API 200 응답 + 상태 배지 `예약취소` + `.toast-stack` 에 `[data-toast]` 요소 없음. 예약 #15 취소 시에는 `[data-toast="success"]` 출현.
- **재현 방법**: `#/appointments/4` → 취소 확정 → 토스트 부재 확인.
- **Reset 이후 재현 가능 여부**: 가능 (#4 가 다시 예약확정으로 복원).
- **DQN 기대 행동**: 취소 절차 완료 후 성공 피드백 부재를 관찰. ERR04 와 다른 예약(#4)을 사용한다.

---

## B03-ERR04 — 예약 현황 요약 캐시 불일치

- **bug_id**: B03-ERR04
- **CSV No**: 1972
- **CSV 오류명**: 캐시 상태 불일치
- **확인전략**: ACTION_REPLAY
- **DQN_학습대상**: 예
- **화면 위치**: 내 예약 상단 예약 현황 요약 카드(예약확정 건수) + 예약 #5 취소
- **관련 파일**: `frontend/src/pages/AppointmentsPage.jsx` (`afterCancel`, `SummaryCards`), `frontend/src/hooks/useMyAppointments.js`
- **data-bug-id selector**: `.summary-card[data-status="예약확정"][data-bug-id="B03-ERR04"]`, `button[data-action="cancel"][data-bug-id="B03-ERR04"]` (예약 #5)
- **precondition**: `#/appointments` 에서 예약확정 건수를 기록한다(초기값 8; 예약 목록 기준 값).
- **trigger**: 예약확정 상태의 예약 #5 를 취소한다.
- **정상 기대 동작**: 목록 배지와 상단 예약확정 건수가 함께 갱신된다(8 → 7).
- **실제 오류 동작**: 목록의 #5 배지는 예약취소로 바뀌고 Backend 상태도 변경되지만 상단 요약 카드의 예약확정 건수는 이전 값(8)을 유지한다. 성공 토스트는 정상 표시된다. 새로고침 시 Backend 기준 값(7)으로 표시된다.
- **코드상 의도된 원인**: 목록 캐시(`patchList`)만 갱신하고 요약 캐시 동기화(`syncSummary`)를 `updated.id !== 5` 일 때만 호출.
- **필요한 Evidence**: ActionLog + UI + State + Network
- **Confirmation Oracle**: (1) 취소 API 200, (2) 목록 `[data-appointment-id="5"] .badge` = 예약취소, (3) 취소 후 `GET /api/appointments?patientId=1` 재조회 요청 없음, (4) `.summary-card[data-status="예약확정"] .summary-count` 값 불변, (5) `window.__medislotState.summary` 와 `appointments` 집계 불일치, (6) 새로고침 후 값 일치.
- **재현 방법**: `#/appointments/5` → 취소 확정 → 상단 카드 값 확인 → F5 → 값 변경 확인.
- **Reset 이후 재현 가능 여부**: 가능. ERR03(#4) 과 독립. (참고: 예약 #15 취소는 요약이 정상 갱신되는 비교 대조군)
- **DQN 기대 행동**: 취소 전후 요약 수치와 목록을 비교하고 불일치를 관찰한 뒤 새로고침으로 확인.

---

## B03-ERR05 — 진료 시간 더보기 후 스크롤 튐

- **bug_id**: B03-ERR05
- **CSV No**: 2038
- **CSV 오류명**: 스크롤 튐
- **확인전략**: ACTION_REPLAY
- **DQN_학습대상**: 예
- **화면 위치**: 병원 상세(`#/hospital/1`) > 두 번째 의사(의사 #2) 시간표의 `진료 시간 더보기`
- **관련 파일**: `frontend/src/components/DoctorCard.jsx` (`expanded` 효과)
- **data-bug-id selector**: `button[data-action="more-slots"][data-bug-id="B03-ERR05"]`
- **precondition**: `#/hospital/1` 을 열고 의사 #2 시간표가 보이도록 아래로 스크롤한다.
- **trigger**: 의사 #2 의 `진료 시간 더보기 (+10)` 클릭.
- **정상 기대 동작**: 숨겨진 슬롯이 펼쳐지고 스크롤 위치가 유지된다.
- **실제 오류 동작**: 슬롯(6 → 16개)은 정상 표시되지만 렌더 후 `window.scrollTo` 가 실행되어 페이지가 최상단(scrollY ≈ 0)으로 이동한다. 같은 병원의 다른 의사(#1, #3, #4) 및 다른 병원에서는 스크롤이 유지된다.
- **코드상 의도된 원인**: `doctor.id === 2` 일 때 확장 직후 효과에서 비어 있는 복원 오프셋(`lastOffset.current ?? 0`)으로 `scrollTo`.
- **필요한 Evidence**: ActionLog + UI + DOM + State
- **Confirmation Oracle**: 클릭 전 `scrollY > 0`, 클릭 후 `.slot` 개수 증가(6→16) 그리고 `scrollY` 가 0 근처로 변화. 의사 #3 에서 동일 동작 시 `scrollY` 유지.
- **재현 방법**: `#/hospital/1` → 의사 #2 카드까지 스크롤 → 더보기 클릭 → 최상단 이동 확인.
- **Reset 이후 재현 가능 여부**: 가능 (의사/슬롯 seed 고정).
- **DQN 기대 행동**: 스크롤 후 의사 #2 의 더보기 클릭, 슬롯 증가와 스크롤 위치 급변을 함께 관찰.

---

## 오류 간 독립성

| 오류 | 사용 예약/의사 | 다른 오류와의 간섭 |
|---|---|---|
| ERR01 | 예약 #1 | 없음 |
| ERR02 | 예약 #3 | 없음 |
| ERR03 | 예약 #4 | 요약은 정상 갱신 |
| ERR04 | 예약 #5 | 토스트는 정상 표시 |
| ERR05 | 의사 #2 | 없음 |

정상 대조군: 예약 #2(변경/수정 정상), 예약 #15(취소 시 토스트·요약 모두 정상), 예약 #6/#7(확정 상태), 예약 #8/#9(진료대기, `예약 확정` 가능).
