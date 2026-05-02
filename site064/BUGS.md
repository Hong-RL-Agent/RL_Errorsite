# BUGS (site064)

## 1. site064-bug01
- **Type:** `database-filter`
- **Description:** found 상태 필터에서 lost 게시글도 함께 반환됨.
- **Data-Bug-ID:** `site064-bug01`

## 2. site064-bug02
- **Type:** `network-cache-stale`
- **Description:** 등록 후 목록 API가 이전 캐시 데이터를 반환함.
- **Data-Bug-ID:** `site064-bug02`

## 3. site064-bug03
- **Type:** `security-authorization`
- **Description:** postId만 바꾸면 다른 사용자의 게시글 상태 변경 가능.
- **Data-Bug-ID:** `site064-bug03`
