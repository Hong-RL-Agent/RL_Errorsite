# TeamOrbit 의도적 기능 오류 명세서 (BUGS.md)

본 문서는 **TeamOrbit (D-08)** 팀 업무 협업 및 칸반 보드 플랫폼에 설계된 5가지 의도적 기능 오류에 대한 상세 명세서입니다.  
본 사이트는 **RAWD DQN Validation 사이트**로서, 3가지 핵심 검증 전략인 **ACTION_REPLAY**, **SEQUENCE_REPLAY**, **STATE_REVISIT**을 혼합하여 DQN 에이전트의 상태 전이 추적 및 정책 유효성을 평가할 수 있도록 구현되었습니다.

---

## 1. BUG-D08-01: 업무 14번 완료 처리 시 DB 미반영 오류

- **bug_id**: `BUG-D08-01`
- **오류명**: 특정 업무(ID 14, `MOB-105`)에 대해 완료 버튼을 클릭했을 때 응답은 성공으로 반환되나 실제 SQLite DB 상태 업데이트가 누락되는 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 업무**:
  - Task ID: `14`
  - Task Key: `MOB-105`
  - Task Title: `iOS 백그라운드 푸시 노티피케이션 안정화`
  - Project ID: `2` (Orbit Mobile App)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 업무 14번의 초기 상태는 `IN_PROGRESS` (또는 `TODO`).
- **상태 전이 추적 (State Transition)**:
  - **작업 전 상태 (Before Action)**: `status = 'IN_PROGRESS'`
  - **수행 동작 (User Action)**: 업무 14번 완료 버튼 클릭 (`PATCH /api/tasks/14/status` with `{"status": "DONE"}`)
  - **동작 직후 응답 (Immediate Response)**: `{ success: true, message: "업무가 완료 처리되었습니다.", data: { id: 14, status: "DONE", db_persisted: false } }`
  - **액션 리플레이 / 재조회 후 상태 (Action Replay / Re-query)**: `status = 'IN_PROGRESS'` (DB 미반영으로 인해 칸반 보드 재렌더링 또는 상세 조회 시 진행 중 컬럼에 그대로 머무름)
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 좌측 프로젝트 사이드바에서 [Orbit Mobile App] (ID: 2) 프로젝트 선택.
  2. 칸반 보드의 [진행 중 (In Progress)] 컬럼에서 `MOB-105` (업무 14번) 카드를 탐색.
  3. 카드 우측 상단의 초록색 체크 모양 [완료 처리] 버튼을 클릭 (또는 카드를 클릭하여 드로어를 연 뒤 상태를 `DONE`으로 변경).
  4. "업무가 완료 처리되었습니다" 알림 토스트를 확인.
  5. 브라우저 새로고침(F5) 또는 프로젝트 목록 재선택으로 업무 목록을 다시 불러옴.
  6. `MOB-105` 카드가 [완료됨 (Done)] 컬럼으로 이동하지 않고 여전히 [진행 중 (In Progress)] 컬럼에 남아있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 완료 버튼 클릭 후 재조회 시 여전히 [진행 중] 컬럼에 렌더링됨.
  - **DOM**: `div[data-task-id="14"]`의 `data-task-status` 속성이 `'IN_PROGRESS'`.
  - **Network**: `GET /api/tasks?projectId=2` 응답 내 `id: 14` 객체의 `status` 필드가 `'IN_PROGRESS'`.
  - **State**: SQLite `SELECT status FROM tasks WHERE id = 14` 조회 결과가 `'IN_PROGRESS'`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/tasks/:id/status` 핸들러 내 `if (taskId === 14 && status === 'DONE')` 예외 분기를 제거하고, 정상 `UPDATE tasks SET status = ? WHERE id = ?` 구문이 모든 업무 ID에 대해 실행되도록 일원화.

---

## 2. BUG-D08-02: 댓글 9번 삭제 요청 시 인접 댓글 8번 삭제 오류

- **bug_id**: `BUG-D08-02`
- **오류명**: 특정 댓글(ID 9)에 대해 삭제를 요청했을 때, 요청한 9번 댓글 대신 이전 댓글(ID 8)이 삭제되는 타깃 왜곡 오류
- **확인전략**: `ACTION_REPLAY`
- **대상 댓글**:
  - Comment ID: `9` (요청 대상) vs `8` (실제 삭제 대상)
  - 소속 업무: Task ID `5` (`CORE-105`, MySQL 쿼리 인덱스 최적화)
  - Project ID: `1` (Orbit Core Platform)
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 업무 5번에 댓글 8번(`윤지아`: 슬로우 쿼리 로그 수집 완료)과 댓글 9번(`최영진`: 복합 인덱스 적용 검토 중)이 모두 존재함.
- **상태 전이 추적 (State Transition)**:
  - **작업 전 상태 (Before Action)**: 업무 5번에 댓글 8번, 9번 존재 (`count = 2`)
  - **수행 동작 (User Action)**: 댓글 9번의 삭제(휴지통) 아이콘 클릭 (`DELETE /api/comments/9`)
  - **동작 직후 응답 (Immediate Response)**: `{ success: true, message: "댓글이 삭제되었습니다.", data: { requested_id: 9, deleted_id: 8 } }`
  - **액션 리플레이 / 재조회 후 상태 (Action Replay / Re-query)**: 댓글 9번은 그대로 남아있고, 댓글 8번이 목록에서 사라짐.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 좌측 프로젝트 사이드바에서 [Orbit Core Platform] (ID: 1) 선택.
  2. `CORE-105` (업무 5번: MySQL 쿼리 인덱스 최적화) 카드를 클릭하여 업무 상세 슬라이드오버 드로어를 오픈.
  3. 하단 [댓글 및 피드백] 섹션으로 스크롤하여 `#C8`, `#C9` 댓글을 확인.
  4. `#C9` (최영진: 복합 인덱스 적용 검토 중) 댓글 우측의 삭제(휴지통) 아이콘 클릭 후 확인 팝업 승인.
  5. 댓글 목록이 갱신된 후, `#C9` 댓글은 여전히 남아있고 `#C8` 댓글이 사라진 상태 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: `#C9` 댓글 카드가 화면에 유지되고, 상단 `#C8` 댓글이 제거됨.
  - **DOM**: 드로어 내 `div` 요소 중 `#C9` 텍스트 노드는 존재하나 `#C8` 요소가 부재.
  - **Network**: `DELETE /api/comments/9` 호출 후 `GET /api/tasks/5` 응답 내 `comments` 배열에 `id: 9`만 포함되고 `id: 8`이 누락됨.
  - **State**: SQLite `SELECT id FROM comments WHERE id IN (8, 9)` 실행 시 `id: 9`만 1건 반환됨.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `DELETE /api/comments/:id` 핸들러 내 `if (commentId === 9) { db.run('DELETE FROM comments WHERE id = 8', ...) }` 하드코딩 분기를 제거하고 요청 파라미터 `commentId`를 파라미터 바인딩으로 전달하도록 수정.

