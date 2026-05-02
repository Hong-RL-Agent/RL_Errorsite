# BUGS (site020)

## 1. site020-bug01
- **Type:** `database-state`
- **Description:** 기사 읽음 처리 API가 요청한 articleId가 아닌 마지막 기사 상태를 변경함.
- **Data-Bug-ID:** `site020-bug01`

## 2. site020-bug02
- **Type:** `network-stale-data`
- **Description:** 트렌드 API가 최신 데이터 대신 고정된 오래된 mock 데이터를 반환함.
- **Data-Bug-ID:** `site020-bug02`

## 3. site020-bug03
- **Type:** `security-authorization`
- **Description:** 다른 사용자의 subscriptionId를 전달하면 구독 설정을 조회하거나 변경할 수 있음.
- **Data-Bug-ID:** `site020-bug03`
