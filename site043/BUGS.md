# BUGS - site043

## site043-bug01
- **type**: event-loss-during-batch
- **API**: `GET /api/news/stream`
- **증상**: 실시간 뉴스 스트림 중 일부 데이터 누락
- **description**: 서버에서 뉴스 이벤트를 배치로 묶어 전송하는 과정에서 타이밍 이슈로 인해 일부 데이터가 유실됨.

## site043-bug02
- **type**: inconsistent-sorting-state
- **API**: `GET /api/news/popular`
- **증상**: 정렬 순서 비결정성 (요청마다 동일 데이터의 순서가 바뀜)
- **description**: 클릭수 기반 정렬 로직에 랜덤 요소가 섞이거나 동점자 처리가 불안정하여 일관성 없는 순위 제공.

## site043-bug03
- **type**: duplicate-event-processing
- **API**: `POST /api/news/click`
- **증상**: 클릭수 과다 증가 (한 번 클릭 시 2회 이상 카운트)
- **description**: 클릭 이벤트 처리 핸들러가 중복 실행되거나 메시지 큐의 중복 처리 방지 로직 결여로 인해 클릭수가 비정상적으로 급증함.

## site043-bug04
- **type**: partial-state-update
- **API**: `PUT /api/news/:id`
- **증상**: 데이터 불일치 (일부 필드만 업데이트되고 나머지는 과거 상태 유지)
- **description**: 뉴스 정보를 수정할 때 제목은 갱신되지만, 연관된 메타데이터(수정일, 조회수 초기화 등)가 부분적으로 누락되어 데이터 무결성이 깨짐.
