# BUGS (site017)

## 1. site017-bug01
- **Type:** `database-search`
- **Description:** 재료 검색 시 정확히 일치하는 값만 반환하여 부분 검색 결과가 누락됨.
- **Data-Bug-ID:** `site017-bug01`

## 2. site017-bug02
- **Type:** `network-http-status`
- **Description:** 저장 실패 상황에서도 201 Created를 반환함.
- **Data-Bug-ID:** `site017-bug02`

## 3. site017-bug03
- **Type:** `security-input-validation`
- **Description:** 후기 내용 길이와 스크립트성 입력을 서버에서 검증하지 않고 저장함.
- **Data-Bug-ID:** `site017-bug03`
