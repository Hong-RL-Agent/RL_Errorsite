# BUGS (site046)

## 1. site046-bug01
- **Type:** `database-conflict`
- **Description:** 같은 공구의 겹치는 대여 기간을 허용함.
- **Data-Bug-ID:** `site046-bug01`

## 2. site046-bug02
- **Type:** `network-request-validation`
- **Description:** endDate가 없어도 대여 API가 성공 응답을 반환함.
- **Data-Bug-ID:** `site046-bug02`

## 3. site046-bug03
- **Type:** `security-idor`
- **Description:** rentalId 변경으로 다른 사용자의 대여 내역 조회 가능.
- **Data-Bug-ID:** `site046-bug03`
