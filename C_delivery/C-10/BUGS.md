# WorkGrid (C-10) Enterprise Project Management Bug Specification

## 사이트 개요
- **Site ID**: C-10
- **Service Name**: WorkGrid (엔터프라이즈 프로젝트 & 애자일 협업 플랫폼)
- **Role**: DQN Final Unseen Generalization Test Environment
- **Strategies Covered**: `ACTION_REPLAY`, `SEQUENCE_REPLAY`, `STATE_REVISIT`
- **Frontend**: `http://localhost:5182`
- **Backend**: `http://localhost:5009`
- **Database**: SQLite (`backend/data/workgrid.db`)

---

## 1. BUG 1 — Milestone Delete Cascade Failure

```text
bug_id:
C-10-057

error_name:
Milestone Delete Cascade Failure

strategy:
ACTION_REPLAY

confirmation_strategy:
Action + Revisit Related Screen + Error Boundary DOM

precondition:
프로젝트(P-101 Atlas Mobile)의 마일스톤 M-01(Core Architecture v1.0)에 하위 이슈들이 연계되어 존재한다.

trigger:
1. 마일스톤 목록에서 M-01의 [삭제] 버튼 클릭
2. 상단/사이드바 네비게이션에서 [이슈 트래커] 또는 [칸반 보드] 화면으로 이동

normal_behavior:
마일스톤 삭제 시 하위 이슈의 milestone_id가 정상적으로 NULL 처리되거나 cascade 정리되어 이슈 목록이 정상 조회되어야 한다.

actual_error_behavior:
마일스톤만 삭제되고 하위 이슈에 고아 외래키(dangling milestone_id = 'M-01')가 잔존하여, 백엔드 이슈 조회 API가 500 Runtime Error를 반환하고 프론트엔드 Error Boundary Fallback UI가 렌더링된다.

required_evidence:
- DOM Error Boundary Fallback: "문제가 발생했습니다. 프로젝트 데이터를 불러오는 중 오류가 발생했습니다. [다시 시도]"

verification_method:
마일스톤 M-01 삭제 → [이슈 트래커] 이동 → Error Boundary Fallback 컴포넌트 렌더링 확인
```

---

## 2. BUG 2 — Project Member Invitation Cross-leak

```text
bug_id:
C-10-786

error_name:
Project Member Invitation Cross-leak

strategy:
ACTION_REPLAY

confirmation_strategy:
Action + Target Comparison (Network & DOM)

precondition:
현재 활성 프로젝트가 P-101(Atlas Mobile)인 상태이다.

trigger:
[멤버 관리] 화면에서 [새 멤버 초대] 클릭 → 이메일 'member@example.com' 입력 → [초대장 발송] 클릭.

normal_behavior:
현재 활성 프로젝트(P-101)의 초대 API(`POST /workspace/projects/P-101/invitations`)가 호출되고 현재 프로젝트 멤버로 추가되어야 한다.

actual_error_behavior:
클라이언트 스테이트의 stale project 참조로 인해 다른 프로젝트(P-102 Orion Commerce)의 초대 API(`POST /workspace/projects/P-102/invitations`)가 호출되어, 현재 P-101 멤버 목록에는 새 사용자가 추가되지 않고 P-102에 등록된다.

required_evidence:
- Network: POST /workspace/projects/P-102/invitations
- DOM: 현재 P-101 프로젝트 멤버 수(4명) 미변경

verification_method:
P-101에서 멤버 초대 발송 → Network 요청 경로 확인(P-102) 및 현재 화면 멤버 목록 미증가 확인
```

---

## 3. BUG 3 — Filter Tag State Persistence Bug

