# B-02 Intentional Bugs

## B02-ERR01

- CSV No: 1700
- 오류명: 의도치 않은 더블 클릭 (이벤트 중복)
- 확인전략: ACTION_REPLAY
- Precondition: 판매중 상품 `P0007` 또는 `P0021` 상세 화면에서 거래 예약 모달을 연다.
- Trigger: `거래 예약하기` 버튼을 한 번 클릭한다.
- 정상 동작: 예약 요청 한 건만 생성된다.
- 실제 오류 동작: 동일 예약 API 요청 2개가 전송되어 서로 다른 reservationId 두 건이 생성된다.
- 코드상 의도된 원인: 프론트엔드 클릭 핸들러가 재현 대상 상품에서 예약 생성 함수를 두 번 호출한다.
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B02-ERR01"]`
- Evidence: ActionLog + Network + UI + State
- Confirmation Oracle: 단일 클릭 후 `GET /api/reservations?userId=1`에 동일 productId 예약이 두 건 추가된다.
- DQN 기대 행동: 상품 상세 진입, 예약 모달 열기, 버튼 클릭, 네트워크 요청 수와 예약 목록 상태 비교.

## B02-ERR02

- CSV No: 1972
- 오류명: 캐시 상태 불일치
- 확인전략: ACTION_REPLAY
- Precondition: 찜하지 않은 상품 상세 화면을 연다.
- Trigger: 하트 모양 `찜하기` 버튼을 클릭한다.
- 정상 동작: 상세 하트, 헤더 찜 개수, 찜 목록이 모두 갱신된다.
- 실제 오류 동작: Backend는 저장하지만 상세 하트만 갱신되고 헤더 찜 개수와 기존 찜 목록 캐시는 이전 값을 유지한다.
- 코드상 의도된 원인: POST `/api/favorites` 후 상세 상태만 변경하고 favorites 캐시를 재조회하지 않는다.
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B02-ERR02"]`
- Evidence: ActionLog + UI + Network + State
- Confirmation Oracle: POST 성공 후 헤더 찜 개수는 변하지 않고, 새로고침 또는 강제 재조회 후 서버 상태와 일치한다.
- DQN 기대 행동: 상세 하트 클릭, 헤더 카운트 관찰, favorites API 상태와 UI 상태 비교.

## B02-ERR03

- CSV No: 2097
- 오류명: 행동 확인 없음
- 확인전략: ACTION_REPLAY
- Precondition: 내 판매 목록에서 판매자 소유 상품 `P0012`가 보인다.
- Trigger: 상품 관리 메뉴의 `삭제` 버튼을 클릭한다.
- 정상 동작: 삭제 확인 모달이 표시되고 사용자가 확인해야 DELETE API가 실행된다.
- 실제 오류 동작: 확인 모달 없이 즉시 DELETE API가 호출되어 상품이 삭제된다.
- 코드상 의도된 원인: 특정 상품 ID는 확인 모달 상태를 거치지 않고 삭제 API를 바로 호출한다.
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B02-ERR03"]`
- Evidence: ActionLog + UI + Network + State
- Confirmation Oracle: 클릭 직후 DELETE `/api/products/P0012`가 실행되고 확인 모달 DOM이 나타나지 않는다.
- DQN 기대 행동: 내 판매 목록 탐색, 삭제 클릭, 모달 부재와 DELETE 요청 발생 확인.

## B02-ERR04

- CSV No: 1648
- 오류명: 성공/실패 피드백 부재
- 확인전략: ACTION_REPLAY
- Precondition: 내 판매 목록 또는 거래 내역에 `P0018` 예약중 거래가 존재한다.
- Trigger: `거래 완료 처리` 버튼을 클릭한다.
- 정상 동작: 거래완료 상태 변경과 함께 성공 토스트가 표시된다.
- 실제 오류 동작: Backend는 상태를 저장하고 배지도 변경되지만 성공 토스트가 표시되지 않는다.
- 코드상 의도된 원인: `P0018` 거래 완료 처리 경로에서 성공 토스트 호출을 건너뛴다.
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B02-ERR04"]`
- Evidence: ActionLog + UI + Network + DOM
- Confirmation Oracle: POST `/api/transactions/T9000/complete` 성공 후 상태 텍스트는 바뀌지만 `.toast` 성공 메시지가 없다.
- DQN 기대 행동: 거래 완료 버튼 클릭, 상태 배지 변화와 토스트 DOM 부재를 함께 확인.

## B02-ERR05

- CSV No: 1611
- 오류명: 페이징 드리프트 및 리스트 중복
- 확인전략: ACTION_REPLAY
- Precondition: 메인 상품 목록 1페이지를 연다.
- Trigger: `상품 더보기` 버튼을 클릭한다.
- 정상 동작: 다음 페이지의 고유 상품만 추가된다.
- 실제 오류 동작: 이전 페이지 마지막 3개 상품이 다시 추가되어 같은 productId 카드가 중복 표시된다.
- 코드상 의도된 원인: 프론트엔드 목록 병합 코드가 현재 목록의 마지막 3개 항목을 새 응답 앞에 덧붙인다.
- 관련 파일: `frontend/src/app/page.jsx`
- data-bug-id selector: `[data-bug-id="B02-ERR05"]`
- Evidence: ActionLog + UI + DOM + Network + State
- Confirmation Oracle: Backend 페이지 응답에는 중복 ID가 없지만 DOM에는 같은 `data-product-id`가 두 번 이상 존재한다.
- DQN 기대 행동: 더보기 클릭, 네트워크 응답 ID와 렌더링된 카드 ID 집합 비교.
