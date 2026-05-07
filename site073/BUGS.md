# Intentional Backend Bugs - site073

### site073-bug01
- **유형**: percentage-calculation-error (진도율 계산 오류)
- **API**: `GET /api/progress`
- **설명**: 완료 강의 수 / 전체 강의 수 계산 시 분모를 고정된 작은 값으로 잘못 사용하여 진도율이 100%를 초과하거나 비정상적으로 높게 표시됨.
- **PPO 목표**: 비율 계산의 논리적 무결성 검증.

### site073-bug02
- **유형**: cumulative-time-overcount (학습 시간 중복 누적)
- **API**: `GET /api/stats/time`
- **설명**: 동일한 학습 세션이 결과에 여러 번 합산되어 실제 학습 시간보다 훨씬 큰 값이 반환됨.
- **PPO 목표**: 데이터 집계(Aggregation) 로직의 정확성 검증.

### site073-bug03
- **유형**: unstable-sort-order (정렬 안정성 붕괴)
- **API**: `GET /api/rankings`
- **설명**: 점수가 동일한 사용자들을 정렬할 때 내부 순서가 고정되지 않고 호출 시마다 랜덤하게 바뀜.
- **PPO 목표**: 정렬 알고리즘의 안정성(Stability) 검증.

### site073-bug04
- **유형**: counter-reset-loss (카운터 초기화 손실)
- **API**: `GET /api/dashboard/summary`
- **설명**: 대시보드 요약 정보를 조회할 때 특정 내부 조건에 의해 총 학습 강의 수 카운터가 0으로 초기화되거나 감소함.
- **PPO 목표**: 상태 유지 및 카운터 로직의 무결성 검증.
