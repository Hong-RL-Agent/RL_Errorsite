# BUGS (site019)

## 1. site019-bug01
- **Type:** `database-conflict`
- **Description:** 같은 의사와 같은 시간대 예약 중복을 막지 못함.
- **Data-Bug-ID:** `site019-bug01`

## 2. site019-bug02
- **Type:** `network-retry`
- **Description:** 예약 가능 시간 API가 일시 실패할 때 재시도 로직 없이 빈 목록만 표시됨.
- **Data-Bug-ID:** `site019-bug02`

## 3. site019-bug03
- **Type:** `security-data-exposure`
- **Description:** 내 예약 API 응답에 주민번호 형식의 patientPrivateCode mock 값이 포함됨.
- **Data-Bug-ID:** `site019-bug03`
