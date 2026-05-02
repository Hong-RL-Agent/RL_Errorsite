# BUGS (site065)

## 1. site065-bug01
- **Type:** `database-validation`
- **Description:** 최대 참가 반려견 수를 초과해도 신청 가능.
- **Data-Bug-ID:** `site065-bug01`

## 2. site065-bug02
- **Type:** `network-missing-field`
- **Description:** 산책 모임 API가 일부 organizerName을 누락함.
- **Data-Bug-ID:** `site065-bug02`

## 3. site065-bug03
- **Type:** `security-idor`
- **Description:** dogId 변경으로 다른 사용자의 반려견 프로필 조회 가능.
- **Data-Bug-ID:** `site065-bug03`
