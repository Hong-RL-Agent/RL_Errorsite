# BUGS (site023)

## 1. site023-bug01
- **Type:** `database-duplicate`
- **Description:** 같은 봉사활동에 동일 사용자가 여러 번 신청 가능함.
- **Data-Bug-ID:** `site023-bug01`

## 2. site023-bug02
- **Type:** `network-http-status`
- **Description:** 신청 마감 상태에서도 서버가 201 Created를 반환함.
- **Data-Bug-ID:** `site023-bug02`

## 3. site023-bug03
- **Type:** `security-data-exposure`
- **Description:** 기관 목록 API 응답에 adminEmail과 adminMemo가 포함됨.
- **Data-Bug-ID:** `site023-bug03`
