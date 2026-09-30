# Detailed Vulnerability Specifications (bug.md) — Site030

| bugId | csvId | Category | Family | Type | Endpoint | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SITE030-BUG-001` | `SEC-311` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/care/premium-order` | 1:1 방문 Plant Care 서비스 결제 시 클라이언트 전달 customAmount를 검증 없이 승인 |
| `SITE030-BUG-002` | `SEC-312` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/care/program-subscribe` | Care Program 신규 가입 구독 시 clientAmount를 프로그램 정가와 대조 없이 승인 |
| `SITE030-BUG-003` | `SEC-313` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/orders/address-checkout` | 배송지 주소 저장 후 결제 진행 시 클라이언트 tamperedAmount를 장바구니 실제 금액과 비교 없이 승인 |
| `SITE030-BUG-004` | `SEC-314` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/diagnosis` | AI 식물 병해충 진단 신청 시 clientDiagnosisFee를 정가(15,000원)와 비교 없이 승인 |
| `SITE030-BUG-005` | `SEC-315` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/repotting` | 화분 크기별 분갈이 서비스 신청 시 repottingAmount를 옵션 단가와 대조 없이 승인 |
| `SITE030-BUG-006` | `SEC-316` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/cart/checkout` | 장바구니 관리용품 결제 시 상품 단가 재계산 없이 클라이언트 tamperedSubtotal / totalAmount 채택 |
| `SITE030-BUG-007` | `SEC-317` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/nutrition` | 맞춤 영양 관리 정기 솔루션 결제 시 nutritionPlanAmount를 플랜 정가와 대조 없이 승인 |
| `SITE030-BUG-008` | `SEC-318` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/care/tier-subscribe` | Care Program 티어 옵션 결제 시 Premium 플랜의 실제 가격 대신 클라이언트 clientPrice 채택 |
| `SITE030-BUG-009` | `SEC-319` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/shipping/calculate` | 배송비 및 안심 서비스 이용료를 클라이언트 요청에서 0원으로 조작 시 그대로 수용 |
| `SITE030-BUG-010` | `SEC-320` | Business Logic | Price Tampering | Client-side Price Tampering | `POST /api/payment/confirm` | 주문 요약서 조회 후 2단계 최종 승인 요청 시 authorizedAmount를 원본 주문 금액과 대조 없이 확정 |
