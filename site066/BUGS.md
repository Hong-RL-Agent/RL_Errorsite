# BUGS site066

### site066-bug01
- **유형**: unit-mismatch-conversion
- **한국어 유형**: 단위 변환 혼동 오류
- **API**: `/api/sensors/data`
- **증상**: 일부 센서가 mg/m³ 단위를 사용함에도 불구하고 변환 없이 평균을 계산하여 값이 비정상적으로 높게 나옴.

### site066-bug02
- **유형**: moving-average-skip
- **한국어 유형**: 이동 평균 계산 누락
- **API**: `/api/sensors/data`
- **증상**: 이동 평균 계산 시 특정 인덱스의 데이터가 누락되어 실제 추이와 그래프가 일치하지 않음.

### site066-bug03
- **유형**: latest-record-selection-error
- **한국어 유형**: 최신 데이터 선택 오류
- **API**: `/api/sensors/latest`
- **증상**: 타임스탬프 기준 최신값이 아닌, 배열의 마지막 인덱스를 단순 반환하여 과거 데이터가 노출될 수 있음.

### site066-bug04
- **유형**: threshold-comparison-inversion
- **한국어 유형**: 임계값 비교 반전 오류
- **API**: `/api/sensors/status`
- **증상**: PM2.5 기준값 비교 시 부등호가 반전되어, 매우 나쁜 상태가 'Good'으로 표시됨.
