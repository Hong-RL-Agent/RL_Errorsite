# BUGS (site015)

## 1. site015-bug01
- **Type:** `database-count`
- **Description:** 참가 신청 저장 후 remainingSeats 값이 감소하지 않아 잔여석이 잘못 표시됨.
- **Data-Bug-ID:** `site015-bug01`

## 2. site015-bug02
- **Type:** `network-cache-stale`
- **Description:** 행사 목록 API에 잘못된 Cache-Control을 설정하여 갱신된 신청 상태가 즉시 반영되지 않음.
- **Data-Bug-ID:** `site015-bug02`

## 3. site015-bug03
- **Type:** `security-authentication`
- **Description:** admin=true 쿼리 파라미터만 붙이면 관리자용 행사 신청 목록이 반환됨.
- **Data-Bug-ID:** `site015-bug03`
