# BUGS (site076)

## 1. site076-bug01
- **Type:** `database-update`
- **Description:** complaintId가 아닌 첫 번째 민원 상태가 변경됨.
- **Data-Bug-ID:** `site076-bug01`

## 2. site076-bug02
- **Type:** `network-request-validation`
- **Description:** 민원 제목이 비어도 접수 성공 처리됨.
- **Data-Bug-ID:** `site076-bug02`

## 3. site076-bug03
- **Type:** `security-idor`
- **Description:** complaintId 변경으로 다른 사용자의 민원 상세 조회 가능.
- **Data-Bug-ID:** `site076-bug03`
