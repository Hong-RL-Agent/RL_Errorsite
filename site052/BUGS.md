# BUGS.md — site052 (SpaceMate)

This document contains the exact 5 intentional errors present in site052 for PPO agent evaluation.

---

### Bug 1: SEC-436
* **Bug ID**: SEC-436
* **Type**: UI State Inconsistency / Stale Slot Selection
* **Category**: UI State
* **Family**: dependent-state
* **Severity**: medium
* **Endpoint**: `/api/rooms/:id/availability`
* **Method**: GET
* **Condition**: 날짜를 선택하여 특정 시간 슬롯(예: 10:00)을 선택한 뒤, 다른 날짜로 변경했을 때
* **File**: `src/components/BookingPanel.jsx`, `server.js`
* **Location**: `handleDateChange` / `timeSlotsState`
* **Selector**: `.time-slot-btn.selected`, `.date-picker-input`
* **Symptom**: 날짜를 변경했음에도 이전 날짜에서 선택했던 시간 슬롯 선택 상태가 초기화되지 않고 새 날짜 UI에 그대로 남아 있음
* **Expected Behavior**: 날짜가 변경되면 시간 슬롯 선택 상태가 초기화되고 새로운 날짜의 예약 가능 여부에 따라 슬롯이 새로 계산되어야 함
* **PPO Expected Behavior**: PPO는 공간 상세 페이지에서 날짜를 선택하고 시간을 선택한 후 다른 날짜로 변경했을 때 이전 날짜의 선택 상태가 유지되는지 확인
* **Status**: Open
* **Example**: 9월 27일 선택 -> 10:00 슬롯 선택 -> 9월 28일로 변경 -> 9월 28일 화면에서도 10:00이 이미 선택된 상태로 렌더링됨
* **Cause**: 날짜 변경 이벤트 시 시간 선택 state(`selectedTime` / `selectedSlots`)를 리셋하지 않고 날짜 state만 갱신함

---

### Bug 2: SEC-437
* **Bug ID**: SEC-437
* **Type**: Modal ESC Key Stale Draft Retention
* **Category**: UI Interaction
* **Family**: modal-state
* **Severity**: medium
* **Endpoint**: `/api/bookings/:id/memo`
* **Method**: PATCH
* **Condition**: 예약 메모 수정 모달에서 텍스트를 수정한 뒤 저장을 누르지 않고 ESC 키를 눌러 닫았을 때
* **File**: `src/pages/MyBookings.jsx`, `server.js`
* **Location**: `handleKeyDown` (Escape) in EditMemoModal
* **Selector**: `.memo-edit-modal`, `textarea[name="memoDraft"]`
* **Symptom**: ESC 키로 모달을 닫은 후 다시 같은 모달을 열었을 때 취소했던 draft 텍스트가 초기화되지 않고 그대로 유지됨
* **Expected Behavior**: 모달이 ESC 키로 닫힐 때 변경 중이던 draft state는 버려지고 원본 데이터로 초기화되어야 함
* **PPO Expected Behavior**: 예약 상세에서 메모 수정 버튼 클릭 -> 텍스트 수정 -> ESC 입력 -> 다시 메모 수정 클릭 -> 이전 draft 텍스트 잔존 확인
* **Status**: Open
* **Example**: "팀 회의 준비" -> "고객 미팅 준비"로 타이핑 후 ESC -> 다시 열면 "고객 미팅 준비"가 남아 있음
* **Cause**: ESC 키 바인딩 핸들러에서 모달 `isOpen` 상태만 `false`로 바꾸고 `draftMemo` state를 원본 데이터(`booking.memo`)로 복원하지 않음

---

