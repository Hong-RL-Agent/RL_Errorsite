# BUGS site065

### site065-bug01
- **유형**: slot-double-booking
- **한국어 유형**: 예약 슬롯 중복 할당
- **API**: `/api/reservations`
- **증상**: 동일 시간 슬롯에 여러 예약이 가능하며 검증 로직이 누락됨.

### site065-bug02
- **유형**: timezone-conversion-shift
- **한국어 유형**: 타임존 변환 오류
- **API**: `/api/slots`
- **증상**: UTC ↔ 로컬 변환 시 시간대가 밀려 표시 시간과 실제 예약 시간이 불일치.

### site065-bug03
- **유형**: boundary-time-inclusive-error
- **한국어 유형**: 경계 시간 포함 여부 오류
- **API**: `/api/slots`
- **증상**: 예약 가능 범위 필터링 시 종료 시간(경계값)의 포함 여부가 잘못 처리됨.

### site065-bug04
- **유형**: cancel-without-slot-release
- **한국어 유형**: 예약 취소 후 슬롯 미복구
- **API**: `/api/reservations/cancel`
- **증상**: 예약 취소는 성공하지만 해당 슬롯이 다시 'available'로 돌아가지 않고 'booked' 유지.
