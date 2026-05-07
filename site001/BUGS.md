# Intentional Bugs for PPO Training (site001)

1. **site001-bug01: 이벤트 중복 처리 (duplicate-event-processing)**
   - 동일한 투표 요청이 인위적인 동시성 이슈로 인해 다중 반영되어 집계 수치가 과도하게 증가함.

2. **site001-bug02: 이벤트 순서 오류 (out-of-order-event-handling)**
   - 비동기 처리 과정에서 이벤트 순서가 뒤바뀌어 결과 통계 데이터의 시간적 일관성이 깨짐.

3. **site001-bug03: 이벤트 유실 (event-loss)**
   - 특정 빈도의 요청이 누락되어 실제 투표 수보다 집계 결과가 낮게 나타나는 결함.

4. **site001-bug04: 지연 이벤트 반영 오류 (delayed-event-misapplied)**
   - 투표가 공식적으로 종료된 이후에 도착한 요청이 필터링되지 않고 결과에 합산됨.
