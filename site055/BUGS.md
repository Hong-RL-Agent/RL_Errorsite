# BUGS (site055)

## 1. site055-bug01
- **Type:** `database-state`
- **Description:** 예약 완료 후 seat.status가 occupied로 변경되지 않음.
- **Data-Bug-ID:** `site055-bug01`

## 2. site055-bug02
- **Type:** `network-duplicate-submit`
- **Description:** 좌석 예약 요청 재전송 시 같은 좌석 예약 레코드가 중복 생성됨.
- **Data-Bug-ID:** `site055-bug02`

## 3. site055-bug03
- **Type:** `security-idor`
- **Description:** reservationId만 바꾸면 다른 사용자의 예약 확인 가능.
- **Data-Bug-ID:** `site055-bug03`
