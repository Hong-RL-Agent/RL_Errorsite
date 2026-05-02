# BUGS (site048)

## 1. site048-bug01
- **Type:** `database-duplicate`
- **Description:** 같은 사용자가 같은 날짜 메뉴에 여러 번 투표 가능.
- **Data-Bug-ID:** `site048-bug01`

## 2. site048-bug02
- **Type:** `network-schema-mismatch`
- **Description:** 결과 API가 percentage 대신 percentText를 반환함.
- **Data-Bug-ID:** `site048-bug02`

## 3. site048-bug03
- **Type:** `security-authentication`
- **Description:** x-student-id 헤더만 임의로 보내면 투표 가능.
- **Data-Bug-ID:** `site048-bug03`
