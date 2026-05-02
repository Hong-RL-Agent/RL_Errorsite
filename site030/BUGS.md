# BUGS (site030)

## 1. site030-bug01
- **Type:** `database-date-query`
- **Description:** 임박 재료 API가 만료된 재료를 제외하지 못함.
- **Data-Bug-ID:** `site030-bug01`

## 2. site030-bug02
- **Type:** `network-request-format`
- **Description:** 재료 추가 API가 JSON이 아닌 문자열 수량도 정상 저장함.
- **Data-Bug-ID:** `site030-bug02`

## 3. site030-bug03
- **Type:** `security-multi-tenant`
- **Description:** 모든 사용자의 냉장고 재료가 함께 반환됨.
- **Data-Bug-ID:** `site030-bug03`
