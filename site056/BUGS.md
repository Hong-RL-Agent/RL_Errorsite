# BUGS (site056)

## 1. site056-bug01
- **Type:** `database-duplicate`
- **Description:** 같은 사용자가 같은 구독 상품을 중복 신청 가능.
- **Data-Bug-ID:** `site056-bug01`

## 2. site056-bug02
- **Type:** `network-error-handling`
- **Description:** 배송일 저장 실패 시 원인 없는 빈 응답을 반환함.
- **Data-Bug-ID:** `site056-bug02`

## 3. site056-bug03
- **Type:** `security-parameter-tampering`
- **Description:** 클라이언트에서 보낸 monthlyPrice를 서버가 그대로 저장함.
- **Data-Bug-ID:** `site056-bug03`
