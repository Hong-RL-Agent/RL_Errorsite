# BUGS - site027

### site027-bug01
- **Type**: timestamp-format-change
- **Description**: createdAt이 number(timestamp)여야 하지만 일부 API에서 ISO string으로 반환됨. 프론트에서 시간 계산 시 오류 발생 가능.
- **Trigger**: GET /api/posts

### site027-bug02
- **Type**: numeric-overflow-change
- **Description**: likes 값이 비정상적으로 큰 값(overflow급)으로 반환됨. 인기 게시글 데이터 왜곡 발생.
- **Trigger**: GET /api/posts/popular

### site027-bug03
- **Type**: null-handling-change
- **Description**: description 필드가 null 대신 문자열 "null"로 반환되어 UI에서 텍스트로 노출됨.
- **Trigger**: GET /api/posts/:id

### site027-bug04
- **Type**: response-type-mismatch
- **Description**: totalLikes가 number가 아닌 string으로 반환됨. 대시보드 통계 계산 시 타입 오류 유발.
- **Trigger**: GET /api/dashboard/summary
