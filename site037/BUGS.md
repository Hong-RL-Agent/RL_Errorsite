# BUGS (site037)

## 1. site037-bug01
- **Type:** `database-relation`
- **Description:** 선택한 인화 크기와 다른 옵션 가격이 적용됨.
- **Data-Bug-ID:** `site037-bug01`

## 2. site037-bug02
- **Type:** `network-payload-size`
- **Description:** 특정 크기 이상의 주문 데이터에서 서버가 413 대신 일반 500을 반환함.
- **Data-Bug-ID:** `site037-bug02`

## 3. site037-bug03
- **Type:** `security-data-exposure`
- **Description:** 주문 내역 API가 전체 주소와 내부 배송 메모를 불필요하게 반환함.
- **Data-Bug-ID:** `site037-bug03`
