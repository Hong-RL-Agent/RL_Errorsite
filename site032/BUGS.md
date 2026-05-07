# BUGS - site032

## site032-bug01
- **type**: message-loss-after-recovery
- **symptom**: `expected > actual` 메시지 카운트 불일치
- **description**: 복구 로직 중 큐 영속성 복구 실패로 인한 데이터 유실

## site032-bug02
- **type**: duplicate-processing-after-recovery
- **symptom**: 주문 목록(`orders`)에 동일 상품/수량의 주문이 중복 생성됨
- **description**: 멱등성(Idempotency) 처리 실패로 인한 중복 트랜잭션 발생

## site032-bug03
- **type**: queue-state-not-restored
- **symptom**: `queueSize: 0`이나 실제 메시지는 존재함
- **description**: 큐의 메타데이터 상태 정보가 복구 과정에서 누락됨

## site032-bug04
- **type**: cache-not-warmed
- **symptom**: `cacheHit: false` 또는 `cacheLoaded: false`
- **description**: 서비스 복구 후 필수 캐시 데이터의 선제적 로딩(Warm-up) 누락
