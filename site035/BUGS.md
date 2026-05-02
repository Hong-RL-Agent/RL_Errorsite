# BUGS (site035)

## 1. site035-bug01
- **Type:** `database-duplicate`
- **Description:** 같은 공연에 같은 사용자가 알림을 여러 번 등록 가능.
- **Data-Bug-ID:** `site035-bug01`

## 2. site035-bug02
- **Type:** `network-cache-stale`
- **Description:** 공연 좌석 상태 API가 오래된 캐시 데이터를 반환함.
- **Data-Bug-ID:** `site035-bug02`

## 3. site035-bug03
- **Type:** `security-authorization`
- **Description:** alertId만 알면 다른 사용자의 알림 설정 조회 가능.
- **Data-Bug-ID:** `site035-bug03`
