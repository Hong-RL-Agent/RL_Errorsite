# C-01 Bug Catalog (ACTION_REPLAY Training Environment)

This document contains the detailed specifications, preconditions, triggers, behaviors, and verification evidence for all 5 deterministic bugs in the `C-01` File Management Service.

---

## 1. BUG-112 (`C-01-112`) — 데이터 삭제 불가 (Delete Failure)

- **bug_id**: `C-01-112`
- **error_name**: 데이터 삭제 불가 (Delete Failure)
- **strategy**: `ACTION_REPLAY`
- **precondition**:
  - `Documents` 폴더 내에 `A.txt` (ID: `file-a-txt`) 파일이 존재함.
- **trigger**:
  - `A.txt`의 삭제 아이콘 클릭 → 삭제 확인 모달에서 "Delete" 버튼 클릭.
- **expected_behavior**:
  - `DELETE /api/files/file-a-txt` 요청이 200 OK를 반환하고 서버 데이터베이스에서 파일이 영구 삭제됨. 이후 목록을 다시 조회해도 `A.txt`가 나타나지 않음.
- **actual_behavior**:
  - Frontend는 Optimistic UI로 화면에서 `A.txt`를 즉시 제거함.
  - 실제 Network 요청 `DELETE /api/files/file-a-txt`는 `500 Internal Server Error`를 반환하며 서버에서 파일이 삭제되지 않음.
  - 목록을 새로고침하거나 폴더를 다시 조회하면 `A.txt`가 다시 나타남.
- **evidence**:
  1. **Network**: `DELETE /api/files/file-a-txt` → HTTP status `500`.
  2. **DOM**: 삭제 직후 DOM에서 `A.txt`가 사라졌다가, 목록 재조회 후 다시 렌더링됨.
- **verification_method**:
  - `A.txt` 삭제 실행 → Network 패널에서 500 에러 확인 → 목록 새로고침 후 `A.txt` 존재 여부 확인.

---

## 2. BUG-885 (`C-01-885`) — 멱등성 위반 (Duplicate Folder on Double Click)

- **bug_id**: `C-01-885`
- **error_name**: 멱등성 위반 (Duplicate Folder on Double Click)
- **strategy**: `ACTION_REPLAY`
- **precondition**:
  - 현재 작업 디렉토리에 생성하려는 동일한 이름의 폴더가 없는 상태.
- **trigger**:
  - "New Folder" 모달에서 폴더명 입력 후 "Create" 버튼을 빠르게 더블 클릭(또는 연속 2회 전송).
- **expected_behavior**:
  - 단일 폴더만 생성되거나 중복 요청에 대한 멱등성 보호로 1개의 폴더만 생성되어야 함.
- **actual_behavior**:
  - 프론트엔드의 중복 클릭 방어 미비 및 백엔드의 비멱등적 처리로 인해 `POST /api/folders` 요청이 2건 연속 전송되고 둘 다 `201 Created`로 처리됨.
  - 동일한 이름을 가진 2개의 폴더 객체가 생성되어 DOM에 2개 모두 렌더링됨.
- **evidence**:
  1. **Network**: `POST /api/folders` 요청 2건 발생, 2건 모두 `201 Created` 수신.
  2. **DOM**: 동일한 이름을 가진 폴더 element가 2개 존재함.
- **verification_method**:
  - 새 폴더 생성 시 더블 클릭 액션 수행 → 201 응답 2회 수신 확인 → DOM 내 동일 폴더명 2개 렌더링 확인.

---

## 3. BUG-007 (`C-01-007`) — 잘못된 대상 수정 (Wrong Target Mutation)

- **bug_id**: `C-01-007`
- **error_name**: 비즈니스 참조 무결성 파괴 (Wrong Target Mutation)
- **strategy**: `ACTION_REPLAY`
- **precondition**:
  - 파일 목록이 `A.txt`, `B.txt`, `Report.pdf` 순서로 정렬되어 존재함.
- **trigger**:
  - `A.txt`의 이름 변경(Rename) 버튼 클릭 → 새 이름 `A_final.txt` 입력 → "Save" 클릭.
- **expected_behavior**:
  - `A.txt`의 이름만 `A_final.txt`로 변경되고, `B.txt`는 원래 이름 그대로 유지되어야 함.
- **actual_behavior**:
  - 프론트엔드의 인덱스/참조 해석 오류로 인해 변경 대상이 `B.txt` (ID: `file-b-txt`)로 매핑되어 `PATCH /api/files/file-b-txt` 요청이 전송됨.
  - 결과적으로 `A.txt`는 이름이 그대로 유지되고, `B.txt`의 이름이 `A_final.txt`로 변조됨.
