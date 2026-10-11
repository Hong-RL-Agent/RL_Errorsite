# B-04 Intentional Bugs

## B04-ERR01

- bug_id: B04-ERR01
- CSV No: 1700
- CSV 오류명: 의도치 않은 더블 클릭 (이벤트 중복)
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 단일 클릭에서 API 요청 수와 예매 결과 수 비교
- 화면 위치: 예매 확인 모달의 `예매 확정` 버튼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id: `[data-bug-id="B04-ERR01"]`
- precondition: 영화, 상영시간, 예약 가능 좌석 2개 이상을 선택하고 예매 확인 모달에 진입한다.
- trigger: `예매 확정` 버튼을 한 번 클릭한다.
- 정상 동작: 예매 생성 API가 한 번 호출되고 예매 한 건이 생성된다.
- 실제 오류 동작: 프론트엔드가 좌석 묶음을 나누어 예매 생성 API를 두 번 호출하고 예매 두 건이 생성된다.
- 코드상 원인: 클릭 핸들러에서 2개 이상 선택 좌석을 두 요청으로 분리해 `POST /api/bookings`를 중복 호출한다.
- 필요한 Evidence: ActionLog + Network + State + UI
- Confirmation Oracle: 한 번의 클릭 후 Network에 `POST /api/bookings` 두 건, 내 예매 목록에 신규 예매 두 건이 나타난다.
- 재현 단계: 영화 선택 → 상영시간 선택 → 빈 좌석 2개 선택 → 예매 확인 → 예매 확정 클릭.
- DQN 기대 행동: 클릭 전후 요청 개수, booking id 개수, 티켓 UI 증가를 비교한다.

## B04-ERR02

- bug_id: B04-ERR02
- CSV No: 1972
- CSV 오류명: 캐시 상태 불일치
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 취소 API 성공 후 목록 상태와 통계 카드 상태 비교
- 화면 위치: 내 예매 목록 `B0001` 예매 취소 버튼 및 상단 통계 카드
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id: `[data-bug-id="B04-ERR02"]`
- precondition: 내 예매 화면에서 예매확정 건수와 `B0001` 예매를 확인한다.
- trigger: `B0001`의 `예매 취소` 버튼을 클릭한다.
- 정상 동작: 목록 상태가 예매취소로 변경되고 예매확정 건수가 감소한다.
- 실제 오류 동작: 목록 상태만 예매취소로 바뀌고 통계 카드는 이전 캐시 값을 유지한다.
- 코드상 원인: 특정 취소 경로에서 statistics API 재조회와 stats 상태 갱신을 건너뛴다.
- 필요한 Evidence: ActionLog + UI + State + Network
- Confirmation Oracle: `POST /api/bookings/B0001/cancel` 성공 후 티켓 상태와 통계 숫자가 불일치한다.
- 재현 단계: 내 예매 목록 확인 → `B0001` 취소 → 상태와 통계 카드 비교.
- DQN 기대 행동: 취소 전후 DOM 숫자와 API 상태를 비교한다.

## B04-ERR03

- bug_id: B04-ERR03
- CSV No: 1648
- CSV 오류명: 성공/실패 피드백 부재
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 정상 상태 변경 후 성공 피드백 DOM 부재 확인
- 화면 위치: `B0002` 좌석 변경 모달
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id: `[data-bug-id="B04-ERR03"]`
- precondition: `B0002` 예매의 좌석 변경 모달을 연다.
- trigger: 다른 빈 좌석을 선택하고 `변경 저장`을 클릭한다.
- 정상 동작: 좌석이 변경되고 성공 토스트가 표시된다.
- 실제 오류 동작: Backend에는 좌석 변경이 저장되고 티켓 좌석도 바뀌지만 성공 토스트가 표시되지 않는다.
- 코드상 원인: 특정 예매 ID에서는 좌석 변경 후 toast 호출을 생략한다.
- 필요한 Evidence: ActionLog + UI + Network + DOM
- Confirmation Oracle: `PATCH /api/bookings/B0002/seats` 성공 후 `.toast` 성공 메시지가 없다.
- 재현 단계: `B0002` 좌석 변경 → 빈 좌석 선택 → 변경 저장 → 티켓 좌석과 토스트 확인.
- DQN 기대 행동: Network 성공, 좌석 텍스트 변경, 피드백 DOM 부재를 함께 확인한다.

## B04-ERR04

- bug_id: B04-ERR04
- CSV No: 2097
- CSV 오류명: 행동 확인 없음
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 위험 행동 전 확인 모달 부재와 DELETE 요청 발생 확인
- 화면 위치: 취소된 예매 `B0003`의 `내역 삭제` 버튼
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id: `[data-bug-id="B04-ERR04"]`
- precondition: 내 예매 내역에서 이미 취소된 `B0003` 예매가 보인다.
- trigger: `내역 삭제`를 클릭한다.
- 정상 동작: 삭제 확인 모달이 나타나고 확인 후 삭제된다.
- 실제 오류 동작: 확인 모달 없이 DELETE API가 즉시 실행된다.
- 코드상 원인: 특정 취소 예매 ID에서 확인 모달 상태를 거치지 않고 삭제 API를 직접 호출한다.
- 필요한 Evidence: ActionLog + UI + Network + State
- Confirmation Oracle: 클릭 직후 `DELETE /api/bookings/B0003`가 발생하고 확인 모달 DOM이 없다.
- 재현 단계: `B0003` 찾기 → 내역 삭제 클릭 → 모달 부재와 목록 제거 확인.
- DQN 기대 행동: 클릭 직후 네트워크와 DOM을 관찰한다.

## B04-ERR05

- bug_id: B04-ERR05
- CSV No: 1755
- CSV 오류명: 수정 및 취소 경로 차단
- 확인전략: ACTION_REPLAY
- DQN_학습대상: 취소/닫기 액션 후 모달 유지 상태 확인
- 화면 위치: `B0004` 좌석 변경 모달
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id: `[data-bug-id="B04-ERR05"]`
- precondition: `B0004` 예매 상세에서 좌석 변경 모달을 연다.
- trigger: 다른 좌석을 선택한 뒤 `취소` 또는 닫기 버튼을 클릭한다.
- 정상 동작: 변경 사항을 버리고 모달이 닫힌다.
- 실제 오류 동작: 취소 및 닫기 이벤트가 동작해도 모달이 닫히지 않는다.
- 코드상 원인: 특정 예매 ID와 변경 좌석 상태에서 닫기 함수가 기존 모달 상태를 다시 설정한다.
- 필요한 Evidence: ActionLog + UI + DOM + State
- Confirmation Oracle: 취소/닫기 클릭 후에도 좌석 변경 모달 DOM이 남아 있다.
- 재현 단계: `B0004` 좌석 변경 → 빈 좌석 선택 → 취소 또는 × 클릭 → 모달 유지 확인.
- DQN 기대 행동: 클릭 후 모달 존재 여부와 선택 상태를 관찰한다.
