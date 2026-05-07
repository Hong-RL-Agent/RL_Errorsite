# BUGS - site003

## site003-bug01
- type: workflow-bypass
- API endpoint: POST /api/order/complete
- 발생 조건: 결제(pay) 단계 이전에 완료(complete) API 호출
- 관련 파일: server.js
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site003-bug01"]`
- 사용자가 경험하는 증상: 결제를 거치지 않았는데도 주문 완료 처리가 됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site003-bug01","status":"completed","step":4}`
- 코드상 의도된 원인: 현재 상태나 단계를 전혀 검증하지 않고 상태를 강제 할당함
- PPO 에이전트 기대 행동: 순차적 프로세스에서 단계를 뛰어넘어 직접 접근하는 우회 공격 탐지

## site003-bug02
- type: improper-state-transition
- API endpoint: POST /api/order/pay
- 발생 조건: 장바구니 배열이 비어있는 상태에서 결제 요청
- 관련 파일: server.js
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site003-bug02"]`
- 사용자가 경험하는 증상: 장바구니가 비어있음에도 불구하고 결제가 성공하며 다음 상태로 넘어감
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site003-bug02","message":"Payment successful","status":"paid"}`
- 코드상 의도된 원인: 상태 변화 전에 `cart.length > 0`인지 체크하는 비즈니스 로직 부재
- PPO 에이전트 기대 행동: 전제 조건이 충족되지 않은 상태에서 부적절한 상태 전이를 허용함을 탐지

## site003-bug03
- type: undefined-state
- API endpoint: POST /api/order/status
- 발생 조건: 허용되지 않은 임의의 주문 상태 문자열을 전송
- 관련 파일: server.js
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site003-bug03"]`
- 사용자가 경험하는 증상: 시스템에 정의되지 않은 이상한 문자열이 현재 상태값으로 고정됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site003-bug03","status":"DELIVERING_PENDING_UNKNOWN"}`
- 코드상 의도된 원인: 입력된 상태값이 유효한 enum인지 검증하지 않고 메모리에 그대로 덮어씀
- PPO 에이전트 기대 행동: 비정상적 상태 문자열 주입을 통해 정의되지 않은 상태 오류를 식별

## site003-bug04
- type: implicit-state-assumption
- API endpoint: POST /api/order/step
- 발생 조건: 클라이언트에서 단계 값(ex. 4)을 임의로 전송하여 상태 조작
- 관련 파일: server.js
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site003-bug04"]`
- 사용자가 경험하는 증상: 한 번의 클릭으로 UI 스텝바가 즉시 4단계로 변경됨
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site003-bug04","step":4}`
- 코드상 의도된 원인: 클라이언트가 보내는 파라미터를 그대로 신뢰하여 서버 내부 상태 변수로 사용
- PPO 에이전트 기대 행동: 입력 파라미터 조작을 통해 암묵적 상태 검증 누락을 탐지

## site003-bug05
- type: feature-interaction-conflict
- API endpoint: POST /api/order/cancel (and pay)
- 발생 조건: 결제 요청이 처리되는 동안(지연시간 중) 취소 요청이 동시에 발생
- 관련 파일: server.js
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site003-bug05"]`
- 사용자가 경험하는 증상: 주문은 취소되었다고 나오지만 상태는 '결제완료'가 되어 데이터 불일치/충돌이 일어남
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site003-bug05","message":"Conflict generated..."}`
- 코드상 의도된 원인: 두 기능(결제, 취소)이 락 없이 동시에 공유 자원(`orderState`)을 수정하도록 방치함
- PPO 에이전트 기대 행동: 병렬 리퀘스트(Race condition)를 통해 기능 간 상호작용 충돌 오류 유발 및 관찰

## site003-bug06
- type: business-logic-paradox
- API endpoint: POST /api/order/cancel
- 발생 조건: 취소 버튼 클릭 후 상태 조회
- 관련 파일: server.js
- 관련 프론트엔드 data-bug-id selector: `[data-bug-id="site003-bug06"]`
- 사용자가 경험하는 증상: 취소 여부(isCancelled)는 참이지만, 진행 상태(status)는 여전히 이전 상태를 유지하여 배달이 계속되는 모순
- 서버 응답 상태 코드: 200
- 서버 응답 예시: `{"ok":true,"bugId":"site003-bug06","status":"idle","isCancelled":true}`
- 코드상 의도된 원인: 취소 로직에서 플래그만 세팅하고 주 상태(status)를 'cancelled'로 변경하지 않음
- PPO 에이전트 기대 행동: 플래그와 실제 비즈니스 상태 간의 논리적 모순/역설 상황을 탐지
