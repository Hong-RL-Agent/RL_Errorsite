# C-03 Bug Catalog (ACTION_REPLAY Training Environment)

## C-03-936
- bug_id: C-03-936
- error_name: Role Toggle Desync
- strategy: ACTION_REPLAY
- precondition:
  - Brian Lee (`id: 102`, 초기 역할 `USER`) 사용자가 존재함.
- trigger:
  - Brian Lee의 역할(Role) 선택 드롭다운에서 `USER`를 `ADMIN`으로 변경함.
- normal_behavior:
  - 백엔드에 `PATCH /api/users/102/role` with `{ role: "ADMIN" }`이 저장되어 DB에 `ADMIN`으로 반영되고, 이후 페이지 재조회 시에도 `ADMIN`으로 유지되어야 함.
- actual_behavior:
  - 프론트엔드는 낙관적으로 화면에 `ADMIN` 배지를 표시하고 `"Role updated successfully to ADMIN"` 토스트를 띄우지만, 백엔드는 Brian Lee의 역할을 `USER`로 그대로 유지함.
  - 새로고침 또는 서버 재조회 시 Brian Lee의 역할은 여전히 `USER`임.
- required_evidence:
  - **UI**: Role badge가 `ADMIN`으로 렌더링되고 성공 Toast 표시
  - **Network / Backend State**: `GET /api/users/102` 응답의 `role`은 `"USER"`로 불일치
- verification_method:
  - Brian Lee의 역할을 ADMIN으로 변경 → 성공 토스트 확인 → 새로고침 후 실제 DB에 USER로 남아있는지 확인.

---

## C-03-182
- bug_id: C-03-182
- error_name: Wrong Target / ID Parameter Mutation
- strategy: ACTION_REPLAY
- precondition:
  - `User A` (`Alice Kim`, ID: 101)와 `User B` (`Brian Lee`, ID: 102)가 목록에 존재함.
- trigger:
  - `User B` (`Brian Lee`)의 [Edit] 버튼 클릭 → 이름을 `Brian Lee - Updated`로 변경 → [Save Changes] 클릭.
- normal_behavior:
  - `User B` (`Brian Lee`)의 정보만 수정되고 `User A` (`Alice Kim`)는 변경되지 않아야 함.
- actual_behavior:
  - 프론트엔드 수정 모달의 대상 ID 매핑 오류로 인해 `User A` (`101`)의 ID로 `PATCH /api/users/101` 요청이 전송됨.
  - 결과적으로 `Brian Lee`는 변경되지 않고, `Alice Kim`이 `Brian Lee - Updated`로 변조됨.
- required_evidence:
  - **DOM**: `Brian Lee`의 이름은 그대로 유지되고, `Alice Kim`의 이름이 `Brian Lee - Updated`로 변조되어 렌더링됨
  - **Network**: `PATCH /api/users/101` 요청 발생
- verification_method:
  - User B 수정 저장 → DOM에서 User B 불변 및 User A 변조 여부 확인.

---

## C-03-1783
- bug_id: C-03-1783
- error_name: Search Query Persistence Loss
- strategy: ACTION_REPLAY
- precondition:
  - 사용자 목록이 로드된 상태.
- trigger:
  - 검색창에 `brian`을 입력하고 [Search]를 클릭하여 검색 결과를 확인한 뒤, 상단 상태 필터(`All Statuses`)를 `Active Only`로 변경함.
- normal_behavior:
  - 상태 필터를 변경해도 기존 검색어(`search=brian`)가 유지되어 `GET /api/users?search=brian&status=ACTIVE` 요청이 전송되고 검색창에 `brian` 텍스트가 유지되어야 함.
- actual_behavior:
  - 상태 필터를 변경하는 순간 프론트엔드의 검색 state가 빈 값(`""`)으로 초기화되어 검색창이 지워지고, `search` 파라미터가 빠진 `GET /api/users?status=ACTIVE` 요청이 발생함.
- required_evidence:
  - **DOM**: 검색창 input의 value가 `""` (빈 값)으로 초기화됨
  - **Network**: `search=brian` 파라미터가 누락된 `GET /api/users?status=ACTIVE` 요청 발생
- verification_method:
  - 검색어 입력 후 Search 클릭 → Status 필터 변경 → 검색 입력창의 초기화 및 Network 파라미터 누락 확인.

---

## C-03-889
- bug_id: C-03-889
- error_name: Active Status Inversion
- strategy: ACTION_REPLAY
- precondition:
  - `is_active = true` (Active) 상태인 사용자가 존재함.
- trigger:
  - Active 상태의 사용자 상태 버튼(`Active`)을 클릭하여 계정을 Block(비활성화)하려 함.
- normal_behavior:
  - `PATCH /api/users/:id/status` with `{ isActive: false }` 요청이 처리되어 계정 상태가 `Inactive` (Blocked)로 변경되어야 함.
- actual_behavior:
  - 백엔드의 상태 반전 로직 오류로 인해 비활성화 요청(`isActive = false`)을 받았음에도 DB에 `is_active = 1`로 저장/유지되어 반환됨.
  - 결과적으로 화면에 여전히 초록색 `Active` 배지가 표시됨.
- required_evidence:
  - **DOM**: 비활성화(Block) 클릭 후에도 `Active` 배지가 유지됨
  - **Network**: 백엔드 응답 객체의 `isActive`가 `true`로 반환됨
- verification_method:
  - Active 계정의 상태 클릭 → Network 응답의 isActive: true 확인 → DOM의 Active 배지 유지 확인.

---

## C-03-2088
- bug_id: C-03-2088
- error_name: Action Confirm Without Feedback
- strategy: ACTION_REPLAY
- precondition:
  - 사용자 목록이 로드된 상태.
- trigger:
  - 특정 사용자의 [Reset Link] (비밀번호 리셋 링크 발송) 버튼을 클릭함.
- normal_behavior:
  - 버튼 클릭 시 로딩 스피너, 성공/실패 토스트 메시지, 모달 등의 명확한 UI 피드백이 사용자에게 제공되어야 함.
- actual_behavior:
  - 실제 `POST /api/users/:id/password-reset` API 요청은 정상 전송되고 200 OK를 수신하지만, 프론트엔드에 피드백 처리 로직이 누락되어 로딩, 토스트, 텍스트 변경 등 어떠한 DOM 변화도 발생하지 않음.
- required_evidence:
  - **Network**: `POST /api/users/:id/password-reset` → `200 OK`
  - **DOM**: 클릭 전후 DOM이 100% 동일하게 유지됨 (피드백 부재)
- verification_method:
  - Reset Link 클릭 → Network 200 OK 확인 → DOM 상 어떠한 피드백도 발생하지 않음을 확인.