- **evidence**:
  1. **DOM**: `A.txt` 파일 항목이 그대로 남아있고, `B.txt` 항목이 사라진 대신 `A_final.txt` 항목이 렌더링됨.
  2. **Network**: `PATCH /api/files/file-b-txt` 요청 전송 확인.
- **verification_method**:
  - `A.txt`에 대해 rename to `A_final.txt` 액션 수행 → DOM에서 `A.txt`의 불변 및 `B.txt` -> `A_final.txt` 변조 확인.

---

## 4. BUG-2002 (`C-01-2002`) — 파일명 데이터 잘림 (Data Truncation on Rename)

- **bug_id**: `C-01-2002`
- **error_name**: 텍스트 잘림 (Data Truncation on Rename)
- **strategy**: `ACTION_REPLAY`
- **precondition**:
  - 파일 이름을 변경할 수 있는 파일이 존재함.
- **trigger**:
  - 파일 이름 변경 모달에서 30자 이상의 긴 파일명(예: `Quarterly_Project_Review_Document_Final_2026.txt`)을 입력하고 저장.
- **expected_behavior**:
  - 입력한 47글자의 파일명이 온전하게 저장되고 목록 및 상세 정보에 전체 이름이 표시되어야 함.
- **actual_behavior**:
  - 프론트엔드는 글자수 제한 없이 전체 문자열을 백엔드로 전송함.
  - 백엔드 스토리지 계층의 30자 컬럼 제약으로 인해 문자열이 30자로 잘려서 저장됨 (`Quarterly_Project_Review_Docume`).
  - 백엔드는 오류 없이 `200 OK`를 반환하고, 잘린 이름이 UI에 렌더링됨.
- **evidence**:
  1. **Input vs DOM**: 사용자가 입력한 원래 이름(`Quarterly_Project_Review_Document_Final_2026.txt`, length: 47) ≠ 저장 후 DOM에 표시된 이름(`Quarterly_Project_Review_Docume`, length: 30).
  2. **Network**: API 응답 객체의 `name` 필드가 30자로 잘려 반환됨.
- **verification_method**:
  - 30자 초과 파일명 입력 및 저장 → 반환된 응답 및 DOM 텍스트의 30자 절삭 확인.

---

## 5. BUG-1800 (`C-01-1800`) — 이동 후 UI-서버 상태 불일치 (Silent Move Failure)

- **bug_id**: `C-01-1800`
- **error_name**: 부분적 롤백에 따른 UI-서버 불일치 (Silent Move Failure)
- **strategy**: `ACTION_REPLAY`
- **precondition**:
  - `Documents` 폴더에 `A.txt`가 존재하고, 대상 폴더 `Archive`가 존재함.
- **trigger**:
  - `A.txt`의 이동(Move) 메뉴 클릭 → 대상 폴더로 `Archive` 선택 → "Move Here" 클릭.
- **expected_behavior**:
  - `PUT /api/files/file-a-txt/move` 요청이 성공(200 OK)하고, 서버에서 파일의 `folderId`가 `folder-archive`로 변경되어 UI와 서버 모두 `Archive` 폴더에 `A.txt`가 표시됨.
- **actual_behavior**:
  - 백엔드에서 `PUT /api/files/file-a-txt/move` 요청 시 `500 Internal Server Error`가 발생하여 서버 이동이 실패함 (파일의 `folderId`는 여전히 `folder-documents`로 유지됨).
  - 프론트엔드는 500 에러를 무시하고 이동 성공으로 낙관적 처리하여 화면에서는 `Archive`로 이동한 것처럼 표시함.
  - 서버 상태를 다시 조회(새로고침 또는 API 재조회)하면 `A.txt`는 원래 위치인 `Documents`에 그대로 존재함.
- **evidence**:
  1. **Network**: `PUT /api/files/file-a-txt/move` → HTTP `500`.
  2. **UI/DOM**: 이동 직후 UI에서는 대상 폴더로 이동된 것으로 렌더링됨.
  3. **Server State**: `GET /api/files?folderId=folder-documents` 호출 시 여전히 `A.txt`가 반환됨.
- **verification_method**:
  - `A.txt` 이동 실행 → 500 에러 발생 확인 → UI 상 이동 확인 → 서버 재조회 시 원래 위치 확인.
