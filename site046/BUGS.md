# BUGS - site046

## site046-bug01
- **type**: incorrect-sorting
- **API**: `GET /api/gdp?sort=desc`
- **증상**: GDP 순위가 금액순이 아닌 문자열 순으로 정렬됨.
- **description**: 백엔드 정렬 로직에서 숫자를 숫자로 처리하지 않고 문자열로 비교함. (예: 9,000,000이 100,000,000보다 앞에 옴)

## site046-bug02
- **type**: aggregation-error
- **API**: `GET /api/gdp/summary`
- **증상**: 대륙별 GDP 합계가 실제 국가들의 합보다 작게 나옴.
- **description**: 집계 로직(`reduce`)에서 특정 조건을 잘못 설정하여 일부 국가(예: 섬나라 또는 인구 적은 국가)를 계산에서 누락함.

## site046-bug03
- **type**: stale-cache
- **API**: `GET /api/gdp?year=latest`
- **증상**: '최신(latest)' 데이터를 요청했으나 1~2년 전의 과거 데이터가 반환됨.
- **description**: 서버 사이드 캐싱 로직이 최신 데이터를 반영하지 못하고 고정된 과거 스냅샷만 반환하는 전형적인 캐시 무효화 실패 사례.

## site046-bug04
- **type**: pagination-off-by-one
- **API**: `GET /api/gdp?page=last`
- **증상**: 마지막 페이지의 국가 목록 중 하나가 누락됨.
- **description**: 페이지네이션 인덱스 계산 시 `slice` 범위를 `(n-1) * limit`에서 `n * limit`까지로 잡아야 하나, 경계 조건 오류로 인해 마지막 요소 하나를 포함하지 못함.
