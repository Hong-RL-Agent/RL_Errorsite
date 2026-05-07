# BUGS site070

### site070-bug01
- **유형**: ttl-expiry-miscalculation
- **한국어 유형**: TTL 만료 계산 오류
- **API**: `/api/seats`
- **증상**: 홀드된 좌석의 만료 시간(5분)이 지나도 자동으로 해제되지 않고 계속 `held` 상태로 유지됨.

### site070-bug02
- **유형**: duplicate-hold-allocation
- **한국어 유형**: 홀드 중복 할당
- **API**: `/api/seats/hold`
- **증상**: 특정 좌석에 대해 이미 홀드가 진행 중임에도 불구하고, 다른 사용자에게 중복으로 홀드 할당이 가능함.

### site070-bug03
- **유형**: missing-idempotency-key
- **한국어 유형**: 멱등성 키 미적용
- **API**: `/api/payments`
- **증상**: 네트워크 재시도 등으로 동일한 결제 요청이 중복 전송될 경우, 서버에서 중복 체크를 하지 않아 한 좌석에 대해 결제가 여러 번 처리됨.

### site070-bug04
- **유형**: timezone-interpretation-error
- **한국어 유형**: 시간대 해석 오류
- **API**: `/api/reservations`
- **증상**: 예약 내역 조회 시 서버의 UTC 시간과 클라이언트의 로컬 시간 해석 차이로 인해 예약 일시가 비정상적으로 표시됨.
