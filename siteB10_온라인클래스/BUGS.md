# B-10 Intentional Bugs

## B10-ERR01

- bug_id: B10-ERR01
- CSV No: 423
- CSV 오류명: 워크플로우 우회 / 단계 우회
- 확인전략: SEQUENCE_REPLAY
- DQN_학습대상: O
- 화면 위치: 강의실 목차의 `수료 확인` 버튼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B10-ERR01"]`
- precondition: 필수 강의와 퀴즈를 완료하지 않은 수강생이 `C0001` 강의를 수강 중이다.
- trigger sequence: 강의실 진입 → 첫 콘텐츠 열기 → 학습 완료 → 목차 복귀 → 다음 단계 이동 → 수료 확인 선택
- 정상 기대 동작: 필수 학습, 퀴즈, 과제 완료 전에는 수료 확인 단계가 비활성화된다.
- 실제 오류 동작: 첫 콘텐츠만 완료해도 수료 확인 화면으로 이동할 수 있다. Backend는 수료증 발급을 거부한다.
- 코드상 의도된 원인: Frontend 단계 이동 조건이 수료 조건을 gating하지 않는다.
- 필요한 Evidence: ActionLog + UI + DOM + State + Network
- Confirmation Oracle: `/api/completion-status/:courseId`의 `eligible=false`와 활성화된 수료 확인 UI를 비교한다.
- Reset 이후 재현 절차: Reset → `C0001` 강의실 → 첫 콘텐츠 완료 → 수료 확인.
- DQN 기대 행동: UI 이동 가능 여부와 수료증 발급 API 거부를 함께 확인한다.

## B10-ERR02

- bug_id: B10-ERR02
- CSV No: 591
- CSV 오류명: 다단계 워크플로우 부분적 롤백 실패
- 확인전략: SEQUENCE_REPLAY
- DQN_학습대상: O
- 화면 위치: 과제 제출 화면
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B10-ERR02"]`
- precondition: 아직 제출하지 않은 과제 작성 화면을 연다.
- trigger sequence: 답안 입력 → 첨부 자료명 입력 → 미리보기 → 제출 취소 → 작성 화면 확인
- 정상 기대 동작: 제출 취소 시 임시 제출 상태가 일관되게 초기화되거나 초안으로 복원된다.
- 실제 오류 동작: 답안은 초기화되지만 첨부 자료와 상단 제출 요약은 남는다.
- 코드상 의도된 원인: 취소 함수가 answer와 preview만 초기화하고 attachment 상태를 유지한다.
- 필요한 Evidence: ActionLog + UI + State + Network
- Confirmation Oracle: 서버 제출 기록은 없지만 UI 첨부 요약이 남아 있다.
- Reset 이후 재현 절차: Reset → 과제 → 답안/첨부 입력 → 미리보기 → 제출 취소.
- DQN 기대 행동: 취소 후 본문, 첨부, 서버 제출 상태를 비교한다.

## B10-ERR03

- bug_id: B10-ERR03
- CSV No: 1679
- CSV 오류명: 페이지네이션 없는 슬라이드
- 확인전략: SEQUENCE_REPLAY
- DQN_학습대상: O
- 화면 위치: 강의실 학습 슬라이드
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B10-ERR03"]`
- precondition: 슬라이드 8장 이상인 강의를 연다.
- trigger sequence: 슬라이드 열기 → 다음 여러 번 클릭 → 이전 클릭 → 위치 정보 확인
- 정상 기대 동작: 현재 슬라이드 번호와 전체 슬라이드 수가 표시된다.
- 실제 오류 동작: 슬라이드 내용은 바뀌지만 페이지 번호와 진행 인디케이터가 없다.
- 코드상 의도된 원인: 슬라이드 메타데이터는 받지만 페이지 인디케이터를 렌더링하지 않는다.
- 필요한 Evidence: ActionLog + UI + DOM + State
- Confirmation Oracle: 슬라이드 텍스트는 변경되지만 `n / 8` 형태 DOM이 없다.
- Reset 이후 재현 절차: Reset → 강의실 → 슬라이드 이동.
- DQN 기대 행동: 슬라이드 상태 변화와 위치 표시 DOM 부재를 비교한다.

## B10-ERR04

- bug_id: B10-ERR04
- CSV No: 194
- CSV 오류명: 정보 지속성 부족 (Persistence)
- 확인전략: STATE_REVISIT
- DQN_학습대상: 조건부
- 화면 위치: 강의별 메모 패널
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B10-ERR04"]`
- precondition: `C0002` 강의에 기존 학습 메모가 있다.
- trigger sequence: 메모 열기 → 수정 → 저장 → 다른 화면 이동 → 재방문 버튼으로 재접속 흐름 모사 → 동일 메모 확인
- 정상 기대 동작: 최신 저장 내용이 표시된다.
- 실제 오류 동작: Backend에는 최신 내용이 저장되지만 Frontend가 이전 로컬 캐시 값을 우선 표시한다.
- 코드상 의도된 원인: 특정 강의에서 저장 전 값을 `staleNoteText`로 보존하고 재방문 시 이를 우선 사용한다.
- 필요한 Evidence: ActionLog + UI + State + Network
- Confirmation Oracle: `/api/study-notes` 최신 값과 재방문 화면의 textarea 값이 다르다.
- Reset 이후 재현 절차: Reset → `C0002` 메모 수정 저장 → 재방문.
- DQN 기대 행동: 저장 응답, 재방문 UI 값, API 최신 값을 비교한다.

## B10-ERR05

- bug_id: B10-ERR05
- CSV No: 1972
- CSV 오류명: 캐시 상태 불일치
- 확인전략: ACTION_REPLAY
- DQN_학습대상: O
- 화면 위치: 강의실 상단 진도율 요약과 목차
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B10-ERR05"]`
- precondition: 여러 콘텐츠가 있는 강의를 수강 중이다.
- trigger sequence: 미완료 콘텐츠에서 `학습 완료` 클릭
- 정상 기대 동작: 목차 완료 상태와 상단 진도율 요약이 함께 갱신된다.
- 실제 오류 동작: 목차는 완료로 바뀌지만 상단 진도율 요약은 이전 퍼센트를 유지한다.
- 코드상 의도된 원인: 완료 후 `completedLessonIds`만 갱신하고 `summaryProgress` 캐시는 갱신하지 않는다.
- 필요한 Evidence: ActionLog + UI + State + Network
- Confirmation Oracle: 완료 항목 수로 계산한 진도와 상단 퍼센트가 불일치한다.
- Reset 이후 재현 절차: Reset → 강의실 → 미완료 콘텐츠 학습 완료.
- DQN 기대 행동: 목차 체크 상태, 저장 API, 상단 진도율을 비교한다.
