# PawCare 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 **PawCare (D-09)** 반려동물 예약 및 케어 플랫폼에 설계된 5가지 의도적 기능 오류에 대한 상세 명세서입니다.  
본 사이트는 **RAWD DQN Unseen Test 사이트**로서, 기존의 학습용 사이트(구독/가계부/운동/관리자)와 완전히 차별화된 도메인 및 카드/캘린더/위자드 DOM 구조를 기반으로 구성되었으며, DQN 에이전트의 일반화된 오류 탐지 및 검증 행동(Action Replay, Sequence Replay, State Revisit) 성능을 평가할 수 있도록 구현되었습니다.

---

## 1. BUG-D09-01: 특정 예약 취소 시 취소 성공 응답 반환 후 DB 미반영 오류

- **bug_id**: `BUG-D09-01`
- **오류명**: 특정 예약(ID: 12, `PAW-2026-012`)에 대해 [취소] 버튼을 클릭하면 취소 성공 안내가 노출되지만 실제 SQLite DB의 상태 업데이트가 생략되어 예약이 그대로 유지되는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 예약**:
  - Reservation ID: `12`
  - Booking Code: `PAW-2026-012`
  - 보호자: 정현우 (User ID: 4)
  - 반려동물: 모찌 (Pet ID: 8, 페르시안 고양이)
  - 서비스: 아로마 스파 & 버블 목욕 (Service ID: 4)
  - 예약 일시: `2026-10-19 14:00`
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 예약 12번의 초기 상태는 `CONFIRMED` (예약 확정).
- **상태 전이 추적 (State Transition)**:
  - **작업 전 상태 (Before Action)**: `status = 'CONFIRMED'`
  - **수행 동작 (User Action)**: 예약 12번의 [취소] 버튼 클릭 (`PATCH /api/reservations/12/cancel`)
  - **동작 직후 응답 (Immediate Response)**: `{ success: true, message: "예약이 성공적으로 취소되었습니다.", data: { id: 12, status: "CANCELLED", db_persisted: false } }`
  - **액션 리플레이 / 재조회 후 상태 (Action Replay / Re-query)**: `status = 'CONFIRMED'` (DB UPDATE 미실행으로 인해 새로고침 또는 목록 재조회 시 여전히 '예약 확정' 배지 유지)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 네비게이션에서 [예약 내역서] (`reservations`) 탭 선택.
  2. 예약 목록에서 `PAW-2026-012` (모찌 / 아로마 스파 & 버블 목욕) 바우처 카드를 탐색.
  3. 카드 하단 우측의 빨간색 [취소] 버튼 클릭 후 확인 팝업 승인.
  4. "예약이 취소되었습니다" 토스트 알림 확인.
  5. 브라우저 새로고침(F5)을 누르거나 필터를 변경하여 예약 목록을 다시 불러옴.
  6. `PAW-2026-012` 카드의 상태가 '예약 취소'로 바뀌지 않고 여전히 초록색 '예약 확정' 배지로 남아있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 새로고침 후 바우처 카드 우측 상단 배지가 초록색 `예약 확정`으로 유지되고 [일정 변경], [취소] 버튼이 활성 상태로 노출됨.
  - **DOM**: `div[data-reservation-id="12"]` 내의 배지 요소 클래스가 `status-confirmed`이며 텍스트가 `'예약 확정'`임.
  - **Network**: `GET /api/reservations` 호출 응답 내 `id: 12` 객체의 `status` 필드가 `'CONFIRMED'`.
  - **State**: SQLite `SELECT status FROM reservations WHERE id = 12` 조회 결과가 `'CONFIRMED'`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/reservations/:id/cancel` 라우터 내 `if (resId === 12)` 분기에서 DB 업데이트를 생략하는 예외 코드를 제거하고 표준 `UPDATE reservations SET status = 'CANCELLED' WHERE id = ?` 구문이 실행되도록 수정.

---

## 2. BUG-D09-02: 특정 반려동물 체중 수정 시 다른 반려동물 체중 변조 오류

- **bug_id**: `BUG-D09-02`
- **오류명**: 특정 반려동물(Pet ID: 4, '초코')의 체중을 수정하면 요청한 4번 동물이 아닌 다른 반려동물(Pet ID: 2, '보리')의 체중 데이터가 변경되는 왜곡 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 반려동물**:
  - 수정 요청 대상: Pet ID `4` ('초코', 푸들, 초기 체중 5.2kg)
  - 실제 변조 대상: Pet ID `2` ('보리', 포메라니안, 초기 체중 3.8kg)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 4번 초코의 체중은 5.2kg, 2번 보리의 체중은 3.8kg.
- **상태 전이 추적 (State Transition)**:
  - **정상 기대 동작 (Expected)**: 4번 초코의 체중이 5.8kg로 변경되고, 2번 보리는 3.8kg 유지.
  - **실제 이상 동작 (Actual)**: 4번 초코의 체중은 5.2kg 그대로 유지되고, 2번 보리의 체중이 5.8kg로 변경됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 보호자 셀렉트박스에서 `박준호 보호자님` (User ID: 2) 선택.
  2. [마이 펫룸] 화면에서 초코(푸들, 5.2kg) 카드의 [프로필 수정] 버튼 클릭.
  3. 현재 체중 입력란의 값을 `5.2`에서 `5.8`로 변경 후 [변경사항 저장] 클릭 (`PATCH /api/pets/4`).
  4. 상단 보호자를 `이민지 보호자님` (User ID: 1)으로 전환하거나 [전체 둘러보기] 필터 클릭.
  5. 2번 보리(포메라니안) 카드의 체중이 원래 3.8kg에서 5.8kg로 잘못 변경되어 있고, 4번 초코 카드의 체중은 여전히 5.2kg로 남아있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 4번 초코 카드의 체중 표시는 `5.2 kg`, 2번 보리 카드의 체중 표시는 `5.8 kg`.
  - **DOM**: `div[data-pet-id="4"]` 내 체중 텍스트는 `5.2 kg`, `div[data-pet-id="2"]` 내 체중 텍스트는 `5.8 kg`.
  - **Network**: `GET /api/pets` 응답 내 `id: 4`의 `weight: 5.2`, `id: 2`의 `weight: 5.8`.
  - **State**: SQLite `SELECT id, name, weight FROM pets WHERE id IN (2, 4)` 쿼리 결과:
    - `id: 2 -> weight = 5.8`
    - `id: 4 -> weight = 5.2`
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/pets/:id` 라우터 내 `if (petId === 4 && weight !== undefined)` 분기에서 `UPDATE pets SET weight = ? WHERE id = 2`로 하드코딩된 대상 변조 로직을 삭제하고 요청 파라미터 `petId`를 대상으로 업데이트하도록 수정.

