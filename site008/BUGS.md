# BUGS - site008

## site008-bug01
- **type**: retroactive-state-pollution
- **API endpoint**: POST /api/subscription/update
- **HTTP method**: POST
- **발생 조건**: `backdate=true` 파라미터와 함께 상태 변경 요청 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/subscription/update` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site008-bug01"]`
- **사용자가 경험하는 증상**: 현재 구독 상태가 과거 날짜(2020년 등)로 고정되며 현재 데이터가 오염됨
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site008-bug01","data":{"status":"POLLUTED","updatedAt":"2020-01-01T00:00:00.000Z"}}`
- **코드상 의도된 원인**: 과거 날짜 데이터를 현재 상태에 검증 없이 덮어씌움
- **PPO 에이전트 기대 행동**: 시계열 데이터의 역행 및 상태 무결성 파괴 탐지

## site008-bug02
- **type**: subscription-overlap
- **API endpoint**: POST /api/subscription/create
- **HTTP method**: POST
- **발생 조건**: 이미 구독 중인 상태에서 새로운 구독 생성 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/subscription/create` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site008-bug02"]`
- **사용자가 경험하는 증상**: 기존 구독이 취소되거나 연장되는 것이 아니라, 새로운 상태로 겹치거나 충돌하며 덮어씌워짐
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site008-bug02","data":{...}}`
- **코드상 의도된 원인**: 중복 구독 방지 로직(Existing Check) 부재
- **PPO 에이전트 기대 행동**: 리소스의 중복 할당 및 주기 충돌 탐지

## site008-bug03
- **type**: workflow-bypass
- **API endpoint**: POST /api/reservation/activate
- **HTTP method**: POST
- **발생 조건**: 결제 단계 없이 활성화 API 호출 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/reservation/activate` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site008-bug03"]`
- **사용자가 경험하는 증상**: "Pending" 상태의 예약이 결제 과정 없이 즉시 "Active" 상태로 변함
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site008-bug03","data":{"status":"ACTIVE"}}`
- **코드상 의도된 원인**: 상태 전이 전 필수 워크플로우(결제 확인) 검증 생략
- **PPO 에이전트 기대 행동**: 필수 중간 단계를 건너뛰는 워크플로우 우회 탐지

## site008-bug04
- **type**: improper-state-transition
- **API endpoint**: POST /api/state/change
- **HTTP method**: POST
- **발생 조건**: 상태 흐름도에 맞지 않는 임의의 상태로 변경 요청 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/state/change` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site008-bug04"]`
- **사용자가 경험하는 증상**: 구독이 끊겼거나(Expired) 초기 상태임에도 불구하고 바로 활성(Active) 상태로 점프함
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site008-bug04","data":{"status":"ACTIVE"}}`
- **코드상 의도된 원인**: 상태 머신(State Machine)의 유효성 검증 로직 부재
- **PPO 에이전트 기대 행동**: 비논리적인 상태 전이 규칙 위반 탐지

## site008-bug05
- **type**: state-machine-deadlock
- **API endpoint**: GET /api/reservation/status
- **HTTP method**: GET
- **발생 조건**: `lock=true` 쿼리와 함께 호출 시
- **관련 파일**: server.js
- **관련 코드 위치**: `/api/reservation/status` 라우트 내부
- **관련 프론트엔드 data-bug-id selector**: `[data-bug-id="site008-bug05"]`
- **사용자가 경험하는 증상**: 예약 상태를 확인하려 할 때 특정 데이터가 "PENDING"에 영구적으로 고정되어 더 이상 진행되지 않음
- **서버 응답 상태 코드**: 200
- **서버 응답 예시**: `{"ok":true,"bugId":"site008-bug05","status":"LOCKED_PENDING"}`
- **코드상 의도된 원인**: 특정 조건에서 상태 업데이트가 차단되는 논리적 데드락 삽입
- **PPO 에이전트 기대 행동**: 프로세스가 진행되지 않고 멈추는 상태 고착(Stall) 현상 탐지
