# BUGS (site025)

## 1. site025-bug01
- **Type:** `database-validation`
- **Description:** 남은 티켓보다 많은 수량도 예매 가능함.
- **Data-Bug-ID:** `site025-bug01`

## 2. site025-bug02
- **Type:** `network-cache-stale`
- **Description:** 티켓 잔여 수량 API가 오래된 값을 반환함.
- **Data-Bug-ID:** `site025-bug02`

## 3. site025-bug03
- **Type:** `security-idor`
- **Description:** ticketId만 알면 다른 사용자의 티켓 정보를 조회할 수 있음.
- **Data-Bug-ID:** `site025-bug03`
