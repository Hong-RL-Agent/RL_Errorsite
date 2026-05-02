# BUGS (site038)

## 1. site038-bug01
- **Type:** `database-calculation`
- **Description:** 독서 페이지 누적 시 이전 기록을 덮어써 총합이 잘못됨.
- **Data-Bug-ID:** `site038-bug01`

## 2. site038-bug02
- **Type:** `network-race-condition`
- **Description:** 빠른 날짜 필터 변경 시 이전 응답이 최신 목록을 덮어씀.
- **Data-Bug-ID:** `site038-bug02`

## 3. site038-bug03
- **Type:** `security-multi-tenant`
- **Description:** reading logs API가 모든 사용자의 기록을 함께 반환함.
- **Data-Bug-ID:** `site038-bug03`
