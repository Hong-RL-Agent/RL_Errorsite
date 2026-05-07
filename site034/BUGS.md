# BUGS - site034

## site034-bug01
- **type**: missing-required-field
- **API**: `GET /api/alerts`
- **symptom**: 공지 카드 중 일부가 라인 정보나 상태 배지 없이 렌더링됨
- **description**: 응답 객체에서 필수 키가 누락됨

## site034-bug02
- **type**: unexpected-extra-field
- **API**: `GET /api/lines`
- **symptom**: 응답 하단에 디버그용 메타데이터 필드가 노출됨
- **description**: API 계약에 없는 불필요한 정보가 생산 환경 응답에 포함됨

## site034-bug03
- **type**: field-type-mismatch
- **API**: `GET /api/stations`
- **symptom**: 혼잡도 그래프가 표시되지 않고 "critical" 등 문자열 텍스트가 표시됨
- **description**: 데이터 타입 기대값(Number)과 실제값(String)의 불일치

## site034-bug04
- **type**: enum-value-mismatch
- **API**: `GET /api/alerts/:id`
- **symptom**: 상세 모달의 상태 배지가 빨간색 에러 스타일로 표시됨
- **description**: 정의되지 않은 상태값("LATE", "STOP")이 서버로부터 반환됨
