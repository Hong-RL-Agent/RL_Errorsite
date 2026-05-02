# BUGS (site026)

## 1. site026-bug01
- **Type:** `database-state`
- **Description:** 매칭 거절 후에도 status가 pending으로 유지됨.
- **Data-Bug-ID:** `site026-bug01`

## 2. site026-bug02
- **Type:** `network-race-condition`
- **Description:** 빠른 연속 매칭 요청 시 이전 응답이 최신 상태를 덮어씀.
- **Data-Bug-ID:** `site026-bug02`

## 3. site026-bug03
- **Type:** `security-data-exposure`
- **Description:** 비공개 이메일과 internalNote가 파트너 API 응답에 포함됨.
- **Data-Bug-ID:** `site026-bug03`
