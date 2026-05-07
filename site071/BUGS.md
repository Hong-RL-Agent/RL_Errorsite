# BUGS site071

### site071-bug01
- **유형**: boundary-inclusive-error
- **한국어 유형**: 경계값 포함 오류
- **API**: `/api/items`
- **증상**: 가격 필터링 시 `min`과 `max` 값에 정확히 일치하는 상품이 결과에서 누락됨. (이상/이하가 아닌 초과/미만으로 처리됨)

### site071-bug02
- **유형**: average-outlier-distortion
- **한국어 유형**: 평균값 이상치 왜곡
- **API**: `/api/stats/average`
- **증상**: 시세 분석 시 비정상적으로 높거나 낮은 극단적 가격(outlier)을 제거하지 않고 산술 평균을 계산하여 전체 시세가 왜곡됨.

### site071-bug03
- **유형**: filter-condition-drop
- **한국어 유형**: 필터 조건 누락
- **API**: `/api/items`
- **증상**: 카테고리와 지역 등 여러 필터를 동시에 적용했을 때, 특정 조건(예: 지역)이 백엔드 쿼리에서 무시되어 조건에 맞지 않는 데이터가 반환됨.

### site071-bug04
- **유형**: group-aggregation-contamination
- **한국어 유형**: 그룹 집계 오염
- **API**: `/api/stats/group`
- **증상**: 카테고리별 그룹 통계 집계 시, 다른 카테고리의 데이터가 계산 과정에 섞여 들어와 각 카테고리의 평균 가격이 잘못 산출됨.