---

## 3. BUG-D08-03: 특정 조건 필터링 하에서 업무 3번 담당자 변경 시 1번 업무 변조 오류

- **bug_id**: `BUG-D08-03`
- **오류명**: 프로젝트 1번에서 담당자 '최영진' 필터를 적용한 뒤 업무 3번의 담당자를 변경하면, 업무 3번 대신 1번 업무(`CORE-101`)의 담당자가 변조되는 다단계 시퀀스 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **트리거 시퀀스 (Sequential Condition)**:
  - 단계 1: 프로젝트 ID `1` (Orbit Core Platform) 활성화
  - 단계 2: 상단 툴바에서 담당자 필터를 `최영진`으로 선택 (`filterAssignee = '최영진'`)
  - 단계 3: 필터링된 결과 중 `CORE-103` (업무 3번, Redis 세션 클러스터 이중화) 선택
  - 단계 4: 담당자를 다른 팀원(예: `김도현` 또는 `윤지아`)으로 변경
- **상태 전이 추적 (State Transition)**:
  - **정상 기대 동작 (Expected)**: 업무 3번의 `assignee_name`이 선택한 팀원으로 변경되고, 1번 업무는 불변.
  - **실제 이상 동작 (Actual)**: 업무 3번의 담당자는 여전히 `최영진`으로 유지되고, 업무 1번(`CORE-101`)의 담당자가 선택한 팀원으로 변조됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. [Orbit Core Platform] (ID: 1) 프로젝트로 이동.
  2. 상단 툴바의 [모든 담당자] 드롭다운에서 `최영진 (인프라/데브옵스 엔지니어)` 선택.
  3. 화면에 최영진 담당 업무인 `CORE-103` 카드가 필터링되어 나타남.
  4. `CORE-103` 카드를 클릭하여 상세 드로어를 열고, [담당자] 셀렉트박스를 `윤지아 (수석 백엔드 엔지니어)`로 변경.
  5. 상단 필터를 [모든 담당자]로 초기화한 뒤 칸반 보드 확인.
  6. `CORE-103`의 담당자는 여전히 `최영진`인 반면, `CORE-101` (Kubernetes 1.30 업그레이드)의 담당자가 본래 `김도현`에서 `윤지아`로 잘못 변경되어 있음을 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: `CORE-103` 카드의 담당자 배지는 `최영진` 유지, `CORE-101` 카드의 담당자 배지가 `윤지아`로 변경됨.
  - **DOM**: `div[data-task-id="1"]` 내 담당자 텍스트가 `윤지아`, `div[data-task-id="3"]` 내 담당자 텍스트가 `최영진`.
  - **Network**: `PATCH /api/tasks/3/assignee` 호출 시 서버 응답에 `{ requested_task_id: 3, affected_task_id: 1 }` 반환.
  - **State**: SQLite `SELECT id, task_key, assignee_name FROM tasks WHERE id IN (1, 3)` 결과:
    - `id: 1 -> assignee_name = '윤지아'`
    - `id: 3 -> assignee_name = '최영진'`
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/tasks/:id/assignee` 핸들러에서 `if (isProj1 && isAssigneeChoi && isTask3)` 조건 분기에서 `UPDATE tasks SET assignee_id = ?, assignee_name = ? WHERE id = 1`로 왜곡하는 하드코딩을 제거하고 항상 타깃 `taskId`를 업데이트하도록 수정.

---

## 4. BUG-D08-04: 특정 조건 필터링 하에서 업무 21번 상태 변경 시 DB 미반영 오류

- **bug_id**: `BUG-D08-04`
- **오류명**: 프로젝트 3번에서 우선순위 'URGENT' 필터를 적용한 뒤 업무 21번의 상태를 변경하면 성공 응답을 반환하지만 실제 DB에는 반영되지 않는 다단계 시퀀스 오류
- **확인전략**: `SEQUENCE_REPLAY`
- **트리거 시퀀스 (Sequential Condition)**:
  - 단계 1: 프로젝트 ID `3` (Orbit Data Pipeline) 활성화
  - 단계 2: 상단 툴바에서 우선순위 필터를 `URGENT`로 선택 (`filterPriority = 'URGENT'`)
  - 단계 3: 필터링된 결과 중 `DATA-103` (업무 21번, Spark 스트리밍 메모리 누수 패치) 선택
  - 단계 4: 업무 상태를 `IN_PROGRESS`에서 `DONE` 또는 `REVIEW`로 변경
- **상태 전이 추적 (State Transition)**:
  - **정상 기대 동작 (Expected)**: 상태 변경 후 재조회 시 변경된 상태(`DONE` 또는 `REVIEW`)로 저장 및 렌더링.
  - **실제 이상 동작 (Actual)**: 성공 메시지 반환 후 재조회 시 DB 영속화가 생략되어 초기 상태인 `IN_PROGRESS`로 강제 원복됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 좌측 사이드바에서 [Orbit Data Pipeline] (ID: 3) 프로젝트 선택.
  2. 상단 툴바의 [모든 우선순위] 드롭다운에서 `긴급 (URGENT)` 필터 선택.
  3. 필터링된 결과 목록 중 `DATA-103` (Spark 스트리밍 메모리 누수 패치, ID: 21) 카드를 확인.
  4. 카드 우측의 [완료 처리] 버튼을 클릭하거나 상세 드로어에서 상태를 `DONE`으로 변경.
  5. 상단 툴바의 우선순위 필터를 `모든 우선순위`로 해제하거나 페이지 새로고침.
  6. `DATA-103` 카드가 [완료됨]이 아닌 여전히 [진행 중] 컬럼에 머물러 있는 현상 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 필터 해제 또는 새로고침 후 `DATA-103` 카드가 [진행 중] 컬럼에 렌더링됨.
  - **DOM**: `div[data-task-id="21"]`의 `data-task-status`가 `'IN_PROGRESS'`.
  - **Network**: `GET /api/tasks?projectId=3` 응답 내 `id: 21` 객체의 `status` 필드가 `'IN_PROGRESS'`.
  - **State**: SQLite `SELECT status FROM tasks WHERE id = 21` 쿼리 결과가 `'IN_PROGRESS'`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/tasks/:id/status` 핸들러 내 `if (isProj3 && isUrgentFilter && isTask21)` 분기를 제거하고 정상적인 `UPDATE tasks SET status = ? WHERE id = ?` 구문이 실행되도록 통합.

