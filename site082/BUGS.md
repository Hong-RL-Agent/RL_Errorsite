# BUGS - site082

### [Bug #1] site082-bug01
- **Type**: unstable-assignment (실험군 할당 불안정)
- **API**: `GET /api/recommendations`
- **Description**: 동일한 유저 ID로 요청해도 추천 상품 리스트가 매번 랜덤하게 바뀌어 실험 데이터의 오염을 유발함.

### [Bug #2] site082-bug02
- **Type**: rollout-percentage-miscalculation (롤아웃 비율 계산 오류)
- **API**: `GET /api/experiments/stats`
- **Description**: 설정된 롤아웃 비율(예: 30%)보다 훨씬 많은 사용자(예: 75%)에게 실험 기능이 노출되는 로직 오류.

### [Bug #3] site082-bug03
- **Type**: flag-cache-inconsistency (플래그 캐시 불일치)
- **API**: `POST /api/experiments` -> `GET /api/recommendations`
- **Description**: 실험 설정을 변경(Update)했음에도 불구하고, 추천 로직에 즉시 반영되지 않고 이전 상태의 캐시 데이터를 반환함.

### [Bug #4] site082-bug04
- **Type**: segment-matching-error (사용자 세그먼트 매칭 오류)
- **API**: `GET /api/recommendations`
- **Description**: '신규 회원' 등 특정 그룹에만 적용되어야 할 추천 로직이 전체 사용자에게 무분별하게 적용됨.
