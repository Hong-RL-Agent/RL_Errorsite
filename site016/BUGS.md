# BUGS (site016)

## 1. site016-bug01
- **Type:** `database-type`
- **Description:** 금액을 문자열로 저장하여 정렬과 합산 결과가 잘못 계산됨.
- **Data-Bug-ID:** `site016-bug01`

## 2. site016-bug02
- **Type:** `network-rate-limit`
- **Description:** 리포트 생성 API에 요청 제한이 없어 짧은 시간 반복 호출이 가능함.
- **Data-Bug-ID:** `site016-bug02`

## 3. site016-bug03
- **Type:** `security-idor`
- **Description:** userId 파라미터만 변경하면 다른 사용자의 지출 내역을 조회할 수 있음.
- **Data-Bug-ID:** `site016-bug03`