### Bug 3: SEC-438
* **Bug ID**: SEC-438
* **Type**: Optimistic UI Rollback Failure
* **Category**: Async UI
* **Family**: optimistic-update
* **Severity**: medium
* **Endpoint**: `/api/favorites`, `/api/favorites/:roomId`
* **Method**: POST / DELETE
* **Condition**: `roomId === "room-018"` 공간에 대해 즐겨찾기 토글 시 서버가 500 에러를 반환할 때
* **File**: `src/components/RoomCard.jsx`, `src/pages/Rooms.jsx`, `server.js`
* **Location**: `toggleFavorite` async catch block
* **Selector**: `.favorite-btn[data-room-id="room-018"]`
* **Symptom**: 서버 요청이 실패했음에도 optimistic UI로 변경된 하트(♥) 상태가 이전 상태(♡)로 롤백되지 않고 화면상에만 즐겨찾기된 것처럼 표시됨
* **Expected Behavior**: 서버 요청 실패 시 이전 상태로 UI를 롤백하고 사용자에게 알림을 표시해야 함
* **PPO Expected Behavior**: 공간 목록에서 `room-018` 공간의 즐겨찾기 클릭 -> 500 에러 응답 수신 -> UI 하트 상태와 서버 실제 즐겨찾기 목록 간 불일치 탐지
* **Status**: Open
* **Example**: 합정 센터 `Creator Atelier 02` (room-018) 즐겨찾기 클릭 -> 서버 500 반환 -> 화면은 ♥ 유지, 서버 데이터는 미반영
* **Cause**: optimistic update 적용 후 `try-catch`의 `catch` 블록에서 이전 `favorites` 상태로의 복구 로직이 누락됨

---

### Bug 4: SEC-439
* **Bug ID**: SEC-439
* **Type**: CSV Export Column & Header Mismatch
* **Category**: Export
* **Family**: schema-mismatch
* **Severity**: medium
* **Endpoint**: `/api/bookings/export`
* **Method**: GET
* **Condition**: 예약 내역 페이지에서 "예약 내역 다운로드(CSV)" 버튼을 클릭하여 파일을 생성할 때
* **File**: `server.js`, `src/pages/MyBookings.jsx`
* **Location**: `GET /api/bookings/export`
* **Selector**: `.download-csv-btn`
* **Symptom**: CSV 헤더는 `[예약번호,공간명,지점,날짜,시작시간,종료시간,인원,상태]` 순서이나, 실제 데이터 로우에서는 `시작시간`과 `종료시간`, 그리고 `인원`과 `상태` 컬럼이 서로 뒤바뀌어 출력됨
* **Expected Behavior**: CSV 헤더 순서와 실제 행(row)의 필드 매핑 순서가 1:1로 정확하게 일치해야 함
* **PPO Expected Behavior**: 예약 내역 페이지에서 CSV 다운로드 실행 -> 다운로드된 파일의 헤더와 행 데이터를 파싱하여 컬럼 불일치 검증
* **Status**: Open
* **Example**: 헤더 `시작시간` 컬럼 위치에 `12:00`(종료시간)이 들어가고 `인원` 위치에 `"예약 예정"` 문자열이 들어감
* **Cause**: CSV 행 생성 매핑 배열에서 컬럼 인덱스 매핑 순서가 잘못 지정됨

---

### Bug 5: SEC-440
* **Bug ID**: SEC-440
* **Type**: Checkbox Group Deselect All Ghost Filter State
* **Category**: Form Control
* **Family**: checkbox-group-state
* **Severity**: medium
* **Endpoint**: `/api/rooms`
* **Method**: GET
* **Condition**: 공간 찾기 화면에서 시설 필터 "전체 선택" 후 "전체 해제"를 클릭하여 검색할 때
* **File**: `src/pages/Rooms.jsx`, `server.js`
* **Location**: `handleDeselectAllFacilities`
* **Selector**: `.filter-facility-checkbox`, `.facility-deselect-all-btn`
* **Symptom**: 체크박스 UI는 모두 해제된 빈 상자로 표시되지만 내부 검색 state에는 특정 항목('화상회의')이 여전히 포함되어 있어 실제 검색 결과가 잘못 필터링됨
* **Expected Behavior**: 전체 해제 버튼을 누르면 체크박스 UI와 내부 필터 배열이 모두 빈 배열(`[]`)로 완전 초기화되어 모든 공간이 검색되어야 함
* **PPO Expected Behavior**: 공간 목록 페이지 -> 시설 필터 전체 선택 -> 전체 해제 -> 공간 검색 -> 화면 UI와 실제 쿼리 파라미터/결과 불일치 검증
* **Status**: Open
* **Example**: 전체 해제 후 모든 체크박스가 체크 해제되어 보이지만 목록에는 '화상회의' 시설이 있는 룸만 한정되어 노출됨
* **Cause**: 전체 해제 핸들러에서 UI 상태만 빈 Set으로 갱신하고 필터 쿼리 state에서 마지막 항목을 지우지 않고 잔존시킴
