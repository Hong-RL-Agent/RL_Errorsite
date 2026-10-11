# B-06 Intentional Bugs

## B06-ERR01

- bug_id: B06-ERR01
- CSV No: 2090
- CSV 오류명: 다단계 기억 부담
- 확인전략: SEQUENCE_REPLAY
- DQN_학습대상: 다단계 회원가입 중 이전 단계 복귀 후 폼 상태 보존 여부
- 화면 위치: 회원가입 프로필 설정 화면의 `이전 단계` 버튼과 계정 정보 입력 폼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B06-ERR01"]`
- precondition: 신규 사용자로 회원가입을 시작한다.
- trigger 및 action sequence: 약관 동의 → 이메일/계정/비밀번호 입력 → 인증 코드 발급 → 인증 완료 → 프로필 설정 진입 → 이전 단계 클릭
- 정상 기대 동작: 이전 단계에 입력했던 계정 정보가 그대로 표시된다.
- 실제 오류 동작: 이메일, 계정 ID, 이름, 비밀번호 입력값이 초기화된다.
- 코드상 원인: 이전 단계 이동 함수가 서버 진행 데이터 대신 초기 폼 상태를 다시 세팅한다.
- 필요한 Evidence: ActionLog + UI + DOM + State
- Confirmation Oracle: 최초 입력값과 이전 단계 복귀 후 input value가 다르다.
- Reset 이후 재현 여부: `POST /api/test/reset` 후 동일 입력 순서로 재현된다.
- DQN 기대 행동: 입력값 기록, 인증 완료, 뒤로가기, DOM input value 비교.

## B06-ERR02

- bug_id: B06-ERR02
- CSV No: 1679
- CSV 오류명: 페이지네이션 없는 슬라이드
- 확인전략: SEQUENCE_REPLAY
- DQN_학습대상: 슬라이드 이동 중 현재 위치 정보 부재 확인
- 화면 위치: 온보딩 안내 슬라이드
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B06-ERR02"]`
- precondition: 회원가입을 완료하고 온보딩 화면으로 이동한다.
- trigger 및 action sequence: 첫 슬라이드 확인 → 다음 클릭 → 여러 슬라이드 이동 → 이전 클릭
- 정상 기대 동작: 현재 슬라이드 번호와 전체 슬라이드 개수, 진행 상태가 표시된다.
- 실제 오류 동작: 슬라이드 내용은 바뀌지만 페이지 번호와 인디케이터가 없다.
- 코드상 원인: 온보딩 컴포넌트에서 페이지 인디케이터 렌더링이 누락되어 있다.
- 필요한 Evidence: ActionLog + UI + DOM + State
- Confirmation Oracle: `다음`/`이전` 후 텍스트는 변경되지만 `n / 8` 형태의 DOM이 없다.
- Reset 이후 재현 여부: Reset 후 가입 완료 및 온보딩 진입으로 반복 재현된다.
- DQN 기대 행동: 슬라이드 이동, 콘텐츠 변경 확인, 위치 표시 DOM 부재 확인.

## B06-ERR03

- bug_id: B06-ERR03
- CSV No: 1648
- CSV 오류명: 성공/실패 피드백 부재
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 저장 성공 후 성공 토스트 부재 확인
- 화면 위치: 개인정보 수정 모달의 `저장` 버튼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B06-ERR03"]`
- precondition: 로그인한 사용자가 프로필 수정 화면을 연다.
- trigger 및 action sequence: 닉네임 변경 → 저장 클릭
- 정상 기대 동작: 변경된 닉네임 저장과 성공 토스트 표시
- 실제 오류 동작: Backend 저장과 프로필 카드 갱신은 되지만 성공 토스트가 없다.
- 코드상 원인: 프로필 저장 성공 경로에서 `pushToast` 호출이 생략되어 있다.
- 필요한 Evidence: ActionLog + UI + Network + DOM
- Confirmation Oracle: `PATCH /api/users/:id/profile` 성공 후 `.toast` 성공 메시지가 없다.
- Reset 이후 재현 여부: Reset 후 기본 사용자로 대시보드에서 재현된다.
- DQN 기대 행동: 닉네임 변경, 네트워크 성공, 카드 텍스트 변경, 토스트 부재 확인.

## B06-ERR04

- bug_id: B06-ERR04
- CSV No: 1972
- CSV 오류명: 캐시 상태 불일치
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 설정 저장 후 토글 상태와 요약 카드 상태 비교
- 화면 위치: 알림 설정 패널과 대시보드 요약 카드
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B06-ERR04"]`
- precondition: 계정 설정 화면에서 현재 알림 설정을 확인한다.
- trigger 및 action sequence: 이메일 알림 토글 변경 → 설정 저장
- 정상 기대 동작: 토글과 요약 카드의 알림 상태가 일치한다.
- 실제 오류 동작: Backend와 토글은 새 값이지만 요약 카드는 이전 캐시 값을 유지한다.
- 코드상 원인: 저장 후 `summarySettings` 파생 상태를 갱신하지 않는다.
- 필요한 Evidence: ActionLog + UI + Network + State
- Confirmation Oracle: 저장 후 설정 토글과 요약 카드의 `수신/미수신` 텍스트가 불일치한다.
- Reset 이후 재현 여부: Reset 후 기본 사용자 설정에서 재현된다.
- DQN 기대 행동: 토글 변경, 저장 요청 확인, 두 UI 상태 비교.

## B06-ERR05

- bug_id: B06-ERR05
- CSV No: 1755
- CSV 오류명: 수정 및 취소 경로 차단
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 취소/닫기 이벤트 후 모달 유지 여부
- 화면 위치: 연락처 정보 관리 모달
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B06-ERR05"]`
- precondition: 계정 관리 화면에서 연락처 수정 모달을 연다.
- trigger 및 action sequence: 연락처 변경 → 취소 또는 닫기 클릭
- 정상 기대 동작: 변경 사항을 저장하지 않고 모달이 닫힌다.
- 실제 오류 동작: 취소 및 닫기 버튼을 눌러도 모달이 닫히지 않는다.
- 코드상 원인: 연락처 draft가 기존 값과 다를 때 닫기 함수가 현재 open 상태를 그대로 유지한다.
- 필요한 Evidence: ActionLog + UI + DOM + State
- Confirmation Oracle: 취소/닫기 클릭 후에도 연락처 모달 DOM이 남아 있다.
- Reset 이후 재현 여부: Reset 후 기본 사용자 대시보드에서 재현된다.
- DQN 기대 행동: 연락처 변경, 취소 클릭, 모달 DOM 유지 확인.
