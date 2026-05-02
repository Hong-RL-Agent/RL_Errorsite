# BUGS (site067)

## 1. site067-bug01
- **Type:** `database-calculation`
- **Description:** 삭제한 식단도 칼로리 요약에 포함됨.
- **Data-Bug-ID:** `site067-bug01`

## 2. site067-bug02
- **Type:** `network-race-condition`
- **Description:** 날짜를 빠르게 바꾸면 이전 날짜 응답이 최신 화면을 덮어씀.
- **Data-Bug-ID:** `site067-bug02`

## 3. site067-bug03
- **Type:** `security-multi-tenant`
- **Description:** 모든 사용자의 meal 데이터가 함께 반환됨.
- **Data-Bug-ID:** `site067-bug03`
