# EventWave 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 **EventWave (D-10)** 행사 참가 신청 및 티켓팅 플랫폼에 설계된 5가지 의도적 기능 오류에 대한 상세 명세서입니다.  
본 환경은 **RAWD DQN Unseen Test 환경**으로, 기존 Training 사이트(구독, 가계부, 운동, 도서, 관리자, 주문, 환경설정, 협업, 반려동물)와 완전히 다른 행사/컨퍼런스 도메인 및 대형 배너, 카테고리 필터 바, 잔여 인원 프로그레스, 전자 티켓 패스 구조를 사용합니다.  
DQN 에이전트가 특정 DOM 선택자나 버튼명을 기계적으로 암기하지 않고, 상태 불일치를 검증하기 위한 탐색 행동(Action Replay, Sequence Replay, State Revisit)을 일반화하여 수행할 수 있는지 평가하는 것이 목적입니다.

---

## 1. BUG-D10-01: 특정 행사 참가 신청 취소 시 DB 미반영 오류

- **bug_id**: `BUG-D10-01`
- **오류명**: 특정 행사 신청(ID: 14, `EVT-REG-014`)의 [취소] 버튼을 클릭하면 취소 성공 안내가 노출되지만 실제 SQLite DB의 상태 업데이트가 생략되어 참가 신청 상태가 그대로 유지되는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 참가 신청**:
  - Registration ID: `14`
  - 발급번호: `EVT-REG-014`
  - 대상 행사: Event ID `11` (핸즈온 마이크로서비스 리팩토링 랩, `EVT-2026-011`)
  - 참석자: 고서진 (`seojin.ko@eventwave.io`, `010-4411-5522`)
  - 티켓: STANDARD (1명, 130,000원)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 14번 신청 건의 초기 상태는 `CONFIRMED` (참가 확정).
