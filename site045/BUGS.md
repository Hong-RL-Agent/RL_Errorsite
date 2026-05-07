# BUGS - site045

## site045-bug01
- **type**: non-deterministic-matching
- **API**: `GET /api/match`
- **증상**: 동일한 입력 조건(성분)에도 불구하고 매칭 결과와 점수가 요청마다 달라짐.
- **description**: 추천 점수 계산 로직에 고정된 알고리즘 대신 `Math.random()`과 같은 랜덤 요소가 포함되어 결과의 재현성이 없음.

## site045-bug02
- **type**: filter-leakage
- **API**: `GET /api/products`
- **증상**: 특정 향 노드(예: Woody)로 필터링했음에도 조건에 맞지 않는 다른 향수가 결과에 섞여 나옴.
- **description**: 백엔드 필터링 로직에서 `includes()` 또는 조건부 체크가 부정확하여 원치 않는 데이터가 유출(Leakage)됨.

## site045-bug03
- **type**: accumulated-state-error
- **API**: `GET /api/match/repeat`
- **증상**: 추천 기능을 반복 사용할수록 매칭 점수가 비정상적으로 점점 높아짐.
- **description**: 서버 측 메모리에 이전 요청의 점수 상태가 전역 변수처럼 누적되어, 새로운 요청 시 초기화되지 않고 계속 합산됨.

## site045-bug04
- **type**: inconsistent-aggregation
- **API**: `GET /api/dashboard/summary`
- **증상**: 대시보드에 표시되는 전체 향수 개수나 평균 점수가 실제 리스트 데이터와 일치하지 않음.
- **description**: 통계 집계 로직에서 `reduce()` 시 특정 조건을 누락하거나, 필터링된 데이터셋이 아닌 원본 데이터셋을 잘못 참조하여 발생하는 정합성 오류.
