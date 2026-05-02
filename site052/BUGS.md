# BUGS (site052)

## 1. site052-bug01
- **Type:** `database-sort`
- **Description:** 가격을 문자열로 비교해 1000보다 900이 뒤에 오는 등 정렬이 틀어짐.
- **Data-Bug-ID:** `site052-bug01`

## 2. site052-bug02
- **Type:** `network-query-param`
- **Description:** 연식 필터 query가 서버에서 무시됨.
- **Data-Bug-ID:** `site052-bug02`

## 3. site052-bug03
- **Type:** `security-idor`
- **Description:** noteId 변경으로 다른 사용자의 차량 메모 조회 가능.
- **Data-Bug-ID:** `site052-bug03`
