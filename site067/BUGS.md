# BUGS site067

### site066-bug01
- **유형**: premium-calculation-overflow
- **한국어 유형**: 보험료 계산 로직 오버플로우
- **API**: `/api/insurance/quote`
- **증상**: 특정 특약을 다수 선택 시 계산 로직의 한계로 인해 보험료가 비정상적으로 낮게(또는 마이너스로) 산출됨.

### site066-bug02
- **유형**: underwriting-bypass-logic
- **한국어 유형**: 인수심사 우회 로직 결함
- **API**: `/api/insurance/validate`
- **증상**: 고위험 질병 이력을 입력했음에도 불구하고, 특정 순서로 가입 시 심사 로직을 우회하여 가입 불가 상품이 '가입 가능'으로 표시됨.

### site066-bug03
- **유형**: discount-stacking-error
- **한국어 유형**: 할인 중복 적용 오류
- **API**: `/api/insurance/discount`
- **증상**: 중복 적용이 불가능한 할인 항목(가족 결합, 건강체 할인 등)이 동시에 적용되어 보험료가 0원에 수렴하는 현상.

### site066-bug04
- **유형**: coverage-limit-mismatch
- **한국어 유형**: 보장 한도 갱신 누락
- **API**: `/api/insurance/coverage`
- **증상**: 기본 계약 변경 시 하위 특약의 보장 한도가 연동되어 변경되어야 하나, 이전 계약의 한도가 그대로 남아있어 한도 초과 가입이 가능해짐.
