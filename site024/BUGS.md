# Intentional Backend Bugs (site024)

## site024-bug01
- **type**: seed-data-inconsistency
- **한국어 유형**: 시드 데이터 불일치
- **API endpoint**: GET /api/diagnostics/seed
- **data-bug-id selector**: [data-bug-id="site024-bug01"]
- **사용자 증상**: 일부 상품이 카테고리 없음 상태로 표시되며 진단 패널에서 orphan 상품으로 나타남.
- **서버 응답 상태 코드**: 200
- **코드상 의도된 원인**: seed 데이터의 product.categoryId가 실제 categories 테이블에 존재하지 않는 'cat_99'를 참조함.
- **PPO 기대 행동**: 데이터 간 참조 무결성 불일치를 탐지하고 해당 결과를 오류로 분류.

## site024-bug02
- **type**: backward-compatibility-break-field-removal
- **한국어 유형**: 하위 호환성 파손 (필드 삭제)
- **API endpoint**: GET /api/legacy/products
- **data-bug-id selector**: [data-bug-id="site024-bug02"]
- **사용자 증상**: 레거시 응답 검사에서 `displayName` 필드가 누락되어 유효성 검사 실패 경고가 표시됨.
- **서버 응답 상태 코드**: 200
- **코드상 의도된 원인**: 레거시 호환 응답을 생성하면서 기존에 존재하던 `name` 필드를 `displayName`으로 변환하지 않고 삭제함.
- **PPO 기대 행동**: 성공 응답이어도 이전 계약(contract)에 존재해야 하는 필드가 사라진 호환성 파손을 탐지.

## site024-bug03
- **type**: default-value-change-logic-collapse
- **한국어 유형**: 기본값 변경에 의한 로직 붕괴
- **API endpoint**: POST /api/products
- **data-bug-id selector**: [data-bug-id="site024-bug03"]
- **사용자 증상**: 상품 생성은 성공했지만 활성 상품 목록에 보이지 않거나 draft/hidden 상태로 저장됨.
- **서버 응답 상태 코드**: 201
- **코드상 의도된 원인**: status/visibility 기본값이 기존 active/public에서 draft/hidden으로 변경되어 상품이 카탈로그에 즉시 노출되지 않음.
- **PPO 기대 행동**: 사용자가 기대한 기본 동작(생성 후 즉시 노출)과 실제 저장 결과가 달라 운영 흐름이 깨지는 점을 탐지.

## site024-bug04
- **type**: n-plus-one-query-timeout
- **한국어 유형**: N+1 쿼리에 의한 타임아웃
- **API endpoint**: GET /api/orders?includeDetails=true
- **data-bug-id selector**: [data-bug-id="site024-bug04"]
- **사용자 증상**: 상세 포함 주문 조회 시 응답이 매우 느리거나(수 초 지연) 프론트엔드에서 타임아웃 경고가 표시됨.
- **서버 응답 상태 코드**: 200 (또는 지연에 의한 504 시뮬레이션)
- **코드상 의도된 원인**: 각 주문마다 고객/아이템/상품을 개별 조회하는 반복 패턴과 각 레코드당 800ms의 인위적 지연을 추가함.
- **PPO 기대 행동**: 데이터 수 증가에 비례해 응답 성능이 급격히 악화되는 N+1 성능 문제를 탐지.
