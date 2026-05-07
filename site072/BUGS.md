# Intentional Backend Bugs - site072

### site072-bug01
- **유형**: string-normalization-mismatch (문자열 정규화 불일치)
- **API**: `GET /api/recipes`
- **증상**: 검색 시 대소문자를 구분하거나 공백 처리가 미흡하여 "Pasta" 검색 시 "pasta" 데이터가 누락됨.
- **트리거**: `GET /api/recipes?search=Pasta`

### site072-bug02
- **유형**: incorrect-sort-key-selection (정렬 키 선택 오류)
- **API**: `GET /api/recipes`
- **증상**: 인기순(popular) 정렬 요청 시 좋아요(likes)가 아닌 생성일자(createdAt) 기준으로 정렬됨.
- **트리거**: `GET /api/recipes?sort=popular`

### site072-bug03
- **유형**: floating-point-precision-error (부동소수점 정밀도 오류)
- **API**: `GET /api/recipes/ratings`
- **증상**: 평균 평점 계산 시 소수점 오차가 발생하여 4.5 대신 4.499999... 가 출력됨.
- **트리거**: `GET /api/recipes/ratings`
