# BUGS (site047)

## 1. site047-bug01
- **Type:** `database-concurrency`
- **Description:** 같은 시간에 같은 테이블이 중복 예약될 수 있음.
- **Data-Bug-ID:** `site047-bug01`

## 2. site047-bug02
- **Type:** `network-stale-data`
- **Description:** 테이블 현황 API가 예약 후에도 이전 상태를 반환함.
- **Data-Bug-ID:** `site047-bug02`

## 3. site047-bug03
- **Type:** `security-data-exposure`
- **Description:** 일반 API 응답에 전체 고객 예약자 연락처 mock 데이터가 포함됨.
- **Data-Bug-ID:** `site047-bug03`