---

## 3. BUG-D09-03: 다단계 예약 신청 시 최종 예약 시간 슬롯 왜곡 저장 오류

- **bug_id**: `BUG-D09-03`
- **오류명**: 서비스 선택 → 반려동물 선택 → 날짜 선택 → 시간대 선택 → 예약 확인 순서로 예약 신청 시, 특정 서비스와 특정 시간대를 선택한 경우 DB에 다른 시간대로 왜곡되어 저장되는 다단계 시퀀스 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **트리거 시퀀스 (Sequential Condition)**:
  - 단계 1: [예약하기] 위자드 진입 후 1단계에서 [펫 호텔 디럭스 스위트] (Service ID: 2) 선택
  - 단계 2: 2단계에서 반려동물 선택
  - 단계 3: 3단계에서 임의의 날짜(예: 2026-10-25) 선택
  - 단계 4: 3단계 시간대에서 `14:00` 칩 선택
  - 단계 5: 4단계 견적 확인 후 [예약 확정하기] 클릭
- **상태 전이 추적 (State Transition)**:
  - **사용자 선택 값 (User Input)**: `time_slot = '14:00'`
  - **실제 저장된 값 (Persisted in DB)**: `time_slot = '16:30'` (2시간 30분 뒤 슬롯으로 왜곡 저장)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 메뉴에서 [예약하기] (`booking`) 탭 클릭.
  2. 1단계 [서비스 선택]에서 `🏨 펫 호텔 디럭스 스위트` 카드 선택 후 [다음] 클릭.
  3. 2단계 [반려동물 선택]에서 등록된 반려동물 카드 선택 후 [다음] 클릭.
  4. 3단계 [날짜 및 시간]에서 달력 날짜를 클릭하고, 시간대 목록에서 `14:00` 칩을 선택 후 [다음] 클릭.
  5. 4단계 [견적 & 확인]에서 [예약 확정하기] 버튼 클릭 (`POST /api/reservations`).
  6. 자동으로 이동된 [예약 내역서] 화면에서 방금 생성된 예약 바우처의 일시를 확인.
  7. 선택했던 '14:00'이 아니라 '16:30'으로 잘못 예약되어 있음을 확인. (영수증 보기 클릭 시에도 16:30으로 표기됨)
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 생성된 예약 카드 및 영수증 모달의 예약 일정 란에 `16:30` 표기.
  - **DOM**: 바우처 카드 내 예약 일정 텍스트 노드에 `16:30` 포함.
  - **Network**: `POST /api/reservations` 요청 본문의 `timeSlot`은 `'14:00'`, 반환된 응답 데이터 `time_slot`은 `'16:30'`.
  - **State**: SQLite `SELECT time_slot FROM reservations WHERE id = (SELECT MAX(id) FROM reservations)` 조회 결과가 `'16:30'`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `POST /api/reservations` 라우터 내 `if (parseInt(serviceId, 10) === 2 && timeSlot === '14:00') { finalTimeSlot = '16:30'; }` 임의 조작 코드를 제거하고 클라이언트가 전달한 `timeSlot`을 그대로 DB에 INSERT하도록 수정.

