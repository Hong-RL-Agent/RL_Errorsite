# BUGS (site050)

## 1. site050-bug01
- **Type:** `database-order`
- **Description:** 코스 상세 조회 시 stopOrder가 아닌 id 순서로 장소가 정렬됨.
- **Data-Bug-ID:** `site050-bug01`

## 2. site050-bug02
- **Type:** `network-partial-response`
- **Description:** 장소 API가 특정 지역에서 일부 place description을 누락함.
- **Data-Bug-ID:** `site050-bug02`

## 3. site050-bug03
- **Type:** `security-idor`
- **Description:** savedRouteId만 바꾸면 다른 사용자의 저장 코스 조회 가능.
- **Data-Bug-ID:** `site050-bug03`