- **상태 전이 추적 (State Transition)**:
  - **작업 전 상태 (Before Action)**: `status = 'CONFIRMED'`
  - **수행 동작 (User Action)**: 14번 신청 카드의 [취소] 버튼 클릭 (`PATCH /api/registrations/14/cancel`)
  - **동작 직후 응답 (Immediate Response)**: `{ success: true, message: "참가 신청이 성공적으로 취소되었습니다.", data: { id: 14, status: "CANCELLED", db_persisted: false } }`
  - **액션 리플레이 / 재조회 후 상태 (Action Replay / Re-query)**: `status = 'CONFIRMED'` (DB UPDATE 미실행으로 인해 새로고침 또는 목록 재조회 시 여전히 초록색 '참가 확정' 배지 유지)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 네비게이션에서 [나의 참가권] (`passes`) 탭 클릭.
  2. 신청 내역 목록에서 발급번호 `EVT-REG-014` (고서진 / 핸즈온 마이크로서비스 리팩토링 랩) 카드를 탐색.
  3. 카드 우측 하단의 빨간색 [취소] 버튼 클릭 후 확인 팝업 승인.
  4. "참가 신청이 성공적으로 취소되었습니다" 알림 토스트 확인.
  5. 브라우저 새로고침(F5)을 누르거나 필터를 변경하여 참가권 목록을 다시 불러옴.
  6. `EVT-REG-014` 카드의 상태가 '취소됨'으로 바뀌지 않고 여전히 초록색 '참가 확정' 배지로 남아있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 새로고침 후 티켓 카드 상단 우측 배지가 초록색 `참가 확정`으로 유지되고 [참석자 수정], [연락처], [취소] 버튼이 활성 상태로 노출됨.
  - **DOM**: `div[data-reg-id="14"]` 내부의 배지 요소 클래스가 `status-confirmed`이며 텍스트가 `'참가 확정'`임.
  - **Network**: `GET /api/registrations` 호출 응답 내 `id: 14` 객체의 `status` 필드가 `'CONFIRMED'`.
  - **State**: SQLite `SELECT status FROM registrations WHERE id = 14` 조회 결과가 `'CONFIRMED'`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/registrations/:id/cancel` 라우터 내 `if (regId === 14)` 분기에서 DB 업데이트를 생략하는 예외 분기를 제거하고 표준 `UPDATE registrations SET status = 'CANCELLED' WHERE id = ?` 구문이 실행되도록 수정.

---

## 2. BUG-D10-02: 특정 참가 신청의 참석자 이름 수정 시 타 신청 참석자 이름 변조 오류

- **bug_id**: `BUG-D10-02`
- **오류명**: 특정 참가 신청(ID: 5, `EVT-REG-005`)의 참석자 이름을 수정하면 요청한 5번 건이 아닌 다른 참가 신청(ID: 2, `EVT-REG-002`)의 참석자 이름이 변경되는 왜곡 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 참가 신청**:
  - 수정 요청 대상: Registration ID `5` (최서윤 / `EVT-REG-005`, 디지털 프로덕트 UX/UI 디자인 위크)
  - 실제 변조 대상: Registration ID `2` (이도윤 / `EVT-REG-002`, AI 프론티어 컨퍼런스 2026)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 5번 신청의 초기 참석자 이름은 `'최서윤'`, 2번 신청의 초기 참석자 이름은 `'이도윤'`.
- **상태 전이 추적 (State Transition)**:
  - **정상 기대 동작 (Expected)**: 5번 신청의 참석자 이름이 수정한 이름(예: `'김수현'`)으로 변경되고, 2번 신청은 `'이도윤'` 유지.
  - **실제 이상 동작 (Actual)**: 5번 신청의 참석자 이름은 `'최서윤'` 그대로 유지되고, 2번 신청의 참석자 이름이 `'김수현'`으로 변조됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 네비게이션에서 [나의 참가권] (`passes`) 탭 클릭.
  2. `EVT-REG-005` (최서윤 / 디지털 프로덕트 UX/UI 디자인 위크) 카드의 [참석자 수정] 버튼 클릭.
  3. 참석자 성명 입력란의 값을 `최서윤`에서 `김수현`으로 변경 후 [변경사항 저장] 클릭 (`PATCH /api/registrations/5`).
  4. 목록이 갱신된 후, `EVT-REG-005` 카드의 참석자는 여전히 `최서윤`인 반면, `EVT-REG-002` 카드의 참석자 성명이 `이도윤`에서 `김수현`으로 잘못 변경되어 있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: `EVT-REG-005` 카드의 참석자 표시는 `최서윤`, `EVT-REG-002` 카드의 참석자 표시는 `김수현`.
  - **DOM**: `div[data-reg-id="5"]` 내 참석자 텍스트는 `최서윤`, `div[data-reg-id="2"]` 내 참석자 텍스트는 `김수현`.
  - **Network**: `GET /api/registrations` 응답 내 `id: 5`의 `attendee_name: "최서윤"`, `id: 2`의 `attendee_name: "김수현"`.
  - **State**: SQLite `SELECT id, attendee_name FROM registrations WHERE id IN (2, 5)` 쿼리 결과:
    - `id: 2 -> attendee_name = '김수현'`
    - `id: 5 -> attendee_name = '최서윤'`
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/registrations/:id` 라우터 내 `if (regId === 5 && attendeeName !== undefined)` 분기에서 `UPDATE registrations SET attendee_name = ? WHERE id = 2`로 하드코딩된 변조 로직을 삭제하고 요청 파라미터 `regId`를 대상으로 업데이트하도록 일원화.

---

## 3. BUG-D10-03: 다단계 참가 신청 시 선택한 참가권 유형 왜곡 저장 오류

- **bug_id**: `BUG-D10-03`
- **오류명**: 행사 검색 → 날짜 필터 → 특정 행사(Event ID: 3, '글로벌 AI 서밋 2026') 선택 → 참가권 선택(`'VIP'`) → 신청 완료 순서에서 선택한 VIP 패스가 아닌 `'STANDARD'`(일반 패스)로 왜곡되어 저장되는 다단계 시퀀스 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **트리거 시퀀스 (Sequential Condition)**:
  - 단계 1: [행사 탐색] 화면에서 검색 또는 스크롤을 통해 `글로벌 AI 서밋 2026` (Event ID: 3, `EVT-2026-003`) 카드 탐색
  - 단계 2: 카드의 [참가 신청] 버튼 클릭하여 신청 모달 진입
  - 단계 3: 1단계 [참가권 종류 선택]에서 `VIP 올액세스 패스` 카드 선택 (`ticketTier = 'VIP'`)
  - 단계 4: 인원(1명) 확인 후 [다음] 클릭
  - 단계 5: 2단계에서 참석자 정보 입력 후 3단계 최종 확인에서 [참가 신청 확정] 클릭
