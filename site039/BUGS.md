# BUGS (site039)

## 1. site039-bug01
- **Type:** `database-query`
- **Description:** 이미 예약된 시간도 가능 시간 목록에 포함됨.
- **Data-Bug-ID:** `site039-bug01`

## 2. site039-bug02
- **Type:** `network-duplicate-submit`
- **Description:** 예약 버튼 연속 클릭 시 같은 예약이 중복 저장됨.
- **Data-Bug-ID:** `site039-bug02`

## 3. site039-bug03
- **Type:** `security-idor`
- **Description:** bookingId 변경으로 다른 사용자의 예약 상세 조회 가능.
- **Data-Bug-ID:** `site039-bug03`
