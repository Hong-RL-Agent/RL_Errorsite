# BUGS - site041

## site041-bug01
- **type**: inconsistent-response-field
- **API**: `GET /api/recipes`
- **증상**: 동일 API에서 일부 응답은 `ingredients`, 일부는 `ingredientList`로 반환됨
- **description**: 스키마 일관성 결여로 인한 프론트엔드 렌더링 오류 가능성.

## site041-bug02
- **type**: incorrect-calculation
- **API**: `GET /api/recipes/:id`
- **증상**: 칵테일 도수(ABV) 계산이 실제보다 높거나 낮게 계산됨
- **description**: 백엔드 수식 오류로 인해 잘못된 영양/성분 정보 제공.

## site041-bug03
- **type**: missing-validation
- **API**: `POST /api/recipes`
- **증상**: 레시피 생성 시 재료(ingredients) 없이도 생성 성공됨
- **description**: 필수 입력값 검증 누락으로 인한 데이터 무결성 결여.

## site041-bug04
- **type**: stale-cache-data
- **API**: `PUT /api/recipes/:id` -> `GET /api/recipes/:id`
- **증상**: 레시피 수정 후에도 이전 데이터가 계속 반환됨
- **description**: 인메모리 캐시 갱신 누락으로 인한 상태 불일치.
