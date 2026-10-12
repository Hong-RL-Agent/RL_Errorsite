# AdminScope 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 AdminScope (D-05) 기업 내부 운영 관리자 대시보드 웹사이트에 설계된 5가지 의도적 기능 오류에 대한 명세서입니다.  
본 환경은 **SEQUENCE_REPLAY** 학습 환경으로, 단순 단일 액션(ACTION_REPLAY)이 아닌 **여러 사용자 행동(Action Sequence)이 엄밀한 순서대로 수행되었을 때에만 오류 상태가 발현**되도록 구성되어 있습니다.  
DQN 에이전트는 올바른 행동 시퀀스를 탐색하고, 최종 상태에서 UI, DOM, Network, State Evidence를 대조하여 오류를 식별할 수 있습니다.

---

## 1. BUG-D05-01: 사용자 검색 및 상태 필터 결합 시 타 계정 상태 변경 오류

- **bug_id**: `BUG-D05-01`
- **오류명**: 사용자 검색 및 활성 상태 필터 적용 후 특정 사용자 비활성화 시, 선택한 계정이 아닌 전체 1번 계정(EMP-1001)의 상태가 변경되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 계정**:
  - 사용자 선택 대상: `최영진_사원` (사번: `EMP-1015`, 부서: 서비스개발팀, 초기 상태: `ACTIVE`)
  - 실제 상태 변경 대상: `김도현` (사번: `EMP-1001`, 부서: 플랫폼개발팀, 초기 상태: `ACTIVE`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `EMP-1015`의 상태가 `ACTIVE`, `EMP-1001`의 상태가 `ACTIVE`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 상단 사이드바에서 [사용자 및 계정 관리] 메뉴 선택 (`activeTab = 'users'`).
  2. `Action 2`: 사용자 검색창에 `"최"` 입력 (`search = '최'`).
  3. `Action 3`: 상태 필터 드롭다운에서 `"ACTIVE"` 선택 (`status = 'ACTIVE'`).
  4. `Action 4`: 필터링된 목록에서 `최영진_사원` (`EMP-1015`) 행의 [비활성화] 버튼 클릭 (`PATCH /api/users/EMP-1015/status`).
  5. `Action 5`: 변경 완료 알림 확인 후 사용자 목록 상태 검증.
- **기대 결과 (Expected Behavior)**:
  - `최영진_사원` (`EMP-1015`)의 상태 배지가 `INACTIVE`로 변경되고, `김도현` (`EMP-1001`)은 `ACTIVE`를 유지해야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - "사용자 상태가 성공적으로 변경되었습니다." 메시지가 표시되지만,
  - 복합 필터(`search='최'` + `status='ACTIVE'`) 상태에서 백엔드/프론트엔드 인덱스 참조 왜곡으로 인해 선택한 `EMP-1015` 대신 전체 목록의 1번째 유저인 `김도현` (`EMP-1001`)의 상태가 `INACTIVE`로 변환됨.
  - 화면 목록의 `최영진_사원`은 여전히 초록색 `ACTIVE` 배지를 유지함.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 검색 결과 목록에서 `최영진_사원`의 상태 배지가 여전히 초록색 `활성(ACTIVE)`으로 표시됨.
  - **DOM**: `tr[data-user-id="EMP-1015"] .badge.active`가 그대로 존재함.
  - **Network**: `PATCH /api/users/EMP-1015/status` 응답의 `affected_user` 값이 `'EMP-1001'`.
  - **State**: SQLite `SELECT status FROM users WHERE emp_no = 'EMP-1015'`는 `'ACTIVE'`, `WHERE emp_no = 'EMP-1001'`은 `'INACTIVE'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. [사용자 관리] 탭 이동 -> 검색어 `"최"` 입력 -> 상태 필터 `"ACTIVE"` 선택.
  3. `EMP-1015` (`최영진_사원`) 행의 [비활성화] 클릭.
  4. 검색어 및 필터를 해제(`전체`)하고 `EMP-1001` (`김도현`)의 상태가 `INACTIVE`로 변하고 `EMP-1015`는 `ACTIVE`로 남아있는지 확인.

---

## 2. BUG-D05-02: 부서 필터 및 검색 적용 시 상세 패널 권한 수정 미반영 오류

- **bug_id**: `BUG-D05-02`
- **오류명**: 플랫폼개발팀 부서 필터 및 검색어 입력 상태에서 상세 패널을 열어 권한(ADMIN)을 수정 저장 시 권한 변경이 무시되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 계정**: `강수현_엔지니어` (사번: `EMP-1018`, 부서: 플랫폼개발팀, 초기 권한: `OPERATOR`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `EMP-1018`의 초기 권한은 `OPERATOR`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 상단 사이드바에서 [사용자 및 계정 관리] 메뉴 선택.
  2. `Action 2`: 부서 필터 드롭다운에서 `"플랫폼개발팀"` 선택 (`department = '플랫폼개발팀'`).
  3. `Action 3`: 검색창에 `"강"` 입력 (`search = '강'`).
  4. `Action 4`: 검색된 `강수현_엔지니어` (`EMP-1018`) 행의 [상세] 버튼을 클릭하여 슬라이드오버 드로어 패널 오픈.
  5. `Action 5`: 시스템 접근 권한(Role) 선택박스에서 `"ADMIN"`을 선택.
  6. `Action 6`: 하단 [변경사항 저장] 버튼 1회 클릭 (`PATCH /api/users/EMP-1018`).
  7. `Action 7`: 저장 후 사용자 목록 및 상세 드로어의 권한 확인.
- **기대 결과 (Expected Behavior)**:
  - `강수현_엔지니어`의 권한 배지가 파란색 `ADMIN`으로 변경되어 저장되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - "성공적으로 저장되었습니다" 메시지가 나오지만, 특정 복합 필터 조건에서 백엔드 SQL 업데이트 시 `role` 컬럼 반영이 누락됨.
  - `강수현_엔지니어`의 권한이 `ADMIN`이 아닌 원래의 `OPERATOR`로 그대로 유지됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 상세 패널 및 목록 테이블의 권한 배지가 여전히 녹색 `OPERATOR`.
  - **DOM**: `tr[data-user-id="EMP-1018"]` 내 `span.badge.role-operator` 존재 (role-admin 미존재).
  - **Network**: `GET /api/users/EMP-1018` 응답 JSON의 `data.role` 값이 `'OPERATOR'`.
  - **State**: SQLite `SELECT role FROM users WHERE emp_no = 'EMP-1018'` 결과가 `'OPERATOR'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. [사용자 관리] -> 부서 `"플랫폼개발팀"` -> 검색 `"강"` -> `EMP-1018` [상세] 클릭.
  3. 권한을 `ADMIN`으로 변경 후 [변경사항 저장].
  4. 다시 상세 패널을 열거나 목록에서 권한이 `OPERATOR`로 유지되어 있는지 대조 검증.

---

## 3. BUG-D05-03: 서비스 요청 대기 필터 상태에서 특정 요청 승인 누락 오류

- **bug_id**: `BUG-D05-03`
- **오류명**: 서비스 요청 목록에서 대기 상태 필터 적용 후 특정 요청(REQ-2009)을 승인 처리해도 DB 상태가 변경되지 않고 대기(PENDING)로 유지되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 요청**: 요청 ID `REQ-2009` (제목: '오프라인 컨퍼런스 전시용 태블릿 2대 대여', 신청자: `한지민`, 부서: 마케팅팀, 초기 상태: `PENDING`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `REQ-2009`의 초기 상태는 `PENDING`.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 좌측 사이드바에서 [서비스 요청 승인] 메뉴 클릭 (`activeTab = 'requests'`).
  2. `Action 2`: 상태 필터 드롭다운에서 `"PENDING"`(대기 중) 선택 (`status = 'PENDING'`).
  3. `Action 3`: 목록에서 요청 번호 `REQ-2009` (`한지민`, 태블릿 대여) 항목 확인.
  4. `Action 4`: 우측 [승인] 버튼 클릭 -> 승인 확인 모달 팝업.
  5. `Action 5`: 모달의 [승인 확정] 버튼 클릭 (`PATCH /api/requests/REQ-2009/approve`).
  6. `Action 6`: 대기 상태 목록 갱신 결과 확인.
- **기대 결과 (Expected Behavior)**:
  - `REQ-2009` 요청의 상태가 `APPROVED`로 변경되며 대기 중 목록에서 제거되고 승인 완료 목록으로 이동해야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - "요청이 성공적으로 승인되었습니다." 알림이 발생하지만, 백엔드에서 `REQ-2009`의 `status` UPDATE 쿼리가 누락되어 `PENDING` 상태를 유지함.
  - 대기 목록 테이블에 `REQ-2009` 행이 사라지지 않고 노란색 `대기 중` 배지와 함께 그대로 노출됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 승인 후에도 대기 상태 필터 테이블에 노란색 `대기 중` 배지로 `REQ-2009` 노출.
  - **DOM**: `tr[data-req-id="REQ-2009"] .badge.pending` 유지.
  - **Network**: `GET /api/requests?status=PENDING` 응답 배열에 `req_id: 'REQ-2009'`가 여전히 포함됨.
  - **State**: SQLite `SELECT status FROM service_requests WHERE req_id = 'REQ-2009'` 결과가 `'PENDING'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. [서비스 요청 승인] -> 상태 `"PENDING"` 선택 -> `REQ-2009` [승인] -> [승인 확정].
  3. 목록에 `REQ-2009`가 여전히 남아있는지 확인.

---

## 4. BUG-D05-04: 날짜 및 부서 조건 집계 후 CSV 내보내기 시 타 부서 데이터 왜곡 오류

- **bug_id**: `BUG-D05-04`
- **오류명**: 날짜 범위(2026-09-01 ~ 2026-09-30) 및 부서('마케팅팀') 선택 후 CSV 다운로드 시 다운로드 파일에 재무회계팀 데이터가 기록되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 조건**:
  - 선택 기간: `2026-09-01` ~ `2026-09-30`
  - 선택 부서: `마케팅팀`
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 좌측 사이드바에서 [통계 및 데이터 내보내기] 메뉴 클릭 (`activeTab = 'export'`).
  2. `Action 2`: 시작 일자를 `"2026-09-01"`로 설정.
  3. `Action 3`: 종료 일자를 `"2026-09-30"`으로 설정.
  4. `Action 4`: 대상 부서를 `"마케팅팀"`으로 선택.
  5. `Action 5`: [조건별 통계 조회] 버튼 클릭 (화면에 마케팅팀 대상자 미리보기 확인).
  6. `Action 6`: [선택 조건 CSV 다운로드] 버튼 클릭 (`GET /api/export/csv?...`).
  7. `Action 7`: 다운로드된 CSV 파일의 레코드 내용 확인.
- **기대 결과 (Expected Behavior)**:
  - 다운로드된 CSV 파일에 마케팅팀 소속 임직원(`최영진`, `오세훈`, `송하늘` 등)의 정보가 기록되어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 화면에는 마케팅팀 데이터가 표시되지만, 백엔드 내보내기 생성기에서 부서 쿼리가 `재무회계팀`으로 왜곡 치환됨.
  - 다운로드된 CSV 파일 내용에 `마케팅팀`이 아닌 `재무회계팀` 임직원(`조민석`, `신동엽`, `류호준` 등) 정보가 출력됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 화면 통계에는 '마케팅팀'으로 표시됨.
  - **DOM**: 미리보기 컴포넌트의 부서명('마케팅팀') vs CSV 내용 불일치.
  - **Network**: `GET /api/export/csv?startDate=2026-09-01&endDate=2026-09-30&department=마케팅팀`의 다운로드 스트림 첫 데이터 행의 부서 컬럼 값이 `"재무회계팀"`.
  - **State**: CSV 파일 파싱 데이터의 Department 항목이 '재무회계팀'.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. [통계 및 데이터 내보내기] -> 날짜 `2026-09-01 ~ 2026-09-30`, 부서 `마케팅팀` 설정.
  3. [조건별 통계 조회] -> [선택 조건 CSV 다운로드] 실행.
  4. 응답 CSV 파일 텍스트를 열어 소속 부서가 `재무회계팀`으로 왜곡되어 있는지 확인.

---

## 5. BUG-D05-05: 검색, 정렬 및 2페이지 이동 후 사용자 상태 변경 시 타 페이지 계정 변경 오류

- **bug_id**: `BUG-D05-05`
- **오류명**: 검색("김") 적용 후 등록일 오름차순 정렬 및 2페이지로 이동하여 대상(EMP-1032, 김태희) 비활성화 시 1페이지 대상(EMP-1001)이 변경되는 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **대상 계정**:
  - 선택 대상: 2페이지 1번째 행 `김태희` (`EMP-1032`, 서비스개발팀, 초기 상태: `ACTIVE`)
  - 실제 변경 대상: 1페이지 1번째 행 `김도현` (`EMP-1001`, 플랫폼개발팀, 초기 상태: `ACTIVE`)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - `EMP-1032`와 `EMP-1001` 모두 `ACTIVE` 상태.
- **행동 시퀀스 (Action Sequence)**:
  1. `Action 1`: 좌측 사이드바에서 [사용자 및 계정 관리] 메뉴 선택.
  2. `Action 2`: 검색창에 `"김"` 입력 (총 15명 검색되어 2페이지로 분할됨).
  3. `Action 3`: 정렬 드롭다운에서 `"등록일 오래된순 (오름차순)"` 선택 (`sort = 'created_at', order = 'asc'`).
  4. `Action 4`: 하단 페이지네이션에서 `[2]` 페이지 버튼 클릭 (`page = 2`).
  5. `Action 5`: 2페이지 첫 번째 행인 `김태희` (`EMP-1032`)의 [비활성화] 버튼 클릭 (`PATCH /api/users/EMP-1032/status`).
  6. `Action 6`: 변경 후 2페이지 상태 및 1페이지 이동 후 상태 확인.
- **기대 결과 (Expected Behavior)**:
  - 2페이지의 `김태희` (`EMP-1032`)의 상태 배지가 `INACTIVE`로 바뀌어야 함.
- **실제 결과 (Actual Defect Behavior)**:
  - 2페이지의 `김태희` 행은 여전히 초록색 `ACTIVE` 상태로 유지됨.
  - 오프셋 계산 버그로 인해 1페이지 1번째 행인 `김도현` (`EMP-1001`)의 상태가 `INACTIVE`로 잘못 변경됨.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 2페이지 `김태희` 상태 배지가 그대로 `활성(ACTIVE)`이며, 1페이지로 이동 시 `김도현`이 `비활성(INACTIVE)`으로 변해 있음.
  - **DOM**: 2페이지 `tr[data-user-id="EMP-1032"] .badge.active` 잔류.
  - **Network**: `PATCH /api/users/EMP-1032/status` 응답 JSON의 `affected_user`가 `'EMP-1001'`.
  - **State**: SQLite `SELECT status FROM users WHERE emp_no = 'EMP-1032'`는 `'ACTIVE'`, `WHERE emp_no = 'EMP-1001'`은 `'INACTIVE'`.
- **재현 확인 방법 (Confirmation Steps)**:
  1. `POST /api/test/reset` 실행.
  2. [사용자 관리] -> 검색 `"김"` -> 정렬 `"등록일 오래된순"` -> 페이지 `[2]` 이동.
  3. `EMP-1032` [비활성화] 클릭.
  4. 2페이지의 `EMP-1032` 상태가 `ACTIVE`로 유지되고, 1페이지의 `EMP-1001` 상태가 `INACTIVE`로 변했는지 확인.
