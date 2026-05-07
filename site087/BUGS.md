# BUGS - site087

### [Bug #1] site087-bug01
- **Type**: expiration-time-miscalculation (만료 시간 계산 오류)
- **API**: `POST /api/coupons/create`
- **Description**: 쿠폰 생성 시 유효 기간을 입력값의 절반으로 계산하여 저장함 (예: 24시간 입력 시 12시간으로 설정).

### [Bug #2] site087-bug02
- **Type**: timezone-mismatch (시간대 불일치)
- **API**: `GET /api/coupons`
- **Description**: 서버는 UTC 기준으로 만료를 판단하지만 클라이언트는 KST 기준으로 표시하여, 아직 유효한 쿠폰이 만료된 것으로 보이거나 그 반대의 상황이 발생함.

### [Bug #3] site087-bug03
- **Type**: ttl-refresh-missing (TTL 갱신 누락)
- **API**: `PATCH /api/coupons/extend`
- **Description**: 쿠폰 연장 요청 시 성공 응답은 반환하지만 실제 데이터베이스(메모리)의 만료 시간은 갱신하지 않음.

### [Bug #4] site087-bug04
- **Type**: scheduled-activation-drift (예약 실행 시간 오차)
- **API**: `POST /api/coupons/schedule`
- **Description**: 예약된 쿠폰이 지정된 시간보다 1시간 늦게 활성화되도록 오차가 발생함.
