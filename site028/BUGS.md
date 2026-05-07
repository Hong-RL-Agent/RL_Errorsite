# BUGS - site028

### site028-bug01
- **Type**: data-anonymization-missing
- **Description**: 사건 데이터에 내부 식별자(brainScanId, internalNotes)가 그대로 노출됨. 민감 데이터 제거되지 않음.
- **Trigger**: GET /api/events

### site028-bug02
- **Type**: pagination-format-change
- **Description**: 기존 page/limit 기반이 cursor 기반으로 바뀌었지만 응답 구조 불일치. 프론트가 예상하는 필드 없음.
- **Trigger**: GET /api/events?page=1

### site028-bug03
- **Type**: cursor-incompatibility
- **Description**: nextCursor 값이 잘못 생성되어(null) 다음 페이지 조회 실패.
- **Trigger**: GET /api/events?cursor=abc123

### site028-bug04
- **Type**: sorting-order-change
- **Description**: 사건이 시간순이 아니라 랜덤 또는 역순 정렬됨.
- **Trigger**: GET /api/events/popular
