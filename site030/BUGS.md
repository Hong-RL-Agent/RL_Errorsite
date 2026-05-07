# BUGS - site030

## site030-bug01
- **type**: circuit-not-opening
- **description**: 실패 임계값(5회) 도달 시에도 CLOSED 상태 유지
- **trigger**: `GET /api/cards?simulateFailure=true&bug=not-opening` 여러 번 호출
- **expected detection**: 실패 횟수(failures) 대비 상태(state)가 'OPEN'으로 바뀌지 않음을 탐지

## site030-bug02
- **type**: circuit-not-closing
- **description**: resetTimeout(10초) 경과 후에도 OPEN 상태 고착
- **trigger**: `OPEN` 상태 진입 후 10초 이상 대기하여 복구 시도 시 `bug=not-closing` 파라미터 사용
- **expected detection**: 시간 경과 후에도 상태 전이(State Transition)가 발생하지 않음을 탐지

## site030-bug03
- **type**: circuit-flapping
- **description**: 요청마다 상태가 무작위로 OPEN/CLOSED로 변경됨
- **trigger**: `GET /api/cards?bug=flapping` 반복 호출
- **expected detection**: 일관성 없는 상태 변화 패턴 탐지

## site030-bug04
- **type**: threshold-misconfiguration
- **description**: 임계값이 0으로 설정되어 반환됨
- **trigger**: `GET /api/circuit/status?bug=threshold` 호출
- **expected detection**: 임계값 필드(threshold)의 비정상 값(0) 탐지
