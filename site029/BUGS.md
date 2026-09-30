# Starlight Ticket (site029) Vulnerability Matrix

| bugId | csvId | Category | Family | Type | Korean Summary | Target Endpoints | Description |
|---|---|---|---|---|---|---|---|
| site029-bug01 | SEC-301 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (검색창) | `GET /api/search`, `POST /api/payment` | 검색 흐름 후 paymentAmount 변조 승인 |
| site029-bug02 | SEC-302 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (프로필 소개) | `POST /api/profile`, `POST /api/payment` | 프로필 수정 후 paymentAmount 변조 승인 |
| site029-bug03 | SEC-303 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (문의 폼) | `POST /api/support`, `POST /api/payment` | 1:1 고객 문의 후 paymentAmount 변조 승인 |
| site029-bug04 | SEC-304 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (좌석 선택) | `POST /api/seats/select`, `POST /api/payment` | 좌석 선점 후 paymentAmount 변조 승인 |
| site029-bug05 | SEC-305 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (티켓 수량) | `POST /api/cart`, `POST /api/payment` | 장바구니 수량 변경 후 paymentAmount 변조 승인 |
| site029-bug06 | SEC-306 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (할인 쿠폰) | `POST /api/coupons/apply`, `POST /api/payment` | 할인 쿠폰 적용 후 paymentAmount 변조 승인 |
| site029-bug07 | SEC-307 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (좌석 등급) | `GET /api/performances/:performanceId/seats`, `POST /api/payment` | 등급별 가격 조회 후 paymentAmount 변조 승인 |
| site029-bug08 | SEC-308 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (패키지 티켓) | `GET /api/packages`, `POST /api/payment` | 패키지 상품 선택 후 paymentAmount 변조 승인 |
| site029-bug09 | SEC-309 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (주문 요약) | `GET /api/orders/summary`, `POST /api/payment` | 주문 요약 조회 후 paymentAmount 변조 승인 |
| site029-bug10 | SEC-310 | business-logic | price-tampering | price-tampering | 클라이언트 금액 변조 (결제 확인) | `POST /api/payment/confirm`, `POST /api/payment` | 결제 확인 후 paymentAmount 변조 승인 |
