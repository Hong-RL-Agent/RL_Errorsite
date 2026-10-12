# SubFlow 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 SubFlow (D-01) SaaS 구독 관리 웹사이트에 의도적으로 삽입된 5가지 기능 오류에 대한 명세서입니다.  
모든 오류의 검증 확인전략은 **ACTION_REPLAY**이며, 각 오류마다 하나의 명확한 사용자 행동(User Trigger Action)을 실행하고 그 전후 상태(Before/After State)를 비교하여 결정적으로 재현 및 검증할 수 있습니다.

---

## 1. BUG-D01-01: 특정 구독 상품 해지 후에도 활성 상태 유지 오류

- **bug_id**: `BUG-D01-01`
- **오류명**: 특정 구독 상품(Slack) 해지 확인 후에도 활성 상태(ACTIVE) 유지 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 상품**: `Slack` (구독 ID: `2`)
- **UI 클릭 위치**: 
  1. 좌측 메뉴 [내 구독 관리] 또는 [대시보드] 진입
  2. `Slack` 행의 [상세 관리] 버튼 클릭
  3. 상세 모달 하단 영역 [구독 해지] 버튼 클릭
  4. '구독 계약 해지 확인' 팝업에서 [해지 확인] 버튼 클릭
- **Precondition (사전조건)**:
  - 시스템 초기 상태(POST `/api/test/reset` 완료 상태).
  - 구독 ID `2` (`Slack`)의 상태가 `ACTIVE`이어야 함.
- **Trigger (사용자 행동)**:
  - `Slack` 상세 모달의 해지 확인 팝업에서 [해지 확인] 버튼 1회 클릭 (`POST /api/subscriptions/2/cancel`).
- **정상 동작 (Expected Behavior)**:
  - 해지 요청 완료 후 구독 목록에서 `Slack`의 상태 배지가 `해지됨 (CANCELLED)`으로 갱신되어야 함.
  - 활성 구독 수(Active count)가 1 감소해야 함.
- **실제 오류 동작 (Actual Defect Behavior)**:
  - "구독 해지가 성공적으로 접수되었습니다"라는 성공 토스트와 함께 모달이 정상 종료되지만, 데이터베이스 및 API 응답 상의 `status`가 여전히 `ACTIVE`로 유지됨.
  - 구독 목록 화면 재조회 후에도 `Slack`의 상태가 계속 `활성 (ACTIVE)`으로 표시됨.
- **필요한 Evidence (증거 데이터)**:
  - 해지 전/후 `GET /api/subscriptions` 응답의 `id: 2` 항목의 `status` 필드 비교 (`ACTIVE` -> `ACTIVE` 유지).
  - 화면 상 `Slack`의 상태 배지가 `활성`으로 유지되는 UI 캡처/DOM 상태.
- **확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 호출로 초기화.
  2. `GET /api/subscriptions`를 호출하여 `id: 2`의 `status`가 `"ACTIVE"`인지 확인.
  3. UI에서 `Slack`의 [상세 관리] -> [구독 해지] -> [해지 확인] 클릭.
  4. 해지 후 목록에서 `Slack`의 상태가 여전히 `활성`인지 확인.
  5. `GET /api/subscriptions`를 다시 호출하여 `id: 2`의 `status`가 여전히 `"ACTIVE"`로 반환되는지 확인.

---

## 2. BUG-D01-02: 특정 구독 상품 요금제 변경 미반영 오류

- **bug_id**: `BUG-D01-02`
- **오류명**: 특정 구독 상품(Notion)의 상위 요금제 업그레이드 시 성공 알림 후 기존 요금제 유지 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 상품**: `Notion` (구독 ID: `1`)
- **UI 클릭 위치**:
  1. 좌측 메뉴 [내 구독 관리] 진입
  2. `Notion` 행의 [상세 관리] 버튼 클릭
  3. 상세 모달 내 [요금제 선택] 드롭다운에서 `Business` 선택
  4. 바로 아래 [요금제 변경사항 저장] 버튼 클릭
- **Precondition (사전조건)**:
  - 시스템 초기 상태(POST `/api/test/reset` 완료 상태).
  - 구독 ID `1` (`Notion`)의 현재 플랜이 `Plus`이어야 함.
- **Trigger (사용자 행동)**:
  - 요금제 선택을 `Business`로 변경 후 [요금제 변경사항 저장] 버튼 1회 클릭 (`PATCH /api/subscriptions/1/plan`).