- **상태 전이 추적 (State Transition)**:
  - **사용자 선택 값 (User Input)**: `ticket_tier = 'VIP'`
  - **실제 저장된 값 (Persisted in DB)**: `ticket_tier = 'STANDARD'` (스탠다드 패스로 왜곡 저장)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. [행사 탐색] 탭에서 상단 검색창에 `글로벌 AI` 입력.
  2. 검색된 `글로벌 AI 서밋 2026` 카드의 [참가 신청] 버튼 클릭.
  3. 모달 1단계에서 [VIP 올액세스 패스 (320,000원)] 선택 후 [다음] 클릭.
  4. 2단계에서 참석자 기본 정보를 입력하고 3단계로 이동하여 [참가 신청 확정] 버튼 클릭 (`POST /api/registrations`).
  5. 자동으로 이동된 [나의 참가권] 화면에서 최상단에 생성된 신규 참가권 카드를 확인.
  6. 선택했던 `VIP PASS`가 아닌 `STANDARD PASS`로 잘못 저장 및 발급되어 있는 현상 확인. ([참가증] 상세 영수증 모달에서도 동일하게 확인됨)
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 신규 생성된 티켓 카드 내 참가권 정보에 `STANDARD PASS` 표기.
  - **DOM**: 바우처 카드 내 참가권 텍스트 노드에 `STANDARD` 포함.
  - **Network**: `POST /api/registrations` 요청 본문의 `ticketTier`는 `'VIP'`, 응답 JSON의 `ticket_tier`는 `'STANDARD'`.
  - **State**: SQLite `SELECT ticket_tier FROM registrations WHERE id = (SELECT MAX(id) FROM registrations)` 결과가 `'STANDARD'`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `POST /api/registrations` 라우터 내 `if (parseInt(eventId, 10) === 3 && ticketTier === 'VIP') { finalTicketTier = 'STANDARD'; }` 조작 코드를 제거하고 클라이언트가 전송한 `ticketTier`를 그대로 DB에 INSERT하도록 수정.

---

## 4. BUG-D10-04: 특정 카테고리 필터 하에서 다수 인원 신청 시 인원 수 누락 오류

- **bug_id**: `BUG-D10-04`
- **오류명**: 카테고리 'TECH' 필터 선택 상태에서 특정 행사(Event ID: 7, '클라우드 네이티브 아키텍처 데이')를 선택하고 참석 인원을 3명으로 신청 완료했을 때, DB에 최종 신청 인원이 3명이 아닌 `1명`으로 누락 저장되는 다단계 시퀀스 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **트리거 시퀀스 (Sequential Condition)**:
  - 단계 1: 상단 카테고리 필터 바에서 `💻 테크 & 인공지능` (TECH) 클릭
  - 단계 2: 필터링된 행사 목록 중 `클라우드 네이티브 아키텍처 데이` (Event ID: 7) 선택
  - 단계 3: 참가 신청 모달 1단계에서 참석 인원 수를 `3명`으로 변경
  - 단계 4: [다음] → [다음] → [참가 신청 확정] 클릭
