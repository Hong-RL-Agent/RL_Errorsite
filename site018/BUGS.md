# BUGS (site018)

## 1. site018-bug01
- **Type:** `database-pagination`
- **Description:** page 파라미터 계산이 잘못되어 일부 채용 공고가 중복 또는 누락됨.
- **Data-Bug-ID:** `site018-bug01`

## 2. site018-bug02
- **Type:** `network-query-param`
- **Description:** 필터 API가 일부 query parameter를 무시하여 직무 필터 결과가 부정확함.
- **Data-Bug-ID:** `site018-bug02`

## 3. site018-bug03
- **Type:** `security-authorization`
- **Description:** applicationId만 알면 다른 사용자의 지원 현황을 조회할 수 있음.
- **Data-Bug-ID:** `site018-bug03`