---

## 4. BUG-D09-04: 특정 서비스 필터 하에서 날짜 변경 시 다른 예약 날짜 변조 오류

- **bug_id**: `BUG-D09-04`
- **오류명**: 예약 내역에서 특정 서비스(아로마 스파&목욕, SPA) 필터를 적용한 후 예약 16번의 일정을 변경하면, 16번 예약 대신 이전 예약 11번의 날짜가 변경되는 다단계 시퀀스 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **트리거 시퀀스 (Sequential Condition)**:
  - 단계 1: [예약 내역서] 화면 진입
  - 단계 2: 서비스 드롭다운 필터에서 `🛁 아로마 스파&목욕` (SPA) 선택
  - 단계 3: 필터링된 목록 중 `PAW-2026-016` (Reservation ID: 16) 카드의 [일정 변경] 클릭
  - 단계 4: 변경할 날짜(예: `2026-10-31`) 선택 후 [일정 변경 확정] 클릭
- **상태 전이 추적 (State Transition)**:
  - **정상 기대 동작 (Expected)**: 16번 예약의 날짜가 `2026-10-31`로 변경되고, 11번 예약은 `2026-10-18` 유지.
  - **실제 이상 동작 (Actual)**: 16번 예약의 날짜는 기존 `2026-10-22`로 불변이며, 11번 예약의 날짜가 `2026-10-31`로 변조됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 네비게이션에서 [예약 내역서] (`reservations`) 탭 선택.
  2. 필터 툴바의 서비스 선택 드롭다운에서 `🛁 아로마 스파&목욕` 필터 선택.
  3. 화면에 나타난 스파 예약 목록 중 `PAW-2026-016` (뭉치 / 2026-10-22 10:00) 카드의 [일정 변경] 버튼 클릭.
  4. 모달에서 새 예약 날짜를 `2026-10-31`로 지정하고 [일정 변경 확정] 클릭 (`PATCH /api/reservations/16/reschedule`).
  5. 필터를 [모든 서비스]로 해제한 뒤 전체 예약 목록을 확인.
  6. 변경 요청한 `PAW-2026-016`의 날짜는 여전히 `2026-10-22`인 반면, `PAW-2026-011` 예약의 날짜가 `2026-10-18`에서 `2026-10-31`로 잘못 변경되어 있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: `PAW-2026-016` 카드의 날짜 표시는 `2026-10-22`, `PAW-2026-011` 카드의 날짜 표시는 `2026-10-31`.
  - **DOM**: `div[data-reservation-id="16"]` 내 날짜 텍스트는 `2026-10-22`, `div[data-reservation-id="11"]` 내 날짜 텍스트는 `2026-10-31`.
  - **Network**: `PATCH /api/reservations/16/reschedule` 응답 데이터 내 `{ requested_reservation_id: 16, affected_reservation_id: 11 }`.
  - **State**: SQLite `SELECT id, booking_code, booking_date FROM reservations WHERE id IN (11, 16)` 조회 결과:
    - `id: 11 -> booking_date = '2026-10-31'`
    - `id: 16 -> booking_date = '2026-10-22'`
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/reservations/:id/reschedule` 라우터 내 `if (isSpaCategory && isTarget16)` 분기에서 `UPDATE reservations SET ... WHERE id = 11`로 실행되는 하드코딩을 제거하고 항상 타깃 `resId`에 대해 날짜를 업데이트하도록 수정.

---

## 5. BUG-D09-05: 특정 반려동물 돌봄 주의사항 변경 후 재방문 시 원복 오류

- **bug_id**: `BUG-D09-05`
- **오류명**: 특정 반려동물(Pet ID: 7, '뭉치')의 돌봄 주의사항을 수정한 직후에는 저장 성공 토스트가 노출되지만, 실제 DB 저장이 누락되어 다른 탭 이동 후 재방문 시 원래 주의사항으로 되돌아오는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 반려동물**:
  - Pet ID: `7`
  - 이름: 뭉치 (비숑 프리제, 남아, 4.3kg)
  - 소속 보호자: 정현우 (User ID: 4)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 7번 뭉치의 초기 `care_notes`: `"귀가 예민하여 귀 청소 시 천천히 진행 필요."`
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `care_notes = "귀가 예민하여 귀 청소 시 천천히 진행 필요."`
  - **사용자 입력 값 (User Input Value)**: `"닭고기 알러지 있음, 건식 사료만 급여 요망"`
  - **저장 직후 값 (Post-Save Value in UI)**: 성공 토스트 알림 노출 및 임시 반영.
  - **재방문 후 값 (Revisit Value)**: 타 탭(예약하기 또는 예약내역) 이동 후 다시 [마이 펫룸]으로 복귀했을 때, DB 재조회 결과 원래의 `"귀가 예민하여 귀 청소 시 천천히 진행 필요."`로 복원됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 보호자 드롭다운에서 `정현우 보호자님` (User ID: 4) 선택.
  2. [마이 펫룸] 탭에서 7번 뭉치 카드의 [주의사항 변경] 버튼 클릭.
  3. 돌봄 주의사항 입력창에 `"닭고기 알러지 있음, 건식 사료만 급여 요망"` 입력 후 [주의사항 저장] 클릭 (`PATCH /api/pets/7/care-notes`).
  4. "돌봄 주의사항이 저장되었습니다" 토스트 알림을 확인하고 모달 닫힘.
  5. 상단 네비게이션에서 [서비스 안내] (`services`) 또는 [예약 내역서] (`reservations`) 탭을 클릭하여 다른 화면으로 이동.
  6. 다시 상단 네비게이션에서 [마이 펫룸] (`pets`) 탭을 클릭하여 복귀.
  7. 7번 뭉치 카드의 [돌봄 주의사항] 박스를 확인했을 때, 방금 수정한 내용이 사라지고 초기 문구인 `"귀가 예민하여 귀 청소 시 천천히 진행 필요."`로 되돌아가 있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 재방문 후 뭉치 카드의 빨간색 돌봄 주의사항 영역에 `"귀가 예민하여 귀 청소 시 천천히 진행 필요."`가 렌더링됨.
  - **DOM**: `div[data-pet-id="7"]` 내부의 `.care-notes-box` 텍스트에 초기 주의사항 문구가 포함되어 있음.
  - **Network**: 재방문 시 호출된 `GET /api/pets` 응답 내 `id: 7` 객체의 `care_notes` 필드가 초기 값으로 내려옴.
  - **State**: SQLite `SELECT care_notes FROM pets WHERE id = 7` 쿼리 결과가 `"귀가 예민하여 귀 청소 시 천천히 진행 필요."`로 불변.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/pets/:id/care-notes` 라우터 내 `if (petId === 7)` 블록에서 DB UPDATE를 실행하지 않고 조기 리턴하는 버그 분기를 삭제하고 표준 `UPDATE pets SET care_notes = ? WHERE id = ?` 구문으로 처리하도록 수정.