---

## 5. BUG-D08-05: 프로젝트 4번 알림 환경설정 저장 후 재입장 시 초기화 오류

- **bug_id**: `BUG-D08-05`
- **오류명**: 프로젝트 4번(Orbit Design System)의 알림 환경설정(Slack 알림, 주간 이메일 리포트)을 켜고 저장한 직후에는 성공 알림이 뜨지만, 다른 프로젝트로 이동 후 재입장하면 기존 미설정(OFF) 상태로 원복되는 오류
- **확인전략**: `STATE_REVISIT`
- **대상 프로젝트**:
  - Project ID: `4`
  - Project Key: `DSN`
  - Project Name: `Orbit Design System`
- **사전조건 (Precondition)**:
  - 시스템 초기 상태 (`POST /api/test/reset` 호출 완료).
  - 프로젝트 4번의 초기 설정: `slack_notification = 0`, `email_digest = 0`.
- **상태 전이 추적 (State Transition)**:
  - **저장 전 값 (Pre-Save Value)**: `slack_notification = 0`, `email_digest = 0` (스위치 비활성화)
  - **사용자 변경 값 (User Input Value)**: Slack 실시간 알림 ON, 주간 업무 리포트 ON
  - **저장 직후 값 (Post-Save Value in UI)**: 토글이 켜진 상태로 "프로젝트 알림 환경설정이 저장되었습니다" 토스트 노출.
  - **재방문 후 값 (Revisit Value)**: 타 프로젝트(예: 프로젝트 1번)를 클릭한 뒤 다시 프로젝트 4번을 선택하여 설정 모달을 열었을 때, 토글이 다시 OFF(0)로 원복됨.
