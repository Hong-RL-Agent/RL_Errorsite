# BUGS (site011)

## 1. site011-bug01
- **Type:** `database-persistence`
- **Description:** 물주기 완료 API가 성공 응답을 보내지만 실제 mock DB의 watered 상태를 변경하지 않음.
- **Data-Bug-ID:** `site011-bug01`

## 2. site011-bug02
- **Type:** `network-schema-mismatch`
- **Description:** 성장 기록 API가 records 배열 대신 data 객체로 반환하여 일부 데이터 흐름이 어긋남.
- **Data-Bug-ID:** `site011-bug02`

## 3. site011-bug03
- **Type:** `security-user-validation`
- **Description:** 요청 body의 ownerId를 그대로 신뢰해 다른 사용자의 식물 기록을 추가할 수 있음.
- **Data-Bug-ID:** `site011-bug03`
