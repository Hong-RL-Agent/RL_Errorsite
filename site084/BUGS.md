# BUGS - site084

### [Bug #1] site084-bug01
- **Type**: average-calculation-error (평균 계산 오류)
- **API**: `GET /api/stats/average`
- **Description**: `averageCalories` 산출 시 `workouts.length`가 아닌 하드코딩된 값(10)을 분모로 사용하여 실제 데이터와의 불일치 발생.

### [Bug #2] site084-bug02
- **Type**: cumulative-sum-inconsistency (누적 합계 불일치)
- **API**: `GET /api/stats/total`
- **Description**: 전체 소모 칼로리 합산 시 `slice(0, -1)` 처리로 인해 마지막 1건의 데이터가 누계에서 제외됨.

### [Bug #3] site084-bug03
- **Type**: filter-omission-error (필터링 누락)
- **API**: `GET /api/stats`
- **Description**: 클라이언트에서 전달한 `startDate`, `endDate` 쿼리 파라미터를 서버 로직에서 무시하고 전체 데이터셋을 반환함.

### [Bug #4] site084-bug04
- **Type**: grouping-key-misalignment (그룹화 기준 오류)
- **API**: `GET /api/stats/group`
- **Description**: 각 운동 종목별로 개별 그룹화가 이루어져야 하나, 모든 데이터를 'Other'라는 하나의 그룹으로 합산하여 반환하는 로직 오류.