- **정상 동작 (Expected Behavior)**:
  - 저장 완료 후 `Notion`의 플랜이 `Business`로 영구 저장되고 화면과 API 재조회 시 `Business` 플랜으로 변경되어야 함.
- **실제 오류 동작 (Actual Defect Behavior)**:
  - "Plan upgraded successfully to Business" 성공 토스트 메시지가 화면에 노출되지만, 백엔드 데이터베이스에 실제 업데이트가 누락되어 기존 플랜(`Plus`)이 그대로 유지됨.
  - 모달을 다시 열거나 목록을 새로고침하면 플랜이 여전히 `Plus`로 표시됨.
- **필요한 Evidence (증거 데이터)**:
  - 요금제 변경 요청 직후 `GET /api/subscriptions` 응답의 `id: 1` 항목의 `plan_name` 확인 (`Plus`로 잔류).
- **확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 호출.
  2. `GET /api/subscriptions` 호출하여 `id: 1`의 `plan_name`이 `"Plus"`인지 확인.
  3. UI에서 `Notion` [상세 관리] 클릭 후 드롭다운에서 `Business` 선택 후 [요금제 변경사항 저장] 클릭.
  4. 성공 메시지 확인 후, 모달을 닫았다가 다시 열거나 목록을 확인했을 때 `plan_name`이 여전히 `"Plus"`인지 확인.

---

## 3. BUG-D01-03: 특정 구독 상품 자동결제 해제 시 프론트엔드 스위치 UI 불일치 오류

- **bug_id**: `BUG-D01-03`
- **오류명**: 특정 구독 상품(GitHub Copilot) 자동결제 OFF 설정 시 백엔드 저장 정상이나 프론트엔드 스위치 ON 유지 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 상품**: `GitHub Copilot` (구독 ID: `3`)
- **UI 클릭 위치**:
  - [내 구독 관리] 화면의 `GitHub Copilot` 행의 [자동 결제 갱신] 토글 스위치 (또는 상세 관리 모달 내 토글 스위치)
- **Precondition (사전조건)**:
  - 시스템 초기 상태(POST `/api/test/reset` 완료 상태).
  - `GitHub Copilot`의 자동 결제 스위치가 `ON` 상태이어야 함 (`auto_renew: 1`).
- **Trigger (사용자 행동)**:
  - `GitHub Copilot`의 자동 결제 토글 스위치를 1회 클릭하여 OFF로 변경 (`PATCH /api/subscriptions/3/auto-renew` 전송).
- **정상 동작 (Expected Behavior)**:
  - 백엔드 DB의 `auto_renew`가 `0`으로 변경되고, 프론트엔드 스위치 UI도 비활성화(`OFF`, 회색 배경) 상태로 전환되어야 함.
- **실제 오류 동작 (Actual Defect Behavior)**:
  - 백엔드에는 실제로 `auto_renew: 0`으로 정상 저장되어 "자동 결제가 비활성화되었습니다" 알림이 발생하지만, 프론트엔드 컴포넌트의 렌더링 매핑에서 `id === 3`일 때 스위치 체크 상태가 계속 `ON` (보라색 활성화 및 'ON' 텍스트)으로 유지됨.
- **필요한 Evidence (증거 데이터)**:
  - 백엔드 `GET /api/subscriptions` 응답에서는 `auto_renew: 0`인 반면, 프론트엔드 DOM의 input[type=checkbox]는 `checked` 상태로 렌더링된 불일치 상태.
- **확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 호출.
  2. [내 구독 관리] 화면에서 `GitHub Copilot`의 자동결제 토글 스위치를 클릭하여 끄기 시도.
  3. 토스트 알림("비활성화되었습니다") 확인.
  4. 프론트엔드 스위치 상태를 확인: 스위치가 여전히 보라색 `ON`으로 켜져 있는지 확인.
  5. `GET /api/subscriptions` API 응답 확인: 백엔드 DB에는 `auto_renew: 0`으로 저장되어 프론트 UI와 불일치하는 상태 검증.

---

## 4. BUG-D01-04: 특정 결제 내역 삭제 시 엉뚱한 결제 건 삭제 오류

- **bug_id**: `BUG-D01-04`
- **오류명**: 특정 결제 내역(AWS Cloud Services) 삭제 시 다른 결제 건(GitHub Copilot)이 삭제되는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 항목**: 결제 내역 ID `4` (`AWS Cloud Services`, 45.00 USD, 2026-10-10)
- **UI 클릭 위치**:
  - 좌측 메뉴 [결제 및 인보이스] 진입 후 `AWS Cloud Services` (인보이스 `INV-2026-1004`, ID: 4) 행의 [내역 삭제] 버튼 클릭
