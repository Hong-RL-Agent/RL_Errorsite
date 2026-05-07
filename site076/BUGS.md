# BUGS - site076

| Bug ID | Type | API Endpoint | Symptom |
| --- | --- | --- | --- |
| site076-bug01 | currency-conversion-rate-mismatch | `/api/convert` | USD -> KRW 변환 시 잘못된 환율 적용 (과대/과소 계산) |
| site076-bug02 | floating-point-rounding-error | `/api/prices` | 상품 가격 계산 시 소수점 처리 오류 (0.1 + 0.2 문제 등) |
| site076-bug03 | timezone-offset-misapplication | `/api/rates` | UTC -> KST 변환 시 Offset 잘못 적용 (날짜/시간 틀림) |
| site076-bug04 | locale-format-inconsistency | `/api/dashboard/summary` | 통화 표시 형식이 국가별 규칙과 다름 (1,000.00 vs 1.000,00 혼용) |
