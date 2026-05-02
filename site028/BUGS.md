# BUGS (site028)

## 1. site028-bug01
- **Type:** `database-date`
- **Description:** 일기 저장 시 사용자가 선택한 날짜가 아니라 서버 현재 날짜로 저장됨.
- **Data-Bug-ID:** `site028-bug01`

## 2. site028-bug02
- **Type:** `network-timeout`
- **Description:** 통계 API가 느릴 때 로딩 상태가 풀리지 않음.
- **Data-Bug-ID:** `site028-bug02`

## 3. site028-bug03
- **Type:** `security-idor`
- **Description:** entryId만 알면 다른 사용자의 감정 일기 조회 가능.
- **Data-Bug-ID:** `site028-bug03`
