# BUGS (site045)

## 1. site045-bug01
- **Type:** `database-stock`
- **Description:** 주문 수량이 재고보다 많아도 재고가 음수로 저장됨.
- **Data-Bug-ID:** `site045-bug01`

## 2. site045-bug02
- **Type:** `network-content-type`
- **Description:** 주문 API가 JSON 응답에 잘못된 Content-Type을 설정함.
- **Data-Bug-ID:** `site045-bug02`

## 3. site045-bug03
- **Type:** `security-parameter-tampering`
- **Description:** 클라이언트가 보낸 discountedTotal을 서버가 재검증하지 않음.
- **Data-Bug-ID:** `site045-bug03`
