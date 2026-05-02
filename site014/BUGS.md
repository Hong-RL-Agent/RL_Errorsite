# BUGS (site014)

## 1. site014-bug01
- **Type:** `database-stock`
- **Description:** 공동구매 수량이 남은 재고를 초과해도 참여가 허용됨.
- **Data-Bug-ID:** `site014-bug01`

## 2. site014-bug02
- **Type:** `network-response-format`
- **Description:** 주문 API가 성공 시 JSON이 아니라 HTML 문자열을 반환함.
- **Data-Bug-ID:** `site014-bug02`

## 3. site014-bug03
- **Type:** `security-information-disclosure`
- **Description:** 오류 응답에 서버 내부 파일 경로와 mock DB 변수명이 포함됨.
- **Data-Bug-ID:** `site014-bug03`