- **정확한 재현 절차 (Reproduction Steps)**:
  1. 좌측 사이드바에서 [Orbit Design System] (ID: 4) 프로젝트 선택.
  2. 상단 헤더 우측의 [프로젝트 설정] 버튼 클릭.
  3. [Slack 실시간 알림] 및 [주간 업무 요약 리포트 이메일] 스위치를 모두 활성화(체크).
  4. 하단 [설정 저장] 버튼 클릭 (`PATCH /api/projects/4/settings`).
  5. "프로젝트 알림 환경설정이 저장되었습니다" 토스트 메시지 확인 및 모달 자동 닫힘.
  6. 좌측 사이드바에서 [Orbit Core Platform] (ID: 1) 프로젝트를 클릭하여 이동.
  7. 다시 좌측 사이드바에서 [Orbit Design System] (ID: 4) 프로젝트를 클릭하여 복귀.
  8. 상단 [프로젝트 설정] 버튼을 다시 클릭하여 모달을 열었을 때, 방금 켰던 알림 스위치 2개가 모두 꺼진 상태(OFF)로 되돌아가 있음을 확인.
- **필요한 Evidence (증거 데이터)**:
  - **UI**: 재입장 후 [프로젝트 설정] 모달 내부의 2개 토글 스위치가 모두 회색(비활성) 상태.
  - **DOM**: `input[type="checkbox"]` 요소들의 `checked` 프로퍼티가 모두 `false`.
  - **Network**: 재방문 시 호출된 `GET /api/projects` 응답에서 `id: 4` 객체의 `slack_notification: 0`, `email_digest: 0`.
  - **State**: SQLite `SELECT slack_notification, email_digest FROM projects WHERE id = 4` 결과가 `0 | 0`.
- **원인 분석 및 수정 가이드**:
  - `backend/server.js`의 `PATCH /api/projects/:id/settings` 핸들러 내 `if (projId === 4)` 블록에서 DB `UPDATE projects SET ...` 실행 없이 성공 응답만 리턴하는 버그 분기를 삭제하고 표준 UPDATE 구문으로 처리하도록 수정.
