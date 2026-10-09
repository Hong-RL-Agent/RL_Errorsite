# C-02 Bug Catalog (ACTION_REPLAY Training Environment)

# C-02 Bug Catalog

## C-02-424
- bug_id: C-02-424
- error_name: Invalid State Transition
- strategy: ACTION_REPLAY
- precondition:
  - `TODO` 상태의 Task(예: ID 1 "Landing Page Review", ID 2 "API Documentation", ID 3 "Mobile Layout Check")가 존재함.
- trigger:
  - Kanban 화면에서 `TODO` 컬럼의 Task를 `DONE` 컬럼으로 직접 드래그 앤 드롭하거나, 카드 우측의 `→ Done` 버튼을 클릭함.
- normal_behavior:
  - 정상적인 워크플로우(`TODO → IN_PROGRESS → DONE`)에 따라 `TODO → DONE` 직접 전이는 백엔드 유효성 검증에서 차단(400 Bad Request)되어야 함.
- actual_behavior:
  - 백엔드의 상태 전이 매트릭스 검증이 누락되어 `PUT /api/tasks/:id/status` (`status: "DONE"`) 요청이 `200 OK`로 성공하고 실제 DB에 `DONE` 상태로 직접 저장됨.
- evidence:
  - **Network**: `PUT /api/tasks/:id/status` with `status=DONE` → HTTP `200 OK`
  - **DOM**: 해당 Task가 Kanban의 `DONE` 컬럼에 렌더링됨
- verification_method:
  - `TODO` Task를 `DONE`으로 이동 → Network 200 OK 확인 → DOM 내 DONE 컬럼 배치 확인.

---

## C-02-726
- bug_id: C-02-726
- error_name: Optimistic UI Revert Failure
- strategy: ACTION_REPLAY
- precondition:
  - 완료 체크박스를 누를 수 있는 Task(예: ID 2 "API Documentation" 또는 미완료 Task)가 목록에 존재함.
- trigger:
  - List View에서 Task 좌측의 완료 체크박스를 클릭하여 체크함.
- normal_behavior:
  - 프론트엔드가 낙관적 UI로 체크를 표시한 후 백엔드에 완료 요청을 보냈을 때, 백엔드가 `400 Bad Request`로 거부하면 프론트엔드는 체크박스를 원래의 미체크 상태(`checked=false`)로 롤백해야 함.
- actual_behavior:
  - 프론트엔드는 체크박스를 `checked=true`로 변경한 후 API를 호출함. 백엔드는 의존성 미충족 오류로 `400 Bad Request`를 반환하지만, 프론트엔드가 롤백을 수행하지 않아 체크박스가 `checked=true` 상태로 유지됨.
- evidence:
  - **Network**: `PUT /api/tasks/:id/status` → HTTP `400 Bad Request`
  - **DOM**: Checkbox가 `checked=true` (완료 취소선 및 체크 상태)로 유지됨
- verification_method:
  - Checkbox 클릭 → Network 400 Bad Request 발생 확인 → DOM 상 Checkbox가 여전히 체크 상태로 남아있는지 확인.

---

## C-02-051
- bug_id: C-02-051
- error_name: Task Priority Sorting Bug
- strategy: ACTION_REPLAY
- precondition:
  - 서로 다른 우선순위(`HIGH`, `MEDIUM`, `LOW`)를 가진 여러 Task가 존재함.
- trigger:
  - 정렬 드롭다운에서 `Sort by Priority (우선순위순)`을 선택함.
- normal_behavior:
  - Task 목록이 `HIGH` → `MEDIUM` → `LOW` 순서대로 정렬되어야 함.
- actual_behavior:
  - 백엔드의 쿼리 핸들러가 priority 정렬 가중치 조건을 적용하지 않고 기본 ID 순서로 데이터를 반환함.
- evidence:
  - **Network**: `GET /api/tasks?sort=priority` 요청 발생
  - **DOM**: Priority Badge 순서가 `HIGH` → `MEDIUM` → `LOW`가 아닌 뒤섞인 순서(예: `HIGH`, `MEDIUM`, `LOW`, `HIGH`, `LOW`, `HIGH`, `MEDIUM`)로 렌더링됨
- verification_method:
  - 정렬을 `Sort by Priority`로 변경 → 렌더링된 카드의 우선순위 배지 순서가 올바르지 않음을 DOM에서 확인.

---

## C-02-865
- bug_id: C-02-865
- error_name: Assignee Dropdown Loss
- strategy: ACTION_REPLAY
- precondition:
  - 담당자가 지정된 Task(예: ID 4 "Payment Integration", 담당자: Alice)가 존재함.
- trigger:
  - Task 수정(Edit Task) 모달을 열고 담당자를 `Alice`에서 `Brian`으로 변경한 뒤 `Save Changes`를 클릭함.
- normal_behavior:
  - 수정 요청 Payload에 `assignee_id: 2`가 포함되어 전송되고, 저장 후 담당자가 `Brian`으로 변경되어야 함.
- actual_behavior:
  - 프론트엔드 수정 폼 제출 핸들러에서 `assignee_id` 필드가 누락된 채 전송되어(`{ title, description, priority }`), 백엔드가 담당자를 `null`로 리셋함. 결과적으로 담당자가 `미지정 (Unassigned)`으로 변경됨.
- evidence:
  - **Network**: `PATCH /api/tasks/:id` Payload에 `assignee_id` 필드가 부재함
  - **DOM**: 담당자 이름이 `미지정`으로 표시되고 아바타가 기본 유저 아이콘으로 변경됨
- verification_method:
  - Task 수정 모달에서 담당자 변경 후 저장 → Network Payload 확인 → DOM 상 담당자가 `미지정`으로 변조되었는지 확인.

---

## C-02-006
- bug_id: C-02-006
- error_name: Deleted Task Resurrected
- strategy: ACTION_REPLAY
- precondition:
  - 삭제 대상 Task(예: ID 1 "Landing Page Review")가 목록에 존재함.
- trigger:
  - Task의 삭제 버튼 클릭 → 삭제 확인 모달에서 `Delete Task` 클릭.
  - 이후 필터를 변경(예: `All` 탭 클릭)하거나 목록을 새로고침함.
- normal_behavior:
  - 삭제된 Task는 `is_deleted = true` 처리되어 이후 목록 조회 시 다시 나타나지 않아야 함.
- actual_behavior:
  - 삭제 API(`DELETE /api/tasks/:id`)는 `is_deleted = 1`을 저장하고 UI에서 즉시 제거되지만, 백엔드 목록 조회 API(`GET /api/tasks`)에서 `WHERE is_deleted = 0` 필터 조건이 누락되어 있어 다시 목록을 조회하면 삭제된 Task가 DOM에 부활하여 나타남.
- evidence:
  - **DOM Step 1**: 삭제 직후 Task가 DOM에서 제거됨
  - **DOM Step 2**: 필터 전환 또는 재조회 시 삭제했던 Task가 DOM에 다시 나타남
  - **Network**: `DELETE /api/tasks/1` 후 `GET /api/tasks` 응답에 삭제된 Task가 계속 포함되어 반환됨
- verification_method:
  - Task 삭제 → DOM에서 사라짐 확인 → 상단 `All` 탭 클릭 또는 재조회 → 삭제된 Task가 다시 렌더링되는지 확인.
