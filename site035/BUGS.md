# BUGS - site035

## site035-bug01
- **type**: response-order-change
- **API**: `GET /api/words`
- **symptom**: 새로고침할 때마다 단어 목록의 순서가 바뀜
- **description**: 정렬 로직 부재로 인한 비결정적 응답 순서

## site035-bug02
- **type**: atomicity-violation
- **API**: `POST /api/words`
- **symptom**: 단어는 추가되나 `webhookSent`가 `false`로 반환됨
- **description**: 트랜잭션의 원자성 보장 실패로 인한 부분적 작업 수행

## site035-bug03
- **type**: webhook-payload-change
- **API**: `POST /api/webhook/send`
- **symptom**: 페일로드의 키값이 `word`에서 `term`으로 변경됨
- **description**: API 계약을 위반하는 필드명 변경

## site035-bug04
- **type**: webhook-schema-mismatch
- **API**: `GET /api/webhook/logs`
- **symptom**: 로그 데이터에 `internalTraceId`, `rawBuffer` 등 불필요한 필드 포함
- **description**: 정의되지 않은 스키마 확장으로 인한 계약 위반

## site035-bug05
- **type**: serialization-error
- **API**: `GET /api/words/:id`
- **symptom**: 단어 뜻이 사라지고 단어명이 대문자로 변형됨
- **description**: 서버 사이드 직렬화 로직의 버그로 인한 데이터 변형 및 누락
