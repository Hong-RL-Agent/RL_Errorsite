# BUGS site069

### site069-bug01
- **유형**: invalid-state-transition-allow
- **한국어 유형**: 상태 전이 역행 허용
- **API**: `/api/orders/status`
- **증상**: 완료(completed)된 주문이 다시 조리중(cooking) 상태로 돌아가는 등 정상적인 상태 머신 흐름을 역행함.

### site069-bug02
- **유형**: duplicate-event-application
- **한국어 유형**: 이벤트 중복 적용
- **API**: `/api/orders/logs`
- **증상**: 동일한 상태 변경 요청이 여러 번 기록되어 로그가 중복되고, 실시간 상태 트래킹이 꼬임.

### site069-bug03
- **유형**: unstable-sort-order
- **한국어 유형**: 정렬 비결정성
- **API**: `/api/orders`
- **증상**: 주문 목록 정렬 시 타임스탬프가 동일한 항목들의 정렬 기준이 미비하여, 요청할 때마다 순서가 뒤바뀜.

### site069-bug04
- **유형**: stale-cache-read-after-write
- **한국어 유형**: 쓰기 후 캐시 불일치
- **API**: `/api/orders`
- **증상**: 상태 변경 요청 후 즉시 목록을 조회했을 때, 캐시가 아직 갱신되지 않아 이전 상태가 그대로 표시됨.
