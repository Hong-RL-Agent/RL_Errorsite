# BUGS (site022)

## 1. site022-bug01
- **Type:** `database-filter`
- **Description:** 지역 필터가 lot.address가 아니라 lot.name을 기준으로 동작함.
- **Data-Bug-ID:** `site022-bug01`

## 2. site022-bug02
- **Type:** `network-latency`
- **Description:** 예약 API가 특정 시간대 요청에서 과도하게 지연됨.
- **Data-Bug-ID:** `site022-bug02`

## 3. site022-bug03
- **Type:** `security-idor`
- **Description:** reservationId만 변경하면 다른 사용자의 예약 정보를 볼 수 있음.
- **Data-Bug-ID:** `site022-bug03`
