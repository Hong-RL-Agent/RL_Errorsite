# BUGS (site027)

## 1. site027-bug01
- **Type:** `database-relation`
- **Description:** 수리 요청 저장 시 technicianId 대신 categoryId가 저장됨.
- **Data-Bug-ID:** `site027-bug01`

## 2. site027-bug02
- **Type:** `network-error-body`
- **Description:** 실패 응답이 success:true를 포함해 클라이언트가 혼동함.
- **Data-Bug-ID:** `site027-bug02`

## 3. site027-bug03
- **Type:** `security-authorization`
- **Description:** requestId만 바꾸면 다른 사용자의 수리 요청 상세 조회 가능.
- **Data-Bug-ID:** `site027-bug03`
