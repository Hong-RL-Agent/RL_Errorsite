# BUGS (site012)

## 1. site012-bug01
- **Type:** `database-id-conflict`
- **Description:** 주문 생성 시 마지막 id를 잘못 계산해 기존 주문 id와 충돌할 수 있음.
- **Data-Bug-ID:** `site012-bug01`

## 2. site012-bug02
- **Type:** `network-duplicate-submit`
- **Description:** 주문 버튼 연속 클릭 시 서버가 중복 주문을 방지하지 못함.
- **Data-Bug-ID:** `site012-bug02`

## 3. site012-bug03
- **Type:** `security-authorization`
- **Description:** 다른 사용자의 memberId를 전달하면 해당 멤버십 포인트를 조회할 수 있음.
- **Data-Bug-ID:** `site012-bug03`
