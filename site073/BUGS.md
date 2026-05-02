# BUGS (site073)

## 1. site073-bug01
- **Type:** `database-calculation`
- **Description:** 일시정지 시간을 제외하지 않고 총 공부 시간에 포함함.
- **Data-Bug-ID:** `site073-bug01`

## 2. site073-bug02
- **Type:** `network-duplicate-submit`
- **Description:** 세션 저장 버튼 연속 클릭 시 같은 기록이 중복 생성됨.
- **Data-Bug-ID:** `site073-bug02`

## 3. site073-bug03
- **Type:** `security-idor`
- **Description:** sessionId 변경으로 다른 사용자의 공부 기록 조회 가능.
- **Data-Bug-ID:** `site073-bug03`
