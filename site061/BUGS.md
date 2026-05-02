# BUGS (site061)

## 1. site061-bug01
- **Type:** `database-calculation`
- **Description:** 송금 후 수수료를 차감하지 않아 잔액이 잘못 계산됨.
- **Data-Bug-ID:** `site061-bug01`

## 2. site061-bug02
- **Type:** `network-duplicate-submit`
- **Description:** 송금 버튼 연속 클릭 시 중복 송금 기록 생성 가능.
- **Data-Bug-ID:** `site061-bug02`

## 3. site061-bug03
- **Type:** `security-idor`
- **Description:** accountId 변경으로 다른 사용자의 계좌 요약 조회 가능.
- **Data-Bug-ID:** `site061-bug03`
