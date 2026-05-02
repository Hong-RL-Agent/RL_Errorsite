# BUGS (site042)

## 1. site042-bug01
- **Type:** `database-state`
- **Description:** 주문 제작 요청 후 status가 requested가 아닌 draft로 저장됨.
- **Data-Bug-ID:** `site042-bug01`

## 2. site042-bug02
- **Type:** `network-http-status`
- **Description:** 주문 제작 실패에도 200 OK를 반환함.
- **Data-Bug-ID:** `site042-bug02`

## 3. site042-bug03
- **Type:** `security-data-exposure`
- **Description:** 작품 상세 API에 작가 정산 계좌 mock 정보가 포함됨.
- **Data-Bug-ID:** `site042-bug03`
