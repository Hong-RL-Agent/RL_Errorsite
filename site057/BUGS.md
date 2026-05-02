# BUGS (site057)

## 1. site057-bug01
- **Type:** `database-relation`
- **Description:** 댓글 저장 시 noteId 대신 userId에 연결되어 다른 노트에 표시됨.
- **Data-Bug-ID:** `site057-bug01`

## 2. site057-bug02
- **Type:** `network-request-validation`
- **Description:** 업로드 API가 허용되지 않은 파일 확장자도 성공 처리함.
- **Data-Bug-ID:** `site057-bug02`

## 3. site057-bug03
- **Type:** `security-access-control`
- **Description:** private 노트도 id만 알면 조회 가능.
- **Data-Bug-ID:** `site057-bug03`
