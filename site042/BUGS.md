# BUGS - site042

## site042-bug01
- **type**: race-condition-duplicate-application
- **API**: `POST /api/apply`
- **증상**: 중복 신청 발생
- **description**: 동일 사용자가 동시에 여러 번 신청 요청을 보내면, 상태 체크와 저장이 비동기로 분리되어 있어 중복 데이터가 생성됨.

## site042-bug02
- **type**: stale-read-after-write
- **API**: `POST /api/apply` -> `GET /api/applications`
- **증상**: 최신 데이터 미반영
- **description**: 신청 직후 상태 조회 시, 백엔드 비동기 업데이트 지연으로 인해 이전 상태가 반환됨.

## site042-bug03
- **type**: shared-state-mutation
- **API**: `GET /api/policies`
- **증상**: 데이터 오염
- **description**: 서버에서 모든 사용자가 동일한 정책 객체 리스트를 공유하며, 특정 필터링 요청 시 원본 데이터가 직접 수정되어 다른 사용자에게 영향을 줌.

## site042-bug04
- **type**: async-ordering-issue
- **API**: `POST /api/applications/update`
- **증상**: 상태 역전
- **description**: 비동기 상태 업데이트가 순차적으로 처리되지 않아 '승인' 이후에 '심사중'으로 상태가 되돌아가는 현상 발생.
