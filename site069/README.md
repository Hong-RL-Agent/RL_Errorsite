# 배달 주문 상태 시스템 (site069)
포트: 9178

## 실행 방법
1. `npm install`
2. `npm run build`
3. `npm start`

## 의도된 오류
1. **site069-bug01**: 상태 전이 역행 허용.
2. **site069-bug02**: 이벤트 중복 적용 및 로그 중복.
3. **site069-bug03**: 정렬 결과 비결정성.
4. **site069-bug04**: 캐시 불일치(Stale Read).

## PPO 탐지 목표
- 상태 머신(FSM) 무결성 검증
- Idempotency(멱등성) 결함 탐지
- 정렬 안정성 및 결정성 검증
- 캐시 일관성(Consistency) 문제 탐지
