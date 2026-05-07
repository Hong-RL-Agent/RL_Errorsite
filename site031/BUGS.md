# BUGS - site031

## site031-bug01
- **type**: recovery-order-error
- **symptom**: `inconsistent: true` 응답 반환
- **description**: 복구 순서가 꼬여 데이터 동기화에 실패함

## site031-bug02
- **type**: external-service-recovery-failure
- **symptom**: `reported: "up"` 이나 실제 `paymentService: "down"`
- **description**: 모니터링 시스템이 외부 서비스의 실제 상태를 반영하지 못함

## site031-bug03
- **type**: message-reprocessing-failure
- **symptom**: `retried: 0` 반환 (실패 큐에 메시지가 있음에도)
- **description**: 재처리 로직이 트리거되지 않음

## site031-bug04
- **type**: message-loss-after-recovery
- **symptom**: `actual < expected` 메시지 수 불일치
- **description**: 복구 과정에서 영구적인 데이터 유실 발생
