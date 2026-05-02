# BUGS (site058)

## 1. site058-bug01
- **Type:** `database-date-query`
- **Description:** 만료된 이용권도 예약 가능 상태로 처리됨.
- **Data-Bug-ID:** `site058-bug01`

## 2. site058-bug02
- **Type:** `network-http-status`
- **Description:** 구매 실패에도 201 Created 반환.
- **Data-Bug-ID:** `site058-bug02`

## 3. site058-bug03
- **Type:** `security-idor`
- **Description:** passId 변경으로 다른 사용자의 이용권 정보 조회 가능.
- **Data-Bug-ID:** `site058-bug03`
