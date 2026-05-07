# BUGS - site083

### [Bug #1] site083-bug01
- **Type**: duplicate-purchase-acceptance (중복 구매 허용)
- **API**: `POST /api/purchase/confirm`
- **Description**: 동일 상품에 대해 여러 번의 구매 확정 처리가 가능함. 락(Lock) 또는 상태 검증 부재.

### [Bug #2] site083-bug02
- **Type**: invalid-state-transition (상태 전이 오류)
- **API**: `PATCH /api/item/status`
- **Description**: 거래가 완료된 상품('completed')을 다시 예약 중('reserved') 상태로 변경할 수 있는 논리 오류.

### [Bug #3] site083-bug03
- **Type**: operation-order-inversion (처리 순서 역전)
- **API**: `GET /api/logs`
- **Description**: 로그 데이터 제공 시 정렬 로직의 오류로 인해 실제 발생 시간과 반대로 데이터가 나열됨.

### [Bug #4] site083-bug04
- **Type**: broken-reference-integrity (참조 무결성 붕괴)
- **API**: `POST /api/purchase/confirm`
- **Description**: 상품 목록에 존재하지 않는 가상의 ID로 구매 확정 요청을 보내도 서버에서 유효성 검사 없이 성공 처리함.