- **상태 전이 추적 (State Transition)**:
  - **사용자 선택 값 (User Input)**: `attendee_count = 3`
  - **실제 저장된 값 (Persisted in DB)**: `attendee_count = 1` (1명으로 왜곡 저장)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. [행사 탐색] 화면 상단의 카테고리 목록에서 `💻 테크 & 인공지능` 버튼 클릭.
  2. `클라우드 네이티브 아키텍처 데이` 카드의 [참가 신청] 버튼 클릭.
  3. 1단계 모달의 [참석 인원 수] 드롭다운에서 `3명`을 선택 후 [다음] 클릭.
  4. 2단계 정보 입력 후 3단계에서 [참가 신청 확정] 버튼 클릭 (`POST /api/registrations`).
  5. [나의 참가권] 탭으로 이동하여 방금 발급된 참가권 카드를 확인.
  6. 3명으로 신청했던 내용이 참석자 옆 괄호에 `(1명)`으로 잘못 반영되어 있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 발급된 티켓 카드 내 참석자 정보에 `(1명)`으로 표시됨.
  - **DOM**: 바우처 카드 내 참석자 인원 텍스트에 `1명` 표기.
  - **Network**: `POST /api/registrations` 요청 본문의 `attendeeCount: 3`, 응답 JSON 내 `attendee_count: 1`.
  - **State**: SQLite `SELECT attendee_count FROM registrations WHERE id = (SELECT MAX(id) FROM registrations)` 결과가 `1`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `POST /api/registrations` 라우터 내 `if (isTechCat && parseInt(eventId, 10) === 7 && finalCount > 1) { finalCount = 1; }` 분기를 제거하고 요청받은 `attendeeCount`를 DB에 온전히 저장하도록 수정.

---

## 5. BUG-D10-05: 특정 참가 신청의 연락처 수정 후 재방문 시 이전 연락처 원복 오류

- **bug_id**: `BUG-D10-05`
- **오류명**: 특정 참가 신청(ID: 9, `EVT-REG-009`)의 참석자 연락처를 수정한 직후에는 저장 성공 토스트가 노출되지만, 실제 DB 저장이 생략되어 다른 탭 이동 후 재방문 시 원래 연락처로 되돌아오는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 참가 신청**:
  - Registration ID: `9`
  - 발급번호: `EVT-REG-009`
  - 행사: 핀테크 & 오픈뱅킹 혁신 서밋
  - 참석자: 한소율 (`010-8821-4192`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 9번 신청의 초기 `attendee_phone`: `'010-8821-4192'`.
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `attendee_phone = '010-8821-4192'`
  - **사용자 입력 값 (User Input Value)**: `'010-9999-8888'`
  - **저장 직후 값 (Post-Save Value in UI)**: 성공 토스트 알림 노출 및 일시 반영.
  - **재방문 후 값 (Revisit Value)**: 타 탭(행사 탐색) 이동 후 다시 [나의 참가권]으로 복귀했을 때, DB 재조회 결과 원래의 `'010-8821-4192'`로 복원됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 상단 네비게이션에서 [나의 참가권] (`passes`) 탭 클릭.
  2. `EVT-REG-009` (한소율 / 핀테크 & 오픈뱅킹 혁신 서밋) 카드의 [연락처] 버튼 클릭.
  3. 휴대폰 연락처 입력창에 `010-9999-8888` 입력 후 [연락처 저장] 클릭 (`PATCH /api/registrations/9/contact`).
  4. "참석자 연락처가 성공적으로 수정되었습니다" 토스트 알림을 확인하고 모달 닫힘.
  5. 상단 네비게이션에서 [행사 탐색] (`explore`) 탭을 클릭하여 다른 화면으로 이동.
  6. 다시 상단 네비게이션에서 [나의 참가권] (`passes`) 탭을 클릭하여 복귀.
  7. `EVT-REG-009` 카드의 연락처 정보를 확인했을 때, 방금 수정한 `010-9999-8888`이 사라지고 초기 번호인 `010-8821-4192`로 되돌아가 있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 재방문 후 `EVT-REG-009` 카드 내 연락처 표시가 초기 번호인 `010-8821-4192`.
  - **DOM**: `div[data-reg-id="9"]` 내부의 연락처 텍스트 노드가 `010-8821-4192`.
  - **Network**: 재방문 시 호출된 `GET /api/registrations` 응답 내 `id: 9` 객체의 `attendee_phone` 필드가 `'010-8821-4192'`.
  - **State**: SQLite `SELECT attendee_phone FROM registrations WHERE id = 9` 쿼리 결과가 `'010-8821-4192'`로 불변.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/registrations/:id/contact` 라우터 내 `if (regId === 9)` 블록에서 DB UPDATE를 실행하지 않고 조기 리턴하는 버그 분기를 삭제하고 표준 `UPDATE registrations SET attendee_phone = ? WHERE id = ?` 구문으로 처리하도록 수정.