```text
bug_id:
C-10-180

error_name:
Filter Tag State Persistence Bug

strategy:
STATE_REVISIT

confirmation_strategy:
Filter Active → Modal Open → Modal Close → State Revisit & List Comparison

precondition:
P-101 이슈 트래커에 전체 24개 이슈(그 중 '내 이슈' 6개)가 등록되어 있다.

trigger:
1. [내 이슈] 필터 버튼 클릭 (표시 이슈: 6개)
2. 임의의 이슈 카드를 클릭하여 상세 모달 오픈
3. 상세 모달의 닫기 버튼 클릭

normal_behavior:
모달을 닫은 후에도 [내 이슈] 필터 활성 상태가 유지되어 6개 이슈만 표시되어야 한다.

actual_error_behavior:
모달 닫기 핸들러가 이슈 쿼리 상태를 초기화하면서 필터 상태를 '전체(all)'로 리셋시켜, [내 이슈] 뱃지가 비활성화되고 목록이 24개로 급증한다.

required_evidence:
- Before Modal: [내 이슈] Active, 표시 이슈: 6개
- After Modal Close: [내 이슈] Inactive, 표시 이슈: 24개

verification_method:
[내 이슈] 필터 선택 (6개 확인) → 이슈 상세 모달 오픈 → 모달 닫기 → 필터 비활성화 및 24개 이슈 복원 관찰
```

---

## 4. BUG 4 — Sprint Due-date Off-by-one Bug

```text
bug_id:
C-10-1445

error_name:
Sprint Due-date Off-by-one Bug

strategy:
ACTION_REPLAY

confirmation_strategy:
Input Date vs Output Rendered Date Comparison

precondition:
스프린트 관리 화면에서 새 스프린트 등록 모달을 연다.

trigger:
종료일(Due Date) 입력 필드에 "2026-10-31"을 입력하고 [스프린트 저장] 버튼을 클릭한다.

normal_behavior:
입력한 종료일인 "2026-10-31"이 그대로 저장되고 스프린트 카드에도 "Ends 2026-10-31"로 렌더링되어야 한다.

actual_error_behavior:
백엔드 Date 객체 직렬화 및 타임존 파싱 오프셋 처리 오류로 인해 하루 이전 날짜인 "2026-10-30"으로 저장/응답된다.

required_evidence:
- Input Date: "2026-10-31"
- DOM Rendered Sprint Card: "Ends 2026-10-30"

verification_method:
종료일 "2026-10-31" 입력 후 저장 → 생성된 스프린트 카드의 종료일 텍스트("Ends 2026-10-30") 확인
```

---

## 5. BUG 5 — Dynamic Kanban Hydration Mismatch

```text
bug_id:
C-10-1874

error_name:
Dynamic Kanban Hydration Mismatch

strategy:
ACTION_REPLAY

confirmation_strategy:
Initial Page Render + Immediate Action + DOM Unresponsiveness

precondition:
사용자가 칸반 보드(`/projects/:projectId/board`) 화면에 진입한다.

trigger:
페이지가 렌더링된 직후(초기 하이드레이션 완료 전) 특정 태스크 카드의 [수정] 버튼을 즉시 클릭한다.

normal_behavior:
정상적인 이벤트 리스너가 트리거되어 태스크 수정 모달이 열려야 한다.

actual_error_behavior:
SSR/CSR 간 동적 태스크 식별자 및 정렬 불일치로 인해 React DOM 재조정 과정에서 이벤트 리스너 바인딩이 누락되어, 클릭해도 모달이 열리지 않고 아무런 DOM 변화가 발생하지 않는다 (0 DOM Change).

required_evidence:
- Immediate Click 실행 후 DOM 상태 변화 없음 (0 DOM Mutation)
- 브라우저 콘솔: Hydration warning

verification_method:
칸반 보드 진입 직후 태스크 카드 [수정] 버튼 즉시 클릭 → 모달 미오픈 및 화면 무반응 확인
```

---

## 6. Deterministic Reset API
- **Endpoint**: `POST http://localhost:5009/workspace/test/reset`
- **Action**: 프로젝트, 마일스톤, 이슈(24개), 스프린트, 멤버 데이터를 초기 Seed 상태로 100% 원복.
