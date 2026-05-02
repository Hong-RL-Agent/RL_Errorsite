# BUGS (site033)

## 1. site033-bug01
- **Type:** `database-calculation`
- **Description:** 수량을 반영하지 않고 단가만 합산하여 주문 합계가 잘못됨.
- **Data-Bug-ID:** `site033-bug01`

## 2. site033-bug02
- **Type:** `network-error-handling`
- **Description:** 주문 실패 시 message 없는 500 응답만 반환됨.
- **Data-Bug-ID:** `site033-bug02`

## 3. site033-bug03
- **Type:** `security-parameter-tampering`
- **Description:** 클라이언트가 보낸 quoteTotal을 서버가 검증 없이 저장함.
- **Data-Bug-ID:** `site033-bug03`
