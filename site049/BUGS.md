# BUGS (site049)

## 1. site049-bug01
- **Type:** `database-update`
- **Description:** taskId 대신 배열 인덱스로 상태를 업데이트해 잘못된 할 일이 변경됨.
- **Data-Bug-ID:** `site049-bug01`

## 2. site049-bug02
- **Type:** `network-race-condition`
- **Description:** 상태 변경 요청을 빠르게 연속 실행하면 이전 응답이 최신 상태를 덮어씀.
- **Data-Bug-ID:** `site049-bug02`

## 3. site049-bug03
- **Type:** `security-authorization`
- **Description:** projectId만 알면 다른 팀 프로젝트의 할 일 조회 가능.
- **Data-Bug-ID:** `site049-bug03`
