# BUGS (site013)

## 1. site013-bug01
- **Type:** `database-integrity`
- **Description:** 존재하지 않는 classId로도 예약 데이터가 저장됨.
- **Data-Bug-ID:** `site013-bug01`

## 2. site013-bug02
- **Type:** `network-method`
- **Description:** 후기 삭제성 요청을 GET으로 처리하여 의도치 않은 데이터 변경이 발생할 수 있음.
- **Data-Bug-ID:** `site013-bug02`

## 3. site013-bug03
- **Type:** `security-csrf`
- **Description:** 예약 생성 API가 CSRF 토큰 없이도 상태 변경 요청을 허용함.
- **Data-Bug-ID:** `site013-bug03`
