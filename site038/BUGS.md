# BUGS - site038

## site038-bug01
- **type**: partial-header-send
- **API**: `GET /api/meals`
- **symptom**: HTTP 응답 헤더 중 일부가 누락되거나 비정상적인 상태로 전송됨
- **description**: 서버 측 헤더 플러싱(flushing) 시점 오류로 인한 불완전한 프로토콜 전송

## site038-bug02
- **type**: timeout-calculation-error
- **API**: `GET /api/meals?slow=true`
- **symptom**: 실제 타임아웃 임계값보다 빠르게 504 Gateway Timeout 발생
- **description**: 타임아웃 계산 로직의 정밀도 부족 및 잘못된 임계값 적용

## site038-bug03
- **type**: retry-without-backoff
- **API**: `POST /api/meals`
- **symptom**: 실패 응답(shouldRetry: true) 수신 시 지연 시간 없이 즉시 5회 이상 연속 요청 발생
- **description**: 클라이언트/서버 간의 비효율적인 재시도 합의(Handshake) 문제

## site038-bug04
- **type**: retry-starvation
- **API**: `GET /api/meals/retry-test`
- **symptom**: 대기 중인 요청 중 특정 ID를 가진 요청들이 처리되지 않고 'starved' 상태로 유지됨
- **description**: 재시도 큐 관리 알고리즘의 편향(Bias)으로 인한 리소스 할당 불균형