- **Precondition (사전조건)**:
  - 시스템 초기 상태(POST `/api/test/reset` 완료 상태).
  - 결제 내역에 ID `3` (`GitHub Copilot`, 19.00 USD)과 ID `4` (`AWS Cloud Services`, 45.00 USD)가 모두 존재해야 함.
- **Trigger (사용자 행동)**:
  - ID `4` (`AWS Cloud Services`) 행의 [내역 삭제] 버튼 1회 클릭 (`DELETE /api/billings/4`).
- **정상 동작 (Expected Behavior)**:
  - 선택한 ID `4` (`AWS Cloud Services`) 결제 내역이 삭제되고, ID `3` (`GitHub Copilot`)은 유지되어야 함.
- **실제 오류 동작 (Actual Defect Behavior)**:
  - 사용자가 선택한 `AWS Cloud Services`(ID 4)는 삭제되지 않고 그대로 남아있으며, 바로 앞의 `GitHub Copilot`(ID 3) 결제 건이 삭제되어 사라짐.
- **필요한 Evidence (증거 데이터)**:
  - 삭제 실행 전 결제 목록: ID 1, 2, 3, 4, 5 존재.
  - 삭제 실행 후 `GET /api/billings` 응답: ID 3이 소멸하고 ID 4가 여전히 존재하는 상태.
- **확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 호출.
  2. [결제 및 인보이스] 메뉴에서 ID `4` (`AWS Cloud Services`)와 ID `3` (`GitHub Copilot`) 확인.
  3. `AWS Cloud Services`의 [내역 삭제] 버튼 클릭.
  4. 목록 갱신 후 화면 확인: `AWS Cloud Services`는 그대로 남아있고, `GitHub Copilot` 내역이 사라졌는지 확인.
  5. `GET /api/billings` API를 호출하여 ID 4는 존재하고 ID 3은 존재하지 않음을 확인.

---

## 5. BUG-D01-05: 특정 서비스 구독 신청 시 중복 레코드 생성 오류

- **bug_id**: `BUG-D01-05`
- **오류명**: 특정 서비스(Figma Professional) 신규 구독 신청 시 동일 구독 레코드 2회 중복 생성 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 서비스**: 카탈로그 서비스 ID `5` (`Figma Professional`)
- **UI 클릭 위치**:
  1. 좌측 메뉴 [서비스 탐색 & 신청] 진입
  2. `Figma Professional` 카드의 [지금 구독 신청하기] 버튼 클릭
- **Precondition (사전조건)**:
  - 시스템 초기 상태(POST `/api/test/reset` 완료 상태).
  - 현재 구독 목록에 `Figma Professional`이 존재하지 않아야 함.
- **Trigger (사용자 행동)**:
  - `Figma Professional` 카드의 [지금 구독 신청하기] 버튼 1회 클릭 (`POST /api/subscriptions` with `service_id: 5`).
- **정상 동작 (Expected Behavior)**:
  - 내 구독 목록에 `Figma Professional` 1건만 신규 등록되어야 함.
- **실제 오류 동작 (Actual Defect Behavior)**:
  - 버튼을 정확히 한 번만 클릭했음에도 불구하고, 백엔드에서 2개의 구독 레코드가 연속 생성되어 [내 구독 관리] 화면에 동일한 `Figma Professional` 카드가 2개 중복 등록됨.
- **필요한 Evidence (증거 데이터)**:
  - `POST /api/subscriptions` 응답의 `total_created: 2` 확인.
  - `GET /api/subscriptions` 응답에서 `service_name: "Figma Professional"`인 레코드가 2개(서로 다른 id) 생성된 데이터 확인.
- **확인 방법 (Verification Steps)**:
  1. `POST /api/test/reset` 호출.
  2. [서비스 탐색 & 신청] 메뉴로 이동.
  3. `Figma Professional` 카드의 [지금 구독 신청하기] 버튼 1회 클릭.
  4. [내 구독 관리] 화면으로 자동 이동된 후, 목록에 `Figma Professional`이 2건 중복 생성되어 있는지 확인.
  5. `GET /api/subscriptions` 호출을 통해 `Figma Professional` 레코드가 2개 생성되었음을 확인.
