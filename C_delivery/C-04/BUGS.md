# C-04 Bug Catalog & Training Specification

- **Site ID**: `C-04`
- **Site Name**: `SupportHub (고객 문의/Ticket 관리 시스템)`
- **Strategy**: `ACTION_REPLAY`
- **Frontend**: React + Vite (`http://localhost:5176`)
- **Backend**: Express + SQLite (`http://localhost:5003`)
- **Reset API**: `POST http://localhost:5003/api/test/reset`

---

## 1. C-04-1431 — Premature Ticket Resolve

### Bug Information
- **bug_id**: `C-04-1431`
- **error_name**: `Premature Ticket Resolve (답변 미제출 조기 해결 오류)`
- **strategy**: `ACTION_REPLAY`

### Precondition
- 대상 문의: `#1042` (환불 요청 문의)
- 상태: `RECEIVED` (또는 `IN_PROGRESS`)

### Trigger
- 문의 상세 화면에서 **답변 작성 영역을 열거나(텍스트에어리어 포커스/열기)** 또는 **[임시저장]** 버튼을 클릭한다. (최종 [답변 등록] 버튼은 누르지 않음)

### Normal Behavior
- 단순 답변 입력창 오픈이나 임시저장은 문의의 상태를 `ANSWERED(답변완료)`로 변경해서는 안 됨.

### Actual Behavior (Intended Bug)
- 답변 입력창을 열거나 [임시저장]을 수행하는 즉시 `PUT /api/tickets/:id/status` (payload: `{ status: "ANSWERED" }`)가 백엔드로 전송되고 백엔드가 이를 저장하여 문의 상태가 즉시 `ANSWERED`로 조기 변경됨.

### Required Evidence
- **Network**: `PUT /api/tickets/1042/status` (`status="ANSWERED"`, 200 OK)
- **DOM**: 상단/목록의 상태 배지가 `답변완료(ANSWERED)`로 변경됨 (답변은 아직 0건/미등록 상태).

---

## 2. C-04-1686 — Answer Input Duplication

### Bug Information
- **bug_id**: `C-04-1686`
- **error_name**: `Answer Input Duplication (답변 문장 중복 저장 오류)`
- **strategy**: `ACTION_REPLAY`

### Precondition
- 대상 문의: `#1041` (로그인 문제 문의)

### Trigger
- 답변 작성란에 `"안녕하세요. 환불 요청을 확인했습니다."` 문장을 입력 후 **[답변 등록]** 버튼 클릭.

### Normal Behavior
- 작성한 문장이 1회만 정확히 DB에 저장되고 화면에 출력되어야 함.

### Actual Behavior (Intended Bug)
- 백엔드 저장 및 응답 처리 과정에서 마지막 입력 문장 segment가 중복 처리되어 DB에 2회 연속 저장됨:
  `"안녕하세요. 환불 요청을 확인했습니다.\n환불 요청을 확인했습니다."`

### Required Evidence
- **DOM**: 타임라인에 등록된 답변 텍스트 마지막 부분이 중복되어 표시됨.
- **Backend**: `replies` 테이블의 `content` 컬럼에 중복된 문장이 저장됨.

---

## 3. C-04-891 — Category Tab Filter Ignored

### Bug Information
- **bug_id**: `C-04-891`
- **error_name**: `Category Tab Filter Ignored (카테고리 탭 필터 요청 누락)`
- **strategy**: `ACTION_REPLAY`

### Trigger
- 목록 상단 카테고리 탭에서 **[환불 문의]** (REFUND) 탭을 클릭.

### Normal Behavior
- `GET /api/tickets?category=REFUND`로 요청을 전송하여 환불 문의만 목록에 필터링되어야 함.

### Actual Behavior (Intended Bug)
- 탭 버튼에는 `active` 클래스가 정상 반영되어 강조되지만, API 요청 파라미터에서 `category`가 누락된 채 `GET /api/tickets`로 요청되어 전체 카테고리 문의가 그대로 화면에 유지됨.

### Required Evidence
- **DOM**: [환불 문의] 탭에 `active` 클래스 존재.
- **Network**: `GET /api/tickets` 요청에 `category=REFUND` 파라미터가 누락됨.
- **DOM List**: 환불 문의 외에 계정, 배송, 결제 문의가 모두 함께 표시됨.

---

## 4. C-04-1856 — Modal Freeze on Close

### Bug Information
- **bug_id**: `C-04-1856`
- **error_name**: `Modal Freeze on Close (모달 닫힘 후 오버레이 잔존 클릭 차단)`
- **strategy**: `ACTION_REPLAY`

### Trigger
- 문의 상세 화면에서 **[답변 템플릿]** 버튼을 클릭하여 모달을 띄운 뒤, **[취소]** 버튼 또는 바깥 영역 클릭.

### Normal Behavior
- 모달 대화창과 배경 오버레이가 모두 DOM에서 언마운트되어 정상적으로 화면의 다른 버튼 클릭이 가능해야 함.

### Actual Behavior (Intended Bug)
- 모달 콘텐츠는 사라지지만 `modal-backdrop-overlay`가 DOM에 잔존하여 `position: fixed; inset: 0; pointer-events: auto; z-index: 9999;` 상태로 화면 전체의 클릭 인터랙션을 영구 차단함.

### Required Evidence
- **DOM**: `.modal-dialog-box`는 소멸되었으나 `.modal-backdrop-overlay`가 화면 전체를 덮고 있음.
- **Interaction**: 문의 목록 클릭, 탭 전환, 답변 작성 버튼 클릭 등의 이벤트가 차단됨.

---

## 5. C-04-896 — Generic Error on Long Reply

### Bug Information
- **bug_id**: `C-04-896`
- **error_name**: `Generic Error on Long Reply (1000자 초과 시 500 에러 및 내용 초기화)`
- **strategy**: `ACTION_REPLAY`

### Precondition
- 답변 최대 길이 1000자 설정.

### Trigger
- 답변 작성창에 **1001자 이상**의 긴 텍스트를 입력하고 **[답변 등록]** 버튼 클릭.

### Normal Behavior
- 클라이언트 또는 백엔드에서 400 Validation Error와 함께 "1000자 이내로 작성해 주세요"라는 안내를 띄우고 작성 중이던 텍스트는 보존되어야 함.

### Actual Behavior (Intended Bug)
- 백엔드에서 적절한 400 유효성 검사 대신 `500 Internal Server Error`를 반환하고, 프론트엔드는 500 에러 팝업을 띄우며 기존에 작성 중이던 텍스트에어리어 내용을 `""`로 초기화하여 작성 데이터를 유실시킴.

### Required Evidence
- **Network**: `POST /api/tickets/:id/replies` 응답 `500 Internal Server Error`
- **DOM**: 500 Server Error 모달 팝업 표시 및 textarea 값이 빈 값(`""`)으로 리셋됨.
